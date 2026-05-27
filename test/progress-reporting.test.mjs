import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const englishGuidePath = "docs/guides/progress-reporting.md";
const chineseGuidePath = "docs/guides/progress-reporting.zh.md";
const skillPath = "skills/vibelog/SKILL.md";
const agentGuidePath = "skills/vibelog/references/agent-usage-guide.md";

test("progress reporting docs use the current S26 baseline", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  assert.match(english, /Project Progress: 22 \/ 100/);
  assert.match(english, /S26 stream-first opt-in project verification/i);
  assert.match(english, /stream-first live hook/i);
  assert.doesNotMatch(english, /Project Progress: 10 \/ 100/);
  assert.doesNotMatch(english, /Project Progress: 15 \/ 100/);
  assert.doesNotMatch(english, /Project Progress: 16 \/ 100/);
  assert.doesNotMatch(english, /Project Progress: 18 \/ 100/);
  assert.doesNotMatch(english, /Project Progress: 20 \/ 100/);
  assert.doesNotMatch(english, /Slice 4 implementation plan/);
  assert.doesNotMatch(english, /has not yet completed agent dogfood verification/);

  assert.match(chinese, /项目总进度：22 \/ 100/);
  assert.match(chinese, /S26/);
  assert.match(chinese, /stream-first opt-in 项目验证/);
  assert.doesNotMatch(chinese, /项目总进度：10 \/ 100/);
  assert.doesNotMatch(chinese, /项目总进度：15 \/ 100/);
  assert.doesNotMatch(chinese, /项目总进度：16 \/ 100/);
  assert.doesNotMatch(chinese, /项目总进度：18 \/ 100/);
  assert.doesNotMatch(chinese, /项目总进度：20 \/ 100/);
  assert.doesNotMatch(chinese, /Slice 4 implementation plan/);
  assert.doesNotMatch(chinese, /还没有完成 agent dogfood verification/);
});

test("agent-facing progress examples point to the current baseline", async () => {
  const skill = await readFile(skillPath, "utf8");
  const agentGuide = await readFile(agentGuidePath, "utf8");

  for (const content of [skill, agentGuide]) {
    assert.match(content, /Project Progress: 22 \/ 100/);
    assert.match(content, /S26/);
    assert.doesNotMatch(content, /Project Progress: 10 \/ 100/);
    assert.doesNotMatch(content, /Project Progress: 15 \/ 100/);
    assert.doesNotMatch(content, /Project Progress: 16 \/ 100/);
    assert.doesNotMatch(content, /Project Progress: 18 \/ 100/);
    assert.doesNotMatch(content, /Project Progress: 20 \/ 100/);
  }
});
