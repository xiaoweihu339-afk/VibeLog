import { spawn } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { configureClaudeCodeVibeLogHooks } from "./configure-claude-code-vibelog-hooks.mjs";
import { recordVibeLogEventsFile } from "./record-vibelog-event.mjs";
import { validateVibeLog } from "./validate-vibelog.mjs";

const HOOK_EVENTS = ["UserPromptSubmit", "PostToolUse", "Stop"];

export async function createRealProjectFixture({ workspace }) {
  const resolvedWorkspace = resolve(workspace);
  const files = {
    "README.md": `# VibeLog Opt-In Fixture

Scratch project used to verify project-local VibeLog Claude Code hooks.
`,
    "package.json": `${JSON.stringify({
      name: "vibelog-opt-in-fixture",
      version: "0.0.0",
      private: true,
      type: "module",
      scripts: {
        test: "node --test"
      }
    }, null, 2)}\n`,
    "src/receipt-total.js": `export function formatReceiptTotal(items) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return total.toFixed(2);
}
`,
    "test/receipt-total.test.js": `import test from "node:test";
import assert from "node:assert/strict";

import { formatReceiptTotal } from "../src/receipt-total.js";

test("formats receipt totals", () => {
  assert.equal(formatReceiptTotal([{ amount: 12 }, { amount: 3.5 }]), "15.50");
});
`,
    "vibe-log.md": `---
schema: vibelog@0.2-draft
title: "VibeLog Opt-In Fixture Project"
one_line_vibe: "Verify a real project can opt in to VibeLog Claude Code hooks locally."
stage: prototype
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: human_led_ai_assisted
process_level: core
tools: ["Claude Code", "VibeLog"]
tags: ["vibelog", "claude-code", "opt-in", "acceptance-test"]
created_at: "2026-05-27"
updated_at: "2026-05-27"
---

# VibeLog

## One-Line Vibe

Verify a real project can opt in to VibeLog Claude Code hooks locally.

## Current Idea

This is a tiny scratch receipt-total utility used to verify that project-local Claude Code hook settings can update a VibeLog without touching global settings.

## Idea Evolution

## Human-in-the-Loop

## Implementation Status

### Current State

Scratch project is ready for opt-in hook acceptance verification.

### Completed

- Tiny project fixture created.

### In Progress

### Pending

- Run project-local hook settings generator.
- Execute generated hook commands.

### Blocked

### Next Actions

- Enable local hooks and verify generated VibeLog output.

## Execution Prompts

## Development Log

## Bugfix / Incident Log

No bugfix or incident entry yet.

## Validation Design

### Success Criteria

- Dry-run does not write settings.
- Write mode creates only project-local settings.
- Generated hook commands update Markdown and JSON.
- Event files stay inside the project-local .vibelog-events directory.

### Core User Paths

- Preview project-local hook settings.
- Write project-local hook settings after review.
- Execute representative hook commands.
- Validate updated VibeLog JSON.

### Manual Test Steps

- Run the opt-in project verifier.

### Automated Test Strategy

Run node --test test/verify-claude-code-opt-in-project.test.mjs.

## Verification Evidence

## Artifact Index

## Handoff State

### Current State

Scratch project is ready for opt-in hook acceptance verification.

### Completed

- Tiny project fixture created.

### In Progress

### Pending

- Run project-local hook settings generator.
- Execute generated hook commands.

### Blockers

### Next Actions

- Enable local hooks and validate generated JSON.

### Context For Next Agent

- This is a scratch-only opt-in verification project.

## Vibe Progress

### 2026-05-27

**Stage:** prototype

**What Happened:** Created the opt-in verification fixture.

**Tools Used:** VibeLog

**Problems:** none

**Next:** Execute representative hook commands.

## Public Summary

Scratch-only project for VibeLog opt-in hook acceptance.
`
  };

  const filesCreated = [];
  for (const [relativePath, content] of Object.entries(files)) {
    const target = join(resolvedWorkspace, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
    filesCreated.push(relativePath);
  }

  return {
    workspace: resolvedWorkspace,
    filesCreated
  };
}

export async function runOptInProjectVerification({
  workspace = defaultWorkspace(),
  adapterPath = resolve("scripts/claude-code-hook-adapter.mjs"),
  eventMode = "direct"
} = {}) {
  const resolvedWorkspace = resolve(workspace);
  const resolvedAdapter = resolve(adapterPath);
  const project = await createRealProjectFixture({ workspace: resolvedWorkspace });
  const settingsPath = join(resolvedWorkspace, ".claude", "settings.json");
  const dryRunSettingsExistedBefore = await exists(settingsPath);

  const dryRun = await configureClaudeCodeVibeLogHooks({
    projectPath: resolvedWorkspace,
    adapterPath: resolvedAdapter,
    write: false,
    eventMode
  });
  const dryRunSettingsExistedAfter = await exists(dryRun.settingsPath);
  const dryRunCreatedSettings = !dryRunSettingsExistedBefore && dryRunSettingsExistedAfter;

  const write = await configureClaudeCodeVibeLogHooks({
    projectPath: resolvedWorkspace,
    adapterPath: resolvedAdapter,
    write: true,
    eventMode
  });
  const settings = JSON.parse(await readFile(write.settingsPath, "utf8"));

  const payloads = representativeHookPayloads(resolvedWorkspace);
  const commandsRun = [];
  for (const payload of payloads) {
    const command = getVibeLogCommand(settings, payload.hook_event_name);
    await runSettingsHookCommand({
      command,
      workspace: resolvedWorkspace,
      payload
    });
    commandsRun.push(payload.hook_event_name);
  }

  const eventDir = join(resolvedWorkspace, ".vibelog-events");
  const eventStreamPath = join(eventDir, "session.jsonl");
  const markdownBeforeConsume = await readFile(join(resolvedWorkspace, "vibe-log.md"), "utf8");
  const markdownUpdatedBeforeConsume = markdownBeforeConsume.includes("Build the opt-in fixture feature and run node --test");
  const eventStreamExists = await exists(eventStreamPath);
  let streamEventCount = 0;

  if (eventMode === "stream") {
    if (!eventStreamExists) {
      throw new Error(`Expected stream-first event file to exist: ${eventStreamPath}`);
    }

    const eventStream = await readFile(eventStreamPath, "utf8");
    streamEventCount = eventStream.split(/\r?\n/u).filter((line) => line.trim().length > 0).length;
    await recordVibeLogEventsFile({
      eventsPath: eventStreamPath,
      logPath: join(resolvedWorkspace, "vibe-log.md"),
      jsonPath: join(resolvedWorkspace, "vibe-log.json")
    });
  }

  const markdown = await readFile(join(resolvedWorkspace, "vibe-log.md"), "utf8");
  const json = JSON.parse(await readFile(join(resolvedWorkspace, "vibe-log.json"), "utf8"));
  const validation = validateVibeLog(json);
  const eventFiles = await listFiles(eventDir);
  const stopCommand = getVibeLogCommand(settings, "Stop");
  const markdownUpdated = markdown.includes("Build the opt-in fixture feature and run node --test");
  const jsonUpdated = validation.valid && json.title === "VibeLog Opt-In Fixture Project";
  const eventFileCount = eventFiles.length;

  return {
    passed: dryRun.wrote === false
      && dryRunCreatedSettings === false
      && write.wrote === true
      && (eventMode !== "stream" || (eventStreamExists && streamEventCount === payloads.length && markdownUpdatedBeforeConsume === false))
      && markdownUpdated
      && jsonUpdated
      && (eventMode === "stream" ? eventFileCount === 1 : eventFileCount >= payloads.length),
    workspace: resolvedWorkspace,
    eventMode,
    project,
    dryRun: {
      wrote: dryRun.wrote,
      ready: dryRun.ready,
      settingsPath: dryRun.settingsPath,
      settingsExistedBefore: dryRunSettingsExistedBefore,
      settingsExistedAfter: dryRunSettingsExistedAfter,
      createdSettings: dryRunCreatedSettings
    },
    write: {
      wrote: write.wrote,
      ready: write.ready,
      settingsPath: write.settingsPath
    },
    settings: {
      events: Object.keys(settings.hooks ?? {}).filter((eventName) => HOOK_EVENTS.includes(eventName)),
      stopCommand
    },
    hooks: {
      commandsRun,
      markdownUpdated,
      markdownUpdatedBeforeConsume,
      jsonUpdated,
      eventDir,
      eventFileCount,
      eventFiles,
      eventStreamPath,
      eventStreamExists,
      streamEventCount
    },
    validation: {
      valid: validation.valid,
      errors: validation.errors
    }
  };
}

export async function runSettingsHookCommand({ command, workspace, payload }) {
  const env = {
    ...process.env,
    CLAUDE_PROJECT_DIR: workspace
  };

  if (process.platform === "win32") {
    return execWithInput("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      command
    ], `${JSON.stringify(payload)}\n`, { cwd: workspace, env });
  }

  return execWithInput("/bin/sh", ["-c", command], `${JSON.stringify(payload)}\n`, { cwd: workspace, env });
}

