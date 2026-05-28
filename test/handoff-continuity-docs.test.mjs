import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const englishGuidePath = "docs/guides/handoff-continuity.md";
const chineseGuidePath = "docs/guides/handoff-continuity.zh.md";
const readmePath = "README.md";
const skillPath = "skills/vibelog/SKILL.md";
const agentGuidePath = "skills/vibelog/references/agent-usage-guide.md";

test("handoff continuity guide exists in English and Chinese", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  assert.match(english, /Handoff Continuity/);
  assert.match(chinese, /交接连续性/);
});

test("handoff continuity guide documents isolated and workflow checks", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  for (const content of [english, chinese]) {
    assert.match(content, /verify-handoff-continuity\.mjs/);
    assert.match(content, /brief-only/);
    assert.match(content, /vibe-log\.json/);
    assert.match(content, /current_state/);
    assert.match(content, /next_actions/);
    assert.match(content, /Project Progress/);
    assert.match(content, /Next Unlock/);
    assert.match(content, /Main Risk/);
    assert.match(content, /human-in-the-loop|人类决策/iu);
    assert.match(content, /verification evidence|验证证据/iu);
    assert.match(content, /privacy|隐私/iu);
    assert.match(content, /push|推送/iu);
    assert.match(content, /isolated|单项/iu);
    assert.match(content, /workflow|流程/iu);
  }
});

test("README and skill docs point to handoff continuity verification", async () => {
  const readme = await readFile(readmePath, "utf8");
  const skill = await readFile(skillPath, "utf8");
  const agentGuide = await readFile(agentGuidePath, "utf8");

  for (const content of [readme, skill, agentGuide]) {
    assert.match(content, /handoff-continuity\.md/);
    assert.match(content, /verify-handoff-continuity\.mjs/);
  }
});
