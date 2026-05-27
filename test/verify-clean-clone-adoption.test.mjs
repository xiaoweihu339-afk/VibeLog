import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { validateVibeLog } from "../scripts/validate-vibelog.mjs";
import { runCleanCloneAdoptionVerification } from "../scripts/verify-clean-clone-adoption.mjs";

const execFileAsync = promisify(execFile);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("clean clone adoption verification runs the package workflow from a fresh clone", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "vibelog-clean-clone-adoption-"));

  try {
    const result = await runCleanCloneAdoptionVerification({
      repoPath: process.cwd(),
      workspace
    });

    assert.equal(result.passed, true);
    assert.equal(await exists(join(result.clone.path, "package.json")), true);
    assert.equal(await exists(join(result.clone.path, "scripts", "vibelog-project.mjs")), true);
    assert.match(result.commands.help.stdout, /vibelog-project/);
    assert.equal(result.commands.init.created, true);
    assert.equal(result.commands.dryRun.wrote, false);
    assert.equal(result.safety.settingsCreatedByDryRun, false);
    assert.equal(result.commands.write.wrote, true);
    assert.equal(result.commands.verify.ready, true);
    assert.equal(result.commands.disable.removedHookCount, 3);
    assert.equal(result.commands.verifyAfterDisable.ready, false);
    assert.equal(result.safety.globalClaudeSettingsUnchanged, true);

    const data = JSON.parse(await readFile(join(result.targetProject.path, "vibe-log.json"), "utf8"));
    const validation = validateVibeLog(data);
    assert.equal(validation.valid, true, validation.errors.join("\n"));
    assert.equal(data.title, "Slice 13 Clean Clone Adoption");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("clean clone adoption verifier CLI prints a passing JSON result", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "vibelog-clean-clone-adoption-cli-"));

  try {
    const { stdout } = await execFileAsync(process.execPath, [
      "scripts/verify-clean-clone-adoption.mjs",
      "--repo",
      process.cwd(),
      "--workspace",
      workspace
    ], {
      cwd: process.cwd(),
      timeout: 120000,
      maxBuffer: 1024 * 1024
    });
    const result = JSON.parse(stdout);

    assert.equal(result.passed, true);
    assert.match(result.clone.path, /vibelog-clean-clone/);
    assert.equal(result.commands.verify.ready, true);
    assert.equal(result.safety.globalClaudeSettingsUnchanged, true);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
