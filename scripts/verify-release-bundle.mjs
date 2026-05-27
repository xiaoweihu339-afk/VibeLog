#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { validateVibeLog } from "./validate-vibelog.mjs";

const REQUIRED_PACKAGE_PATHS = [
  "README.md",
  "package.json",
  "skills/vibelog/SKILL.md",
  "skills/vibelog/assets/vibe-log.schema.json",
  "scripts/vibelog-project.mjs",
  "scripts/vibelog-install.mjs",
  "scripts/verify-installer-rollback.mjs",
  "scripts/verify-installer-backup-restore.mjs"
];

const FORBIDDEN_PACKAGE_PATHS = [
  ".git",
  "node_modules",
  "test"
];

export async function runReleaseBundleVerification({
  repoPath = process.cwd(),
  scratchRoot = null
} = {}) {
  const resolvedRepo = resolve(repoPath);
  const resolvedScratch = scratchRoot
    ? resolve(scratchRoot)
    : await mkdtemp(join(tmpdir(), "vibelog-release-bundle-"));
  await mkdir(resolvedScratch, { recursive: true });
  const runPath = await mkdtemp(join(resolvedScratch, "run-"));

  const pack = await runNpm(["pack", "--json", "--pack-destination", runPath], {
    cwd: resolvedRepo,
    timeout: 120000
  });
  const packResult = parseNpmPackJson(pack.stdout);
  const tarballPath = resolvePackFilename(runPath, packResult.filename);
  const extractedRoot = join(runPath, "extracted");
  await mkdir(extractedRoot, { recursive: true });
  const extract = await runCommand("tar", ["-xzf", tarballPath, "-C", extractedRoot], {
    cwd: runPath,
    timeout: 120000
  });
  const packagePath = join(extractedRoot, "package");

  const included = await checkPaths(packagePath, REQUIRED_PACKAGE_PATHS, true);
  const excluded = await checkPaths(packagePath, FORBIDDEN_PACKAGE_PATHS, false);
  const consumerProjectPath = join(runPath, "consumer-project");
  const adapterPath = join(packagePath, "scripts", "claude-code-hook-adapter.mjs");
  const settingsPath = join(consumerProjectPath, ".claude", "settings.json");

  const help = await runVibeLogScript({ packagePath, args: ["--help"] });
  const init = parseJsonOutput((await runVibeLogScript({
    packagePath,
    args: [
      "init",
      "--project",
      consumerProjectPath,
      "--title",
      "Slice 20 Release Bundle Consumer",
      "--idea",
      "Verify an extracted VibeLog release bundle can initialize and verify a consumer project."
    ]
  })).stdout);

  const dryRunSettingsExistedBefore = await exists(settingsPath);
  const dryRun = parseJsonOutput((await runVibeLogScript({
    packagePath,
    args: [
      "enable-hooks",
      "--project",
      consumerProjectPath,
      "--adapter",
      adapterPath
    ]
  })).stdout);
  const dryRunSettingsExistedAfter = await exists(settingsPath);

  const write = parseJsonOutput((await runVibeLogScript({
    packagePath,
    args: [
      "enable-hooks",
      "--project",
      consumerProjectPath,
      "--adapter",
      adapterPath,
      "--write"
    ]
  })).stdout);

  const verify = parseJsonOutput((await runVibeLogScript({
    packagePath,
    args: ["verify", "--project", consumerProjectPath]
  })).stdout);

  const disable = parseJsonOutput((await runVibeLogScript({
    packagePath,
    args: ["disable-hooks", "--project", consumerProjectPath]
  })).stdout);

  const verifyAfterDisable = parseJsonOutput((await runVibeLogScript({
    packagePath,
    args: ["verify", "--project", consumerProjectPath],
    allowedExitCodes: [0, 1]
  })).stdout);

  const rollback = parseJsonOutput((await runNpmScript({
    packagePath,
    script: "vibelog:verify-installer-rollback",
    args: ["--scratch-root", join(runPath, "installer-rollback")],
    timeout: 120000
  })).stdout);

  const backupRestore = parseJsonOutput((await runNpmScript({
    packagePath,
    script: "vibelog:verify-installer-backup-restore",
    args: ["--scratch-root", join(runPath, "installer-backup-restore")],
    timeout: 120000
  })).stdout);

  const data = JSON.parse(await readFile(join(consumerProjectPath, "vibe-log.json"), "utf8"));
  const validation = validateVibeLog(data);
  const failures = collectFailures({
    included,
    excluded,
    help,
    init,
    dryRun,
    dryRunSettingsExistedBefore,
    dryRunSettingsExistedAfter,
    write,
    verify,
    disable,
    verifyAfterDisable,
    rollback,
    backupRestore,
    validation
  });

  return {
    schema: "vibelog-release-bundle-verification@0.1",
    passed: failures.length === 0,
    repo: {
      sourcePath: resolvedRepo
    },
    scratch: {
      path: resolvedScratch
    },
    run: {
      path: runPath
    },
    bundle: {
      packageName: packResult.name,
      version: packResult.version,
      filename: packResult.filename,
      tarballPath,
      entryCount: packResult.entryCount,
      size: packResult.size,
      unpackedSize: packResult.unpackedSize,
      integrity: packResult.integrity
    },
    extractedPackage: {
      path: packagePath
    },
    consumerProject: {
      path: consumerProjectPath,
      logPath: join(consumerProjectPath, "vibe-log.md"),
      jsonPath: join(consumerProjectPath, "vibe-log.json"),
      settingsPath,
      validation: {
        valid: validation.valid,
        errors: validation.errors
      }
    },
    contents: {
      included,
      excluded
    },
    commands: {
      pack: summarizeCommand(pack),
      extract: summarizeCommand(extract),
      help: summarizeCommand(help),
      init: summarizeInit(init),
      dryRun: summarizeHookSetup(dryRun),
      write: summarizeHookSetup(write),
      verify: summarizeVerify(verify),
      disable: summarizeDisable(disable),
      verifyAfterDisable: summarizeVerify(verifyAfterDisable)
    },
    installerSafety: {
      rollback: summarizeSafetyVerifier(rollback),
      backupRestore: summarizeSafetyVerifier(backupRestore)
    },
    safety: {
      scratchOnly: true,
      settingsCreatedByDryRun: !dryRunSettingsExistedBefore && dryRunSettingsExistedAfter,
      globalClaudeSettingsTouched: false,
      globalCodexSettingsTouched: false,
      pushPerformed: false,
      publishPerformed: false
    },
    failures
  };
}

