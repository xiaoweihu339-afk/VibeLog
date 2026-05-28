import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import { runPublicSkillReadinessVerification } from "../scripts/verify-public-skill-readiness.mjs";

const execFileAsync = promisify(execFile);

async function writeFixtureFile(root, path, content) {
  const fullPath = join(root, path);
  await mkdir(join(fullPath, ".."), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

async function createReadyFixture() {
  const root = await mkdtemp(join(tmpdir(), "vibelog-public-readiness-"));
  const files = {
    "package.json": JSON.stringify({
      name: "vibelog",
      version: "0.2.0-draft.0",
      private: true,
      type: "module",
      bin: {
        "vibelog-install": "./scripts/vibelog-install.mjs",
        "vibelog-project": "./scripts/vibelog-project.mjs",
        "vibelog-verify-public-skill-readiness": "./scripts/verify-public-skill-readiness.mjs"
      },
      scripts: {
        test: "node --test",
        vibelog: "node scripts/vibelog-project.mjs",
        "vibelog:install": "node scripts/vibelog-install.mjs",
        "vibelog:verify-public-skill-readiness": "node scripts/verify-public-skill-readiness.mjs"
      }
    }, null, 2),
    ".gitignore": [
      "/vibe-log.md",
      "/vibe-log.json",
      "/.vibelog-events/",
      "/vibelog-scratch/"
    ].join("\n"),
    "README.md": "## Core Doctrine\nVibeLog is a vibe coding process memory standard, not a GitHub push tool.\n\n## Public Repository Boundary\nRun scripts/verify-public-skill-readiness.mjs before push. Public Skill Readiness is a distribution safety gate that keeps private project memory and private root logs out. Push requires explicit human approval.",
    "AGENTS.md": "Run scripts/verify-public-skill-readiness.mjs. Do not commit private project `vibe-log.md` files.",
    "skills/vibelog/SKILL.md": "## Core Doctrine\nVibeLog is a process memory standard, not a publishing or push workflow.\n\nUse docs/guides/public-skill-readiness.md and scripts/verify-public-skill-readiness.mjs. Never publish or upload without explicit user approval.",
    "skills/vibelog/references/agent-usage-guide.md": "## Core Doctrine\nVibeLog is a process memory standard, not a publishing or push workflow.\n\nBefore push, run scripts/verify-public-skill-readiness.mjs with isolated checks and workflow checks. Never publish or upload without explicit user approval.",
    "docs/guides/public-skill-readiness.md": "Public Skill Readiness is a distribution safety gate, not the VibeLog core. The core is process memory. It requires isolated checks and workflow checks. Do not commit private root vibe-log.md, vibe-log.json, or .vibelog-events data. Push requires explicit human approval.",
    "docs/guides/public-skill-readiness.zh.md": "公开 Skill Readiness 是分发安全闸门，不是 VibeLog 的核心。核心是过程记忆。它需要单项检查和流程检查。不要提交私有根日志 vibe-log.md、vibe-log.json 或 .vibelog-events。push 需要人类明确同意。",
    "docs/guides/handoff-continuity.md": "handoff",
    "docs/guides/handoff-continuity.zh.md": "handoff",
    "docs/guides/second-agent-continuation.md": "second agent",
    "docs/guides/second-agent-continuation.zh.md": "second agent",
    "docs/guides/real-second-agent-dogfood.md": "real second agent",
    "docs/guides/real-second-agent-dogfood.zh.md": "real second agent",
    "docs/guides/stable-live-hook-workflow.md": "stable live hook",
    "docs/guides/stable-live-hook-workflow.zh.md": "stable live hook",
    "scripts/export-vibelog.mjs": "#!/usr/bin/env node\n",
    "scripts/validate-vibelog.mjs": "#!/usr/bin/env node\n",
    "scripts/verify-handoff-continuity.mjs": "#!/usr/bin/env node\n",
    "scripts/simulate-second-agent-continuation.mjs": "#!/usr/bin/env node\n",
    "scripts/verify-second-agent-continuation-report.mjs": "#!/usr/bin/env node\n",
    "scripts/verify-clean-clone-adoption.mjs": "#!/usr/bin/env node\n",
    "scripts/verify-release-bundle.mjs": "#!/usr/bin/env node\n",
    "scripts/verify-github-agent-template-adoption.mjs": "#!/usr/bin/env node\n",
    "scripts/vibelog-project.mjs": "#!/usr/bin/env node\n",
    "scripts/vibelog-install.mjs": "#!/usr/bin/env node\n",
    "scripts/verify-public-skill-readiness.mjs": "#!/usr/bin/env node\n",
    "skills/vibelog/assets/vibe-log.schema.json": "{}",
    "examples/public-sample/vibe-log.md": "# Public Sample\n",
    "examples/public-sample/vibe-log.json": "{}"
  };

  for (const [path, content] of Object.entries(files)) {
    await writeFixtureFile(root, path, content);
  }

  return {
    root,
    trackedFiles: Object.keys(files)
  };
}

test("public skill readiness verifier passes a minimal public-safe skill fixture", async () => {
  const fixture = await createReadyFixture();

  try {
    const result = await runPublicSkillReadinessVerification({
      repoPath: fixture.root,
      trackedFiles: fixture.trackedFiles,
      gitStatusShort: ""
    });

    assert.equal(result.schema, "vibelog-public-skill-readiness@0.1");
    assert.equal(result.passed, true, result.failures.join("\n"));
    assert.equal(result.publicBoundary.privateRootFilesTracked, false);
    assert.equal(result.publicBoundary.personalLocalPathsFound, false);
    assert.equal(result.entrypoints.packagePrivate, true);
    assert.equal(result.pushReadiness.requiresExplicitHumanApproval, true);
    assert.deepEqual(result.failures, []);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("public skill readiness verifier rejects tracked private VibeLog memory", async () => {
  const fixture = await createReadyFixture();

  try {
    await writeFixtureFile(fixture.root, "vibe-log.md", "# Private project memory\n");
    const result = await runPublicSkillReadinessVerification({
      repoPath: fixture.root,
      trackedFiles: [...fixture.trackedFiles, "vibe-log.md"],
      gitStatusShort: ""
    });

    assert.equal(result.passed, false);
    assert.equal(result.publicBoundary.privateRootFilesTracked, true);
    assert.match(result.failures.join("\n"), /vibe-log\.md/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("public skill readiness verifier rejects missing public docs and entrypoint references", async () => {
  const fixture = await createReadyFixture();

  try {
    await writeFixtureFile(fixture.root, "README.md", "VibeLog without the readiness gate.");
    const result = await runPublicSkillReadinessVerification({
      repoPath: fixture.root,
      trackedFiles: fixture.trackedFiles,
      gitStatusShort: ""
    });

    assert.equal(result.passed, false);
    assert.match(result.failures.join("\n"), /README/);
    assert.match(result.failures.join("\n"), /verify-public-skill-readiness/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("public skill readiness verifier rejects docs that omit the VibeLog core doctrine", async () => {
  const fixture = await createReadyFixture();

  try {
    await writeFixtureFile(fixture.root, "skills/vibelog/SKILL.md", "Use scripts/verify-public-skill-readiness.mjs before push.");
    const result = await runPublicSkillReadinessVerification({
      repoPath: fixture.root,
      trackedFiles: fixture.trackedFiles,
      gitStatusShort: ""
    });

    assert.equal(result.passed, false);
    assert.match(result.failures.join("\n"), /Core Doctrine|process memory standard|not a publishing or push workflow/);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test("public skill readiness verifier CLI prints a passing JSON result for this repo", async () => {
  const { stdout } = await execFileAsync(process.execPath, [
    "scripts/verify-public-skill-readiness.mjs",
    "--repo",
    process.cwd()
  ], {
    cwd: process.cwd(),
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
  const result = JSON.parse(stdout);

  assert.equal(result.passed, true, result.failures.join("\n"));
  assert.equal(result.publicBoundary.privateRootFilesTracked, false);
  assert.equal(result.entrypoints.packagePrivate, true);
  assert.equal(result.pushReadiness.pushEligibleScope, true);
});
