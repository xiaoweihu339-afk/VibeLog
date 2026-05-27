import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { validateVibeLog } from "./validate-vibelog.mjs";

export async function runCleanCloneAdoptionVerification({
  repoPath = process.cwd(),
  workspace = defaultWorkspace()
} = {}) {
  const resolvedRepo = resolve(repoPath);
  const resolvedWorkspace = resolve(workspace);
  await mkdir(resolvedWorkspace, { recursive: true });

  const runPath = await mkdtemp(join(resolvedWorkspace, "run-"));
  const clonePath = join(runPath, "vibelog-clean-clone");
  const targetProjectPath = join(runPath, "target-project");
  const adapterPath = join(clonePath, "scripts", "claude-code-hook-adapter.mjs");
  const settingsPath = join(targetProjectPath, ".claude", "settings.json");
  const globalBefore = await fingerprintGlobalClaudeSettings();

  await runCommand("git", ["clone", "--local", "--no-hardlinks", resolvedRepo, clonePath], {
    cwd: runPath,
    timeout: 120000
  });
  const cloneHead = (await runCommand("git", ["rev-parse", "HEAD"], {
    cwd: clonePath,
    timeout: 30000
  })).stdout.trim();

  const help = await runVibeLogCommand({
    clonePath,
    args: ["--help"]
  });

  const init = parseJsonOutput((await runVibeLogCommand({
    clonePath,
    args: [
      "init",
      "--project",
      targetProjectPath,
      "--title",
      "Slice 13 Clean Clone Adoption",
      "--idea",
      "Verify a clean clone can initialize, enable, verify, and disable VibeLog locally."
    ]
  })).stdout);

  const dryRunSettingsExistedBefore = await exists(settingsPath);
  const dryRun = parseJsonOutput((await runVibeLogCommand({
    clonePath,
    args: [
      "enable-hooks",
      "--project",
      targetProjectPath,
      "--adapter",
      adapterPath
    ]
  })).stdout);
  const dryRunSettingsExistedAfter = await exists(settingsPath);

  const write = parseJsonOutput((await runVibeLogCommand({
    clonePath,
    args: [
      "enable-hooks",
      "--project",
      targetProjectPath,
      "--adapter",
      adapterPath,
      "--write"
    ]
  })).stdout);

  const verify = parseJsonOutput((await runVibeLogCommand({
    clonePath,
    args: ["verify", "--project", targetProjectPath]
  })).stdout);

  const disable = parseJsonOutput((await runVibeLogCommand({
    clonePath,
    args: ["disable-hooks", "--project", targetProjectPath]
  })).stdout);

  const verifyAfterDisable = parseJsonOutput((await runVibeLogCommand({
    clonePath,
    args: ["verify", "--project", targetProjectPath],
    allowedExitCodes: [0, 1]
  })).stdout);

  const data = JSON.parse(await readFile(join(targetProjectPath, "vibe-log.json"), "utf8"));
  const validation = validateVibeLog(data);
  const globalAfter = await fingerprintGlobalClaudeSettings();
  const globalClaudeSettingsUnchanged = sameFingerprint(globalBefore, globalAfter);

  const passed = help.stdout.includes("vibelog-project")
    && init.created === true
    && dryRun.wrote === false
    && dryRunSettingsExistedBefore === false
    && dryRunSettingsExistedAfter === false
    && write.wrote === true
    && verify.ready === true
    && disable.removedHookCount === 3
    && verifyAfterDisable.ready === false
    && validation.valid
    && globalClaudeSettingsUnchanged;

  return {
    passed,
    repo: {
      sourcePath: resolvedRepo
    },
    run: {
      workspace: resolvedWorkspace,
      path: runPath
    },
    clone: {
      path: clonePath,
      head: cloneHead
    },
    targetProject: {
      path: targetProjectPath,
      logPath: join(targetProjectPath, "vibe-log.md"),
      jsonPath: join(targetProjectPath, "vibe-log.json"),
      settingsPath,
      validation: {
        valid: validation.valid,
        errors: validation.errors
      }
    },
    commands: {
      help: summarizeCommand(help),
      init: summarizeInit(init),
      dryRun: summarizeHookSetup(dryRun),
      write: summarizeHookSetup(write),
      verify: summarizeVerify(verify),
      disable: summarizeDisable(disable),
      verifyAfterDisable: summarizeVerify(verifyAfterDisable)
    },
    safety: {
      settingsCreatedByDryRun: !dryRunSettingsExistedBefore && dryRunSettingsExistedAfter,
      globalClaudeSettingsPath: globalBefore.path,
      globalClaudeSettingsUnchanged
    }
  };
}

async function runVibeLogCommand({ clonePath, args, allowedExitCodes = [0] }) {
  if (process.platform === "win32") {
    return runCommand("cmd.exe", ["/d", "/s", "/c", "npm", "run", "vibelog", "--", ...args], {
      cwd: clonePath,
      timeout: 120000,
      allowedExitCodes
    });
  }

  return runCommand("npm", ["run", "vibelog", "--", ...args], {
    cwd: clonePath,
    timeout: 120000,
    allowedExitCodes
  });
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

function parseJsonOutput(stdout) {
  const text = String(stdout ?? "");
  const start = text.indexOf("{");
  if (start === -1) {
    throw new Error(`Command output did not contain JSON: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text.slice(start));
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

async function fingerprintGlobalClaudeSettings() {
  const settingsPath = join(homedir(), ".claude", "settings.json");
  try {
    const content = await readFile(settingsPath);
    return {
      path: settingsPath,
      exists: true,
      sha256: createHash("sha256").update(content).digest("hex")
    };
  } catch {
    return {
      path: settingsPath,
      exists: false,
      sha256: null
    };
  }
}

function sameFingerprint(before, after) {
  return before.exists === after.exists && before.sha256 === after.sha256;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function defaultWorkspace() {
  return join(resolve(".."), "vibelog-scratch", "slice-13-clean-clone-adoption");
}

function parseArgs(argv) {
  const options = {
    repoPath: process.cwd(),
    workspace: defaultWorkspace()
  };

  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--repo") {
      options.repoPath = args.shift() ?? "";
    } else if (arg === "--workspace") {
      options.workspace = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.repoPath) throw new Error("--repo requires a path");
  if (!options.workspace) throw new Error("--workspace requires a path");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await runCleanCloneAdoptionVerification(options);
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
