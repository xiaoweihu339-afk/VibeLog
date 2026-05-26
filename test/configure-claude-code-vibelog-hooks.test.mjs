import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir, homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

import {
  buildHookSettings,
  configureClaudeCodeVibeLogHooks
} from "../scripts/configure-claude-code-vibelog-hooks.mjs";

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("dry-run generates project-local settings without writing files", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-hook-dry-run-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    await writeFile(join(project, "vibe-log.md"), "# VibeLog\n", "utf8");
    const result = await configureClaudeCodeVibeLogHooks({
      projectPath: project,
      adapterPath,
      write: false
    });

    assert.equal(result.dryRun, true);
    assert.equal(result.wrote, false);
    assert.equal(result.ready, true);
    assert.equal(await exists(join(project, ".claude", "settings.json")), false);
    assert.match(result.generatedSettings.hooks.Stop[0].hooks[0].command, /claude-code-hook-adapter\.mjs/);
    assert.match(result.generatedSettings.hooks.Stop[0].hooks[0].command, /CLAUDE_PROJECT_DIR/);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("write mode creates project-local settings when vibe-log exists", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-hook-write-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    await writeFile(join(project, "vibe-log.md"), "# VibeLog\n", "utf8");
    const result = await configureClaudeCodeVibeLogHooks({
      projectPath: project,
      adapterPath,
      write: true
    });
    const settings = JSON.parse(await readFile(result.settingsPath, "utf8"));

    assert.equal(result.dryRun, false);
    assert.equal(result.wrote, true);
    assert.equal(dirname(result.settingsPath), join(project, ".claude"));
    assert.equal(settings.hooks.UserPromptSubmit.length, 1);
    assert.equal(settings.hooks.PostToolUse.length, 1);
    assert.equal(settings.hooks.Stop.length, 1);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("merge preserves existing settings and avoids duplicate VibeLog hooks", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-hook-merge-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    await writeFile(join(project, "vibe-log.md"), "# VibeLog\n", "utf8");
    const first = await configureClaudeCodeVibeLogHooks({
      projectPath: project,
      adapterPath,
      write: true
    });
    const existing = JSON.parse(await readFile(first.settingsPath, "utf8"));
    existing.permissions = { allow: ["Bash(git status)"] };
    existing.hooks.Stop.push({
      matcher: "",
      hooks: [{ type: "command", command: "echo keep-me" }]
    });
    await writeFile(first.settingsPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");

    const second = await configureClaudeCodeVibeLogHooks({
      projectPath: project,
      adapterPath,
      write: true
    });
    const merged = JSON.parse(await readFile(second.settingsPath, "utf8"));
    const stopCommands = merged.hooks.Stop.flatMap((group) => group.hooks.map((hook) => hook.command));
    const vibelogCommands = stopCommands.filter((command) => command.includes("claude-code-hook-adapter.mjs"));

    assert.deepEqual(merged.permissions, { allow: ["Bash(git status)"] });
    assert.equal(stopCommands.includes("echo keep-me"), true);
    assert.equal(vibelogCommands.length, 1);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("write mode refuses missing vibe-log unless explicitly allowed", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-hook-missing-log-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");

  try {
    await assert.rejects(
      () => configureClaudeCodeVibeLogHooks({ projectPath: project, adapterPath, write: true }),
      /vibe-log\.md/
    );
    const result = await configureClaudeCodeVibeLogHooks({
      projectPath: project,
      adapterPath,
      write: false
    });

    assert.equal(result.ready, false);
    assert.match(result.warnings.join("\n"), /vibe-log\.md/);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("global Claude settings paths are rejected", async () => {
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");
  const globalClaudePath = join(homedir(), ".claude");

  await assert.rejects(
    () => buildHookSettings({ projectPath: globalClaudePath, adapterPath }),
    /global Claude settings/
  );
});
