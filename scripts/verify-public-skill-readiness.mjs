#!/usr/bin/env node
import { spawn } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const PRIVATE_ROOT_PATHS = [
  "vibe-log.md",
  "vibe-log.json",
  ".vibelog-events",
  "vibelog-scratch"
];

const REQUIRED_IGNORE_LINES = [
  "/vibe-log.md",
  "/vibe-log.json",
  "/.vibelog-events/",
  "/vibelog-scratch/"
];

const REQUIRED_FILES = [
  "README.md",
  "AGENTS.md",
  "package.json",
  "skills/vibelog/SKILL.md",
  "skills/vibelog/assets/vibe-log.schema.json",
  "skills/vibelog/references/agent-usage-guide.md",
  "docs/guides/public-skill-readiness.md",
  "docs/guides/public-skill-readiness.zh.md",
  "docs/guides/handoff-continuity.md",
  "docs/guides/handoff-continuity.zh.md",
  "docs/guides/second-agent-continuation.md",
  "docs/guides/second-agent-continuation.zh.md",
  "docs/guides/real-second-agent-dogfood.md",
  "docs/guides/real-second-agent-dogfood.zh.md",
  "docs/guides/stable-live-hook-workflow.md",
  "docs/guides/stable-live-hook-workflow.zh.md",
  "scripts/export-vibelog.mjs",
  "scripts/validate-vibelog.mjs",
  "scripts/verify-handoff-continuity.mjs",
  "scripts/simulate-second-agent-continuation.mjs",
  "scripts/verify-second-agent-continuation-report.mjs",
  "scripts/verify-clean-clone-adoption.mjs",
  "scripts/verify-release-bundle.mjs",
  "scripts/verify-github-agent-template-adoption.mjs",
  "scripts/vibelog-project.mjs",
  "scripts/vibelog-install.mjs",
  "scripts/verify-public-skill-readiness.mjs",
  "examples/public-sample/vibe-log.md",
  "examples/public-sample/vibe-log.json"
];

const REQUIRED_BIN = {
  "vibelog-project": "./scripts/vibelog-project.mjs",
  "vibelog-install": "./scripts/vibelog-install.mjs",
  "vibelog-verify-public-skill-readiness": "./scripts/verify-public-skill-readiness.mjs"
};

const REQUIRED_SCRIPTS = {
  "vibelog": "node scripts/vibelog-project.mjs",
  "vibelog:install": "node scripts/vibelog-install.mjs",
  "vibelog:verify-public-skill-readiness": "node scripts/verify-public-skill-readiness.mjs"
};

const DOCUMENTATION_REQUIREMENTS = [
  {
    id: "readme",
    path: "README.md",
    patterns: [
      /Public Repository Boundary/u,
      /Core Doctrine/u,
      /vibe coding process memory standard/iu,
      /not a GitHub push tool/iu,
      /verify-public-skill-readiness\.mjs/u,
      /private project memory/u,
      /Public skill readiness is a distribution safety gate/iu,
      /explicit human approval|explicit user approval|explicit approval/iu
    ]
  },
  {
    id: "agents",
    path: "AGENTS.md",
    patterns: [
      /verify-public-skill-readiness\.mjs/u,
      /Do not commit private project `vibe-log\.md`/u
    ]
  },
  {
    id: "skill",
    path: "skills/vibelog/SKILL.md",
    patterns: [
      /public-skill-readiness\.md/u,
      /Core Doctrine/u,
      /process memory standard/iu,
      /not a publishing or push workflow/iu,
      /verify-public-skill-readiness\.mjs/u,
      /Never publish or upload without explicit user approval/u
    ]
  },
  {
    id: "agent-usage-guide",
    path: "skills/vibelog/references/agent-usage-guide.md",
    patterns: [
      /verify-public-skill-readiness\.mjs/u,
      /Core Doctrine/u,
      /process memory standard/iu,
      /not a publishing or push workflow/iu,
      /Never publish or upload without explicit user approval/u,
      /isolated checks|workflow checks/iu
    ]
  },
  {
    id: "public-skill-readiness-en",
    path: "docs/guides/public-skill-readiness.md",
    patterns: [
      /Public Skill Readiness/u,
      /distribution safety gate/iu,
      /not the VibeLog core/iu,
      /core is process memory/iu,
      /isolated checks/iu,
      /workflow checks/iu,
      /vibe-log\.md/u,
      /\.vibelog-events/u,
      /explicit human approval/iu
    ]
  },
  {
    id: "public-skill-readiness-zh",
    path: "docs/guides/public-skill-readiness.zh.md",
    patterns: [
      /公开 skill readiness|公开 Skill Readiness/u,
      /分发安全闸门/u,
      /不是 VibeLog 的核心/u,
      /核心是过程记忆/u,
      /单项检查/u,
      /流程检查/u,
      /vibe-log\.md/u,
      /\.vibelog-events/u,
      /人类明确同意|明确批准/u
    ]
  }
];

