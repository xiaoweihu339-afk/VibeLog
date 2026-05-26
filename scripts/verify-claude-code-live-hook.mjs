import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);

export async function createScratchVibeLog({ workspace }) {
  await mkdir(workspace, { recursive: true });
  const logPath = join(workspace, "vibe-log.md");
  const markdown = `---
schema: vibelog@0.2-draft
title: "Claude Live Hook Test"
one_line_vibe: "Verify Claude Code hooks can update VibeLog through the adapter and recorder core."
stage: prototype
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: agent_led_human_approved
process_level: core
tools: ["Claude Code", "VibeLog"]
tags: ["vibelog", "claude-code", "live-hook-test"]
created_at: "2026-05-27"
updated_at: "2026-05-27"
---

# VibeLog

## One-Line Vibe

Verify Claude Code hooks can update VibeLog through the adapter and recorder core.

## Current Idea

Use a scratch workspace to verify local Claude Code hook configuration without changing global settings.

## Idea Evolution

## Human-in-the-Loop

## Execution Prompts

## Development Log

## Bugfix / Incident Log

No bugfix or incident entry yet.

## Validation Design

### Success Criteria

- Hook command updates Markdown.
- Hook command regenerates JSON.
- No global settings are modified.

## Verification Evidence

## Artifact Index

## Handoff State

### Current State

Scratch VibeLog is ready for hook verification.

### Completed

- Scratch workspace created.

### Pending

- Run fixture hook verification.
- Attempt live Claude Code verification if explicitly enabled.

## Public Summary

Scratch-only VibeLog for Claude Code live hook verification.
`;

  await writeFile(logPath, markdown, "utf8");
  return logPath;
}

export async function writeClaudeLocalSettings({ workspace, adapterPath }) {
  const claudeDir = join(workspace, ".claude");
  await mkdir(claudeDir, { recursive: true });

  const command = [
    "node",
    quotePath(adapterPath),
    "--log",
    "vibe-log.md",
    "--json",
    "vibe-log.json",
    "--event-dir",
    ".vibelog-events"
  ].join(" ");

  const hook = {
    type: "command",
    ...(process.platform === "win32" ? { shell: "powershell" } : {}),
    command
  };

  const settings = {
    hooks: {
      UserPromptSubmit: [{ matcher: "", hooks: [hook] }],
      PostToolUse: [{ matcher: "", hooks: [hook] }],
      Stop: [{ matcher: "", hooks: [hook] }]
    }
  };

  const settingsPath = join(claudeDir, "settings.json");
  await writeFile(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
  return settingsPath;
}

export async function runFixtureVerification({ workspace, adapterPath }) {
  const resolvedWorkspace = resolve(workspace);
  const resolvedAdapter = resolve(adapterPath);
  const logPath = await createScratchVibeLog({ workspace: resolvedWorkspace });
  const settingsPath = await writeClaudeLocalSettings({
    workspace: resolvedWorkspace,
    adapterPath: resolvedAdapter
  });
  const jsonPath = join(resolvedWorkspace, "vibe-log.json");
  const eventDir = join(resolvedWorkspace, ".vibelog-events");

  const fixtures = [
    {
      hook_event_name: "UserPromptSubmit",
      session_id: "fixture-session",
      cwd: resolvedWorkspace,
      prompt: "Implement a tiny fixture task and run node --test"
    },
    {
      hook_event_name: "PostToolUse",
      session_id: "fixture-session",
      tool_name: "Write",
      tool_input: { file_path: "README.md" },
      tool_response: { success: true }
    },
    {
      hook_event_name: "PostToolUse",
      session_id: "fixture-session",
      tool_name: "Bash",
      tool_input: { command: "node --test" },
      tool_response: { exit_code: 0, stdout: "tests 1\npass 1\nfail 0" }
    },
    {
      hook_event_name: "Stop",
      session_id: "fixture-session",
      stop_hook_active: false,
      last_assistant_message: "Fixture hook verification completed."
    }
  ];

  const commandsRun = [];
  for (const fixture of fixtures) {
    await runAdapterCommand({
      adapterPath: resolvedAdapter,
      workspace: resolvedWorkspace,
      payload: fixture
    });
    commandsRun.push(fixture.hook_event_name);
  }

  const markdown = await readFile(logPath, "utf8");
  const json = JSON.parse(await readFile(jsonPath, "utf8"));

  return {
    fixturePassed: markdown.includes("Fixture hook verification completed.") && json.title === "Claude Live Hook Test",
    workspace: resolvedWorkspace,
    settingsPath,
    logPath,
    jsonPath,
    eventDir,
    commandsRun
  };
}

export async function runLiveVerification({
  workspace,
  adapterPath,
  live = false,
  prompt = "Reply with OK. Do not use tools.",
  maxBudgetUsd = "0.05"
}) {
  if (!live) {
    return {
      attempted: false,
      passed: false,
      reason: "Live Claude Code verification requires --live."
    };
  }

  const resolvedWorkspace = resolve(workspace);
  const resolvedAdapter = resolve(adapterPath ?? "scripts/claude-code-hook-adapter.mjs");
  await createScratchVibeLog({ workspace: resolvedWorkspace });
  const settingsPath = await writeClaudeLocalSettings({
    workspace: resolvedWorkspace,
    adapterPath: resolvedAdapter
  });

  try {
    const { stdout, stderr } = await runClaudeCommand([
      "-p",
      prompt,
      "--settings",
      settingsPath,
      "--max-budget-usd",
      maxBudgetUsd,
      "--output-format",
      "stream-json",
      "--include-hook-events",
      "--verbose"
    ], {
      cwd: resolvedWorkspace,
      timeout: 120000,
      maxBuffer: 1024 * 1024
    });

    const markdown = await readFile(join(resolvedWorkspace, "vibe-log.md"), "utf8");
    const stream = parseStreamJsonLines(stdout);
    const hookResponses = stream
      .filter((event) => event.type === "system" && event.subtype === "hook_response")
      .map((event) => ({
        hook_event: event.hook_event,
        exit_code: event.exit_code,
        outcome: event.outcome,
        output: summarizeText(event.output, "No hook output.")
      }));
    const result = stream.find((event) => event.type === "result");
    const stopHookSucceeded = hookResponses.some((event) => event.hook_event === "Stop" && event.exit_code === 0);
    const markdownUpdated = markdown.includes("Claude Code hook event captured");

    return {
      attempted: true,
      passed: stopHookSucceeded && markdownUpdated,
      maxBudgetUsd,
      settingsPath,
      result: result?.result ?? "",
      totalCostUsd: result?.total_cost_usd ?? null,
      hookResponses,
      stderr: stderr.trim()
    };
  } catch (error) {
    return {
      attempted: true,
      passed: false,
      maxBudgetUsd,
      settingsPath,
      error: error.message,
      stdout: error.stdout?.toString().trim() ?? "",
      stderr: error.stderr?.toString().trim() ?? ""
    };
  }
}

function parseStreamJsonLines(text) {
  return String(text ?? "")
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { type: "unparsed", raw: line };
      }
    });
}

