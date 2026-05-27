import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  exportVibeLogFile,
  isSameJsonFile,
  parseVibeLogMarkdown
} from "../scripts/export-vibelog.mjs";

const publicSampleMarkdownPath = "examples/public-sample/vibe-log.md";

test("parses frontmatter fields and inline arrays", async () => {
  const markdown = await readFile(publicSampleMarkdownPath, "utf8");
  const data = parseVibeLogMarkdown(markdown);

  assert.equal(data.title, "Pocket Recipe Planner");
  assert.equal(data.stage, "prototype");
  assert.equal(data.visibility, "public_progress");
  assert.deepEqual(data.tools, ["Codex", "Node.js", "node:test"]);
  assert.deepEqual(data.tags, ["public-sample", "meal-planning", "vibelog"]);
});

test("parses frontmatter block arrays", () => {
  const data = parseVibeLogMarkdown(`---
schema: vibelog@0.2-draft
title: "Block Arrays"
stage: prototype
tools:
  - Codex
  - Node.js
tags:
  - vibelog
  - exporter
---

# Block Arrays

## One-Line Vibe

Keep VibeLog frontmatter arrays readable.

## Current Idea

Support YAML-like block arrays in addition to inline arrays.
`);

  assert.deepEqual(data.tools, ["Codex", "Node.js"]);
  assert.deepEqual(data.tags, ["vibelog", "exporter"]);
});

test("exports core public sample VibeLog sections", async () => {
  const markdown = await readFile(publicSampleMarkdownPath, "utf8");
  const data = parseVibeLogMarkdown(markdown);

  assert.match(data.one_line_vibe, /three-day recipe plan/);
  assert.match(data.current_idea, /Pocket Recipe Planner is a small local-first product concept/);
  assert.equal(data.idea_evolution.length, 2);
  assert.equal(data.human_in_the_loop.length, 1);
  assert.equal(data.execution_prompts.length, 1);
  assert.equal(data.development_log.length, 2);
  assert.equal(data.verification_evidence.length, 2);
  assert.equal(data.handoff_state.completed.length, 7);
  assert.match(data.public_summary, /synthetic VibeLog example/);
});

test("keeps public sample execution prompt summary-only", async () => {
  const markdown = await readFile(publicSampleMarkdownPath, "utf8");
  const data = parseVibeLogMarkdown(markdown);

  assert.equal(data.execution_prompts[0].recording_mode, "summary_only");
  assert.equal(data.execution_prompts[0].prompt_text, "not published in this public sample");
});

test("writes parseable JSON to an output file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-export-"));
  const outPath = join(dir, "vibe-log.json");

  try {
    await exportVibeLogFile(publicSampleMarkdownPath, outPath);
    const exported = JSON.parse(await readFile(outPath, "utf8"));

    assert.equal(exported.title, "Pocket Recipe Planner");
    assert.equal(exported.execution_prompts[0].recording_mode, "summary_only");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("detects JSON drift in check mode", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-check-"));
  const outPath = join(dir, "vibe-log.json");

  try {
    await exportVibeLogFile(publicSampleMarkdownPath, outPath);
    assert.equal(await isSameJsonFile(publicSampleMarkdownPath, outPath), true);

    await writeFile(outPath, JSON.stringify({ title: "Different" }, null, 2));
    assert.equal(await isSameJsonFile(publicSampleMarkdownPath, outPath), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