const TEXT_EXTENSIONS = new Set([
  ".json",
  ".md",
  ".mdc",
  ".mjs",
  ".txt",
  ".yaml",
  ".yml"
]);

const PERSONAL_WINDOWS_PATH_PATTERN = /C:\\Users\\(?!Public\\b)[^\\\r\n"`']+/iu;
const SECRET_LIKE_PATTERN = /\b(sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/u;

export async function runPublicSkillReadinessVerification({
  repoPath = process.cwd(),
  trackedFiles = null,
  gitStatusShort = null
} = {}) {
  const resolvedRepo = resolve(repoPath);
  const checks = [];
  const failures = [];
  const warnings = [];

  const repoExists = await exists(resolvedRepo);
  addCheck(checks, failures, "repo.exists", repoExists, `Repository path does not exist: ${resolvedRepo}`);
  if (!repoExists) {
    return buildResult({
      repoPath: resolvedRepo,
      checks,
      failures,
      warnings,
      trackedFiles: [],
      privateRootMatches: [],
      personalPathMatches: [],
      secretMatches: [],
      packageJson: null,
      gitStatusShort: ""
    });
  }

  const normalizedTrackedFiles = trackedFiles
    ? trackedFiles.map(normalizeRelativePath)
    : await listGitTrackedFiles(resolvedRepo, warnings);

  const statusShort = gitStatusShort ?? await readGitStatusShort(resolvedRepo, warnings);
  if (statusShort.trim()) {
    warnings.push("Working tree has uncommitted or untracked changes. Run this verifier again after final edits and before push.");
  }

  const packageJson = await readPackageJson(resolvedRepo, failures);
  checkPackageMetadata({ checks, failures, packageJson });
  await checkRequiredFiles({ checks, failures, repoPath: resolvedRepo });
  await checkGitignore({ checks, failures, repoPath: resolvedRepo });
  await checkDocumentation({ checks, failures, repoPath: resolvedRepo });

  const privateRootMatches = normalizedTrackedFiles.filter((file) => isPrivateRootPath(file));
  addCheck(
    checks,
    failures,
    "public_boundary.private_root_files_untracked",
    privateRootMatches.length === 0,
    `Private root project memory is tracked: ${privateRootMatches.join(", ")}`
  );

  const personalPathMatches = await scanTrackedText({
    repoPath: resolvedRepo,
    trackedFiles: normalizedTrackedFiles,
    pattern: PERSONAL_WINDOWS_PATH_PATTERN
  });
  addCheck(
    checks,
    failures,
    "public_boundary.no_personal_local_paths",
    personalPathMatches.length === 0,
    `Tracked text contains personal local machine paths: ${formatMatches(personalPathMatches)}`
  );

  const secretMatches = await scanTrackedText({
    repoPath: resolvedRepo,
    trackedFiles: normalizedTrackedFiles,
    pattern: SECRET_LIKE_PATTERN
  });
  addCheck(
    checks,
    failures,
    "public_boundary.no_secret_like_tokens",
    secretMatches.length === 0,
    `Tracked text contains token-like secrets: ${formatMatches(secretMatches)}`
  );

  return buildResult({
    repoPath: resolvedRepo,
    checks,
    failures,
    warnings,
    trackedFiles: normalizedTrackedFiles,
    privateRootMatches,
    personalPathMatches,
    secretMatches,
    packageJson,
    gitStatusShort: statusShort
  });
}

function buildResult({
  repoPath,
  checks,
  failures,
  warnings,
  trackedFiles,
  privateRootMatches,
  personalPathMatches,
  secretMatches,
  packageJson,
  gitStatusShort
}) {
  const passed = failures.length === 0;
  return {
    schema: "vibelog-public-skill-readiness@0.1",
    passed,
    repo: {
      path: repoPath,
      trackedFileCount: trackedFiles.length,
      workingTreeClean: gitStatusShort.trim().length === 0
    },
    publicBoundary: {
      privateRootFilesTracked: privateRootMatches.length > 0,
      privateRootMatches,
      personalLocalPathsFound: personalPathMatches.length > 0,
      personalPathMatches,
      secretLikeTokensFound: secretMatches.length > 0,
      secretMatches
    },
    entrypoints: {
      packagePrivate: packageJson?.private === true,
      bin: packageJson?.bin ?? {},
      scripts: packageJson?.scripts ?? {}
    },
    pushReadiness: {
      pushEligibleScope: passed,
      requiresExplicitHumanApproval: true,
      repositoryContentReady: passed,
      gitWorkingTreeClean: gitStatusShort.trim().length === 0,
      recommendedNextStep: passed
        ? "Review git diff, commit intentionally, then push only with explicit human approval."
        : "Fix readiness failures before any push."
    },
    checks,
    warnings,
    failures
  };
}

function checkPackageMetadata({ checks, failures, packageJson }) {
  addCheck(checks, failures, "package.exists", Boolean(packageJson), "package.json is missing or invalid.");
  if (!packageJson) return;

  addCheck(checks, failures, "package.private", packageJson.private === true, "package.json must stay private for clone-local reuse.");
  addCheck(checks, failures, "package.type_module", packageJson.type === "module", "package.json must use ESM modules.");

  for (const [name, expectedPath] of Object.entries(REQUIRED_BIN)) {
    addCheck(
      checks,
      failures,
      `package.bin.${name}`,
      packageJson.bin?.[name] === expectedPath,
      `package.json bin.${name} must point to ${expectedPath}.`
    );
  }

  for (const [name, expectedCommand] of Object.entries(REQUIRED_SCRIPTS)) {
    addCheck(
      checks,
      failures,
      `package.script.${name}`,
      packageJson.scripts?.[name] === expectedCommand,
      `package.json scripts.${name} must be ${expectedCommand}.`
    );
  }
}

async function checkRequiredFiles({ checks, failures, repoPath }) {
  for (const path of REQUIRED_FILES) {
    addCheck(
      checks,
      failures,
      `file.${path}`,
      await exists(join(repoPath, path)),
      `Required public skill file is missing: ${path}`
    );
  }
}

async function checkGitignore({ checks, failures, repoPath }) {
  const content = await readText(join(repoPath, ".gitignore"));
  addCheck(checks, failures, "gitignore.exists", content !== null, ".gitignore is missing.");
  if (content === null) return;

  for (const line of REQUIRED_IGNORE_LINES) {
    addCheck(
      checks,
      failures,
      `gitignore.${line}`,
      content.split(/\r?\n/u).map((item) => item.trim()).includes(line),
      `.gitignore must include ${line}.`
    );
  }
}

async function checkDocumentation({ checks, failures, repoPath }) {
  for (const requirement of DOCUMENTATION_REQUIREMENTS) {
    const content = await readText(join(repoPath, requirement.path));
    addCheck(checks, failures, `docs.${requirement.id}.exists`, content !== null, `${requirement.path} is missing.`);
    if (content === null) continue;

    for (const pattern of requirement.patterns) {
      addCheck(
        checks,
        failures,
        `docs.${requirement.id}.${pattern.source}`,
        pattern.test(content),
        `${requirement.path} must mention ${pattern.source}.`
      );
    }
  }
}

async function readPackageJson(repoPath, failures) {
  const content = await readText(join(repoPath, "package.json"));
  if (content === null) return null;

  try {
    return JSON.parse(content);
  } catch (error) {
    failures.push(`package.json is invalid JSON: ${error.message}`);
    return null;
  }
}

async function scanTrackedText({ repoPath, trackedFiles, pattern }) {
  const matches = [];
  for (const file of trackedFiles) {
    if (!TEXT_EXTENSIONS.has(extname(file))) continue;
    const content = await readText(join(repoPath, file));
    if (content === null) continue;
    const match = content.match(pattern);
    if (match) {
      matches.push({
        path: file,
        match: match[0]
      });
    }
  }
  return matches;
}

function addCheck(checks, failures, id, passed, message) {
  const check = {
    id,
    passed: Boolean(passed),
    message
  };
  checks.push(check);
  if (!check.passed) failures.push(`${id}: ${message}`);
}

async function listGitTrackedFiles(repoPath, warnings) {
  const result = await runCommand("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { cwd: repoPath, timeout: 30000 });
  if (result.exitCode === 0) {
    return result.stdout
      .split(/\r?\n/u)
      .map(normalizeRelativePath)
      .filter(Boolean);
  }

  warnings.push(`Could not read git tracked files; falling back to filesystem scan: ${result.stderr || result.stdout}`);
  return listRepositoryFiles(repoPath);
}

async function readGitStatusShort(repoPath, warnings) {
  const result = await runCommand("git", ["status", "--short", "--untracked-files=normal"], {
    cwd: repoPath,
    timeout: 30000
  });
  if (result.exitCode === 0) return result.stdout;

  warnings.push(`Could not read git status: ${result.stderr || result.stdout}`);
  return "";
}

async function listRepositoryFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules") continue;
    const fullPath = join(current, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listRepositoryFiles(root, fullPath));
    } else if (entry.isFile()) {
      files.push(normalizeRelativePath(relative(root, fullPath)));
    }
  }
  return files;
}

