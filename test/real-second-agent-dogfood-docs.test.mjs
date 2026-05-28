import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const englishGuidePath = "docs/guides/real-second-agent-dogfood.md";
const chineseGuidePath = "docs/guides/real-second-agent-dogfood.zh.md";
const readmePath = "README.md";
const skillPath = "skills/vibelog/SKILL.md";
const agentGuidePath = "skills/vibelog/references/agent-usage-guide.md";

test("real second-agent dogfood guide exists in English and Chinese", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  assert.match(english, /Real Second-Agent Dogfood/);
  assert.match(chinese, /真实第二 agent 接力/);
});

test("real second-agent dogfood docs preserve S38 safety boundaries", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  for (const content of [english, chinese]) {
    assert.match(content, /verify-handoff-continuity\.mjs/);
    assert.match(content, /--brief-only/);
    assert.match(content, /verify-second-agent-continuation-report\.mjs/);
    assert.match(content, /brief-only/);
    assert.match(content, /no parent conversation history|不继承父会话历史/iu);
    assert.match(content, /must not modify files|不得修改文件/iu);
    assert.match(content, /must not push|不得推送/iu);
    assert.match(content, /isolated|单项/iu);
    assert.match(content, /workflow|流程/iu);
  }
});

test("README and skill docs expose the real second-agent report verifier", async () => {
  const readme = await readFile(readmePath, "utf8");
  const skill = await readFile(skillPath, "utf8");
  const agentGuide = await readFile(agentGuidePath, "utf8");

  for (const content of [readme, skill, agentGuide]) {
    assert.match(content, /real-second-agent-dogfood\.md/);
    assert.match(content, /verify-second-agent-continuation-report\.mjs/);
  }
});
