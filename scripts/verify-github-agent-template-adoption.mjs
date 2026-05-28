#!/usr/bin/env node
import { spawn } from "node:child_process";
import { copyFile, mkdir, mkdtemp, readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { validateVibeLog } from "./validate-vibelog.mjs";

const TEMPLATE_SPECS = [
  {
    id: "agents",
    source: "agent-templates/AGENTS.md",
    destination: "AGENTS.md"
  },
  {
    id: "claude",
    source: "agent-templates/CLAUDE.md",
    destination: "CLAUDE.md"
  },
  {
    id: "gemini",
    source: "agent-templates/GEMINI.md",
    destination: "GEMINI.md"
  },
  {
    id: "cursor",
    source: "agent-templates/cursor/.cursor/rules/vibelog.mdc",
    destination: ".cursor/rules/vibelog.mdc"
  },
  {
    id: "windsurf",
    source: "agent-templates/windsurf/.windsurf/rules/vibelog.md",
    destination: ".windsurf/rules/vibelog.md"
  },
  {
    id: "cline",
    source: "agent-templates/cline/.clinerules/vibelog.md",
    destination: ".clinerules/vibelog.md"
  },
  {
    id: "roo",
    source: "agent-templates/roo-legacy/.roo/rules/vibelog.md",
    destination: ".roo/rules/vibelog.md"
  },
  {
    id: "github-copilot",
    source: "agent-templates/github-copilot/.github/copilot-instructions.md",
    destination: ".github/copilot-instructions.md"
  }
];

const FORBIDDEN_ROOT_PATHS = [
  "vibe-log.md",
  "vibe-log.json",
  ".vibelog-events",
  ["docs", "reports"].join("/"),
  ["docs", "superpowers"].join("/"),
  ["examples", "billmate-lite"].join("/"),
  ["examples", "reading-card-lite"].join("/"),
  ["examples", "vibelog-studio"].join("/")
];

const TEXT_FILE_EXTENSIONS = new Set([
  ".json",
  ".md",
  ".mdc",
  ".mjs",
  ".txt",
  ".yaml",
  ".yml"
]);

export async function runGithubAgentTemplateAdoptionVerification({
  remoteUrl = null,
  workspace = defaultWorkspace()
} = {}) {
  const sourceUrl = remoteUrl || await readOriginUrl(process.cwd());
  const resolvedWorkspace = resolve(workspace);
  await mkdir(resolvedWorkspace, { recursive: true });

  const runPath = await mkdtemp(join(resolvedWorkspace, "run-"));
  const clonePath = join(runPath, "vibelog-github-agent-template-clone");
  const consumerProjectPath = join(runPath, "agent-template-consumer");

  const clone = await cloneRepository(sourceUrl, clonePath, runPath);
  const cloneHead = (await runCommand("git", ["rev-parse", "HEAD"], {
    cwd: clonePath,
    timeout: 30000
  })).stdout.trim();
  const publicBoundary = await verifyPublicBoundary(clonePath);
  const templates = await adoptTemplates({ clonePath, consumerProjectPath });

  const init = parseJsonOutput((await runVibeLogCommand({
    clonePath,
    args: [
      "init",
      "--project",
      consumerProjectPath,
      "--title",
      "S21 Agent Template Adoption",
      "--idea",
      "Verify a clean VibeLog source can initialize a project and install agent templates."
    ]
  })).stdout);

  const logPath = join(consumerProjectPath, "vibe-log.md");
  const jsonPath = join(consumerProjectPath, "vibe-log.json");
  const exportCheck = await runCommand(process.execPath, [
    join(clonePath, "scripts", "export-vibelog.mjs"),
    logPath,
    "--out",
    jsonPath,
    "--check"
  ], {
    cwd: clonePath,
    timeout: 120000
  });
  const validate = await runCommand(process.execPath, [
    join(clonePath, "scripts", "validate-vibelog.mjs"),
    jsonPath
  ], {
    cwd: clonePath,
    timeout: 120000
  });

  const data = JSON.parse(await readFile(jsonPath, "utf8"));
  const validation = validateVibeLog(data);
  const failures = collectFailures({
    publicBoundary,
    templates,
    init,
    exportCheck,
    validate,
    validation
  });

  return {
    schema: "vibelog-github-agent-template-adoption@0.1",
    passed: failures.length === 0,
    remote: {
      url: sourceUrl
    },
    run: {
      workspace: resolvedWorkspace,
      path: runPath
    },
    clone: {
      path: clonePath,
      head: cloneHead
    },
    publicBoundary,
    templates,
    consumerProject: {
      path: consumerProjectPath,
      logPath,
      jsonPath,
      validation: {
        valid: validation.valid,
        errors: validation.errors
      }
    },
    commands: {
      clone: summarizeCommand(clone),
      init: summarizeInit(init),
      exportCheck: summarizeCommand(exportCheck),
      validate: summarizeCommand(validate)
    },
    safety: {
      scratchOnly: true,
      pushPerformed: false,
      publishPerformed: false,
      globalSettingsTouched: false,
      privateDataFound: !publicBoundary.clean
    },
    failures
  };
}

async function cloneRepository(remoteUrl, clonePath, cwd) {
  const isLocalPath = !/^(https?:|git@|ssh:\/\/)/iu.test(remoteUrl);
  const args = isLocalPath
    ? ["clone", "--local", "--no-hardlinks", resolve(remoteUrl), clonePath]
    : ["clone", "--depth", "1", remoteUrl, clonePath];

  return runCommand("git", args, {
    cwd,
    timeout: 120000
  });
}

async function adoptTemplates({ clonePath, consumerProjectPath }) {
  const adopted = [];
  await mkdir(consumerProjectPath, { recursive: true });

  for (const spec of TEMPLATE_SPECS) {
    const sourcePath = join(clonePath, spec.source);
    const destinationPath = join(consumerProjectPath, spec.destination);
    await mkdir(dirname(destinationPath), { recursive: true });
    await copyFile(sourcePath, destinationPath);
    const content = await readFile(destinationPath, "utf8");

    adopted.push({
      id: spec.id,
      sourceRelativePath: spec.source,
      destinationRelativePath: spec.destination,
      sourcePath,
      destinationPath,
      exists: await exists(destinationPath),
      hasCoreContract: hasVibeLogContract(content)
    });
  }

  return adopted;
}

function hasVibeLogContract(content) {
  return content.includes("vibe-log.md")
    && content.includes("vibe-log.json")
    && content.includes("export-vibelog.mjs")
    && content.includes("validate-vibelog.mjs");
}

async function verifyPublicBoundary(clonePath) {
  const forbiddenPaths = {};
  for (const relativePath of FORBIDDEN_ROOT_PATHS) {
    forbiddenPaths[relativePath] = !await exists(join(clonePath, relativePath));
  }

  const forbiddenMarkers = [
    {
      label: "C:\\Users\\<name>",
      pattern: /C:\\+Users\\+(?!Public\b)[A-Za-z0-9._-]+/iu
    },
    "H" + "XW",
    "App" + "Data"
  ];
  const markerMatches = await scanTextFilesForMarkers(clonePath, forbiddenMarkers);
  const clean = Object.values(forbiddenPaths).every(Boolean) && markerMatches.length === 0;

  return {
    clean,
    forbiddenPathsAbsent: forbiddenPaths,
    markerMatches
  };
}

async function scanTextFilesForMarkers(root, markers) {
  const matches = [];
  for (const path of await listFiles(root)) {
    if (!isScannableTextFile(path)) continue;
    const content = await readFile(path, "utf8");
    for (const marker of markers) {
      const match = matchForbiddenMarker(content, marker);
      if (match) {
        matches.push({
          path,
          marker: match
        });
      }
    }
  }
  return matches;
}

function matchForbiddenMarker(content, marker) {
  if (typeof marker === "string") {
    return content.includes(marker) ? marker : null;
  }

  const match = marker.pattern.exec(content);
  return match ? marker.label : null;
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if ([".git", "node_modules", "tmp"].includes(entry.name)) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function isScannableTextFile(path) {
  const normalized = path.toLowerCase();
  for (const extension of TEXT_FILE_EXTENSIONS) {
    if (normalized.endsWith(extension)) return true;
  }
  return false;
}

function collectFailures({
  publicBoundary,
  templates,
  init,
  exportCheck,
  validate,
  validation
}) {
  const failures = [];
  if (!publicBoundary.clean) failures.push("Clean clone public boundary check failed.");
  for (const [path, absent] of Object.entries(publicBoundary.forbiddenPathsAbsent)) {
    if (!absent) failures.push(`Clean clone contains forbidden path: ${path}`);
  }
  for (const match of publicBoundary.markerMatches) {
    failures.push(`Clean clone contains private marker in ${match.path}`);
  }
  if (templates.length !== TEMPLATE_SPECS.length) failures.push("Not every agent template was adopted.");
  for (const template of templates) {
    if (!template.exists) failures.push(`Template destination missing: ${template.destinationRelativePath}`);
    if (!template.hasCoreContract) failures.push(`Template lacks VibeLog contract: ${template.destinationRelativePath}`);
  }
  if (init.created !== true) failures.push("Consumer project was not initialized.");
  if (exportCheck.code !== 0) failures.push("Export drift check did not pass.");
  if (validate.code !== 0) failures.push("Validate command did not pass.");
  if (!validation.valid) failures.push(`Consumer VibeLog JSON is invalid: ${validation.errors.join("; ")}`);
  return failures;
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

async function readOriginUrl(cwd) {
  const remote = await runCommand("git", ["config", "--get", "remote.origin.url"], {
    cwd,
    timeout: 30000
  });
  return remote.stdout.trim();
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
  return join(resolve(".."), "vibelog-scratch", "s21-github-agent-template-adoption");
}

function parseArgs(argv) {
  const options = {
    help: false,
    remoteUrl: null,
    workspace: defaultWorkspace()
  };

  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--remote-url") {
      options.remoteUrl = args.shift() ?? "";
    } else if (arg === "--workspace") {
      options.workspace = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.remoteUrl === "") throw new Error("--remote-url requires a clone URL or path");
  if (!options.workspace) throw new Error("--workspace requires a path");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }
  const result = await runGithubAgentTemplateAdoptionVerification(options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

function helpText() {
  return `verify-github-agent-template-adoption

Clone a clean VibeLog source, install every agent template into a synthetic
consumer project, initialize VibeLog, export JSON, validate JSON, and report
public-repository safety checks.

Usage:
  node scripts/verify-github-agent-template-adoption.mjs [options]

Options:
  --remote-url <url-or-path>  Repository clone URL or local path. Defaults to remote.origin.url.
  --workspace <path>         Scratch workspace for the verification run.
  --help, -h                 Show this help.
`;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error.message);
    if (error.stderr) console.error(error.stderr);
    process.exitCode = 1;
  });
}
