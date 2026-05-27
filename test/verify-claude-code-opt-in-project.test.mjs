import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { validateVibeLog } from "../scripts/validate-vibelog.mjs";
import { runOptInProjectVerification } from "../scripts/verify-claude-code-opt-in-project.mjs";

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("real project opt-in verification installs local hooks and updates VibeLog", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-real-project-opt-in-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    const result = await runOptInProjectVerification({
      workspace: project,
      adapterPath
    });

    assert.equal(result.passed, true);
    assert.equal(result.dryRun.wrote, false);
    assert.equal(result.dryRun.settingsExistedAfter, false);
    assert.equal(result.write.wrote, true);
    assert.equal(result.write.settingsPath, join(project, ".claude", "settings.json"));
    assert.equal(await exists(result.write.settingsPath), true);

    assert.deepEqual(result.project.filesCreated.sort(), [
      "README.md",
      "package.json",
      "src/receipt-total.js",
      "test/receipt-total.test.js",
      "vibe-log.md"
    ].sort());

    assert.equal(result.hooks.commandsRun.length, 4);
    assert.equal(result.hooks.markdownUpdated, true);
    assert.equal(result.hooks.jsonUpdated, true);
    assert.ok(result.hooks.eventFileCount >= 4);
    assert.match(result.settings.stopCommand, /CLAUDE_PROJECT_DIR/);
    assert.match(result.settings.stopCommand, /claude-code-hook-adapter\.mjs/);

    const data = JSON.parse(await readFile(join(project, "vibe-log.json"), "utf8"));
    const validation = validateVibeLog(data);
    assert.equal(validation.valid, true, validation.errors.join("\n"));
    assert.match(data.title, /VibeLog Opt-In Fixture/);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("stream-first opt-in verification accumulates hook events before recorder consumption", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-stream-project-opt-in-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    const result = await runOptInProjectVerification({
      workspace: project,
      adapterPath,
      eventMode: "stream"
    });

    assert.equal(result.passed, true);
    assert.equal(result.write.wrote, true);
    assert.match(result.settings.stopCommand, /--event-stream/);
    assert.doesNotMatch(result.settings.stopCommand, /--log/);
    assert.equal(result.hooks.commandsRun.length, 4);
    assert.equal(result.hooks.eventStreamExists, true);
    assert.equal(result.hooks.streamEventCount, 4);
    assert.equal(result.hooks.markdownUpdatedBeforeConsume, false);
    assert.equal(result.hooks.markdownUpdated, true);
    assert.equal(result.hooks.jsonUpdated, true);
    assert.equal(result.hooks.eventFileCount, 1);
    assert.deepEqual(result.hooks.eventFiles, ["session.jsonl"]);

    const data = JSON.parse(await readFile(join(project, "vibe-log.json"), "utf8"));
    const validation = validateVibeLog(data);
    assert.equal(validation.valid, true, validation.errors.join("\n"));
    assert.equal(data.execution_prompts.length, 1);
    assert.equal(data.verification_evidence.length, 1);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("real project opt-in verification is repeatable when local settings already exist", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-real-project-opt-in-repeat-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    const first = await runOptInProjectVerification({
      workspace: project,
      adapterPath
    });
    const second = await runOptInProjectVerification({
      workspace: project,
      adapterPath
    });

    assert.equal(first.passed, true);
    assert.equal(second.passed, true);
    assert.equal(second.dryRun.settingsExistedBefore, true);
    assert.equal(second.dryRun.createdSettings, false);
    assert.equal(second.hooks.commandsRun.length, 4);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});
