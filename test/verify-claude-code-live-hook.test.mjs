import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { parseVibeLogMarkdown } from "../scripts/export-vibelog.mjs";
import {
  classifyClaudeRuntimeIssue,
  createScratchVibeLog,
  evaluateLessScriptedDogfoodEvidence,
  evaluateLiveHookEvidence,
  parseClaudeAuthStatusText,
  runFixtureVerification,
  runLiveVerification,
  runClaudeRuntimePreflight,
  resetLiveEventStream,
  summarizeVibeEventStream,
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

test("live hook evidence can require a real PostToolUse hook", () => {
  const baseEvidence = {
    eventMode: "stream",
    markdownUpdated: true,
    eventStreamExists: true,
    streamEventCount: 2,
    markdownUpdatedBeforeConsume: false,
    requireToolUse: true
  };

  const withoutToolUse = evaluateLiveHookEvidence({
    ...baseEvidence,
    hookResponses: [
      { hook_event: "UserPromptSubmit", exit_code: 0 },
      { hook_event: "Stop", exit_code: 0 }
    ]
  });

  assert.equal(withoutToolUse.passed, false);
  assert.equal(withoutToolUse.status, "missing_tool_use");
  assert.equal(withoutToolUse.toolUseHookCount, 0);

  const withToolUse = evaluateLiveHookEvidence({
    ...baseEvidence,
    hookResponses: [
      { hook_event: "UserPromptSubmit", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "Stop", exit_code: 0 }
    ]
  });

  assert.equal(withToolUse.passed, true);
  assert.equal(withToolUse.status, "passed");
  assert.equal(withToolUse.toolUseHookCount, 1);
});

test("live hook evidence can require a recorded test run event", () => {
  const baseEvidence = {
    eventMode: "stream",
    markdownUpdated: true,
    eventStreamExists: true,
    streamEventCount: 3,
    markdownUpdatedBeforeConsume: false,
    requireToolUse: true,
    requireTestRun: true,
    hookResponses: [
      { hook_event: "UserPromptSubmit", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "Stop", exit_code: 0 }
    ]
  };

  const withoutTestRun = evaluateLiveHookEvidence({
    ...baseEvidence,
    testRunEventCount: 0
  });

  assert.equal(withoutTestRun.passed, false);
  assert.equal(withoutTestRun.status, "missing_test_run");

  const withTestRun = evaluateLiveHookEvidence({
    ...baseEvidence,
    testRunEventCount: 1
  });

  assert.equal(withTestRun.passed, true);
  assert.equal(withTestRun.status, "passed");
});

test("live hook evidence can require minimum multi-step counts", () => {
  const evidence = {
    eventMode: "stream",
    markdownUpdated: true,
    eventStreamExists: true,
    streamEventCount: 6,
    markdownUpdatedBeforeConsume: false,
    requireToolUse: true,
    requireTestRun: true,
    minToolUseHookCount: 4,
    minTestRunEventCount: 2,
    hookResponses: [
      { hook_event: "UserPromptSubmit", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "Stop", exit_code: 0 }
    ],
    testRunEventCount: 1
  };

  const notEnoughToolUse = evaluateLiveHookEvidence(evidence);

  assert.equal(notEnoughToolUse.passed, false);
  assert.equal(notEnoughToolUse.status, "insufficient_tool_use");
  assert.equal(notEnoughToolUse.toolUseHookCount, 3);

  const notEnoughTestRuns = evaluateLiveHookEvidence({
    ...evidence,
    hookResponses: [
      ...evidence.hookResponses,
      { hook_event: "PostToolUse", exit_code: 0 }
    ]
  });

  assert.equal(notEnoughTestRuns.passed, false);
  assert.equal(notEnoughTestRuns.status, "insufficient_test_runs");

  const enoughEvidence = evaluateLiveHookEvidence({
    ...evidence,
    hookResponses: [
      ...evidence.hookResponses,
      { hook_event: "PostToolUse", exit_code: 0 }
    ],
    testRunEventCount: 2
  });

  assert.equal(enoughEvidence.passed, true);
  assert.equal(enoughEvidence.status, "passed");
});

test("live hook evidence can require a failed test run before recovery", () => {
  const evidence = {
    eventMode: "stream",
    markdownUpdated: true,
    eventStreamExists: true,
    streamEventCount: 7,
    markdownUpdatedBeforeConsume: false,
    requireToolUse: true,
    requireTestRun: true,
    requireFailedTestRun: true,
    minToolUseHookCount: 4,
    minTestRunEventCount: 2,
    hookResponses: [
      { hook_event: "UserPromptSubmit", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "PostToolUse", exit_code: 0 },
      { hook_event: "Stop", exit_code: 0 }
    ],
    testRunEventCount: 2,
    failedTestRunEventCount: 0
  };

  const withoutFailedTest = evaluateLiveHookEvidence(evidence);

  assert.equal(withoutFailedTest.passed, false);
  assert.equal(withoutFailedTest.status, "missing_failed_test_run");

  const withFailedTest = evaluateLiveHookEvidence({
    ...evidence,
    failedTestRunEventCount: 1
  });

  assert.equal(withFailedTest.passed, true);
  assert.equal(withFailedTest.status, "passed");
});

test("less-scripted dogfood evidence requires natural work artifacts", () => {
  const weakSummary = summarizeVibeEventStream([
    JSON.stringify({ type: "prompt_submitted" }),
    JSON.stringify({ type: "tool_used", files_changed: [] }),
    JSON.stringify({ type: "handoff_updated" })
  ].join("\n"));

  const weakEvidence = evaluateLessScriptedDogfoodEvidence({
    streamEventSummary: weakSummary
  });

  assert.equal(weakEvidence.passed, false);
  assert.equal(weakEvidence.status, "insufficient_tool_work");
  assert.equal(weakEvidence.promptSubmittedEventCount, 1);

  const strongSummary = summarizeVibeEventStream([
    JSON.stringify({ type: "prompt_submitted" }),
    JSON.stringify({ type: "tool_used", files_changed: ["src/bill-summary.mjs"] }),
    JSON.stringify({ type: "tool_used", files_changed: ["test/bill-summary.test.mjs"] }),
    JSON.stringify({ type: "tool_used", files_changed: ["README.md"] }),
    JSON.stringify({ type: "test_ran", result: "passed" }),
    JSON.stringify({ type: "handoff_updated" })
  ].join("\n"));

  assert.deepEqual(strongSummary.uniqueChangedFiles.sort(), [
    "README.md",
    "src/bill-summary.mjs",
    "test/bill-summary.test.mjs"
  ]);

  const strongEvidence = evaluateLessScriptedDogfoodEvidence({
    streamEventSummary: strongSummary
  });

  assert.equal(strongEvidence.passed, true);
  assert.equal(strongEvidence.status, "passed");
  assert.equal(strongEvidence.changedFileEventCount, 3);
});

test("less-scripted dogfood evidence can require human decisions", () => {
  const summaryWithoutDecision = summarizeVibeEventStream([
    JSON.stringify({ type: "prompt_submitted" }),
    JSON.stringify({ type: "tool_used", files_changed: ["idea-board.mjs"] }),
    JSON.stringify({ type: "tool_used", files_changed: ["idea-board.test.mjs"] }),
    JSON.stringify({ type: "tool_used", files_changed: ["README.md"] }),
    JSON.stringify({ type: "test_ran", result: "passed" }),
    JSON.stringify({ type: "handoff_updated" })
  ].join("\n"));

  const missingDecision = evaluateLessScriptedDogfoodEvidence({
    streamEventSummary: summaryWithoutDecision,
    requireHumanDecision: true
  });

  assert.equal(missingDecision.passed, false);
  assert.equal(missingDecision.status, "missing_human_decision");
  assert.equal(missingDecision.decisionMadeEventCount, 0);

  const summaryWithDecision = summarizeVibeEventStream([
    JSON.stringify({ type: "prompt_submitted" }),
    JSON.stringify({
      type: "decision_made",
      decision_type: "storage",
      human_input: "Use one JSON file.",
      final_decision: "Use ideas.json.",
      impact: "Keep MVP simple."
    }),
    JSON.stringify({ type: "tool_used", files_changed: ["idea-board.mjs"] }),
    JSON.stringify({ type: "tool_used", files_changed: ["idea-board.test.mjs"] }),
    JSON.stringify({ type: "tool_used", files_changed: ["README.md"] }),
    JSON.stringify({ type: "test_ran", result: "passed" }),
    JSON.stringify({ type: "handoff_updated" })
  ].join("\n"));

  const withDecision = evaluateLessScriptedDogfoodEvidence({
    streamEventSummary: summaryWithDecision,
    requireHumanDecision: true
  });

  assert.equal(withDecision.passed, true);
  assert.equal(withDecision.status, "passed");
  assert.equal(withDecision.decisionMadeEventCount, 1);
});

test("live stream reset removes fixture events before a paid live attempt", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-live-reset-"));
  const eventStreamPath = join(dir, ".vibelog-events", "session.jsonl");

  try {
    await mkdir(join(dir, ".vibelog-events"), { recursive: true });
    await writeFile(eventStreamPath, "{\"type\":\"tool_used\"}\n", "utf8");
    await resetLiveEventStream({
      eventMode: "stream",
      eventStreamPath
    });

    await assert.rejects(
      readFile(eventStreamPath, "utf8"),
      /ENOENT/
    );
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

test("classifies budget failures without mistaking uuid digits for authentication", () => {
  const issue = classifyClaudeRuntimeIssue({
    stdout: [
      JSON.stringify({
        type: "system",
        subtype: "hook_response",
        hook_id: "53e55a99-632f-4d77-b89b-25e8bc1b401b",
        hook_event: "UserPromptSubmit",
        exit_code: 0
      }),
      JSON.stringify({
        type: "result",
        subtype: "error_max_budget_usd",
        is_error: true,
        errors: ["Reached maximum budget ($0.01)"]
      })
    ].join("\n"),
    stderr: "Warning: no stdin data received in 3s",
    errorMessage: "Command failed"
  });

  assert.equal(issue.status, "budget_exceeded");
  assert.equal(issue.failureCategory, "external_environment");
  assert.equal(issue.coreBusiness.passed, false);
  assert.match(issue.summary, /budget/);
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