function isPrivateRootPath(file) {
  return PRIVATE_ROOT_PATHS.some((privatePath) => file === privatePath || file.startsWith(`${privatePath}/`));
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function readText(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

function normalizeRelativePath(path) {
  return String(path ?? "").replace(/\\/gu, "/").replace(/^\.\//u, "");
}

function formatMatches(matches) {
  return matches.map((item) => `${item.path}: ${item.match}`).join(", ");
}

function runCommand(command, args, { cwd, timeout }) {
  return new Promise((resolveCommand) => {
    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      stderr += `\nTimed out after ${timeout}ms`;
    }, timeout);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolveCommand({
        exitCode: 1,
        stdout,
        stderr: stderr || error.message
      });
    });
    child.on("close", (exitCode) => {
      clearTimeout(timer);
      resolveCommand({
        exitCode,
        stdout,
        stderr
      });
    });
  });
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    repoPath: process.cwd()
  };

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--repo") {
      options.repoPath = args.shift();
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.repoPath) throw new Error("--repo requires a path");
  return options;
}

function printHelp() {
  console.log(`verify-public-skill-readiness

Checks whether the VibeLog repository is safe and useful enough to push as a reusable skill.

Usage:
  node scripts/verify-public-skill-readiness.mjs [--repo <path>]

This verifier checks:
  - private root VibeLog files and event streams are ignored and untracked
  - package metadata exposes the local skill entrypoints
  - README, skill, agent guide, and public readiness docs describe the push boundary
  - tracked text does not contain personal local machine paths or token-like secrets

The command never stages, commits, pushes, publishes, uploads, or edits files.`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const result = await runPublicSkillReadinessVerification(options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