function collectFailures({
  included,
  excluded,
  help,
  init,
  dryRun,
  dryRunSettingsExistedBefore,
  dryRunSettingsExistedAfter,
  write,
  verify,
  disable,
  verifyAfterDisable,
  rollback,
  backupRestore,
  validation
}) {
  const failures = [];
  for (const [path, present] of Object.entries(included)) {
    if (!present) failures.push(`Release bundle is missing required path: ${path}`);
  }
  for (const [path, absent] of Object.entries(excluded)) {
    if (!absent) failures.push(`Release bundle contains forbidden path: ${path}`);
  }
  if (!help.stdout.includes("vibelog-project")) failures.push("VibeLog help did not run from extracted package.");
  if (init.created !== true) failures.push("Consumer project was not initialized.");
  if (dryRun.wrote !== false) failures.push("Hook dry-run wrote settings.");
  if (dryRunSettingsExistedBefore || dryRunSettingsExistedAfter) failures.push("Hook dry-run created a settings file.");
  if (write.wrote !== true) failures.push("Hook write did not update project-local settings.");
  if (verify.ready !== true) failures.push("Consumer project did not verify after hook write.");
  if (disable.removedHookCount !== 3) failures.push("Disable did not remove the expected hook count.");
  if (verifyAfterDisable.ready !== false) failures.push("Consumer project remained hook-ready after disable.");
  if (rollback.passed !== true) failures.push("Rollback verifier did not pass from extracted package.");
  if (backupRestore.passed !== true) failures.push("Backup/restore verifier did not pass from extracted package.");
  if (!validation.valid) failures.push(`Consumer VibeLog JSON is invalid: ${validation.errors.join("; ")}`);
  return failures;
}

async function checkPaths(root, paths, expectedPresent) {
  const checks = {};
  for (const path of paths) {
    const present = await exists(join(root, path));
    checks[path] = expectedPresent ? present : !present;
  }
  return checks;
}

async function runVibeLogScript({ packagePath, args, allowedExitCodes = [0] }) {
  return runNpmScript({
    packagePath,
    script: "vibelog",
    args,
    allowedExitCodes,
    timeout: 120000
  });
}

async function runNpmScript({
  packagePath,
  script,
  args = [],
  allowedExitCodes = [0],
  timeout = 30000
}) {
  return runNpm(["run", script, "--", ...args], {
    cwd: packagePath,
    allowedExitCodes,
    timeout
  });
}

async function runNpm(args, options = {}) {
  if (process.platform === "win32") {
    return runCommand("cmd.exe", ["/d", "/s", "/c", "npm", ...args], options);
  }
  return runCommand("npm", args, options);
}

