#!/usr/bin/env node
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createInstallPlan } from "./vibelog-install.mjs";

export async function runInstallerBackupRestoreVerification({
  sourceRoot = process.cwd(),
  scratchRoot = null,
  targetRoot = null
} = {}) {
  const resolvedSource = resolve(sourceRoot);
  const resolvedScratch = scratchRoot
    ? resolve(scratchRoot)
    : await mkdtemp(join(tmpdir(), "vibelog-installer-backup-restore-"));
  const resolvedTarget = targetRoot
    ? resolve(targetRoot)
    : join(resolvedScratch, "install-root");
  const backupRoot = join(resolvedScratch, "backup-root");

  assertScratchTarget(resolvedScratch, resolvedTarget);
  assertScratchTarget(resolvedScratch, backupRoot);
  await mkdir(resolvedScratch, { recursive: true });
  await seedExistingTarget(resolvedTarget);

  const beforeSnapshot = await snapshotTree(resolvedTarget);
  const plan = await createInstallPlan({
    sourceRoot: resolvedSource,
    targetRoot: resolvedTarget
  });
  const failures = [];
  const backedUpPaths = [];
  const restoredPaths = [];

  for (const operation of plan.operations) {
    if (await exists(operation.path)) {
      const backupPath = join(backupRoot, relative(resolvedTarget, operation.path));
      await copyPath(operation.path, backupPath);
      backedUpPaths.push(operation.path);
    }
  }

  for (const operation of plan.operations) {
    await copyOperation(operation);
  }

  const afterInstallSnapshot = await snapshotTree(resolvedTarget);
  if (mapsEqual(beforeSnapshot, afterInstallSnapshot)) {
    failures.push("Install did not change the existing target, so backup/restore was not exercised.");
  }

  for (const operation of plan.operations) {
    const backupPath = join(backupRoot, relative(resolvedTarget, operation.path));
    if (await exists(backupPath)) {
      await rm(operation.path, { recursive: true, force: true });
      await copyPath(backupPath, operation.path);
      restoredPaths.push(operation.path);
    } else {
      await rm(operation.path, { recursive: true, force: true });
    }
  }

  const afterRestoreSnapshot = await snapshotTree(resolvedTarget);
  const existingContentRestored = mapsEqual(beforeSnapshot, afterRestoreSnapshot);
  const unrelatedContentPreserved = afterRestoreSnapshot.get("notes/keep.txt") === "unrelated user note\n";
  const newInstallerFilesRemoved = !afterRestoreSnapshot.has("scripts/record-vibelog-event.mjs");
  const targetExistsAfterRestore = await exists(resolvedTarget);

  if (!existingContentRestored) failures.push("Restored target does not match pre-install snapshot.");
  if (!unrelatedContentPreserved) failures.push("Unrelated user content was not preserved.");
  if (!newInstallerFilesRemoved) failures.push("New installer files remained after restore.");
  if (!targetExistsAfterRestore) failures.push("Target root should still exist after restoring existing content.");

  await rm(backupRoot, { recursive: true, force: true });

  return {
    schema: "vibelog-installer-backup-restore-verification@0.1",
    passed: failures.length === 0,
    backupPerformed: backedUpPaths.length > 0,
    installPerformed: true,
    restorePerformed: restoredPaths.length > 0,
    sourceRoot: resolvedSource,
    scratchRoot: resolvedScratch,
    targetRoot: resolvedTarget,
    backupRoot,
    planSchema: plan.schema,
    plannedOperations: plan.operations.length,
    preInstallFileCount: beforeSnapshot.size,
    postInstallFileCount: afterInstallSnapshot.size,
    postRestoreFileCount: afterRestoreSnapshot.size,
    existingContentRestored,
    unrelatedContentPreserved,
    newInstallerFilesRemoved,
    targetExistsAfterRestore,
    backup: {
      strategy: "copy_existing_operation_targets",
      backedUpPaths
    },
    restore: {
      strategy: "remove_installed_operation_targets_then_copy_backups",
      restoredPaths
    },
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

function assertScratchTarget(scratchRoot, targetRoot) {
  const rel = relative(scratchRoot, targetRoot);
  if (!rel || rel.startsWith(`..${sep}`) || rel === ".." || isAbsolute(rel)) {
    throw new Error(`targetRoot must be inside scratchRoot: ${targetRoot}`);
  }
}

async function seedExistingTarget(targetRoot) {
  await mkdir(join(targetRoot, "skills", "vibelog"), { recursive: true });
  await mkdir(join(targetRoot, "scripts"), { recursive: true });
  await mkdir(join(targetRoot, "docs", "guides"), { recursive: true });
  await mkdir(join(targetRoot, "notes"), { recursive: true });

  await writeFile(join(targetRoot, "README.md"), "existing README\n", "utf8");
  await writeFile(join(targetRoot, "package.json"), "{\"name\":\"existing-project\"}\n", "utf8");
  await writeFile(join(targetRoot, "skills", "vibelog", "SKILL.md"), "existing skill\n", "utf8");
  await writeFile(join(targetRoot, "scripts", "vibelog-install.mjs"), "existing installer script\n", "utf8");
  await writeFile(join(targetRoot, "scripts", "local-user-script.mjs"), "existing user script\n", "utf8");
  await writeFile(join(targetRoot, "docs", "guides", "quickstart.md"), "existing quickstart\n", "utf8");
  await writeFile(join(targetRoot, "docs", "guides", "user-guide.md"), "existing user guide\n", "utf8");
  await writeFile(join(targetRoot, "notes", "keep.txt"), "unrelated user note\n", "utf8");
}

async function copyOperation(operation) {
  await copyPath(operation.source, operation.path);
}

async function copyPath(source, target) {
  await mkdir(dirname(target), { recursive: true });
  await cp(source, target, {
    recursive: true,
    force: true,
    errorOnExist: false
  });
}

async function snapshotTree(root) {
  const files = await listFiles(root);
  const snapshot = new Map();
  for (const file of files) {
    const rel = relative(root, file).split(sep).join("/");
    snapshot.set(rel, await readFile(file, "utf8"));
  }
  return snapshot;
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

function mapsEqual(left, right) {
  if (left.size !== right.size) return false;
  for (const [key, value] of left) {
    if (right.get(key) !== value) return false;
  }
  return true;
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
      throw new Error("S19 backup/restore verifier is scratch-only. Use --scratch-root and keep the public installer dry-run-only.");
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.sourceRoot) throw new Error("--source requires a path");
  return options;
}

function helpText() {
  return `verify-installer-backup-restore

Scratch-only VibeLog installer backup/restore verifier.

Usage:
  verify-installer-backup-restore [--source <repo-root>] [--scratch-root <scratch-root>]
  verify-installer-backup-restore --help

Safety:
  - Writes only inside a scratch target.
  - Backs up existing scratch target content before install simulation.
  - Restores the scratch target to its pre-install snapshot.
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

  const result = await runInstallerBackupRestoreVerification(options);
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
