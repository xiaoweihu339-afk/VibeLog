import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { parseVibeLogMarkdown } from "../scripts/export-vibelog.mjs";
import {
  createScratchVibeLog,
  runFixtureVerification,
  runLiveVerification,
  writeClaudeLocalSettings
} from "../scripts/verify-claude-code-live-hook.mjs";

test("writes local Claude settings without touching global settings", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-live-settings-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    const settingsPath = await writeClaudeLocalSettings({
      workspace: dir,
      adapterPath
    });
    const settings = JSON.parse(await readFile(settingsPath, "utf8"));
    const command = settings.hooks.UserPromptSubmit[0].hooks[0].command;

    assert.ok(settingsPath.startsWith(dir));
    assert.ok(settingsPath.replaceAll("\\", "/").endsWith("/.claude/settings.json"));
    assert.match(command, /claude-code-hook-adapter\.mjs/);
    assert.match(command, /--event-dir/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("writes stream-first local Claude settings without direct log writes", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-live-stream-settings-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    const settingsPath = await writeClaudeLocalSettings({
      workspace: dir,
      adapterPath,
      eventMode: "stream"
    });
    const settings = JSON.parse(await readFile(settingsPath, "utf8"));
    const command = settings.hooks.Stop[0].hooks[0].command;

    assert.ok(settingsPath.startsWith(dir));
    assert.match(command, /--event-stream/);
    assert.match(command, /\.vibelog-events[\\/]session\.jsonl|\.vibelog-events\/session\.jsonl/);
    assert.doesNotMatch(command, /--log/);
    assert.doesNotMatch(command, /--json/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("creates a minimal scratch VibeLog", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-live-log-"));

  try {
    const logPath = await createScratchVibeLog({ workspace: dir });
    const markdown = await readFile(logPath, "utf8");
    const data = parseVibeLogMarkdown(markdown);

    assert.equal(data.title, "Claude Live Hook Test");
    assert.match(data.one_line_vibe, /Verify Claude Code hooks/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("fixture verification updates scratch Markdown and JSON through hook command path", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-live-fixture-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    const result = await runFixtureVerification({
      workspace: dir,
      adapterPath
    });
    const markdown = await readFile(result.logPath, "utf8");
    const json = JSON.parse(await readFile(result.jsonPath, "utf8"));
    const data = parseVibeLogMarkdown(markdown);

    assert.equal(result.fixturePassed, true);
    assert.ok(result.commandsRun.length >= 3);
    assert.ok(data.execution_prompts.length >= 1);
    assert.ok(data.verification_evidence.length >= 1);
    assert.equal(json.title, "Claude Live Hook Test");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("fixture verification can run stream-first and consume the event stream", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-live-stream-fixture-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    const result = await runFixtureVerification({
      workspace: dir,
      adapterPath,
      eventMode: "stream"
    });
    const markdown = await readFile(result.logPath, "utf8");
    const json = JSON.parse(await readFile(result.jsonPath, "utf8"));

    assert.equal(result.fixturePassed, true);
    assert.equal(result.eventMode, "stream");
    assert.equal(result.markdownUpdatedBeforeConsume, false);
    assert.equal(result.eventStreamExists, true);
    assert.equal(result.streamEventCount, 4);
    assert.match(markdown, /Fixture hook verification completed/);
    assert.equal(json.title, "Claude Live Hook Test");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("live verification is skipped unless explicitly enabled", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-live-skip-"));

  try {
    const result = await runLiveVerification({
      workspace: dir,
      live: false
    });

    assert.equal(result.attempted, false);
    assert.match(result.reason, /--live/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
