import { execFile } from "node:child_process";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { delimiter, join, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

import { recordVibeLogEventsFile } from "./record-vibelog-event.mjs";
import { validateVibeLog } from "./validate-vibelog.mjs";
import { runSettingsHookCommand } from "./verify-claude-code-opt-in-project.mjs";

const execFileAsync = promisify(execFile);

export async function createScratchVibeLog({ workspace }) {
  await mkdir(workspace, { recursive: true });
  const logPath = join(workspace, "vibe-log.md");
  const markdown = `---
schema: vibelog@0.2-draft
title: "Claude Live Hook Test"
one_line_vibe: "Verify Claude Code hooks can update VibeLog through the adapter and recorder core."
stage: prototype
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: agent_led_human_approved
process_level: core
tools: ["Claude Code", "VibeLog"]
tags: ["vibelog", "claude-code", "live-hook-test"]
created_at: "2026-05-27"
updated_at: "2026-05-27"
---

# VibeLog

## One-Line Vibe

Verify Claude Code hooks can update VibeLog through the adapter and recorder core.

## Current Idea

Use a scratch workspace to verify local Claude Code hook configuration without changing global settings.

## Idea Evolution

## Human-in-the-Loop

## Implementation Status

### Current State

Scratch VibeLog is ready for hook verification.

### Completed

- Scratch workspace created.

### In Progress

### Pending

- Run fixture hook verification.
- Attempt live Claude Code verification if explicitly enabled.

### Blocked

### Next Actions

- Run the verifier and inspect generated VibeLog output.

## Execution Prompts

## Development Log

## Bugfix / Incident Log

No bugfix or incident entry yet.

## Validation Design

### Success Criteria

- Hook command updates Markdown.
- Hook command regenerates JSON.
- No global settings are modified.

### Core User Paths

- Run fixture hook verification.
- Run opt-in live verification only when explicitly enabled.
- Inspect generated Markdown and JSON.

### Manual Test Steps

- Run the live hook verifier without --live.
- Run the live hook verifier with --live only in a scratch workspace.

### Automated Test Strategy

Run node --test test/verify-claude-code-live-hook.test.mjs.

## Verification Evidence

## Artifact Index

## Handoff State

### Current State

Scratch VibeLog is ready for hook verification.

### Completed

- Scratch workspace created.

### Pending

- Run fixture hook verification.
- Attempt live Claude Code verification if explicitly enabled.

### Blockers

### Next Actions

- Run the verifier and inspect generated VibeLog output.

### Context For Next Agent

- This is a scratch-only live hook verification project.

## Vibe Progress

### 2026-05-27

**Stage:** prototype

**What Happened:** Created the scratch live hook verification fixture.

**Tools Used:** VibeLog

**Problems:** none

**Next:** Execute representative hook commands.

## Public Summary

Scratch-only VibeLog for Claude Code live hook verification.
`;

  await writeFile(logPath, markdown, "utf8");
  return logPath;
}

export async function writeClaudeLocalSettings({ workspace, adapterPath, eventMode = "direct" }) {
  const claudeDir = join(workspace, ".claude");
  await mkdir(claudeDir, { recursive: true });

  const command = buildAdapterCommand({
    adapterPath,
    eventMode: normalizeEventMode(eventMode)
  });

  const hook = {
    type: "command",
    ...(process.platform === "win32" ? { shell: "powershell" } : {}),
    command
  };

  const settings = {
    hooks: {
      UserPromptSubmit: [{ matcher: "", hooks: [hook] }],
      PostToolUse: [{ matcher: "", hooks: [hook] }],
      Stop: [{ matcher: "", hooks: [hook] }]
    }
  };

  const settingsPath = join(claudeDir, "settings.json");
  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  return settingsPath;
}

export async function runFixtureVerification({ workspace, adapterPath, eventMode = "direct" }) {
  const resolvedWorkspace = resolve(workspace);
  const resolvedAdapter = resolve(adapterPath);
  const normalizedEventMode = normalizeEventMode(eventMode);
  const logPath = await createScratchVibeLog({ workspace: resolvedWorkspace });
  const settingsPath = await writeClaudeLocalSettings({
    workspace: resolvedWorkspace,
    adapterPath: resolvedAdapter,
    eventMode: normalizedEventMode
  });
  const jsonPath = join(resolvedWorkspace, "vibe-log.json");
  const eventDir = join(resolvedWorkspace, ".vibelog-events");
  const eventStreamPath = join(eventDir, "session.jsonl");
  const promptText = "Implement a tiny fixture task and run node --test";
  const completionText = "Fixture hook verification completed.";

  const fixtures = [
    {
      hook_event_name: "UserPromptSubmit",
      session_id: "fixture-session",
      cwd: resolvedWorkspace,
      prompt: promptText
    },
    {
      hook_event_name: "PostToolUse",
      session_id: "fixture-session",
      tool_name: "Write",
      tool_input: { file_path: "README.md" },
      tool_response: { success: true }
    },
    {
      hook_event_name: "PostToolUse",
      session_id: "fixture-session",
      tool_name: "Bash",
      tool_input: { command: "node --test" },
      tool_response: { exit_code: 0, stdout: "tests 1\npass 1\nfail 0" }
    },
    {
      hook_event_name: "Stop",
      session_id: "fixture-session",
      stop_hook_active: false,
      last_assistant_message: completionText
    }
  ];

  const settings = JSON.parse(await readFile(settingsPath, "utf8"));
  const commandsRun = [];
  for (const fixture of fixtures) {
    await runSettingsHookCommand({
      command: getVibeLogCommand(settings, fixture.hook_event_name),
      workspace: resolvedWorkspace,
      payload: fixture
    });
    commandsRun.push(fixture.hook_event_name);
  }

  const markdownBeforeConsume = await readFile(logPath, "utf8");
  const markdownUpdatedBeforeConsume = markdownBeforeConsume.includes(completionText);
  const eventStreamExists = await exists(eventStreamPath);
  let streamEventCount = 0;

  if (normalizedEventMode === "stream") {
    if (!eventStreamExists) {
      throw new Error(`Expected stream-first event file to exist: ${eventStreamPath}`);
    }

    const eventStream = await readFile(eventStreamPath, "utf8");
    streamEventCount = eventStream.split(/\r?\n/u).filter((line) => line.trim().length > 0).length;
    await recordVibeLogEventsFile({
      eventsPath: eventStreamPath,
      logPath,
      jsonPath
    });
  }

  const markdown = await readFile(logPath, "utf8");
  const json = JSON.parse(await readFile(jsonPath, "utf8"));
  const validation = validateVibeLog(json);

  return {
    fixturePassed: markdown.includes(completionText)
      && json.title === "Claude Live Hook Test"
      && validation.valid
      && (normalizedEventMode !== "stream" || (streamEventCount === fixtures.length && markdownUpdatedBeforeConsume === false)),
    eventMode: normalizedEventMode,
    workspace: resolvedWorkspace,
    settingsPath,
    logPath,
    jsonPath,
    eventDir,
    eventStreamPath,
    eventStreamExists,
    streamEventCount,
    markdownUpdatedBeforeConsume,
    commandsRun,
    validation: {
      valid: validation.valid,
      errors: validation.errors
    }
  };
}

export async function runLiveVerification({
  workspace,
  adapterPath,
  live = false,
  prompt = "Reply with OK. Do not use tools.",
  maxBudgetUsd = "0.05",
  eventMode = "direct",
  timeoutMs = 120000,
  requireToolUse = false,
  requireTestRun = false,
  requireFailedTestRun = false,
  requireLessScriptedDogfood = false,
  requireHumanDecision = false,
  minToolUseHookCount = 0,
  minTestRunEventCount = 0,
  minToolUsedEventCount = 3,
  minChangedFileEventCount = 2,
  permissionMode = null
}) {
  const normalizedEventMode = normalizeEventMode(eventMode);
  if (!live) {
    return {
      attempted: false,
      passed: false,
      status: "skipped",
      eventMode: normalizedEventMode,
      reason: "Live Claude Code verification requires --live.",
      coreBusiness: coreBusinessStatus({
        passed: false,
        status: "skipped",
        summary: "Live Claude Code hook recording was not attempted."
      })
    };
  }

  const resolvedWorkspace = resolve(workspace);
  const resolvedAdapter = resolve(adapterPath ?? "scripts/claude-code-hook-adapter.mjs");
  await createScratchVibeLog({ workspace: resolvedWorkspace });
  const settingsPath = await writeClaudeLocalSettings({
    workspace: resolvedWorkspace,
    adapterPath: resolvedAdapter,
    eventMode: normalizedEventMode
  });
  const eventStreamPath = join(resolvedWorkspace, ".vibelog-events", "session.jsonl");
  await resetLiveEventStream({
    eventMode: normalizedEventMode,
    eventStreamPath
  });

  try {
    const claudeArgs = [
      "-p",
      prompt,
      "--settings",
      settingsPath,
      "--max-budget-usd",
      maxBudgetUsd,
      "--output-format",
      "stream-json",
      "--include-hook-events",
      "--verbose"
    ];
    if (permissionMode) {
      claudeArgs.push("--permission-mode", permissionMode);
    }

    const { stdout, stderr } = await runClaudeCommand(claudeArgs, {
      cwd: resolvedWorkspace,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024
    });

    const markdownBeforeConsume = await readFile(join(resolvedWorkspace, "vibe-log.md"), "utf8");
    const markdownUpdatedBeforeConsume = markdownBeforeConsume.includes("Claude Code hook event captured");
    const eventStreamExists = await exists(eventStreamPath);
    let streamEventCount = 0;
    let streamEventSummary = emptyStreamEventSummary();

    if (normalizedEventMode === "stream") {
      if (!eventStreamExists) {
        throw new Error(`Expected stream-first event file to exist: ${eventStreamPath}`);
      }

      const eventStream = await readFile(eventStreamPath, "utf8");
      streamEventCount = eventStream.split(/\r?\n/u).filter((line) => line.trim().length > 0).length;
      streamEventSummary = summarizeVibeEventStream(eventStream);
      await recordVibeLogEventsFile({
        eventsPath: eventStreamPath,
        logPath: join(resolvedWorkspace, "vibe-log.md"),
        jsonPath: join(resolvedWorkspace, "vibe-log.json")
      });
    }

    const markdown = await readFile(join(resolvedWorkspace, "vibe-log.md"), "utf8");
    const stream = parseStreamJsonLines(stdout);
    const hookResponses = extractHookResponses(stream);
    const result = stream.find((event) => event.type === "result");
    const markdownUpdated = markdown.includes("Claude Code hook event captured");
    const evidence = evaluateLiveHookEvidence({
      eventMode: normalizedEventMode,
      hookResponses,
      markdownUpdated,
      eventStreamExists,
      streamEventCount,
      markdownUpdatedBeforeConsume,
      requireToolUse,
      requireTestRun,
      requireFailedTestRun,
      minToolUseHookCount,
      minTestRunEventCount,
      testRunEventCount: streamEventSummary.testRunEventCount,
      failedTestRunEventCount: streamEventSummary.failedTestRunEventCount
    });
    const dogfoodEvidence = requireLessScriptedDogfood
      ? evaluateLessScriptedDogfoodEvidence({
        streamEventSummary,
        minToolUsedEventCount,
        minChangedFileEventCount,
        minTestRunEventCount,
        requireHumanDecision
      })
      : {
        passed: true,
        status: "not_required",
        summary: "Less-scripted dogfood evidence was not required."
      };
    const passed = evidence.passed && dogfoodEvidence.passed;
    const status = evidence.passed ? dogfoodEvidence.status : evidence.status;
    const summary = passed
      ? "Claude Code completed a live less-scripted dogfood session and VibeLog recorded the hook flow."
      : (evidence.passed ? dogfoodEvidence.summary : evidence.summary);

    return {
      attempted: true,
      passed,
      status,
      eventMode: normalizedEventMode,
      maxBudgetUsd,
      requireToolUse,
      requireTestRun,
      requireFailedTestRun,
      requireLessScriptedDogfood,
      requireHumanDecision,
      minToolUseHookCount,
      minTestRunEventCount,
      minToolUsedEventCount,
      minChangedFileEventCount,
      permissionMode,
      settingsPath,
      timeoutMs,
      result: result?.result ?? "",
      totalCostUsd: result?.total_cost_usd ?? null,
      hookResponses,
      toolUseHookCount: evidence.toolUseHookCount,
      testRunEventCount: streamEventSummary.testRunEventCount,
      passedTestRunEventCount: streamEventSummary.passedTestRunEventCount,
      failedTestRunEventCount: streamEventSummary.failedTestRunEventCount,
      toolUsedEventCount: streamEventSummary.toolUsedEventCount,
      changedFileEventCount: streamEventSummary.changedFileEventCount,
      uniqueChangedFiles: streamEventSummary.uniqueChangedFiles,
      decisionMadeEventCount: streamEventSummary.decisionMadeEventCount,
      streamEventTypes: streamEventSummary.eventTypes,
      lessScriptedDogfood: dogfoodEvidence,
      eventStreamPath,
      eventStreamExists,
      streamEventCount,
      markdownUpdatedBeforeConsume,
      coreBusiness: coreBusinessStatus({
        passed,
        status,
        summary
      }),
      stderr: stderr.trim()
    };
  } catch (error) {
    const issue = classifyClaudeRuntimeIssue({
      stdout: error.stdout?.toString() ?? "",
      stderr: error.stderr?.toString() ?? "",
      errorMessage: error.message
    });
    const eventStreamStats = await readEventStreamStats(eventStreamPath);

    return {
      attempted: true,
      passed: false,
      status: issue.status,
      failureCategory: issue.failureCategory,
      eventMode: normalizedEventMode,
      maxBudgetUsd,
      requireToolUse,
      requireTestRun,
      requireFailedTestRun,
      requireLessScriptedDogfood,
      requireHumanDecision,
      minToolUseHookCount,
      minTestRunEventCount,
      minToolUsedEventCount,
      minChangedFileEventCount,
      permissionMode,
      settingsPath,
      timeoutMs,
      hookResponses: issue.hookResponses,
      toolUseHookCount: issue.hookResponses.filter((event) => event.hook_event === "PostToolUse" && event.exit_code === 0).length,
      eventStreamPath,
      eventStreamExists: eventStreamStats.exists,
      streamEventCount: eventStreamStats.count,
      coreBusiness: issue.coreBusiness,
      error: error.message,
      stdout: error.stdout?.toString().trim() ?? "",
      stderr: error.stderr?.toString().trim() ?? ""
    };
  }
}

export function evaluateLiveHookEvidence({
  eventMode = "direct",
  hookResponses = [],
  markdownUpdated = false,
  eventStreamExists = false,
  streamEventCount = 0,
  markdownUpdatedBeforeConsume = false,
  requireToolUse = false,
  requireTestRun = false,
  requireFailedTestRun = false,
  minToolUseHookCount = 0,
  minTestRunEventCount = 0,
  testRunEventCount = 0,
  failedTestRunEventCount = 0
} = {}) {
  const stopHookSucceeded = hookResponses.some((event) => event.hook_event === "Stop" && event.exit_code === 0);
  const toolUseHookCount = hookResponses.filter((event) => event.hook_event === "PostToolUse" && event.exit_code === 0).length;
  const streamEvidencePassed = eventMode !== "stream"
    || (eventStreamExists && streamEventCount > 0 && markdownUpdatedBeforeConsume === false);

  if (!stopHookSucceeded) {
    return {
      passed: false,
      status: "missing_stop",
      stopHookSucceeded,
      toolUseHookCount,
      summary: "Claude Code returned without proving a completed Stop/session-end VibeLog flow."
    };
  }

  if (requireToolUse && toolUseHookCount === 0) {
    return {
      passed: false,
      status: "missing_tool_use",
      stopHookSucceeded,
      toolUseHookCount,
      summary: "Claude Code completed Stop, but no successful PostToolUse hook was captured."
    };
  }

  if (minToolUseHookCount > 0 && toolUseHookCount < minToolUseHookCount) {
    return {
      passed: false,
      status: "insufficient_tool_use",
      stopHookSucceeded,
      toolUseHookCount,
      summary: `Claude Code completed Stop, but captured ${toolUseHookCount} successful PostToolUse hook(s), fewer than the required ${minToolUseHookCount}.`
    };
  }

  if (requireTestRun && testRunEventCount === 0) {
    return {
      passed: false,
      status: "missing_test_run",
      stopHookSucceeded,
      toolUseHookCount,
      summary: "Claude Code completed Stop, but no test_ran Vibe Event was captured."
    };
  }

  if (minTestRunEventCount > 0 && testRunEventCount < minTestRunEventCount) {
    return {
      passed: false,
      status: "insufficient_test_runs",
      stopHookSucceeded,
      toolUseHookCount,
      summary: `Claude Code completed Stop, but captured ${testRunEventCount} test_ran event(s), fewer than the required ${minTestRunEventCount}.`
    };
  }

  if (requireFailedTestRun && failedTestRunEventCount === 0) {
    return {
      passed: false,
      status: "missing_failed_test_run",
      stopHookSucceeded,
      toolUseHookCount,
      summary: "Claude Code completed Stop, but no failed test_ran Vibe Event was captured before recovery."
    };
  }

  if (!markdownUpdated) {
    return {
      passed: false,
      status: "log_not_updated",
      stopHookSucceeded,
      toolUseHookCount,
      summary: "Claude Code completed Stop, but VibeLog was not updated."
    };
  }

  if (!streamEvidencePassed) {
    return {
      passed: false,
      status: "stream_not_recorded",
      stopHookSucceeded,
      toolUseHookCount,
      summary: "Claude Code completed Stop, but stream-first hook evidence was not recorded cleanly."
    };
  }

  return {
    passed: true,
    status: "passed",
    stopHookSucceeded,
    toolUseHookCount,
    summary: "Claude Code completed a live session and VibeLog recorded the hook flow."
  };
}

export async function resetLiveEventStream({ eventMode = "direct", eventStreamPath } = {}) {
  if (eventMode !== "stream" || !eventStreamPath) return false;
  await rm(eventStreamPath, { force: true });
  return true;
}

export function evaluateLessScriptedDogfoodEvidence({
  streamEventSummary = emptyStreamEventSummary(),
  minToolUsedEventCount = 3,
  minChangedFileEventCount = 2,
  minTestRunEventCount = 1,
  requireHumanDecision = false
} = {}) {
  const promptSubmittedEventCount = streamEventSummary.promptSubmittedEventCount ?? 0;
  const toolUsedEventCount = streamEventSummary.toolUsedEventCount ?? 0;
  const changedFileEventCount = streamEventSummary.changedFileEventCount ?? 0;
  const testRunEventCount = streamEventSummary.testRunEventCount ?? 0;
  const passedTestRunEventCount = streamEventSummary.passedTestRunEventCount ?? 0;
  const handoffUpdatedEventCount = streamEventSummary.handoffUpdatedEventCount ?? 0;
  const decisionMadeEventCount = streamEventSummary.decisionMadeEventCount ?? 0;

  const base = {
    promptSubmittedEventCount,
    toolUsedEventCount,
    changedFileEventCount,
    testRunEventCount,
    passedTestRunEventCount,
    handoffUpdatedEventCount,
    decisionMadeEventCount
  };

  if (promptSubmittedEventCount === 0) {
    return {
      ...base,
      passed: false,
      status: "missing_prompt",
      summary: "Less-scripted dogfood did not record a user prompt."
    };
  }

  if (toolUsedEventCount < minToolUsedEventCount) {
    return {
      ...base,
      passed: false,
      status: "insufficient_tool_work",
      summary: `Less-scripted dogfood recorded ${toolUsedEventCount} tool_used event(s), fewer than the required ${minToolUsedEventCount}.`
    };
  }

  if (changedFileEventCount < minChangedFileEventCount) {
    return {
      ...base,
      passed: false,
      status: "insufficient_file_changes",
      summary: `Less-scripted dogfood recorded ${changedFileEventCount} file-changing tool event(s), fewer than the required ${minChangedFileEventCount}.`
    };
  }

  if (testRunEventCount < minTestRunEventCount) {
    return {
      ...base,
      passed: false,
      status: "insufficient_test_runs",
      summary: `Less-scripted dogfood recorded ${testRunEventCount} test_ran event(s), fewer than the required ${minTestRunEventCount}.`
    };
  }

  if (passedTestRunEventCount === 0) {
    return {
      ...base,
      passed: false,
      status: "missing_passed_test_run",
      summary: "Less-scripted dogfood recorded tests, but no passing test run."
    };
  }

  if (requireHumanDecision && decisionMadeEventCount === 0) {
    return {
      ...base,
      passed: false,
      status: "missing_human_decision",
      summary: "Less-scripted dogfood did not record a decision_made event."
    };
  }

  if (handoffUpdatedEventCount === 0) {
    return {
      ...base,
      passed: false,
      status: "missing_handoff",
      summary: "Less-scripted dogfood did not record a handoff_updated event."
    };
  }

  return {
    ...base,
    passed: true,
    status: "passed",
    summary: requireHumanDecision
      ? "Less-scripted dogfood recorded prompt, human decision, tool work, file changes, tests, and handoff."
      : "Less-scripted dogfood recorded prompt, tool work, file changes, tests, and handoff."
  };
}

export function summarizeVibeEventStream(text) {
  const events = parseStreamJsonLines(text);
  const eventTypes = events
    .map((event) => event.type)
    .filter((type) => typeof type === "string");
  const testRunEvents = events.filter((event) => event.type === "test_ran");
  const changedFileEvents = events.filter((event) => (
    event.type === "tool_used"
    && Array.isArray(event.files_changed)
    && event.files_changed.length > 0
  ));
  const uniqueChangedFiles = [
    ...new Set(changedFileEvents.flatMap((event) => event.files_changed))
  ].sort();

  return {
    eventTypes,
    promptSubmittedEventCount: eventTypes.filter((type) => type === "prompt_submitted").length,
    decisionMadeEventCount: eventTypes.filter((type) => type === "decision_made").length,
    toolUsedEventCount: eventTypes.filter((type) => type === "tool_used").length,
    changedFileEventCount: changedFileEvents.length,
    uniqueChangedFiles,
    testRunEventCount: testRunEvents.length,
    passedTestRunEventCount: testRunEvents.filter((event) => event.result === "passed").length,
    failedTestRunEventCount: testRunEvents.filter((event) => event.result === "failed").length,
    handoffUpdatedEventCount: eventTypes.filter((type) => type === "handoff_updated").length
  };
}

function emptyStreamEventSummary() {
  return {
    eventTypes: [],
    promptSubmittedEventCount: 0,
    decisionMadeEventCount: 0,
    toolUsedEventCount: 0,
    changedFileEventCount: 0,
    uniqueChangedFiles: [],
    testRunEventCount: 0,
    passedTestRunEventCount: 0,
    failedTestRunEventCount: 0,
    handoffUpdatedEventCount: 0
  };
}

export async function runClaudeRuntimePreflight({ timeoutMs = 30000, cwd = process.cwd() } = {}) {
  const installation = await inspectClaudeInstallation({ timeoutMs, cwd });
  if (!installation.installed) {
    return {
      checked: true,
      status: "claude_not_installed",
      installation,
      auth: {
        checked: false,
        status: "not_checked",
        provesModelAccess: false
      },
      modelProbeAttempted: false,
      provesCompletedSession: false,
      readyForLiveAttempt: false
    };
  }

  const auth = await inspectClaudeAuthStatus({ timeoutMs, cwd });
  const readyForLiveAttempt = auth.loggedIn === true;

  return {
    checked: true,
    status: readyForLiveAttempt ? "cli_ready_auth_reported" : "auth_not_ready",
    installation,
    auth,
    modelProbeAttempted: false,
    provesCompletedSession: false,
    readyForLiveAttempt,
    note: "Auth status is a readiness signal only; it does not prove model API access or a completed live hook session."
  };
}

export function parseClaudeAuthStatusText(text) {
  try {
    const parsed = JSON.parse(String(text ?? ""));
    const loggedIn = parsed.loggedIn === true;
    return {
      checked: true,
      status: loggedIn ? "logged_in" : "not_logged_in",
      loggedIn,
      authMethod: parsed.authMethod ?? null,
      apiProvider: parsed.apiProvider ?? null,
      provesModelAccess: false
    };
  } catch (error) {
    return {
      checked: true,
      status: "unparseable",
      loggedIn: null,
      authMethod: null,
      apiProvider: null,
      provesModelAccess: false,
      error: error.message,
      raw: summarizeText(text, "No auth status output.")
    };
  }
}

export function classifyClaudeRuntimeIssue({ stdout = "", stderr = "", errorMessage = "" } = {}) {
  const stream = parseStreamJsonLines(stdout);
  const hookResponses = extractHookResponses(stream);
  const combined = [stdout, stderr, errorMessage].filter(Boolean).join("\n");
  const apiRetries = stream
    .filter((event) => event.type === "system" && event.subtype === "api_retry")
    .map((event) => ({
      attempt: event.attempt ?? null,
      error_status: event.error_status ?? null,
      error: event.error ?? ""
    }));

  const hasAuthFailure = apiRetries.some((event) => (
    event.error_status === 401 || /authentication_failed/iu.test(event.error)
  )) || /authentication_failed|error_status"?\s*:\s*401|(?:http\s*)?status(?:\s*code)?\s*:?\s*401/iu.test(combined);

  if (hasAuthFailure) {
    return runtimeIssue({
      status: "auth_failed",
      failureCategory: "external_environment",
      summary: "Claude Code reported authentication_failed before the live session could complete.",
      hookResponses,
      apiRetries
    });
  }

  if (/timed out|timeout/iu.test(combined)) {
    return runtimeIssue({
      status: "timeout",
      failureCategory: "external_environment",
      summary: "Claude Code did not complete within the configured timeout.",
      hookResponses,
      apiRetries
    });
  }

  if (/budget|Exceeded USD budget/iu.test(combined)) {
    return runtimeIssue({
      status: "budget_exceeded",
      failureCategory: "external_environment",
      summary: "Claude Code stopped before completion because the configured budget was too low.",
      hookResponses,
      apiRetries
    });
  }

  return runtimeIssue({
    status: "runtime_failed",
    failureCategory: hookResponses.length > 0 ? "runtime_incomplete" : "unknown",
    summary: summarizeText(errorMessage || stderr || stdout, "Claude Code live verification failed before proving the core flow."),
    hookResponses,
    apiRetries
  });
}

function parseStreamJsonLines(text) {
  return String(text ?? "")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { type: "unparsed", raw: line };
      }
    });
}

