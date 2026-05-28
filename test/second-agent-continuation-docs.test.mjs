import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const englishGuidePath = "docs/guides/second-agent-continuation.md";
const chineseGuidePath = "docs/guides/second-agent-continuation.zh.md";
const readmePath = "README.md";
const skillPath = "skills/vibelog/SKILL.md";
const agentGuidePath = "skills/vibelog/references/agent-usage-guide.md";

test("second-agent continuation guide exists in English and Chinese", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  assert.match(english, /Second-Agent Continuation/);
  assert.match(chinese, /第二 agent 接手验证/);
});

test("second-agent continuation docs preserve the S37 simulation boundary", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  for (const content of [english, chinese]) {
    assert.match(content, /simulate-second-agent-continuation\.mjs/);
    assert.match(content, /brief-only/);
    assert.match(content, /rejects full JSON|拒绝完整 JSON/iu);
    assert.match(content, /Privacy boundary|隐私/iu);
    assert.match(content, /Push boundary|push/iu);
    assert.match(content, /Desktop \/ DeepSeek/iu);
    assert.match(content, /real second-agent dogfood|真实第二 agent/iu);
  }
});

test("README and skill docs expose the simulated continuation check", async () => {
  const readme = await readFile(readmePath, "utf8");
  const skill = await readFile(skillPath, "utf8");
  const agentGuide = await readFile(agentGuidePath, "utf8");

  for (const content of [readme, skill, agentGuide]) {
    assert.match(content, /second-agent-continuation\.md/);
    assert.match(content, /simulate-second-agent-continuation\.mjs/);
  }
});
