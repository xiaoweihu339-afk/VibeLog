import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { parseVibeLogMarkdown } from "../scripts/export-vibelog.mjs";
import { validateVibeLog } from "../scripts/validate-vibelog.mjs";
import {
  applyVibeLogEvent,
  loadVibeEventsFile,
  recordVibeLogEventFile,
  recordVibeLogEventsFile,
  SUPPORTED_EVENT_TYPES
} from "../scripts/record-vibelog-event.mjs";

const execFileAsync = promisify(execFile);

const baseMarkdown = `---
schema: vibelog@0.2-draft
title: "Recorder Fixture"
one_line_vibe: "A tiny fixture for recorder tests."
stage: prototype
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: agent_led_human_approved
process_level: core
tools: ["Codex"]
tags: ["vibelog", "recorder"]
created_at: "2026-05-26"
updated_at: "2026-05-26"
---

# VibeLog

## One-Line Vibe

A tiny fixture for recorder tests.

## Current Idea

Use structured events to update Markdown-first VibeLog records.

## Idea Evolution

## Human-in-the-Loop

## Implementation Status

### Current State

Recorder fixture is ready.

### Completed

- Base fixture created.

### In Progress

### Pending

- Apply events.

### Blocked

### Next Actions

- Apply recorder events.

## Execution Prompts

## Development Log

## Bugfix / Incident Log

No bugfix or incident entry yet.

## Validation Design

### Success Criteria

- Recorder updates Markdown.

### Core User Paths

- Apply structured events.

### Manual Test Steps

- Run recorder tests.

### Automated Test Strategy

Use node --test test/record-vibelog-event.test.mjs.

## Verification Evidence

## Artifact Index

## Handoff State

### Current State

Recorder fixture is ready.

### Completed

- Base fixture created.

### In Progress

### Pending

- Apply events.

### Blockers

### Next Actions

- Apply recorder events.

### Context For Next Agent

- Keep Markdown as the source of truth.

## Vibe Progress

### 2026-05-26

**Stage:** prototype

**What Happened:** Created the recorder fixture.

**Tools Used:** Codex

**Problems:** none

**Next:** Apply structured events.

## Public Summary

Recorder fixture for tests.
`;

test("exposes the first supported Vibe Event types", () => {
  assert.deepEqual([...SUPPORTED_EVENT_TYPES].sort(), [
    "bug_fixed",
    "decision_made",
    "handoff_updated",
    "idea_changed",
    "progress_updated",
    "prompt_submitted",
    "test_ran",
    "tool_used"
  ]);
});

test("prompt_submitted appends an exact execution prompt", () => {
  const markdown = applyVibeLogEvent(baseMarkdown, {
    type: "prompt_submitted",
    timestamp: "2026-05-26",
    agent_or_tool: "Codex",
    prompt_type: "build",
    prompt_visibility: "summary",
    recording_mode: "exact",
    prompt_summary: "Build the recorder core.",
    prompt_text: "执行",
    result: "Recorder event recorded.",
    reuse_notes: "Use for approved implementation retries."
  });
  const data = parseVibeLogMarkdown(markdown);

  assert.equal(data.execution_prompts.length, 1);
  assert.equal(data.execution_prompts[0].prompt_text, "执行");
  assert.equal(data.execution_prompts[0].recording_mode, "exact");
  assert.equal(data.updated_at, "2026-05-26");
});

test("test_ran appends verification evidence", () => {
  const markdown = applyVibeLogEvent(baseMarkdown, {
    type: "test_ran",
    timestamp: "2026-05-26",
    summary: "Recorder red test failed before implementation.",
    evidence_ref: "node --test test/record-vibelog-event.test.mjs",
    result: "failed",
    details: "Module did not exist yet.",
    residual_risk: "This proves only the red test.",
    source: "command output",
    confidence: "high"
  });
  const data = parseVibeLogMarkdown(markdown);

  assert.equal(data.verification_evidence.length, 1);
  assert.equal(data.verification_evidence[0].result, "failed");
  assert.match(data.verification_evidence[0].summary, /red test failed/);
});

