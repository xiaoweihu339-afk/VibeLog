import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

import { createInstallPlan, runInstallDryRun } from "../scripts/vibelog-install.mjs";

const execFileAsync = promisify(execFile);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("installer dry-run builds an install and rollback plan without writing files", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "vibelog-install-dry-run-"));
  const targetRoot = join(workspace, "install-root");

  const plan = await createInstallPlan({
    sourceRoot: process.cwd(),
    targetRoot
  });

  assert.equal(plan.dryRun, true);
  assert.equal(plan.writesPerformed, false);
  assert.equal(plan.packagePrivate, true);
  assert.equal(plan.targetRoot, resolve(targetRoot));
  assert.equal(await exists(targetRoot), false);
  assert.ok(plan.operations.length >= 4);
  assert.ok(plan.operations.some((operation) => operation.action === "copy_directory" && operation.label === "VibeLog skill"));
  assert.ok(plan.operations.some((operation) => operation.action === "copy_directory" && operation.label === "VibeLog scripts"));
  assert.ok(plan.operations.some((operation) => operation.action === "copy_file" && operation.label === "README"));
  assert.ok(plan.rollbackPlan.some((step) => step.action === "remove_directory" && step.path.endsWith(join("skills", "vibelog"))));
  assert.deepEqual(plan.safety, {
    dryRunOnly: true,
    writesPerformed: false,
    pushPerformed: false,
    publishPerformed: false,
    globalClaudeSettingsTouched: false,
    requiresExplicitWriteApprovalForFutureInstaller: true
  });
});

test("installer dry-run marks existing targets without modifying them", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "vibelog-install-existing-"));
  const targetRoot = join(workspace, "install-root");

  const plan = await runInstallDryRun({
    sourceRoot: process.cwd(),
    targetRoot,
    existingPaths: new Set([
      join(targetRoot, "skills", "vibelog"),
      join(targetRoot, "scripts")
    ])
  });

  assert.equal(plan.writesPerformed, false);
  assert.equal(await exists(targetRoot), false);
  assert.ok(plan.operations.some((operation) => operation.status === "would_update"));
  assert.ok(plan.warnings.some((warning) => warning.includes("already exists")));
  assert.ok(plan.rollbackPlan.some((step) => step.action === "restore_backup"));
});

test("installer CLI prints JSON dry-run output and does not create target files", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "vibelog-install-cli-"));
  const targetRoot = join(workspace, "install-root");

  const { stdout } = await execFileAsync(process.execPath, [
    "scripts/vibelog-install.mjs",
    "--target",
    targetRoot
  ], {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });

  const plan = JSON.parse(stdout);
  assert.equal(plan.dryRun, true);
  assert.equal(plan.writesPerformed, false);
  assert.equal(plan.targetRoot, resolve(targetRoot));
  assert.equal(await exists(targetRoot), false);
});

test("installer CLI refuses write mode in Slice 17", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "vibelog-install-write-"));
  const targetRoot = join(workspace, "install-root");

  await assert.rejects(
    () => execFileAsync(process.execPath, [
      "scripts/vibelog-install.mjs",
      "--target",
      targetRoot,
      "--write"
    ], {
      cwd: process.cwd(),
      timeout: 30000,
      maxBuffer: 1024 * 1024
    }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /dry-run only/i);
      return true;
    }
  );

  assert.equal(await exists(targetRoot), false);
});
