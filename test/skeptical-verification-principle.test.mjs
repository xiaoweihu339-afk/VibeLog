import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readmePath = "README.md";
const skillPath = "skills/vibelog/SKILL.md";
const agentGuidePath = "skills/vibelog/references/agent-usage-guide.md";
const englishVerificationGuidePath = "docs/guides/vibe-verification-guide.md";
const chineseVerificationGuidePath = "docs/guides/vibe-verification-guide.zh.md";

test("public docs state the skeptical verification principle", async () => {
  const readme = await readFile(readmePath, "utf8");
  const englishGuide = await readFile(englishVerificationGuidePath, "utf8");
  const chineseGuide = await readFile(chineseVerificationGuidePath, "utf8");

  for (const content of [readme, englishGuide]) {
    assert.match(content, /Stay skeptical, verify strictly/);
    assert.match(content, /Do not trust claims/i);
    assert.match(content, /evidence/i);
  }

  assert.match(chineseGuide, /保持质疑，严格验证/);
  assert.match(chineseGuide, /不要相信没有证据的结论/);
});

test("agent-facing docs require skepticism before recording verification", async () => {
  const skill = await readFile(skillPath, "utf8");
  const agentGuide = await readFile(agentGuidePath, "utf8");

  for (const content of [skill, agentGuide]) {
    assert.match(content, /Stay skeptical, verify strictly/);
    assert.match(content, /Do not record passed/i);
    assert.match(content, /actual evidence/i);
  }
});