test("bug_fixed replaces the empty incident placeholder and appends incident details", () => {
  const markdown = applyVibeLogEvent(baseMarkdown, {
    type: "bug_fixed",
    timestamp: "2026-05-26",
    summary: "Prevented duplicate recorder events from losing section boundaries.",
    bug_symptom: "New entries could be inserted into the wrong section.",
    root_cause: "The recorder needed top-level section boundary detection.",
    fix: "Insert before the next level-two heading.",
    verification: "Unit test passed.",
    follow_up: "Keep section insertion covered by tests."
  });
  const data = parseVibeLogMarkdown(markdown);

  assert.equal(data.bugfix_incident_log.length, 1);
  assert.doesNotMatch(markdown, /No bugfix or incident entry yet/);
  assert.match(data.bugfix_incident_log[0].fix, /next level-two heading/);
});

test("handoff_updated replaces handoff state with structured next-agent context", () => {
  const markdown = applyVibeLogEvent(baseMarkdown, {
    type: "handoff_updated",
    timestamp: "2026-05-26",
    current_state: "Recorder core can apply structured events.",
    progress_snapshot: {
      project_progress: "15 / 100",
      change_this_task: "+3",
      current_phase: "Recorder core",
      completed_this_task: "Implemented event-to-Markdown recorder",
      next_unlock: "Hook adapter automatic recording",
      main_risk: "No lifecycle hook integration yet",
      confidence: "medium"
    },
    completed: ["Event mapping implemented", "JSON export supported"],
    in_progress: [],
    pending: ["Build hook adapter"],
    blockers: [],
    next_actions: ["Use recorder from an adapter"],
    context_for_next_agent: ["Markdown remains the source of truth"]
  });
  const data = parseVibeLogMarkdown(markdown);

  assert.match(data.handoff_state.current_state, /structured events/);
  assert.deepEqual(data.handoff_state.completed, ["Event mapping implemented", "JSON export supported"]);
  assert.ok(data.handoff_state.project_progress_snapshot.includes("Project Progress: 15 / 100"));
});

test("progress_updated appends a chronological Vibe Progress entry", () => {
  const markdown = applyVibeLogEvent(baseMarkdown, {
    type: "progress_updated",
    timestamp: "2026-05-27T10:25:00+08:00",
    stage: "prototype",
    what_happened: "S24 local event stream recording became available.",
    tools_used: ["Codex", "node --test"],
    problems: ["Live hook environments still need separate verification."],
    next: ["Wire adapters to emit event streams."],
    source: "S24 event stream",
    confidence: "high"
  });
  const data = parseVibeLogMarkdown(markdown);
  const latest = data.vibe_progress.at(-1);

  assert.equal(latest.timestamp, "2026-05-27T10:25:00+08:00");
  assert.equal(latest.stage, "prototype");
  assert.match(latest.what_happened, /event stream/);
  assert.deepEqual(latest.tools_used, ["`Codex`", "`node --test`"]);
});

test("tool_used preserves empty files_changed as an array", () => {
  const markdown = applyVibeLogEvent(baseMarkdown, {
    type: "tool_used",
    timestamp: "2026-05-27T16:45:00+08:00",
    work_type: "chore",
    summary: "Claude Code used Glob.",
    files_changed: [],
    details: "Glob completed with result partial.",
    verification: "partial",
    follow_up: ["Review whether this tool use changed VibeLog-relevant project state."],
    source: "Claude Code PostToolUse hook",
    confidence: "medium"
  });
  const data = parseVibeLogMarkdown(markdown);
  const result = validateVibeLog(data);

  assert.deepEqual(data.development_log[0].files_changed, []);
  assert.equal(result.valid, true, result.errors.join("\n"));
});

