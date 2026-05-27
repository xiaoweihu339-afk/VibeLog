import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

import { runInstallerBackupRestoreVerification } from "../scripts/verify-installer-backup-restore.mjs";

const execFileAsync = promisify(execFile);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("installer backup restore verifier restores an existing scratch target exactly", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-backup-restore-test-"));

  const result = await runInstallerBackupRestoreVerification({
    sourceRoot: process.cwd(),
    scratchRoot
  });

  assert.equal(result.schema, "vibelog-installer-backup-restore-verification@0.1");
  assert.equal(result.passed, true);
  assert.equal(result.backupPerformed, true);
  assert.equal(result.installPerformed, true);
  assert.equal(result.restorePerformed, true);
  assert.equal(result.targetExistsAfterRestore, true);
  assert.equal(result.existingContentRestored, true);
  assert.equal(result.unrelatedContentPreserved, true);
  assert.equal(result.newInstallerFilesRemoved, true);
  assert.equal(result.safety.scratchOnly, true);
  assert.equal(result.safety.publicInstallerWriteEnabled, false);
  assert.equal(result.safety.globalClaudeSettingsTouched, false);
  assert.equal(result.safety.globalCodexSettingsTouched, false);
  assert.equal(result.safety.pushPerformed, false);
  assert.equal(result.safety.publishPerformed, false);
  assert.equal(resolve(result.scratchRoot), resolve(scratchRoot));
  assert.deepEqual(result.failures, []);
  assert.equal(await readFile(join(result.targetRoot, "README.md"), "utf8"), "existing README\n");
  assert.equal(await readFile(join(result.targetRoot, "scripts", "vibelog-install.mjs"), "utf8"), "existing installer script\n");
  assert.equal(await readFile(join(result.targetRoot, "notes", "keep.txt"), "utf8"), "unrelated user note\n");
  assert.equal(await exists(join(result.targetRoot, "scripts", "record-vibelog-event.mjs")), false);
  assert.ok(result.backup.backedUpPaths.length >= 5);
  assert.ok(result.restore.restoredPaths.length >= 5);
});

test("installer backup restore verifier refuses target roots outside scratch root", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-backup-restore-outside-"));
  const outsideTarget = await mkdtemp(join(tmpdir(), "vibelog-backup-restore-target-"));

  await assert.rejects(
    () => runInstallerBackupRestoreVerification({
      sourceRoot: process.cwd(),
      scratchRoot,
      targetRoot: outsideTarget
    }),
    /targetRoot must be inside scratchRoot/i
  );
});

test("installer backup restore verifier CLI prints passing JSON", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-backup-restore-cli-"));

  const { stdout } = await execFileAsync(process.execPath, [
    "scripts/verify-installer-backup-restore.mjs",
    "--scratch-root",
    scratchRoot
  ], {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024 * 4
  });

  const result = JSON.parse(stdout);
  assert.equal(result.passed, true);
  assert.equal(result.backupPerformed, true);
  assert.equal(result.restorePerformed, true);
  assert.equal(result.targetExistsAfterRestore, true);
  assert.equal(result.newInstallerFilesRemoved, true);
  assert.equal(await readFile(join(result.targetRoot, "package.json"), "utf8"), "{\"name\":\"existing-project\"}\n");
});
