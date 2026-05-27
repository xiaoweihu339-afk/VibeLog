#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const INSTALL_DIRECTORIES = [
  {
    label: "VibeLog skill",
    source: "skills/vibelog",
    target: "skills/vibelog"
  },
  {
    label: "VibeLog scripts",
    source: "scripts",
    target: "scripts"
  },
  {
    label: "VibeLog guide docs",
    source: "docs/guides",
    target: "docs/guides"
  }
];

const INSTALL_FILES = [
  {
    label: "README",
    source: "README.md",
    target: "README.md"
  },
  {
    label: "package metadata",
    source: "package.json",
    target: "package.json"
  }
];

export async function runInstallDryRun(options = {}) {
  return createInstallPlan(options);
}

export async function createInstallPlan({
  sourceRoot = process.cwd(),
  targetRoot,
  existingPaths = null
} = {}) {
  if (!targetRoot) throw new Error("--target is required");

  const resolvedSource = resolve(sourceRoot);
  const resolvedTarget = resolve(targetRoot);
  const pkg = JSON.parse(await readFile(join(resolvedSource, "package.json"), "utf8"));
  const existing = normalizeExistingPaths(existingPaths);
  const operations = [];
  const rollbackPlan = [];
  const warnings = [];

  for (const item of INSTALL_DIRECTORIES) {
    const sourcePath = join(resolvedSource, item.source);
    const targetPath = join(resolvedTarget, item.target);
    const exists = await pathExists(targetPath, existing);
    const fileCount = await countFiles(sourcePath);

    operations.push({
      action: "copy_directory",
      label: item.label,
      source: sourcePath,
      path: targetPath,
      fileCount,
      status: exists ? "would_update" : "would_create"
    });

    rollbackPlan.push(exists
      ? {
          action: "restore_backup",
          path: targetPath,
          reason: `${item.label} already exists and would need a backup before a future write mode.`
        }
      : {
          action: "remove_directory",
          path: targetPath,
          reason: `${item.label} would be created by a future write mode.`
        });

    if (exists) warnings.push(`${item.label} already exists at ${targetPath}; future write mode must create a backup first.`);
  }

  for (const item of INSTALL_FILES) {
    const sourcePath = join(resolvedSource, item.source);
    const targetPath = join(resolvedTarget, item.target);
    const exists = await pathExists(targetPath, existing);

    operations.push({
      action: "copy_file",
      label: item.label,
      source: sourcePath,
      path: targetPath,
      status: exists ? "would_update" : "would_create"
    });

    rollbackPlan.push(exists
      ? {
          action: "restore_backup",
          path: targetPath,
          reason: `${item.label} already exists and would need a backup before a future write mode.`
        }
      : {
          action: "remove_file",
          path: targetPath,
          reason: `${item.label} would be created by a future write mode.`
        });

    if (exists) warnings.push(`${item.label} already exists at ${targetPath}; future write mode must create a backup first.`);
  }

  return {
    schema: "vibelog-install-plan@0.1",
    dryRun: true,
    writesPerformed: false,
    sourceRoot: resolvedSource,
    targetRoot: resolvedTarget,
    packagePrivate: pkg.private === true,
    operations,
    rollbackPlan,
    safety: {
      dryRunOnly: true,
      writesPerformed: false,
      pushPerformed: false,
      publishPerformed: false,
      globalClaudeSettingsTouched: false,
      requiresExplicitWriteApprovalForFutureInstaller: true
    },
    warnings
  };
}

async function countFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      count += await countFiles(path);
    } else if (entry.isFile()) {
      count += 1;
    }
  }

  return count;
}

function normalizeExistingPaths(existingPaths) {
  if (!existingPaths) return null;
  return new Set([...existingPaths].map((path) => resolve(path).toLowerCase()));
}

async function pathExists(path, existingPaths) {
  const resolvedPath = resolve(path);
  if (existingPaths) return existingPaths.has(resolvedPath.toLowerCase());

  try {
    await stat(resolvedPath);
    return true;
  } catch {
    return false;
  }
}

function parseArgs(argv) {
  const options = {
    sourceRoot: process.cwd(),
    targetRoot: null
  };
  const args = [...argv];

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    } else if (arg === "--target") {
      options.targetRoot = args.shift() ?? "";
    } else if (arg === "--source") {
      options.sourceRoot = args.shift() ?? "";
    } else if (arg === "--write") {
      throw new Error("S17 installer is dry-run only. Refusing --write.");
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.targetRoot) throw new Error("--target is required");
  if (!options.sourceRoot) throw new Error("--source requires a path");
  return options;
}

function helpText() {
  return `vibelog-install

Dry-run-only VibeLog installer planner.

Usage:
  vibelog-install --target <install-root> [--source <repo-root>]
  vibelog-install --help

Safety:
  - S17 never writes files.
  - --write is refused.
  - No push, publish, upload, or global Claude settings changes.
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const plan = await runInstallDryRun(options);
  console.log(JSON.stringify(plan, null, 2));
}

if (import.meta.url === pathToFileURL(fileURLToPath(import.meta.url)).href) {
  const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
  if (import.meta.url === invokedPath) {
    main().catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  }
}
