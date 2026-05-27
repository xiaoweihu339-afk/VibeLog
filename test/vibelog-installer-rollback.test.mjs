import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

import { runInstallerRollbackVerification } from "../scripts/verify-installer-rollback.mjs";

const execFileAsync = promisify(execFile);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("installer rollback verifier installs into scratch target and removes created files", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-rollback-test-"));

  const result = await runInstallerRollbackVerification({
    sourceRoot: process.cwd(),
    scratchRoot
  });

  assert.equal(result.schema, "vibelog-installer-rollback-verification@0.1");
  assert.equal(result.passed, true);
  assert.equal(result.installPerformed, true);
  assert.equal(result.rollbackPerformed, true);
  assert.equal(result.safety.scratchOnly, true);
  assert.equal(result.safety.globalClaudeSettingsTouched, false);
  assert.equal(result.safety.globalCodexSettingsTouched, false);
  assert.equal(result.safety.pushPerformed, false);
  assert.equal(result.safety.publishPerformed, false);
  assert.equal(result.targetExistsAfterRollback, false);
  assert.equal(await exists(result.targetRoot), false);
  assert.equal(resolve(result.scratchRoot), resolve(scratchRoot));
  assert.ok(result.installedPaths.some((path) => path.endsWith(join("skills", "vibelog", "SKILL.md"))));
  assert.ok(result.installedPaths.some((path) => path.endsWith("README.md")));
  assert.ok(result.rollback.removedPaths.length > 0);
  assert.deepEqual(result.failures, []);
});

test("installer rollback verifier refuses an existing scratch target", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-rollback-existing-"));
  const targetRoot = join(scratchRoot, "install-root");
  await mkdir(targetRoot, { recursive: true });
  await writeFile(join(targetRoot, "keep.txt"), "do not remove", "utf8");

  await assert.rejects(
    () => runInstallerRollbackVerification({
      sourceRoot: process.cwd(),
      scratchRoot,
      targetRoot
    }),
    /targetRoot must not already exist/i
  );

  assert.equal(await exists(join(targetRoot, "keep.txt")), true);
});

test("installer rollback verifier CLI prints passing JSON", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-rollback-cli-"));

  const { stdout } = await execFileAsync(process.execPath, [
    "scripts/verify-installer-rollback.mjs",
    "--scratch-root",
    scratchRoot
  ], {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024 * 4
  });

  const result = JSON.parse(stdout);
  assert.equal(result.passed, true);
  assert.equal(result.installPerformed, true);
  assert.equal(result.rollbackPerformed, true);
  assert.equal(result.targetExistsAfterRollback, false);
  assert.equal(await exists(result.targetRoot), false);
});
