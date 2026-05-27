import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { parseVibeLogMarkdown } from "../scripts/export-vibelog.mjs";
import {
  classifyClaudeRuntimeIssue,
  createScratchVibeLog,
  parseClaudeAuthStatusText,
  runFixtureVerification,
  runLiveVerification,
  runClaudeRuntimePreflight,
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
    assert.equal(result.status, "skipped");
    assert.equal(result.coreBusiness.passed, false);
    assert.match(result.reason, /--live/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("parses Claude auth status without treating login as full live readiness", () => {
  const status = parseClaudeAuthStatusText(JSON.stringify({
    loggedIn: true,
    authMethod: "oauth_token",
    apiProvider: "firstParty"
  }));

  assert.equal(status.checked, true);
  assert.equal(status.loggedIn, true);
  assert.equal(status.status, "logged_in");
  assert.equal(status.provesModelAccess, false);
});

test("classifies runtime authentication failures as external environment blockers", () => {
  const issue = classifyClaudeRuntimeIssue({
    stdout: [
      JSON.stringify({ type: "system", subtype: "hook_response", hook_event: "UserPromptSubmit", exit_code: 0 }),
      JSON.stringify({ type: "system", subtype: "api_retry", error_status: 401, error: "authentication_failed" })
    ].join("\n"),
    stderr: "Warning: no stdin data received in 3s",
    errorMessage: "Command failed"
  });

  assert.equal(issue.status, "auth_failed");
  assert.equal(issue.failureCategory, "external_environment");
  assert.equal(issue.coreBusiness.passed, false);
  assert.equal(issue.hookResponses.length, 1);
  assert.match(issue.summary, /authentication_failed/);
});

test("preflight reports installed Claude and auth status without running a model turn", async () => {
  const result = await runClaudeRuntimePreflight({ timeoutMs: 30000 });

  assert.equal(result.checked, true);
  assert.equal(result.installation.checked, true);
  assert.match(result.installation.version ?? "", /Claude Code/);
  assert.equal(result.auth.checked, true);
  assert.equal(result.modelProbeAttempted, false);
  assert.equal(result.provesCompletedSession, false);
});

test("preflight does not report Claude missing just because scratch cwd is not created yet", async () => {
  const missingScratch = join(tmpdir(), `vibelog-missing-preflight-${Date.now()}`);
  const result = await runClaudeRuntimePreflight({
    cwd: missingScratch,
    timeoutMs: 30000
  });

  assert.equal(result.installation.checked, true);
  assert.equal(result.installation.installed, true);
  assert.equal(result.installation.cwdFallbackUsed, true);
});