function extractHookResponses(stream) {
  return stream
    .filter((event) => event.type === "system" && event.subtype === "hook_response")
    .map((event) => ({
      hook_event: event.hook_event,
      exit_code: event.exit_code,
      outcome: event.outcome,
      output: summarizeText(event.output, "No hook output.")
    }));
}

function summarizeText(text, fallback) {
  const clean = String(text ?? "").replace(/\s+/gu, " ").trim();
  if (!clean) return fallback;
  return clean.length <= 240 ? clean : `${clean.slice(0, 237)}...`;
}

function coreBusinessStatus({ passed, status, summary }) {
  return {
    target: "completed Claude Code live hook recording into VibeLog",
    passed,
    status,
    summary
  };
}

function runtimeIssue({ status, failureCategory, summary, hookResponses, apiRetries }) {
  return {
    status,
    failureCategory,
    summary,
    hookResponses,
    apiRetries,
    coreBusiness: coreBusinessStatus({
      passed: false,
      status,
      summary
    })
  };
}

async function runClaudeCommand(args, options) {
  if (process.platform === "win32") {
    return execFileAsync(await resolveWindowsClaudeExecutable(), args, options);
  }
  return execFileAsync("claude", args, options);
}

async function inspectClaudeInstallation({ timeoutMs, cwd }) {
  const executionCwd = await existingCwdOrFallback(cwd);
  try {
    const executable = process.platform === "win32" ? await resolveWindowsClaudeExecutable() : "claude";
    const { stdout, stderr } = await execFileAsync(executable, ["--version"], {
      cwd: executionCwd.cwd,
      timeout: timeoutMs,
      maxBuffer: 1024 * 128
    });

    return {
      checked: true,
      installed: true,
      executable,
      version: stdout.trim() || stderr.trim(),
      cwd: executionCwd.cwd,
      cwdFallbackUsed: executionCwd.fallbackUsed
    };
  } catch (error) {
    return {
      checked: true,
      installed: false,
      executable: process.platform === "win32" ? "claude.exe" : "claude",
      cwd: executionCwd.cwd,
      cwdFallbackUsed: executionCwd.fallbackUsed,
      error: error.message,
      stdout: error.stdout?.toString().trim() ?? "",
      stderr: error.stderr?.toString().trim() ?? ""
    };
  }
}