function representativeHookPayloads(workspace) {
  return [
    {
      hook_event_name: "UserPromptSubmit",
      session_id: "slice-10-opt-in",
      cwd: workspace,
      prompt: "Build the opt-in fixture feature and run node --test."
    },
    {
      hook_event_name: "PostToolUse",
      session_id: "slice-10-opt-in",
      tool_name: "Write",
      tool_input: { file_path: "src/receipt-total.js" },
      tool_response: { success: true }
    },
    {
      hook_event_name: "PostToolUse",
      session_id: "slice-10-opt-in",
      tool_name: "Bash",
      tool_input: { command: "node --test" },
      tool_response: { exit_code: 0, stdout: "tests 1\npass 1\nfail 0" }
    },
    {
      hook_event_name: "Stop",
      session_id: "slice-10-opt-in",
      stop_hook_active: false,
      last_assistant_message: "VibeLog opt-in hook acceptance completed."
    }
  ];
}

function getVibeLogCommand(settings, eventName) {
  const groups = settings?.hooks?.[eventName];
  if (!Array.isArray(groups)) {
    throw new Error(`Missing hook event settings: ${eventName}`);
  }

  const hook = groups
    .flatMap((group) => Array.isArray(group?.hooks) ? group.hooks : [])
    .find((entry) => typeof entry?.command === "string" && entry.command.includes("claude-code-hook-adapter.mjs"));

  if (!hook) throw new Error(`Missing VibeLog hook command for ${eventName}`);
  return hook.command;
}

