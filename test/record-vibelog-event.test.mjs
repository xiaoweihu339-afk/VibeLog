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
  recordVibeLogEventFile,
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

## Execution Prompts

## Development Log

## Bugfix / Incident Log

No bugfix or incident entry yet.

## Validation Design

### Success Criteria

- Recorder updates Markdown.

## Verification Evidence

## Artifact Index

## Handoff State

### Current State

Recorder fixture is ready.

### Completed

- Base fixture created.

### Pending

- Apply events.

## Public Summary

Recorder fixture for tests.
`;

test("exposes the first supported Vibe Event types", () => {
  assert.deepEqual([...SUPPORTED_EVENT_TYPES].sort(), [
    "bug_fixed",
    "decision_made",
    "handoff_updated",
    "idea_changed",
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
