import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { validateVibeLog } from "../scripts/validate-vibelog.mjs";
import { runReleaseBundleVerification } from "../scripts/verify-release-bundle.mjs";

const execFileAsync = promisify(execFile);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("release bundle verifier proves an extracted package can run the adoption and installer safety workflow", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-release-bundle-"));

  try {
    const result = await runReleaseBundleVerification({
      repoPath: process.cwd(),
      scratchRoot
    });

    assert.equal(result.schema, "vibelog-release-bundle-verification@0.1");
    assert.equal(result.passed, true);
    assert.equal(result.bundle.packageName, "vibelog");
    assert.match(result.bundle.filename, /\.tgz$/);
    assert.equal(result.contents.included["README.md"], true);
    assert.equal(result.contents.included["package.json"], true);
    assert.equal(result.contents.included["skills/vibelog/SKILL.md"], true);
    assert.equal(result.contents.included["skills/vibelog/assets/vibe-log.schema.json"], true);
    assert.equal(result.contents.included["scripts/vibelog-project.mjs"], true);
    assert.equal(result.contents.included["scripts/vibelog-install.mjs"], true);
    assert.equal(result.contents.included["scripts/verify-public-skill-readiness.mjs"], true);
    assert.equal(result.contents.included["scripts/verify-installer-rollback.mjs"], true);
    assert.equal(result.contents.included["scripts/verify-installer-backup-restore.mjs"], true);
    assert.equal(result.contents.excluded[".git"], true);
    assert.equal(result.contents.excluded["node_modules"], true);
    assert.equal(result.contents.excluded["test"], true);
    assert.match(result.commands.help.stdout, /vibelog-project/);
    assert.equal(result.commands.init.created, true);
    assert.equal(result.commands.dryRun.wrote, false);
    assert.equal(result.commands.verify.ready, true);
    assert.equal(result.commands.disable.removedHookCount, 3);
    assert.equal(result.installerSafety.rollback.passed, true);
    assert.equal(result.installerSafety.backupRestore.passed, true);
    assert.equal(result.safety.scratchOnly, true);
    assert.equal(result.safety.pushPerformed, false);
    assert.equal(result.safety.publishPerformed, false);
    assert.deepEqual(result.failures, []);

    const data = JSON.parse(await readFile(join(result.consumerProject.path, "vibe-log.json"), "utf8"));
    const validation = validateVibeLog(data);
    assert.equal(validation.valid, true, validation.errors.join("\n"));
    assert.equal(data.title, "Slice 20 Release Bundle Consumer");
    assert.equal(await exists(join(result.extractedPackage.path, ".git")), false);
    assert.equal(await exists(join(result.extractedPackage.path, "test")), false);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});

test("release bundle verifier CLI prints a passing JSON result", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-release-bundle-cli-"));

  try {
    const { stdout } = await execFileAsync(process.execPath, [
      "scripts/verify-release-bundle.mjs",
      "--repo",
      process.cwd(),
      "--scratch-root",
      scratchRoot
    ], {
      cwd: process.cwd(),
      timeout: 120000,
      maxBuffer: 1024 * 1024 * 4
    });
    const result = JSON.parse(stdout);

    assert.equal(result.passed, true);
    assert.equal(result.bundle.packageName, "vibelog");
    assert.equal(result.commands.verify.ready, true);
    assert.equal(result.installerSafety.rollback.passed, true);
    assert.equal(result.installerSafety.backupRestore.passed, true);
    assert.equal(result.safety.pushPerformed, false);
    assert.equal(result.safety.publishPerformed, false);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});

test("release bundle verifier can reuse the same scratch root safely", async () => {
  const scratchRoot = await mkdtemp(join(tmpdir(), "vibelog-release-bundle-rerun-"));

  try {
    const first = await runReleaseBundleVerification({
      repoPath: process.cwd(),
      scratchRoot
    });
    const second = await runReleaseBundleVerification({
      repoPath: process.cwd(),
      scratchRoot
    });

    assert.equal(first.passed, true);
    assert.equal(second.passed, true);
    assert.notEqual(first.run.path, second.run.path);
    assert.match(first.run.path, /run-/);
    assert.match(second.run.path, /run-/);
  } finally {
    await rm(scratchRoot, { recursive: true, force: true });
  }
});