test("recordVibeLogEventFile writes Markdown and optional JSON", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-recorder-"));
  const logPath = join(dir, "vibe-log.md");
  const eventPath = join(dir, "event.json");
  const jsonPath = join(dir, "vibe-log.json");

  try {
    await writeFile(logPath, baseMarkdown, "utf8");
    await writeFile(eventPath, JSON.stringify({
      type: "test_ran",
      timestamp: "2026-05-26",
      summary: "Recorder CLI test passed.",
      evidence_ref: "node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json",
      result: "passed",
      residual_risk: "CLI test uses a fixture.",
      source: "test",
      confidence: "high"
    }), "utf8");

    await recordVibeLogEventFile({ eventPath, logPath, jsonPath });

    const markdown = await readFile(logPath, "utf8");
    const json = JSON.parse(await readFile(jsonPath, "utf8"));
    assert.match(markdown, /Recorder CLI test passed/);
    assert.equal(json.verification_evidence[0].result, "passed");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("loads Vibe Events from a JSONL event stream in order", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-event-stream-"));
  const eventsPath = join(dir, "events.jsonl");

  try {
    await writeFile(eventsPath, [
      JSON.stringify({
        type: "prompt_submitted",
        timestamp: "2026-05-27T09:00:00+08:00",
        agent_or_tool: "Codex",
        prompt_type: "build",
        prompt_visibility: "summary",
        recording_mode: "exact",
        prompt_summary: "Execute S24 event loop.",
        prompt_text: "Execute S24.",
        result: "Prompt captured."
      }),
      "",
      JSON.stringify({
        type: "test_ran",
        timestamp: "2026-05-27T09:05:00+08:00",
        summary: "Focused S24 tests passed.",
        evidence_ref: "node --test test/record-vibelog-event.test.mjs",
        result: "passed"
      })
    ].join("\n"), "utf8");

    const events = await loadVibeEventsFile(eventsPath);

    assert.equal(events.length, 2);
    assert.equal(events[0].type, "prompt_submitted");
    assert.equal(events[1].type, "test_ran");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("loads Vibe Events from a JSON array event stream in order", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-event-array-"));
  const eventsPath = join(dir, "events.json");

  try {
    await writeFile(eventsPath, JSON.stringify([
      {
        type: "idea_changed",
        timestamp: "2026-05-27T09:10:00+08:00",
        change_type: "refinement",
        before: "Single-event recorder.",
        after: "Ordered event stream recorder.",
        reason: "A session can emit multiple structured facts."
      },
      {
        type: "decision_made",
        timestamp: "2026-05-27T09:15:00+08:00",
        decision_type: "scope",
        human_input: "Keep S24 local and safe.",
        final_decision: "Use a local event stream before live hooks.",
        why_it_mattered: "It avoids binding the core to one agent.",
        impact: "Adapters can share the same recorder boundary."
      }
    ]), "utf8");

    const events = await loadVibeEventsFile(eventsPath);

    assert.equal(events.length, 2);
    assert.equal(events[0].type, "idea_changed");
    assert.equal(events[1].type, "decision_made");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("recordVibeLogEventsFile applies a local event stream and exports valid JSON", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-event-loop-"));
  const logPath = join(dir, "vibe-log.md");
  const eventsPath = join(dir, "events.jsonl");
  const jsonPath = join(dir, "vibe-log.json");

  const events = [
    {
      type: "prompt_submitted",
      timestamp: "2026-05-27T10:00:00+08:00",
      agent_or_tool: "Codex",
      prompt_type: "build",
      prompt_visibility: "summary",
      recording_mode: "exact",
      prompt_summary: "Build S24 local event loop.",
      prompt_text: "Execute S24 local event loop.",
      result: "Prompt recorded through event stream."
    },
    {
      type: "tool_used",
      timestamp: "2026-05-27T10:10:00+08:00",
      work_type: "feature",
      summary: "Applied event stream updates to VibeLog.",
      files_changed: ["scripts/record-vibelog-event.mjs"],
      details: "Multiple events are applied in file order.",
      verification: "Focused event stream test passed."
    },
    {
      type: "test_ran",
      timestamp: "2026-05-27T10:20:00+08:00",
      summary: "S24 focused tests passed.",
      evidence_ref: "node --test test/record-vibelog-event.test.mjs",
      result: "passed",
      residual_risk: "No long-running daemon is implemented yet.",
      source: "test fixture",
      confidence: "high"
    },
    {
      type: "progress_updated",
      timestamp: "2026-05-27T10:25:00+08:00",
      stage: "prototype",
      what_happened: "S24 event stream updated progress without a manual Markdown edit.",
      tools_used: ["Codex", "node --test"],
      problems: ["No live hook daemon is implemented."],
      next: ["Connect hook adapters to event streams."],
      source: "test fixture",
      confidence: "high"
    },
    {
      type: "handoff_updated",
      timestamp: "2026-05-27T10:30:00+08:00",
      current_state: "Local event stream recording is ready for adapters.",
      progress_snapshot: {
        project_progress: "18 / 100",
        change_this_task: "+2",
        current_phase: "Automatic recording foundation",
        completed_this_task: "Local event stream applied to Markdown and JSON",
        next_unlock: "Agent hook adapters emit event streams continuously",
        main_risk: "Live hook environments still need separate verification",
        confidence: "medium"
      },
      completed: ["Local event stream recorded"],
      pending: ["Hook adapter event stream verification"],
      next_actions: ["Wire adapters to append structured events"]
    }
  ];

  try {
    await writeFile(logPath, baseMarkdown, "utf8");
    await writeFile(eventsPath, events.map((event) => JSON.stringify(event)).join("\n"), "utf8");

    const result = await recordVibeLogEventsFile({ eventsPath, logPath, jsonPath });
    const markdown = await readFile(logPath, "utf8");
    const json = JSON.parse(await readFile(jsonPath, "utf8"));
    const validation = validateVibeLog(json);

    assert.equal(result.count, 5);
    assert.equal(validation.valid, true, validation.errors.join("\n"));
    assert.match(markdown, /Local event stream recording is ready/);
    assert.equal(json.execution_prompts[0].prompt_text, "Execute S24 local event loop.");
    assert.equal(json.development_log[0].files_changed[0], "`scripts/record-vibelog-event.mjs`");
    assert.equal(json.verification_evidence[0].result, "passed");
    assert.match(json.vibe_progress.at(-1).what_happened, /manual Markdown edit/);
    assert.ok(json.handoff_state.project_progress_snapshot.includes("Project Progress: 18 / 100"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI records an event and regenerates JSON", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-recorder-cli-"));
  const logPath = join(dir, "vibe-log.md");
  const eventPath = join(dir, "event.json");
  const jsonPath = join(dir, "vibe-log.json");

  try {
    await writeFile(logPath, baseMarkdown, "utf8");
    await writeFile(eventPath, JSON.stringify({
      type: "prompt_submitted",
      timestamp: "2026-05-26",
      agent_or_tool: "Codex",
      prompt_type: "build",
      prompt_visibility: "summary",
      recording_mode: "exact",
      prompt_summary: "Run recorder CLI.",
      prompt_text: "执行",
      result: "CLI wrote Markdown and JSON.",
      reuse_notes: "Useful for future adapters."
    }), "utf8");

    const { stdout } = await execFileAsync("node", [
      "scripts/record-vibelog-event.mjs",
      "--event",
      eventPath,
      "--log",
      logPath,
      "--json",
      jsonPath
    ], { cwd: process.cwd() });

    const json = JSON.parse(await readFile(jsonPath, "utf8"));
    assert.match(stdout, /Recorded prompt_submitted/);
    assert.equal(json.execution_prompts[0].prompt_text, "执行");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI records an event stream and regenerates JSON", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-event-loop-cli-"));
  const logPath = join(dir, "vibe-log.md");
  const eventsPath = join(dir, "events.jsonl");
  const jsonPath = join(dir, "vibe-log.json");

  try {
    await writeFile(logPath, baseMarkdown, "utf8");
    await writeFile(eventsPath, [
      JSON.stringify({
        type: "idea_changed",
        timestamp: "2026-05-27T11:00:00+08:00",
        change_type: "refinement",
        before: "Manual end-of-slice updates.",
        after: "Structured event stream updates.",
        reason: "Adapters need a repeatable local capture loop."
      }),
      JSON.stringify({
        type: "test_ran",
        timestamp: "2026-05-27T11:05:00+08:00",
        summary: "CLI event stream test passed.",
        evidence_ref: "node scripts/record-vibelog-event.mjs --events events.jsonl --log vibe-log.md --json vibe-log.json",
        result: "passed"
      })
    ].join("\n"), "utf8");

    const { stdout } = await execFileAsync("node", [
      "scripts/record-vibelog-event.mjs",
      "--events",
      eventsPath,
      "--log",
      logPath,
      "--json",
      jsonPath
    ], { cwd: process.cwd() });

    const json = JSON.parse(await readFile(jsonPath, "utf8"));
    assert.match(stdout, /Recorded 2 events/);
    assert.match(json.idea_evolution[0].after, /event stream/);
    assert.equal(json.verification_evidence[0].result, "passed");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("combined session events export to valid VibeLog JSON", () => {
  const events = [
    {
      type: "idea_changed",
      timestamp: "2026-05-26",
      change_type: "refinement",
      before: "Manual logging only.",
      after: "Structured event logging.",
      reason: "Adapters need a stable event contract.",
      source: "Slice 5 design",
      confidence: "high"
    },
    {
      type: "decision_made",
      timestamp: "2026-05-26",
      decision_type: "scope",
      human_input: "Execute the recorder core.",
      agent_proposal: "Build a platform-neutral event recorder first.",
      final_decision: "Implement recorder core before hooks.",
      why_it_mattered: "Avoids binding VibeLog to one agent too early.",
      impact: "Hook adapters can call a shared recorder."
    },
    {
      type: "tool_used",
      timestamp: "2026-05-26",
      work_type: "feature",
      summary: "Applied structured events to Markdown.",
      files_changed: ["scripts/record-vibelog-event.mjs"],
      details: "Recorder maps events to VibeLog sections.",
      verification: "node --test test/record-vibelog-event.test.mjs passed.",
      follow_up: ["Use recorder from hook adapters."]
    },
    {
      type: "test_ran",
      timestamp: "2026-05-26",
      summary: "Recorder tests passed.",
      evidence_ref: "node --test test/record-vibelog-event.test.mjs",
      result: "passed",
      residual_risk: "No hook integration yet.",
      source: "command output",
      confidence: "high"
    },
    {
      type: "handoff_updated",
      timestamp: "2026-05-26",
      current_state: "Recorder core is ready for adapter integration.",
      progress_snapshot: {
        project_progress: "15 / 100",
        change_this_task: "+3",
        current_phase: "Recorder core",
        completed_this_task: "Event-to-Markdown recorder",
        next_unlock: "Hook adapter automatic recording",
        main_risk: "No lifecycle hook integration yet",
        confidence: "medium"
      },
      completed: ["Recorder core implemented"],
      in_progress: [],
      pending: ["Hook adapter"],
      blockers: [],
      next_actions: ["Design hook adapter"],
      context_for_next_agent: ["Use Vibe Event JSON as adapter boundary."]
    }
  ];

  const markdown = events.reduce(applyVibeLogEvent, baseMarkdown);
  const data = parseVibeLogMarkdown(markdown);
  const result = validateVibeLog(data);

  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.equal(data.idea_evolution.length, 1);
  assert.equal(data.human_in_the_loop.length, 1);
  assert.equal(data.development_log.length, 1);
  assert.equal(data.verification_evidence.length, 1);
  assert.match(data.handoff_state.next_actions[0], /hook adapter/i);
});
