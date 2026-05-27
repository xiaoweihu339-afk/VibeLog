import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { validateVibeLog } from "../scripts/validate-vibelog.mjs";
import { runGithubAgentTemplateAdoptionVerification } from "../scripts/verify-github-agent-template-adoption.mjs";

const execFileAsync = promisify(execFile);

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("GitHub-style agent template adoption verifier clones a clean source and adopts every template", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "vibelog-github-agent-template-adoption-"));

  try {
    const result = await runGithubAgentTemplateAdoptionVerification({
      remoteUrl: process.cwd(),
      workspace
    });

    assert.equal(result.schema, "vibelog-github-agent-template-adoption@0.1");
    assert.equal(result.passed, true, result.failures.join("\n"));
    assert.equal(await exists(join(result.clone.path, "agent-templates", "README.md")), true);
    assert.equal(result.publicBoundary.clean, true);
    assert.equal(result.consumerProject.validation.valid, true);
    assert.equal(result.commands.init.created, true);
    assert.equal(result.commands.exportCheck.code, 0);
    assert.equal(result.commands.validate.code, 0);
    assert.equal(result.safety.scratchOnly, true);
    assert.equal(result.safety.pushPerformed, false);
    assert.equal(result.safety.publishPerformed, false);

    const expectedDestinations = new Map([
      ["agents", "AGENTS.md"],
      ["claude", "CLAUDE.md"],
      ["gemini", "GEMINI.md"],
      ["cursor", ".cursor/rules/vibelog.mdc"],
      ["windsurf", ".windsurf/rules/vibelog.md"],
      ["cline", ".clinerules/vibelog.md"],
      ["roo", ".roo/rules/vibelog.md"],
      ["github-copilot", ".github/copilot-instructions.md"]
    ]);

    assert.equal(result.templates.length, expectedDestinations.size);
    for (const template of result.templates) {
      assert.equal(template.exists, true, `${template.id} destination should exist`);
      assert.equal(template.hasCoreContract, true, `${template.id} should contain VibeLog contract`);
      assert.equal(template.destinationRelativePath, expectedDestinations.get(template.id));
      assert.equal(await exists(join(result.consumerProject.path, template.destinationRelativePath)), true);
    }

    const data = JSON.parse(await readFile(join(result.consumerProject.path, "vibe-log.json"), "utf8"));
    const validation = validateVibeLog(data);
    assert.equal(validation.valid, true, validation.errors.join("\n"));
    assert.equal(data.title, "S21 Agent Template Adoption");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("GitHub-style agent template adoption verifier CLI prints a passing JSON result", async () => {
  const workspace = await mkdtemp(join(tmpdir(), "vibelog-github-agent-template-adoption-cli-"));

  try {
    const { stdout } = await execFileAsync(process.execPath, [
      "scripts/verify-github-agent-template-adoption.mjs",
      "--remote-url",
      process.cwd(),
      "--workspace",
      workspace
    ], {
      cwd: process.cwd(),
      timeout: 120000,
      maxBuffer: 1024 * 1024
    });
    const result = JSON.parse(stdout);

    assert.equal(result.passed, true, result.failures.join("\n"));
    assert.match(result.clone.path, /vibelog-github-agent-template-clone/);
    assert.equal(result.templates.length, 8);
    assert.equal(result.publicBoundary.clean, true);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
