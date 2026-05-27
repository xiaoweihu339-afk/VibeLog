#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { configureClaudeCodeVibeLogHooks } from "./configure-claude-code-vibelog-hooks.mjs";
import { exportVibeLogFile, isSameJsonFile } from "./export-vibelog.mjs";
import { validateVibeLog } from "./validate-vibelog.mjs";

const VIBELOG_HOOK_MARKER = "claude-code-hook-adapter.mjs";
const HOOK_EVENTS = ["UserPromptSubmit", "PostToolUse", "Stop"];

export async function initVibeLogProject({
  projectPath = process.cwd(),
  title,
  idea,
  force = false
} = {}) {
  const resolvedProject = resolve(projectPath);
  rejectGlobalClaudePath(resolvedProject);
  if (!title) throw new Error("--title is required");
  if (!idea) throw new Error("--idea is required");

  const logPath = join(resolvedProject, "vibe-log.md");
  const jsonPath = join(resolvedProject, "vibe-log.json");
  if ((await exists(logPath)) && !force) {
    throw new Error(`vibe-log.md already exists: ${logPath}`);
  }

  await mkdir(resolvedProject, { recursive: true });
  await writeFile(logPath, renderInitialVibeLog({ title, idea, projectPath: resolvedProject }), "utf8");
  const data = await exportVibeLogFile(logPath, jsonPath);

  return {
    command: "init",
    projectPath: resolvedProject,
    logPath,
    jsonPath,
    created: true,
    valid: validateVibeLog(data).valid
  };
}

export async function enableVibeLogHooks({
  projectPath = process.cwd(),
  adapterPath = resolve("scripts/claude-code-hook-adapter.mjs"),
  write = false
} = {}) {
  const result = await configureClaudeCodeVibeLogHooks({
    projectPath,
    adapterPath,
    write
  });

  return {
    command: "enable-hooks",
    ...result,
    vibeLogHookCount: countVibeLogHooks(result.mergedSettings)
  };
}

export async function verifyVibeLogProject({ projectPath = process.cwd() } = {}) {
  const resolvedProject = resolve(projectPath);
  rejectGlobalClaudePath(resolvedProject);
  const logPath = join(resolvedProject, "vibe-log.md");
  const jsonPath = join(resolvedProject, "vibe-log.json");
  const settingsPath = join(resolvedProject, ".claude", "settings.json");
  const logExists = await exists(logPath);
  const jsonExists = await exists(jsonPath);

  let validation = { valid: false, errors: ["vibe-log.json is missing"] };
  if (jsonExists) {
    try {
      validation = validateVibeLog(JSON.parse(await readFile(jsonPath, "utf8")));
    } catch (error) {
      validation = { valid: false, errors: [`Could not parse vibe-log.json: ${error.message}`] };
    }
  }

  const jsonSynced = logExists && jsonExists
    ? await isSameJsonFile(logPath, jsonPath)
    : false;
  const settings = await readSettings(settingsPath);
  const vibeLogHookCount = countVibeLogHooks(settings);
  const hookEvents = listVibeLogHookEvents(settings);
  const hooksEnabled = vibeLogHookCount > 0;
  const ready = logExists && jsonExists && validation.valid && jsonSynced && hooksEnabled;

  return {
    command: "verify",
    projectPath: resolvedProject,
    ready,
    log: {
      logPath,
      jsonPath,
      exists: logExists,
      jsonExists,
      valid: validation.valid,
      errors: validation.errors,
      jsonSynced
    },
    hooks: {
      settingsPath,
      settingsExists: settings !== null,
      enabled: hooksEnabled,
      vibeLogHookCount,
      events: hookEvents
    }
  };
}

export async function disableVibeLogHooks({ projectPath = process.cwd() } = {}) {
  const resolvedProject = resolve(projectPath);
  rejectGlobalClaudePath(resolvedProject);
  const settingsPath = join(resolvedProject, ".claude", "settings.json");
  const settings = await readSettings(settingsPath);
  if (!settings) {
    return {
      command: "disable-hooks",
      projectPath: resolvedProject,
      settingsPath,
      settingsExists: false,
      removedHookCount: 0,
      wrote: false
    };
  }

  const { nextSettings, removedHookCount } = removeVibeLogHooks(settings);
  if (removedHookCount > 0) {
    await writeFile(settingsPath, `${JSON.stringify(nextSettings, null, 2)}\n`, "utf8");
  }

  return {
    command: "disable-hooks",
    projectPath: resolvedProject,
    settingsPath,
    settingsExists: true,
    removedHookCount,
    wrote: removedHookCount > 0
  };
}

function renderInitialVibeLog({ title, idea, projectPath }) {
  const date = new Date().toISOString().slice(0, 10);
  const safeTitle = escapeYamlString(title);
  const safeIdea = escapeYamlString(idea);

  return `---
schema: vibelog@0.2-draft
title: "${safeTitle}"
one_line_vibe: "${safeIdea}"
stage: idea
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: unknown
process_level: core
tools: ["VibeLog"]
tags: ["vibelog"]
created_at: "${date}"
updated_at: "${date}"
---

# VibeLog

## One-Line Vibe

${idea}

## Current Idea

${idea}

## Idea Evolution

### ${date}

**Type:** initial

**Before:** none

**After:** ${idea}

**Reason:** Initial VibeLog project setup.

**Source:** user

**Confidence:** high

## Human-in-the-Loop

## Execution Prompts

## Development Log

## Bugfix / Incident Log

No bugfix or incident entry yet.

## Validation Design

### Success Criteria

- VibeLog Markdown exists.
- VibeLog JSON is generated from Markdown.
- Project-local hooks are opt-in only.

### Core User Paths

- Initialize VibeLog.
- Preview hook settings.
- Enable hooks after review.
- Verify readiness.
- Disable hooks if needed.

### Risks / Safety / Privacy Checks

- Do not edit global Claude Code settings.
- Do not publish or upload private project data.

## Verification Evidence

## Project Context

### Repo / Workspace

${projectPath}

### Important Files

- vibe-log.md
- vibe-log.json

### Run / Test Commands

- node scripts/vibelog-project.mjs verify --project "${projectPath}"

## Artifact Index

## Handoff State

### Current State

VibeLog initialized for this project.

### Completed

- Created initial VibeLog files.

### Pending

- Preview and optionally enable project-local hooks.

### Next Actions

- Run verify after enabling hooks.

## Public Summary

Private project VibeLog initialized locally.
`;
}

