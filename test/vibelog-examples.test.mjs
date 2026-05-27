import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { isSameJsonFile } from "../scripts/export-vibelog.mjs";
import { validateVibeLog } from "../scripts/validate-vibelog.mjs";

const exampleDirs = ["examples/public-sample"];
const allowedFiles = new Set(["README.md", "vibe-log.md", "vibe-log.json"]);

test("examples contain only generated VibeLog artifacts", async () => {
  for (const exampleDir of exampleDirs) {
    const entries = await readdir(exampleDir, { withFileTypes: true });
    const names = entries.map((entry) => entry.name).sort();

    assert.deepEqual(names, ["README.md", "vibe-log.json", "vibe-log.md"].sort(), exampleDir);
    for (const entry of entries) {
      assert.equal(entry.isFile(), true, `${exampleDir}/${entry.name} must be a file`);
      assert.equal(allowedFiles.has(entry.name), true, `${exampleDir}/${entry.name} is not allowed in examples`);
    }
  }
});

test("example JSON files are valid VibeLog data", async () => {
  for (const exampleDir of exampleDirs) {
    const data = JSON.parse(await readFile(join(exampleDir, "vibe-log.json"), "utf8"));
    const result = validateVibeLog(data);

    assert.equal(result.valid, true, `${exampleDir}\n${result.errors.join("\n")}`);
  }
});

test("example JSON files match their Markdown source", async () => {
  for (const exampleDir of exampleDirs) {
    assert.equal(
      await isSameJsonFile(join(exampleDir, "vibe-log.md"), join(exampleDir, "vibe-log.json")),
      true,
      `${exampleDir}/vibe-log.json drifted from Markdown`
    );
  }
});

test("examples include core public VibeLog sections", async () => {
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

  for (const exampleDir of exampleDirs) {
    const markdown = await readFile(join(exampleDir, "vibe-log.md"), "utf8");
    for (const section of requiredSections) {
      assert.match(markdown, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${exampleDir} missing ${section}`);
    }
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