function execWithInput(file, args, input, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(file, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: ["pipe", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback(value);
    };

    const timer = setTimeout(() => {
      child.kill();
      finish(reject, new Error(`Command timed out: ${file} ${args.join(" ")}`));
    }, 30000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      finish(reject, error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        finish(resolvePromise, { stdout, stderr });
        return;
      }

      const error = new Error(`Command failed (${code}): ${file} ${args.join(" ")}`);
      error.code = code;
      error.stdout = stdout;
      error.stderr = stderr;
      finish(reject, error);
    });

    child.stdin.end(input);
  });
}

async function listFiles(dir) {
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  return entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function defaultWorkspace() {
  return join(resolve(".."), "vibelog-scratch", "vibelog-opt-in-fixture");
}

function parseArgs(argv) {
  const options = {
    workspace: defaultWorkspace(),
    adapterPath: resolve("scripts/claude-code-hook-adapter.mjs"),
    eventMode: "direct"
  };

  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--workspace") {
      options.workspace = args.shift() ?? "";
    } else if (arg === "--adapter") {
      options.adapterPath = args.shift() ?? "";
    } else if (arg === "--event-mode") {
      options.eventMode = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.workspace) throw new Error("--workspace requires a path");
  if (!options.adapterPath) throw new Error("--adapter requires a path");
  if (!["direct", "stream"].includes(options.eventMode)) {
    throw new Error("--event-mode must be direct or stream");
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await runOptInProjectVerification(options);
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(fileURLToPath(import.meta.url)).href) {
  const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
  if (import.meta.url === invokedPath) {
    main().catch((error) => {
      console.error(error.message);
      if (error.stderr) console.error(error.stderr);
      process.exitCode = 1;
    });
  }
}
