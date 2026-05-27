import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";

import { isSameJsonFile } from "../scripts/export-vibelog.mjs";
import { validateVibeLog } from "../scripts/validate-vibelog.mjs";
import {
  disableVibeLogHooks,
  enableVibeLogHooks,
  initVibeLogProject,
  verifyVibeLogProject
} from "../scripts/vibelog-project.mjs";

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test("init creates a valid VibeLog and refuses accidental overwrite", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-project-init-"));

  try {
    const result = await initVibeLogProject({
      projectPath: project,
      title: "Adoption Test",
      idea: "Verify ordinary users can start a VibeLog safely."
    });

    assert.equal(result.created, true);
    assert.equal(result.logPath, join(project, "vibe-log.md"));
    assert.equal(await exists(join(project, "vibe-log.md")), true);
    assert.equal(await exists(join(project, "vibe-log.json")), true);
    assert.equal(await isSameJsonFile(join(project, "vibe-log.md"), join(project, "vibe-log.json")), true);

    const data = JSON.parse(await readFile(join(project, "vibe-log.json"), "utf8"));
    const validation = validateVibeLog(data);
    assert.equal(validation.valid, true, validation.errors.join("\n"));
    assert.equal(data.title, "Adoption Test");

    await assert.rejects(
      () => initVibeLogProject({
        projectPath: project,
        title: "Overwrite Attempt",
        idea: "This should not overwrite by default."
      }),
      /vibe-log\.md already exists/
    );
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});

test("ordinary user workflow can enable, verify, and disable hooks safely", async () => {
  const project = await mkdtemp(join(tmpdir(), "vibelog-project-workflow-"));
  const adapterPath = resolve("scripts/claude-code-hook-adapter.mjs");
  const settingsPath = join(project, ".claude", "settings.json");

  try {
    await initVibeLogProject({
      projectPath: project,
      title: "Workflow Test",
      idea: "Verify the init enable verify disable workflow."
    });
    await mkdir(dirname(settingsPath), { recursive: true });
    await writeFile(settingsPath, `${JSON.stringify({
      permissions: { allow: ["Bash(git status)"] },
      hooks: {
        Stop: [{ matcher: "", hooks: [{ type: "command", command: "echo keep-me" }] }]
      }
    }, null, 2)}\n`, "utf8");

    const dryRun = await enableVibeLogHooks({
      projectPath: project,
      adapterPath,
      write: false
    });
    assert.equal(dryRun.wrote, false);
    assert.equal(dryRun.dryRun, true);

    const write = await enableVibeLogHooks({
      projectPath: project,
      adapterPath,
      write: true
    });
    assert.equal(write.wrote, true);
    assert.equal(write.settingsPath, settingsPath);

    const ready = await verifyVibeLogProject({ projectPath: project });
    assert.equal(ready.ready, true);
    assert.equal(ready.log.valid, true);
    assert.equal(ready.hooks.enabled, true);
    assert.equal(ready.hooks.vibeLogHookCount, 3);

    const disabled = await disableVibeLogHooks({ projectPath: project });
    assert.equal(disabled.removedHookCount, 3);

    const settings = JSON.parse(await readFile(settingsPath, "utf8"));
    const stopCommands = settings.hooks.Stop.flatMap((group) => group.hooks.map((hook) => hook.command));
    assert.deepEqual(settings.permissions, { allow: ["Bash(git status)"] });
    assert.equal(stopCommands.includes("echo keep-me"), true);
    assert.equal(stopCommands.some((command) => command.includes("claude-code-hook-adapter.mjs")), false);

    const afterDisable = await verifyVibeLogProject({ projectPath: project });
    assert.equal(afterDisable.ready, false);
    assert.equal(afterDisable.log.valid, true);
    assert.equal(afterDisable.hooks.enabled, false);
  } finally {
    await rm(project, { recursive: true, force: true });
  }
});
