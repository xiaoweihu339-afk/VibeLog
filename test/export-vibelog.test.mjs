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

const billmateMarkdownPath = "examples/billmate-lite/vibe-log.md";

test("parses frontmatter fields and inline arrays", async () => {
  const markdown = await readFile(billmateMarkdownPath, "utf8");
  const data = parseVibeLogMarkdown(markdown);

  assert.equal(data.title, "BillMate Lite");
  assert.equal(data.stage, "prototype");
  assert.equal(data.visibility, "private");
  assert.deepEqual(data.tools, ["Codex", "Node.js", "node:test"]);
  assert.deepEqual(data.tags, ["billing", "dogfood", "manual-test", "vibelog"]);
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

test("exports core BillMate VibeLog sections", async () => {
  const markdown = await readFile(billmateMarkdownPath, "utf8");
  const data = parseVibeLogMarkdown(markdown);

  assert.match(data.one_line_vibe, /tiny bill splitter/);
  assert.match(data.current_idea, /BillMate Lite is a small local Node.js domain utility/);
  assert.equal(data.idea_evolution.length, 2);
  assert.equal(data.human_in_the_loop.length, 1);
  assert.equal(data.execution_prompts.length, 1);
  assert.equal(data.development_log.length, 2);
  assert.equal(data.verification_evidence.length, 2);
  assert.equal(data.handoff_state.completed.length, 5);
  assert.match(data.public_summary, /tiny local bill splitter/);
});

test("preserves Chinese execution prompt text", async () => {
  const markdown = await readFile(billmateMarkdownPath, "utf8");
  const data = parseVibeLogMarkdown(markdown);

  assert.equal(
    data.execution_prompts[0].prompt_text,
    "必须得我手动吗？你不可以模拟一个小项目，做一个账单啥的小项目去测试吗？"
  );
});

test("writes parseable JSON to an output file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-export-"));
  const outPath = join(dir, "vibe-log.json");

  try {
    await exportVibeLogFile(billmateMarkdownPath, outPath);
    const exported = JSON.parse(await readFile(outPath, "utf8"));

    assert.equal(exported.title, "BillMate Lite");
    assert.equal(exported.execution_prompts[0].recording_mode, "exact");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("detects JSON drift in check mode", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-check-"));
  const outPath = join(dir, "vibe-log.json");

  try {
    await exportVibeLogFile(billmateMarkdownPath, outPath);
    assert.equal(await isSameJsonFile(billmateMarkdownPath, outPath), true);

    await writeFile(outPath, JSON.stringify({ title: "Different" }, null, 2));
    assert.equal(await isSameJsonFile(billmateMarkdownPath, outPath), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