function summarizeText(text, fallback) {
  const clean = String(text ?? "").replace(/\s+/gu, " ").trim();
  if (!clean) return fallback;
  return clean.length <= 240 ? clean : `${clean.slice(0, 237)}...`;
}

async function runAdapterCommand({ adapterPath, workspace, payload }) {
  await execFileWithInput("node", [
    adapterPath,
    "--log",
    "vibe-log.md",
    "--json",
    "vibe-log.json",
    "--event-dir",
    ".vibelog-events"
  ], `${JSON.stringify(payload)}\n`, {
    cwd: workspace,
    timeout: 30000,
    maxBuffer: 1024 * 1024
  });
}

async function runClaudeCommand(args, options) {
  if (process.platform === "win32") {
    return execFileAsync("cmd.exe", ["/d", "/s", "/c", "claude", ...args], options);
  }
  return execFileAsync("claude", args, options);
}

function execFileWithInput(file, args, input, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(file, args, {
      cwd: options.cwd,
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
    }, options.timeout ?? 30000);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (options.maxBuffer && stdout.length > options.maxBuffer) {
        child.kill();
        finish(reject, new Error(`Command stdout exceeded maxBuffer: ${file}`));
      }
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (options.maxBuffer && stderr.length > options.maxBuffer) {
        child.kill();
        finish(reject, new Error(`Command stderr exceeded maxBuffer: ${file}`));
      }
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

function quotePath(path) {
  const normalized = String(path);
  return /\s/u.test(normalized) ? `"${normalized.replace(/"/gu, '\\"')}"` : normalized;
}

function parseArgs(argv) {
  const options = {
    workspace: join(process.cwd(), "vibelog-scratch", "claude-live-hook-test"),
    adapterPath: resolve("scripts/claude-code-hook-adapter.mjs"),
    live: false,
    prompt: "Reply with OK. Do not use tools.",
    maxBudgetUsd: "0.05"
  };

  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--workspace") {
      options.workspace = args.shift() ?? "";
    } else if (arg === "--adapter") {
      options.adapterPath = args.shift() ?? "";
    } else if (arg === "--live") {
      options.live = true;
    } else if (arg === "--prompt") {
      options.prompt = args.shift() ?? "";
    } else if (arg === "--max-budget-usd") {
      options.maxBudgetUsd = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.workspace) throw new Error("--workspace requires a path");
  if (!options.adapterPath) throw new Error("--adapter requires a path");
  if (!options.prompt) throw new Error("--prompt requires text");
  if (!options.maxBudgetUsd) throw new Error("--max-budget-usd requires a value");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const fixture = await runFixtureVerification({
    workspace: options.workspace,
    adapterPath: options.adapterPath
  });
  const live = await runLiveVerification({
    workspace: options.workspace,
    adapterPath: options.adapterPath,
    live: options.live,
    prompt: options.prompt,
    maxBudgetUsd: options.maxBudgetUsd
  });

  console.log(JSON.stringify({ fixture, live }, null, 2));
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
