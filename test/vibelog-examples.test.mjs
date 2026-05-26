import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { validateVibeLog } from "../scripts/validate-vibelog.mjs";

const exampleDir = "examples/reading-card-lite";
const allowedFiles = new Set(["README.md", "vibe-log.md", "vibe-log.json"]);

test("reading-card-lite example contains only generated VibeLog artifacts", async () => {
  const entries = await readdir(exampleDir, { withFileTypes: true });
  const names = entries.map((entry) => entry.name).sort();

  assert.deepEqual(names, ["README.md", "vibe-log.json", "vibe-log.md"].sort());
  for (const entry of entries) {
    assert.equal(entry.isFile(), true, `${entry.name} must be a file`);
    assert.equal(allowedFiles.has(entry.name), true, `${entry.name} is not allowed in examples`);
  }
});

test("reading-card-lite JSON is valid VibeLog data", async () => {
  const data = JSON.parse(await readFile(join(exampleDir, "vibe-log.json"), "utf8"));
  const result = validateVibeLog(data);

  assert.equal(result.valid, true, result.errors.join("\n"));
});

test("reading-card-lite Markdown includes core dogfood evidence sections", async () => {
  const markdown = await readFile(join(exampleDir, "vibe-log.md"), "utf8");
  const requiredSections = [
    "## One-Line Vibe",
    "## Current Idea",
    "## Idea Evolution",
    "## Human-in-the-Loop",
    "## Execution Prompts",
    "## Development Log",
    "## Bugfix / Incident Log",
    "## Validation Design",
    "## Verification Evidence",
    "## Artifact Index",
    "## Handoff State",
    "## Public Summary"
  ];

  for (const section of requiredSections) {
    assert.match(markdown, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("new Slice 4 guides exist in bilingual pairs", async () => {
  const guideFiles = [
    "docs/guides/vibe-verification-guide.md",
    "docs/guides/vibe-verification-guide.zh.md",
    "docs/guides/agent-dogfood-protocol.md",
    "docs/guides/agent-dogfood-protocol.zh.md"
  ];

  for (const file of guideFiles) {
    const content = await readFile(file, "utf8");
    assert.ok(content.trim().length > 200, `${file} should contain real guide content`);
  }
});
