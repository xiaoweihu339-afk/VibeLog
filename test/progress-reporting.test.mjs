import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const englishGuidePath = "docs/guides/progress-reporting.md";
const chineseGuidePath = "docs/guides/progress-reporting.zh.md";
const skillPath = "skills/vibelog/SKILL.md";
const agentGuidePath = "skills/vibelog/references/agent-usage-guide.md";

test("progress reporting docs use the current S41 baseline", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  assert.match(english, /Project Progress: 36 \/ 100/);
  assert.match(english, /S41 core doctrine alignment/i);
  assert.match(english, /not a GitHub push tool/i);
  assert.match(english, /distribution safety gate/i);
  assert.match(english, /questions_or_blockers/);

  for (const stale of [10, 15, 16, 18, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]) {
    assert.doesNotMatch(english, new RegExp(`Project Progress: ${stale} / 100`));
    assert.doesNotMatch(chinese, new RegExp(`项目总进度：${stale} / 100`));
  }

  assert.match(chinese, /项目总进度：36 \/ 100/);
  assert.match(chinese, /S41/);
  assert.match(chinese, /核心 doctrine 校准/);
  assert.match(chinese, /不是 GitHub push 工具/);
  assert.match(chinese, /questions_or_blockers/);
  assert.doesNotMatch(english, /Slice 4 implementation plan/);
  assert.doesNotMatch(english, /has not yet completed agent dogfood verification/);
  assert.doesNotMatch(chinese, /Slice 4 implementation plan/);
});

test("agent-facing progress examples point to the current baseline", async () => {
  const skill = await readFile(skillPath, "utf8");
  const agentGuide = await readFile(agentGuidePath, "utf8");

  for (const content of [skill, agentGuide]) {
    assert.match(content, /Project Progress: 36 \/ 100/);
    assert.match(content, /S41/);
    assert.match(content, /core doctrine alignment/);
    assert.match(content, /not a GitHub push tool/);

    for (const stale of [10, 15, 16, 18, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]) {
      assert.doesNotMatch(content, new RegExp(`Project Progress: ${stale} / 100`));
    }
  }
});
