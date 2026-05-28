import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readmePath = "README.md";
const skillPath = "skills/vibelog/SKILL.md";
const agentGuidePath = "skills/vibelog/references/agent-usage-guide.md";
const readinessPath = "docs/guides/public-skill-readiness.md";
const readinessZhPath = "docs/guides/public-skill-readiness.zh.md";

function requireSection(content, heading) {
  const start = content.indexOf(`## ${heading}`);
  assert.notEqual(start, -1, `Missing section: ${heading}`);
  const rest = content.slice(start + heading.length + 3);
  const next = rest.search(/\n## /u);
  return next === -1 ? rest : rest.slice(0, next);
}

test("README keeps VibeLog core doctrine ahead of distribution and push boundaries", async () => {
  const readme = await readFile(readmePath, "utf8");
  const doctrine = requireSection(readme, "Core Doctrine");

  assert.ok(readme.indexOf("## Core Doctrine") < readme.indexOf("## Public Repository Boundary"));
  assert.match(doctrine, /vibe coding process memory standard/i);
  assert.match(doctrine, /not a GitHub push tool/i);
  assert.match(doctrine, /one-line idea/i);
  assert.match(doctrine, /idea evolution/i);
  assert.match(doctrine, /human-in-the-loop/i);
  assert.match(doctrine, /engineering execution prompts/i);
  assert.match(doctrine, /implementation status/i);
  assert.match(doctrine, /validation design/i);
  assert.match(doctrine, /handoff/i);
  assert.match(doctrine, /Markdown/i);
  assert.match(doctrine, /JSON/i);
  assert.match(doctrine, /agent records structurally/i);
  assert.match(readme, /Public skill readiness is a distribution safety gate/i);
});

test("skill and agent guide state the same core doctrine", async () => {
  const skill = await readFile(skillPath, "utf8");
  const guide = await readFile(agentGuidePath, "utf8");

  for (const content of [skill, guide]) {
    const doctrine = requireSection(content, "Core Doctrine");
    assert.match(doctrine, /process memory standard/i);
    assert.match(doctrine, /not a publishing or push workflow/i);
    assert.match(doctrine, /one-line idea/i);
    assert.match(doctrine, /idea evolution/i);
    assert.match(doctrine, /human-in-the-loop/i);
    assert.match(doctrine, /engineering execution prompts/i);
    assert.match(doctrine, /handoff/i);
    assert.match(doctrine, /Markdown/i);
    assert.match(doctrine, /JSON/i);
  }
});

test("public skill readiness docs are explicitly distribution safety, not VibeLog core", async () => {
  const english = await readFile(readinessPath, "utf8");
  const chinese = await readFile(readinessZhPath, "utf8");

  assert.match(english, /distribution safety gate/i);
  assert.match(english, /not the VibeLog core/i);
  assert.match(english, /core is process memory/i);

  assert.match(chinese, /分发安全闸门/u);
  assert.match(chinese, /不是 VibeLog 的核心/u);
  assert.match(chinese, /核心是过程记忆/u);
});
