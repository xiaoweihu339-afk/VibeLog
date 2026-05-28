import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const templatePaths = [
  "AGENTS.md",
  "agent-templates/README.md",
  "agent-templates/AGENTS.md",
  "agent-templates/CLAUDE.md",
  "agent-templates/GEMINI.md",
  "agent-templates/cursor/.cursor/rules/vibelog.mdc",
  "agent-templates/windsurf/.windsurf/rules/vibelog.md",
  "agent-templates/cline/.clinerules/vibelog.md",
  "agent-templates/roo-legacy/.roo/rules/vibelog.md",
  "agent-templates/github-copilot/.github/copilot-instructions.md"
];

const localUserMarker = "H" + "XW";
const windowsUserPathMarker = ["C:", "Users"].join("\\\\");
const appDataMarker = "App" + "Data";
const unsupportedVendorClaim = ["shutdown", "on", "May", "15,", "2026"].join(" ");

async function read(path) {
  return readFile(path, "utf8");
}

test("agent compatibility templates exist at their expected adapter paths", async () => {
  for (const path of templatePaths) {
    const info = await stat(path);
    assert.equal(info.isFile(), true, `Expected ${path} to be a file`);
  }
});

test("agent compatibility templates contain the portable VibeLog contract", async () => {
  for (const path of templatePaths) {
    const content = await read(path);

    assert.match(content, /vibe-log\.md/u, `${path} should mention Markdown source`);
    assert.match(content, /vibe-log\.json/u, `${path} should mention JSON export`);
    assert.match(content, /export-vibelog\.mjs/u, `${path} should include export command`);
    assert.match(content, /validate-vibelog\.mjs/u, `${path} should include validation command`);
    assert.doesNotMatch(content, new RegExp(`${windowsUserPathMarker}|${localUserMarker}|${appDataMarker}`, "u"), `${path} should not leak local machine data`);
    assert.doesNotMatch(content, new RegExp(unsupportedVendorClaim, "iu"), `${path} should not make unsupported vendor claims`);
  }
});

test("adapter-specific templates preserve each agent's instruction shape", async () => {
  const cursor = await read("agent-templates/cursor/.cursor/rules/vibelog.mdc");
  assert.match(cursor, /^---\r?\n/u);
  assert.match(cursor, /alwaysApply:\s*false/u);

  const windsurf = await read("agent-templates/windsurf/.windsurf/rules/vibelog.md");
  assert.match(windsurf, /trigger:\s*model_decision/u);

  const claude = await read("agent-templates/CLAUDE.md");
  assert.match(claude, /configure-claude-code-vibelog-hooks\.mjs/u);
  assert.match(claude, /project-local/u);

  const rootAgents = await read("AGENTS.md");
  assert.match(rootAgents, /Do not commit private project `vibe-log\.md`/u);
  assert.match(rootAgents, /Public examples under `examples\/` must be synthetic/u);

  const roo = await read("agent-templates/roo-legacy/.roo/rules/vibelog.md");
  assert.match(roo, /\.roo\/rules\//u);
  assert.match(roo, /Verify the rule-loading behavior/u);
});

test("agent compatibility docs and package metadata expose the template pack", async () => {
  const englishGuide = await read("docs/guides/agent-compatibility.md");
  const chineseGuide = await read("docs/guides/agent-compatibility.zh.md");
  const readme = await read("README.md");
  const packageJson = JSON.parse(await read("package.json"));
  const plan = JSON.parse(await read("docs/distribution/vibelog-distribution-plan.json"));
  const combinedDocs = `${englishGuide}\n${chineseGuide}\n${readme}`;

  for (const label of [
    "Codex",
    "Claude Code",
    "Cursor",
    "Gemini CLI",
    "Windsurf",
    "Cline",
    "Roo",
    "GitHub Copilot"
  ]) {
    assert.match(combinedDocs, new RegExp(label, "u"), `Docs should mention ${label}`);
  }

  assert.ok(packageJson.files.includes("AGENTS.md"));
  assert.ok(packageJson.files.includes("agent-templates"));

  const agentChannel = plan.channels.find((channel) => channel.id === "agent_templates");
  assert.equal(agentChannel.state, "prototype_clean_clone_verified");
  assert.equal(agentChannel.human_approval_required, true);
  assert.ok(agentChannel.verified_by.includes("test/agent-compatibility.test.mjs"));
  assert.ok(agentChannel.verified_by.includes("test/verify-github-agent-template-adoption.test.mjs"));
  assert.ok(agentChannel.verified_by.includes("scripts/verify-github-agent-template-adoption.mjs"));
  assert.ok(agentChannel.required_gates.includes("adapter_docs_verified"));
  assert.ok(agentChannel.required_gates.includes("template_smoke_tests_passed"));
  assert.ok(agentChannel.required_gates.includes("clean_clone_template_adoption_verified"));
  assert.ok(agentChannel.required_gates.includes("explicit_release_approval"));
  assert.ok(agentChannel.verified_gates.includes("template_smoke_tests_passed"));
  assert.ok(agentChannel.verified_gates.includes("clean_clone_template_adoption_verified"));
});

test("agent compatibility docs explain automation limits and future adapter work", async () => {
  const englishGuide = await read("docs/guides/agent-compatibility.md");
  const chineseGuide = await read("docs/guides/agent-compatibility.zh.md");
  const readme = await read("README.md");
  const skill = await read("skills/vibelog/SKILL.md");
  const agentGuide = await read("skills/vibelog/references/agent-usage-guide.md");
  const combinedDocs = `${englishGuide}\n${chineseGuide}\n${readme}\n${skill}\n${agentGuide}`;

  assert.match(combinedDocs, /does not guarantee automatic recording/iu);
  assert.match(combinedDocs, /hook|lifecycle|adapter/iu);
  assert.match(combinedDocs, /Claude Code/iu);
  assert.match(combinedDocs, /Codex/iu);
  assert.match(combinedDocs, /Cursor/iu);
  assert.match(combinedDocs, /future optimization|future work|后续优化|未来/iu);
});

test("agent compatibility docs frame integrations as continuously evolving", async () => {
  const englishGuide = await read("docs/guides/agent-compatibility.md");
  const chineseGuide = await read("docs/guides/agent-compatibility.zh.md");
  const readme = await read("README.md");
  const skill = await read("skills/vibelog/SKILL.md");
  const agentGuide = await read("skills/vibelog/references/agent-usage-guide.md");
  const combinedDocs = `${englishGuide}\n${chineseGuide}\n${readme}\n${skill}\n${agentGuide}`;

  assert.match(combinedDocs, /The standard stays stable\. The integrations keep evolving\./u);
  assert.match(combinedDocs, /标准保持稳定，适配持续进化/u);
  assert.match(combinedDocs, /track the capabilities of mainstream AI coding agents/iu);
  assert.match(combinedDocs, /跟进主流 AI 编程 agent 的能力变化/u);
  assert.match(combinedDocs, /compatibility levels are living documentation/iu);
  assert.match(combinedDocs, /适配等级.*持续更新/u);
});
