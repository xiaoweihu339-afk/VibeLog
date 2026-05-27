#!/usr/bin/env node
import { cp, mkdir, mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createInstallPlan } from "./vibelog-install.mjs";

export async function runInstallerRollbackVerification({
  sourceRoot = process.cwd(),
  scratchRoot = null,
  targetRoot = null
} = {}) {
  const resolvedSource = resolve(sourceRoot);
  const resolvedScratch = scratchRoot
    ? resolve(scratchRoot)
    : await makeDefaultScratchRoot();
  const resolvedTarget = targetRoot
    ? resolve(targetRoot)
    : join(resolvedScratch, "install-root");

  assertScratchTarget(resolvedScratch, resolvedTarget);
  await mkdir(resolvedScratch, { recursive: true });

  if (await exists(resolvedTarget)) {
    throw new Error(`targetRoot must not already exist: ${resolvedTarget}`);
  }

  const plan = await createInstallPlan({
    sourceRoot: resolvedSource,
    targetRoot: resolvedTarget
  });

  const failures = [];
  const installedPaths = [];

  for (const operation of plan.operations) {
    await copyOperation(operation);
  }

  for (const operation of plan.operations) {
    if (!await exists(operation.path)) {
      failures.push(`Missing installed path: ${operation.path}`);
    }
  }

  if (await exists(resolvedTarget)) {
    installedPaths.push(...await listFiles(resolvedTarget));
  } else {
    failures.push(`Install target was not created: ${resolvedTarget}`);
  }

  await rm(resolvedTarget, { recursive: true, force: true });

  const targetExistsAfterRollback = await exists(resolvedTarget);
  if (targetExistsAfterRollback) {
    failures.push(`Rollback did not remove target: ${resolvedTarget}`);
  }

  return {
    schema: "vibelog-installer-rollback-verification@0.1",
    passed: failures.length === 0,
    installPerformed: true,
    rollbackPerformed: true,
    sourceRoot: resolvedSource,
    scratchRoot: resolvedScratch,
    targetRoot: resolvedTarget,
    planSchema: plan.schema,
    plannedOperations: plan.operations.length,
    installedPaths,
    rollback: {
      strategy: "remove_scratch_target",
      removedPaths: installedPaths,
      targetExistsAfterRollback
    },
    targetExistsAfterRollback,
    safety: {
      scratchOnly: true,
      publicInstallerWriteEnabled: false,
      globalClaudeSettingsTouched: false,
      globalCodexSettingsTouched: false,
      pushPerformed: false,
      publishPerformed: false
    },
    failures
  };
}

async function makeDefaultScratchRoot() {
  return mkdtemp(join(tmpdir(), "vibelog-installer-rollback-"));
}

function assertScratchTarget(scratchRoot, targetRoot) {
  const rel = relative(scratchRoot, targetRoot);
  if (!rel || rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel)) {
    throw new Error(`targetRoot must be inside scratchRoot: ${targetRoot}`);
  }
}

async function copyOperation(operation) {
  if (operation.action === "copy_directory") {
    await cp(operation.source, operation.path, {
      recursive: true,
      force: true,
      errorOnExist: false
    });
    return;
  }

  if (operation.action === "copy_file") {
    await mkdir(dirname(operation.path), { recursive: true });
    await cp(operation.source, operation.path, {
      force: true,
      errorOnExist: false
    });
    return;
  }

  throw new Error(`Unsupported install operation: ${operation.action}`);
}

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      paths.push(...await listFiles(path));
    } else if (entry.isFile()) {
      paths.push(path);
    }
  }

  return paths.sort();
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
    sourceRoot: process.cwd(),
    scratchRoot: null
  };
  const args = [...argv];

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--help" || arg === "-h") {
      return { help: true };
    } else if (arg === "--source") {
      options.sourceRoot = args.shift() ?? "";
    } else if (arg === "--scratch-root") {
      options.scratchRoot = args.shift() ?? "";
    } else if (arg === "--target" || arg === "--write") {
      throw new Error("S18 rollback verifier is scratch-only. Use --scratch-root and keep the public installer dry-run-only.");
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.sourceRoot) throw new Error("--source requires a path");
  return options;
}

function helpText() {
  return `verify-installer-rollback

Scratch-only VibeLog installer rollback verifier.

Usage:
  verify-installer-rollback [--source <repo-root>] [--scratch-root <scratch-root>]
  verify-installer-rollback --help

Safety:
  - Writes only inside a scratch target.
  - Removes the scratch install target after verification.
  - Does not enable public installer write mode.
  - No push, publish, upload, or global Claude/Codex settings changes.
`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(helpText());
    return;
  }

  const result = await runInstallerRollbackVerification(options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
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
