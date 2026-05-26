import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { parseVibeLogMarkdown } from "../scripts/export-vibelog.mjs";
import {
  mapClaudeHookToVibeEvents,
  redactSecrets,
  runClaudeCodeHookAdapter
} from "../scripts/claude-code-hook-adapter.mjs";

const execFileAsync = promisify(execFile);

const baseMarkdown = `---
schema: vibelog@0.2-draft
title: "Claude Adapter Fixture"
one_line_vibe: "A fixture for Claude Code adapter tests."
stage: prototype
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: agent_led_human_approved
process_level: core
tools: ["Claude Code", "VibeLog"]
tags: ["vibelog", "claude-code", "adapter"]
created_at: "2026-05-26"
updated_at: "2026-05-26"
---

# VibeLog

## One-Line Vibe

A fixture for Claude Code adapter tests.

## Current Idea

Verify Claude Code hook mapping.

## Idea Evolution

## Human-in-the-Loop

## Execution Prompts

## Development Log

## Bugfix / Incident Log

No bugfix or incident entry yet.

## Validation Design

### Success Criteria

- Adapter records events.

## Verification Evidence

## Artifact Index

## Handoff State

### Current State

Adapter fixture is ready.

### Completed

- Base fixture created.

### Pending

- Apply hook events.

## Public Summary

Claude adapter fixture for tests.
`;

test("maps UserPromptSubmit engineering prompt to prompt_submitted", () => {
  const events = mapClaudeHookToVibeEvents({
    hook_event_name: "UserPromptSubmit",
    session_id: "session-1",
    transcript_path: "C:/tmp/transcript.jsonl",
    cwd: "C:/repo",
    prompt: "请实现 recorder adapter 并运行测试"
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].type, "prompt_submitted");
  assert.equal(events[0].agent_or_tool, "Claude Code");
  assert.equal(events[0].prompt_text, "请实现 recorder adapter 并运行测试");
  assert.equal(events[0].recording_mode, "exact");
});

test("ignores ordinary idea chat in Slice 6", () => {
  const events = mapClaudeHookToVibeEvents({
    hook_event_name: "UserPromptSubmit",
    session_id: "session-1",
    prompt: "我有一个产品想法，先聊聊可能性"
  });

  assert.deepEqual(events, []);
});

test("redacts secret-like prompt text", () => {
  const events = mapClaudeHookToVibeEvents({
    hook_event_name: "UserPromptSubmit",
    prompt: "Run deploy with API_KEY=sk-1234567890abcdef and then test"
  });

  assert.equal(events[0].recording_mode, "redacted");
  assert.doesNotMatch(events[0].prompt_text, /sk-1234567890abcdef/);
  assert.match(events[0].prompt_text, /API_KEY=\[REDACTED\]/);
});

test("maps PostToolUse Bash test command to test_ran", () => {
  const events = mapClaudeHookToVibeEvents({
    hook_event_name: "PostToolUse",
    tool_name: "Bash",
    tool_input: {
      command: "node --test test/claude-code-hook-adapter.test.mjs"
    },
    tool_response: {
      exit_code: 0,
      stdout: "tests 8\npass 8\nfail 0"
    }
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].type, "test_ran");
  assert.equal(events[0].result, "passed");
  assert.match(events[0].evidence_ref, /node --test/);
});

test("maps PostToolUse edit/write tool to tool_used", () => {
  const events = mapClaudeHookToVibeEvents({
    hook_event_name: "PostToolUse",
    tool_name: "Write",
    tool_input: {
      file_path: "scripts/claude-code-hook-adapter.mjs",
      content: "secret token=abc123 should not be copied from content"
    },
    tool_response: {
      success: true
    }
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].type, "tool_used");
  assert.equal(events[0].work_type, "feature");
  assert.deepEqual(events[0].files_changed, ["scripts/claude-code-hook-adapter.mjs"]);
  assert.doesNotMatch(events[0].details, /abc123/);
});

test("maps Stop to handoff_updated", () => {
  const events = mapClaudeHookToVibeEvents({
    hook_event_name: "Stop",
    stop_hook_active: false,
    last_assistant_message: "Implemented the adapter and ran tests.",
    session_id: "session-1"
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].type, "handoff_updated");
  assert.match(events[0].current_state, /Implemented the adapter/);
  assert.ok(events[0].pending.includes("Review generated VibeLog updates"));
});

test("CLI print mode prints mapped events without writing files", async () => {
  const dir = await mkdtemp(join(tmpdir(), "claude-adapter-print-"));
  const inputPath = join(dir, "hook.json");

  try {
    await writeFile(inputPath, JSON.stringify({
      hook_event_name: "PostToolUse",
      tool_name: "Bash",
      tool_input: { command: "npm test" },
      tool_response: { exit_code: 1, stderr: "1 failing test" }
    }), "utf8");

    const { stdout } = await execFileAsync("node", [
      "scripts/claude-code-hook-adapter.mjs",
      "--input",
      inputPath,
      "--print-events"
    ], { cwd: process.cwd() });
    const events = JSON.parse(stdout);

    assert.equal(events[0].type, "test_ran");
    assert.equal(events[0].result, "failed");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("record mode updates VibeLog Markdown and JSON through recorder core", async () => {
  const dir = await mkdtemp(join(tmpdir(), "claude-adapter-record-"));
  const inputPath = join(dir, "hook.json");
  const logPath = join(dir, "vibe-log.md");
  const jsonPath = join(dir, "vibe-log.json");
  const eventDir = join(dir, "events");

  try {
    await writeFile(logPath, baseMarkdown, "utf8");
    await writeFile(inputPath, JSON.stringify({
      hook_event_name: "UserPromptSubmit",
      prompt: "Implement Claude Code adapter and run node --test"
    }), "utf8");

    await runClaudeCodeHookAdapter({
      inputPath,
      logPath,
      jsonPath,
      eventDir,
      printEvents: false
    });

    const markdown = await readFile(logPath, "utf8");
    const json = JSON.parse(await readFile(jsonPath, "utf8"));
    const data = parseVibeLogMarkdown(markdown);

    assert.equal(data.execution_prompts.length, 1);
    assert.equal(json.execution_prompts[0].agent_or_tool, "Claude Code");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("redactSecrets removes common secret shapes", () => {
  const text = [
    "Authorization: Bearer abc.def.ghi",
    "password = hunter2",
    "-----BEGIN PRIVATE KEY----- secret -----END PRIVATE KEY-----"
  ].join("\n");
  const result = redactSecrets(text);

  assert.equal(result.redacted, true);
  assert.doesNotMatch(result.text, /hunter2/);
  assert.doesNotMatch(result.text, /abc\.def\.ghi/);
  assert.doesNotMatch(result.text, /PRIVATE KEY----- secret/);
});
