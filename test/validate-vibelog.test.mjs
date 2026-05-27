import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { parseVibeLogMarkdown } from "../scripts/export-vibelog.mjs";
import { validateVibeLog } from "../scripts/validate-vibelog.mjs";

const billmateMarkdownPath = "examples/billmate-lite/vibe-log.md";

async function loadBillMateData() {
  const markdown = await readFile(billmateMarkdownPath, "utf8");
  return parseVibeLogMarkdown(markdown);
}

test("accepts the exported BillMate VibeLog shape", async () => {
  const data = await loadBillMateData();
  const result = validateVibeLog(data);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("rejects a missing one-line vibe", async () => {
  const data = await loadBillMateData();
  delete data.one_line_vibe;

  const result = validateVibeLog(data);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /one_line_vibe/);
});

test("rejects an invalid execution prompt recording mode", async () => {
  const data = await loadBillMateData();
  data.execution_prompts[0].recording_mode = "loose_summary";

  const result = validateVibeLog(data);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /execution_prompts\[0\]\.recording_mode/);
});

test("rejects an invalid top-level schema enum", async () => {
  const data = await loadBillMateData();
  data.visibility = "friends_only";

  const result = validateVibeLog(data);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /visibility/);
});

test("rejects a missing required schema object", async () => {
  const data = await loadBillMateData();
  delete data.handoff_state;

  const result = validateVibeLog(data);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /handoff_state/);
});

test("rejects an unexpected top-level property", async () => {
  const data = await loadBillMateData();
  data.private_notes_dump = "raw chat transcript";

  const result = validateVibeLog(data);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /private_notes_dump/);
});

test("rejects an invalid nested schema enum", async () => {
  const data = await loadBillMateData();
  data.verification_evidence[0].result = "sort_of_passed";

  const result = validateVibeLog(data);

  assert.equal(result.valid, false);
  assert.match(result.errors.join("\n"), /verification_evidence\[0\]\.result/);
});
