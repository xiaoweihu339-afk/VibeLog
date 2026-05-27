import { execFile } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
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
  timeoutMs = 120000
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

  try {
    const { stdout, stderr } = await runClaudeCommand([
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
    ], {
      cwd: resolvedWorkspace,
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024
    });

    const markdownBeforeConsume = await readFile(join(resolvedWorkspace, "vibe-log.md"), "utf8");
    const markdownUpdatedBeforeConsume = markdownBeforeConsume.includes("Claude Code hook event captured");
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
        logPath: join(resolvedWorkspace, "vibe-log.md"),
        jsonPath: join(resolvedWorkspace, "vibe-log.json")
      });
    }

    const markdown = await readFile(join(resolvedWorkspace, "vibe-log.md"), "utf8");
    const stream = parseStreamJsonLines(stdout);
    const hookResponses = extractHookResponses(stream);
    const result = stream.find((event) => event.type === "result");
    const stopHookSucceeded = hookResponses.some((event) => event.hook_event === "Stop" && event.exit_code === 0);
    const markdownUpdated = markdown.includes("Claude Code hook event captured");
    const passed = stopHookSucceeded
      && markdownUpdated
      && (normalizedEventMode !== "stream" || (eventStreamExists && streamEventCount > 0 && markdownUpdatedBeforeConsume === false));
    const status = passed ? "passed" : "incomplete_session";

    return {
      attempted: true,
      passed,
      status,
      eventMode: normalizedEventMode,
      maxBudgetUsd,
      settingsPath,
      timeoutMs,
      result: result?.result ?? "",
      totalCostUsd: result?.total_cost_usd ?? null,
      hookResponses,
      eventStreamPath,
      eventStreamExists,
      streamEventCount,
      markdownUpdatedBeforeConsume,
      coreBusiness: coreBusinessStatus({
        passed,
        status,
        summary: passed
          ? "Claude Code completed a live session and VibeLog recorded the hook flow."
          : "Claude Code returned without proving a completed Stop/session-end VibeLog flow."
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
      settingsPath,
      timeoutMs,
      hookResponses: issue.hookResponses,
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

  if (/authentication_failed|error_status"?\s*:\s*401|401/u.test(combined)) {
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
    timeoutMs: 120000
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
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.workspace) throw new Error("--workspace requires a path");
  if (!options.adapterPath) throw new Error("--adapter requires a path");
  if (!options.prompt) throw new Error("--prompt requires text");
  if (!options.maxBudgetUsd) throw new Error("--max-budget-usd requires a value");
  normalizeEventMode(options.eventMode);
  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs <= 0) throw new Error("--timeout-ms requires a positive integer");
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
    timeoutMs: options.timeoutMs
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