function removeVibeLogHooks(settings) {
  const nextSettings = structuredClone(settings);
  const hooks = isPlainObject(nextSettings.hooks) ? nextSettings.hooks : {};
  let removedHookCount = 0;

  for (const eventName of Object.keys(hooks)) {
    const groups = Array.isArray(hooks[eventName]) ? hooks[eventName] : [];
    hooks[eventName] = groups
      .map((group) => {
        const entries = Array.isArray(group?.hooks) ? group.hooks : [];
        const keptHooks = entries.filter((hook) => {
          const isVibeLogHook = typeof hook?.command === "string" && hook.command.includes(VIBELOG_HOOK_MARKER);
          if (isVibeLogHook) removedHookCount += 1;
          return !isVibeLogHook;
        });
        return { ...group, hooks: keptHooks };
      })
      .filter((group) => group.hooks.length > 0);
  }

  nextSettings.hooks = hooks;
  return { nextSettings, removedHookCount };
}

function countVibeLogHooks(settings) {
  if (!isPlainObject(settings?.hooks)) return 0;
  return Object.values(settings.hooks)
    .filter(Array.isArray)
    .flatMap((groups) => groups)
    .flatMap((group) => Array.isArray(group?.hooks) ? group.hooks : [])
    .filter((hook) => typeof hook?.command === "string" && hook.command.includes(VIBELOG_HOOK_MARKER))
    .length;
}

function listVibeLogHookEvents(settings) {
  if (!isPlainObject(settings?.hooks)) return [];

  return HOOK_EVENTS.filter((eventName) => {
    const groups = settings.hooks[eventName];
    if (!Array.isArray(groups)) return false;
    return groups.some((group) => (Array.isArray(group?.hooks) ? group.hooks : [])
      .some((hook) => typeof hook?.command === "string" && hook.command.includes(VIBELOG_HOOK_MARKER)));
  });
}

async function readSettings(settingsPath) {
  if (!(await exists(settingsPath))) return null;

  try {
    return JSON.parse(await readFile(settingsPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not parse Claude settings JSON at ${settingsPath}: ${error.message}`);
  }
}

function rejectGlobalClaudePath(projectPath) {
  const globalClaude = resolve(homedir(), ".claude").toLowerCase();
  const normalized = resolve(projectPath).toLowerCase();
  if (normalized === globalClaude || normalized.startsWith(`${globalClaude}\\`) || normalized.startsWith(`${globalClaude}/`)) {
    throw new Error(`Refusing to use global Claude settings path: ${projectPath}`);
  }
}

function escapeYamlString(value) {
  return String(value).replace(/\\/gu, "\\\\").replace(/"/gu, '\\"');
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!command || command === "--help" || command === "-h" || command === "help") {
    return { command: "help" };
  }
  const options = { command, projectPath: process.cwd(), write: false, force: false };
  const args = [...rest];

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--project") {
      options.projectPath = args.shift() ?? "";
    } else if (arg === "--adapter") {
      options.adapterPath = args.shift() ?? "";
    } else if (arg === "--title") {
      options.title = args.shift() ?? "";
    } else if (arg === "--idea") {
      options.idea = args.shift() ?? "";
    } else if (arg === "--write") {
      options.write = true;
    } else if (arg === "--dry-run") {
      options.write = false;
    } else if (arg === "--force") {
      options.force = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.projectPath) throw new Error("--project requires a path");
  if (options.adapterPath === "") throw new Error("--adapter requires a path");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  let result;

  if (options.command === "help") {
    console.log(helpText());
    return;
  } else if (options.command === "init") {
    result = await initVibeLogProject(options);
  } else if (options.command === "enable-hooks") {
    result = await enableVibeLogHooks(options);
  } else if (options.command === "verify") {
    result = await verifyVibeLogProject(options);
  } else if (options.command === "disable-hooks") {
    result = await disableVibeLogHooks(options);
  } else {
    throw new Error(`Unknown command: ${options.command}`);
  }

  console.log(JSON.stringify(result, null, 2));
  if (result.ready === false || result.valid === false) process.exitCode = 1;
}

function helpText() {
  return `vibelog-project

Project-local VibeLog adoption CLI.

Usage:
  vibelog-project init --project <path> --title <title> --idea <one-line idea> [--force]
  vibelog-project enable-hooks --project <path> --adapter <adapter path> [--write]
  vibelog-project verify --project <path>
  vibelog-project disable-hooks --project <path>
  vibelog-project --help

Commands:
  init           Create vibe-log.md and vibe-log.json for a project.
  enable-hooks   Preview project-local Claude Code hooks by default; write only with --write.
  verify         Check VibeLog validity, JSON sync, and project-local hook status.
  disable-hooks  Remove only VibeLog hook commands from project-local settings.

Safety:
  - Project-local by default.
  - Does not edit global Claude Code settings.
  - Does not push, publish, or upload project data.
`;
}

if (import.meta.url === pathToFileURL(fileURLToPath(import.meta.url)).href) {
  const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
  if (import.meta.url === invokedPath) {
    main().catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
  }
}
