import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const englishGuidePath = "docs/guides/stable-live-hook-workflow.md";
const chineseGuidePath = "docs/guides/stable-live-hook-workflow.zh.md";
const readmePath = "README.md";
const skillPath = "skills/vibelog/SKILL.md";

test("stable live hook workflow docs exist in English and Chinese", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  assert.match(english, /Stable Live Hook Workflow/);
  assert.match(chinese, /稳定 live hook 工作流/);
});

test("stable live hook workflow documents the required safe user path", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  for (const content of [english, chinese]) {
    assert.match(content, /init/iu);
    assert.match(content, /enable-hooks/iu);
    assert.match(content, /--event-mode stream/iu);
    assert.match(content, /--write/iu);
    assert.match(content, /verify/iu);
    assert.match(content, /record-vibelog-event\.mjs --events/iu);
    assert.match(content, /disable-hooks/iu);
    assert.match(content, /rollback/iu);
    assert.match(content, /UserPromptSubmit/iu);
    assert.match(content, /PostToolUse/iu);
    assert.match(content, /Stop/iu);
    assert.match(content, /tool_used/iu);
    assert.match(content, /test_ran/iu);
    assert.match(content, /handoff_updated/iu);
    assert.match(content, /require-tool-use/iu);
    assert.match(content, /require-test-run/iu);
    assert.match(content, /require-less-scripted-dogfood/iu);
    assert.match(content, /require-human-decision/iu);
    assert.match(content, /decision_made/iu);
    assert.match(content, /bypassPermissions/iu);
    assert.match(content, /scratch/iu);
  }
});

test("stable live hook workflow states configuration and privacy boundaries", async () => {
  const english = await readFile(englishGuidePath, "utf8");
  const chinese = await readFile(chineseGuidePath, "utf8");

  for (const content of [english, chinese]) {
    assert.match(content, /project-local/iu);
    assert.match(content, /Desktop/iu);
    assert.match(content, /DeepSeek/iu);
    assert.match(content, /global/iu);
    assert.match(content, /\.vibelog-events/iu);
    assert.match(content, /API key|API_KEY|token|密钥|凭证/iu);
    assert.match(content, /private|隐私|私有/iu);
    assert.match(content, /do not commit|不要提交/iu);
  }
});

test("README and skill point users to the stable live hook workflow", async () => {
  const readme = await readFile(readmePath, "utf8");
  const skill = await readFile(skillPath, "utf8");

  assert.match(readme, /Stable Live Hook Workflow/);
  assert.match(readme, /docs\/guides\/stable-live-hook-workflow\.md/);
  assert.match(readme, /docs\/guides\/stable-live-hook-workflow\.zh\.md/);
  assert.match(skill, /stable-live-hook-workflow\.md/);
});