async function inspectClaudeAuthStatus({ timeoutMs, cwd }) {
  const executionCwd = await existingCwdOrFallback(cwd);
  try {
    const executable = process.platform === "win32" ? await resolveWindowsClaudeExecutable() : "claude";
    const { stdout } = await execFileAsync(executable, ["auth", "status", "--json"], {
      cwd: executionCwd.cwd,
      timeout: timeoutMs,
      maxBuffer: 1024 * 128
    });

    return {
      ...parseClaudeAuthStatusText(stdout),
      cwd: executionCwd.cwd,
      cwdFallbackUsed: executionCwd.fallbackUsed
    };
  } catch (error) {
    return {
      checked: true,
      status: "auth_status_failed",
      loggedIn: null,
      authMethod: null,
      apiProvider: null,
      provesModelAccess: false,
      cwd: executionCwd.cwd,
      cwdFallbackUsed: executionCwd.fallbackUsed,
      error: error.message,
      stdout: error.stdout?.toString().trim() ?? "",
      stderr: error.stderr?.toString().trim() ?? ""
    };
  }
}

async function resolveWindowsClaudeExecutable() {
  for (const directory of (process.env.PATH ?? "").split(delimiter).filter(Boolean)) {
    const directExe = join(directory, "claude.exe");
    if (await exists(directExe)) return directExe;

    const npmPackageExe = join(directory, "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
    if (await exists(npmPackageExe)) return npmPackageExe;
  }

  return "claude";
}

function quotePath(path) {
  const normalized = String(path);
  return /\s/u.test(normalized) ? `"${normalized.replace(/"/gu, '\\"')}"` : normalized;
}

function buildAdapterCommand({ adapterPath, eventMode }) {
  const quotedAdapter = quotePath(adapterPath);
  if (eventMode === "stream") {
    return [
      "node",
      quotedAdapter,
      "--event-stream",
      ".vibelog-events/session.jsonl"
    ].join(" ");
  }

  return [
    "node",
    quotedAdapter,
    "--log",
    "vibe-log.md",
    "--json",
    "vibe-log.json",
    "--event-dir",
    ".vibelog-events"
  ].join(" ");
}

function getVibeLogCommand(settings, eventName) {
  const command = settings?.hooks?.[eventName]?.[0]?.hooks?.[0]?.command;
  if (!command) throw new Error(`Missing VibeLog hook command for ${eventName}`);
  return command;
}

function normalizeEventMode(eventMode) {
  if (eventMode === "direct" || eventMode === "stream") return eventMode;
  throw new Error("--event-mode must be direct or stream");
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function existingCwdOrFallback(cwd) {
  if (cwd && await exists(cwd)) {
    return {
      cwd,
      fallbackUsed: false
    };
  }

  return {
    cwd: process.cwd(),
    fallbackUsed: true
  };
}

async function readEventStreamStats(path) {
  if (!await exists(path)) {
    return {
      exists: false,
      count: 0
    };
  }

  const eventStream = await readFile(path, "utf8");
  return {
    exists: true,
    count: eventStream.split(/\r?\n/u).filter((line) => line.trim().length > 0).length
  };
}

function parseArgs(argv) {
  const options = {
    workspace: join(process.cwd(), "vibelog-scratch", "claude-live-hook-test"),
    adapterPath: resolve("scripts/claude-code-hook-adapter.mjs"),
    live: false,
    prompt: "Reply with OK. Do not use tools.",
    maxBudgetUsd: "0.05",
    eventMode: "direct",
    timeoutMs: 120000,
    requireToolUse: false,
    requireTestRun: false,
    requireFailedTestRun: false,
    requireLessScriptedDogfood: false,
    requireHumanDecision: false,
    minToolUseHookCount: 0,
    minTestRunEventCount: 0,
    minToolUsedEventCount: 3,
    minChangedFileEventCount: 2,
    permissionMode: null
  };

  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--workspace") {
      options.workspace = args.shift() ?? "";
    } else if (arg === "--adapter") {
      options.adapterPath = args.shift() ?? "";
    } else if (arg === "--live") {
      options.live = true;
    } else if (arg === "--prompt") {
      options.prompt = args.shift() ?? "";
    } else if (arg === "--max-budget-usd") {
      options.maxBudgetUsd = args.shift() ?? "";
    } else if (arg === "--event-mode") {
      options.eventMode = args.shift() ?? "";
    } else if (arg === "--timeout-ms") {
      options.timeoutMs = Number.parseInt(args.shift() ?? "", 10);
    } else if (arg === "--require-tool-use") {
      options.requireToolUse = true;
    } else if (arg === "--require-test-run") {
      options.requireTestRun = true;
    } else if (arg === "--require-failed-test-run") {
      options.requireFailedTestRun = true;
    } else if (arg === "--require-less-scripted-dogfood") {
      options.requireLessScriptedDogfood = true;
    } else if (arg === "--require-human-decision") {
      options.requireHumanDecision = true;
    } else if (arg === "--min-tool-use-count") {
      options.minToolUseHookCount = Number.parseInt(args.shift() ?? "", 10);
    } else if (arg === "--min-test-run-count") {
      options.minTestRunEventCount = Number.parseInt(args.shift() ?? "", 10);
    } else if (arg === "--min-tool-used-event-count") {
      options.minToolUsedEventCount = Number.parseInt(args.shift() ?? "", 10);
    } else if (arg === "--min-changed-file-count") {
      options.minChangedFileEventCount = Number.parseInt(args.shift() ?? "", 10);
    } else if (arg === "--permission-mode") {
      options.permissionMode = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.workspace) throw new Error("--workspace requires a path");
  if (!options.adapterPath) throw new Error("--adapter requires a path");
  if (!options.prompt) throw new Error("--prompt requires text");
  if (!options.maxBudgetUsd) throw new Error("--max-budget-usd requires a value");
  if (options.permissionMode === "") throw new Error("--permission-mode requires a value");
  normalizeEventMode(options.eventMode);
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs <= 0) throw new Error("--timeout-ms requires a positive integer");
  if (!Number.isInteger(options.minToolUseHookCount) || options.minToolUseHookCount < 0) throw new Error("--min-tool-use-count requires a non-negative integer");
  if (!Number.isInteger(options.minTestRunEventCount) || options.minTestRunEventCount < 0) throw new Error("--min-test-run-count requires a non-negative integer");
  if (!Number.isInteger(options.minToolUsedEventCount) || options.minToolUsedEventCount < 0) throw new Error("--min-tool-used-event-count requires a non-negative integer");
  if (!Number.isInteger(options.minChangedFileEventCount) || options.minChangedFileEventCount < 0) throw new Error("--min-changed-file-count requires a non-negative integer");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const preflight = await runClaudeRuntimePreflight({
    timeoutMs: options.timeoutMs,
    cwd: options.workspace
  });
  const fixture = await runFixtureVerification({
    workspace: options.workspace,
    adapterPath: options.adapterPath,
    eventMode: options.eventMode
  });
  const live = await runLiveVerification({
    workspace: options.workspace,
    adapterPath: options.adapterPath,
    live: options.live,
    prompt: options.prompt,
    maxBudgetUsd: options.maxBudgetUsd,
    eventMode: options.eventMode,
    timeoutMs: options.timeoutMs,
    requireToolUse: options.requireToolUse,
    requireTestRun: options.requireTestRun,
    requireFailedTestRun: options.requireFailedTestRun,
    requireLessScriptedDogfood: options.requireLessScriptedDogfood,
    requireHumanDecision: options.requireHumanDecision,
    minToolUseHookCount: options.minToolUseHookCount,
    minTestRunEventCount: options.minTestRunEventCount,
    minToolUsedEventCount: options.minToolUsedEventCount,
    minChangedFileEventCount: options.minChangedFileEventCount,
    permissionMode: options.permissionMode
  });

  console.log(JSON.stringify({ preflight, fixture, live }, null, 2));
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