function runCommand(file, args, {
  cwd,
  timeout = 30000,
  allowedExitCodes = [0]
} = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(file, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };

    const timer = setTimeout(() => {
      child.kill();
      finish(reject, new Error(`Command timed out: ${file} ${args.join(" ")}`));
    }, timeout);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      finish(reject, error);
    });
    child.on("close", (code) => {
      const result = { file, args, cwd, code, stdout, stderr };
      if (allowedExitCodes.includes(code)) {
        finish(resolvePromise, result);
        return;
      }

      const error = new Error(`Command failed (${code}): ${file} ${args.join(" ")}`);
      error.code = code;
      error.stdout = stdout;
      error.stderr = stderr;
      finish(reject, error);
    });
  });
}

function parseNpmPackJson(stdout) {
  const parsed = parseJsonOutput(stdout);
  const packResult = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!packResult || typeof packResult.filename !== "string") {
    throw new Error("npm pack did not return package metadata with a filename.");
  }
  return packResult;
}

function resolvePackFilename(scratchRoot, filename) {
  return isAbsolute(filename) ? filename : join(scratchRoot, filename);
}

function parseJsonOutput(stdout) {
  const text = String(stdout ?? "");
  const objectStart = text.indexOf("{");
  const arrayStart = text.indexOf("[");
  const starts = [objectStart, arrayStart].filter((index) => index >= 0);
  if (starts.length === 0) {
    throw new Error(`Command output did not contain JSON: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text.slice(Math.min(...starts)));
}

function summarizeCommand(result) {
  return {
    code: result.code,
    stdout: result.stdout,
    stderr: result.stderr.trim()
  };
}

function summarizeInit(result) {
  return {
    command: result.command,
    projectPath: result.projectPath,
    logPath: result.logPath,
    jsonPath: result.jsonPath,
    created: result.created,
    valid: result.valid
  };
}

function summarizeHookSetup(result) {
  return {
    command: result.command,
    projectPath: result.projectPath,
    settingsPath: result.settingsPath,
    adapterPath: result.adapterPath,
    dryRun: result.dryRun,
    wrote: result.wrote,
    ready: result.ready,
    warnings: result.warnings,
    vibeLogHookCount: result.vibeLogHookCount
  };
}

function summarizeVerify(result) {
  return {
    command: result.command,
    projectPath: result.projectPath,
    ready: result.ready,
    log: result.log,
    hooks: result.hooks
  };
}

function summarizeDisable(result) {
  return {
    command: result.command,
    projectPath: result.projectPath,
    settingsPath: result.settingsPath,
    settingsExists: result.settingsExists,
    removedHookCount: result.removedHookCount,
    wrote: result.wrote
  };
}

function summarizeSafetyVerifier(result) {
  return {
    schema: result.schema,
    passed: result.passed,
    scratchRoot: result.scratchRoot,
    targetRoot: result.targetRoot,
    failures: result.failures,
    safety: result.safety
  };
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const options = {
    repoPath: process.cwd(),
    scratchRoot: null
  };
  const args = [...argv];

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    } else if (arg === "--repo") {
      options.repoPath = args.shift() ?? "";
    } else if (arg === "--scratch-root") {
      options.scratchRoot = args.shift() ?? "";
    } else if (arg === "--publish" || arg === "--push") {
      throw new Error("Release bundle verifier never pushes or publishes. Run it locally, then ask for explicit human approval before any release action.");
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.repoPath) throw new Error("--repo requires a path");
  if (options.scratchRoot === "") throw new Error("--scratch-root requires a path");
  return options;
}

function helpText() {
  return `verify-release-bundle

Scratch-only VibeLog release bundle verifier.

Usage:
  verify-release-bundle [--repo <repo-root>] [--scratch-root <scratch-root>]
  verify-release-bundle --help

Checks:
  - Builds a local npm pack tarball without publishing.
  - Extracts the release bundle into a scratch directory.
  - Verifies required skill, docs, examples, and CLI files are present.
  - Verifies .git, node_modules, and test sources are not bundled.
  - Runs VibeLog init, hook dry-run/write/verify/disable from the extracted bundle.
  - Runs installer rollback and backup/restore verifiers from the extracted bundle.

Safety:
  - Writes only inside scratch and consumer test directories.
  - Does not push, publish, upload, or edit global Claude/Codex settings.
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const result = await runReleaseBundleVerification(options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(fileURLToPath(import.meta.url)).href) {
  const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
  if (import.meta.url === invokedPath) {
    main().catch((error) => {
      console.error(error.message);
      if (error.stderr) console.error(error.stderr);
      process.exitCode = 1;
    });
  }
}
