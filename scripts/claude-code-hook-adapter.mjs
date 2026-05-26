import { mkdir, readFile, writeFile } from "node:fs/promises";
import { stdin } from "node:process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { recordVibeLogEventFile } from "./record-vibelog-event.mjs";

const ENGINEERING_PROMPT_PATTERN =
  /\b(build|implement|edit|fix|debug|test|refactor|deploy|inspect|read|write|run|execute|docs|document|plan|adapter|hook|record|verify)\b|实现|执行|运行|测试|修复|调试|重构|部署|检查|读取|写|文档|计划|适配器|记录|验证/iu;

const TEST_COMMAND_PATTERN = /\b(node --test|npm test|pnpm test|yarn test|pytest|vitest|jest|cargo test|go test|ruff|eslint|tsc)\b/iu;
const WRITE_TOOL_PATTERN = /^(Write|Edit|MultiEdit|NotebookEdit)$/u;

export function mapClaudeHookToVibeEvents(input, options = {}) {
  const eventName = input?.hook_event_name ?? input?.event ?? input?.hookEventName;
  const timestamp = options.timestamp ?? new Date().toISOString();

  if (eventName === "UserPromptSubmit") {
    return mapUserPromptSubmit(input, timestamp);
  }

  if (eventName === "PostToolUse") {
    return [mapPostToolUse(input, timestamp)];
  }

  if (eventName === "Stop") {
    return [mapStop(input, timestamp)];
  }

  return [];
}

export function redactSecrets(value) {
  let text = String(value ?? "");
  const original = text;

  text = text
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/giu, "[REDACTED_PRIVATE_KEY]")
    .replace(/\b(Authorization\s*:\s*Bearer\s+)[^\s]+/giu, "$1[REDACTED]")
    .replace(/\b(api[_-]?key|token|password|secret)\s*=\s*['"]?[^'"\s]+['"]?/giu, "$1=[REDACTED]")
    .replace(/\b(sk-[A-Za-z0-9_-]{8,})\b/gu, "[REDACTED_API_KEY]");

  return {
    text,
    redacted: text !== original
  };
}

export async function runClaudeCodeHookAdapter({
  inputPath = null,
  logPath = "vibe-log.md",
  jsonPath = "vibe-log.json",
  eventDir = null,
  printEvents = false,
  timestamp = null
} = {}) {
  const input = inputPath
    ? JSON.parse(await readFile(inputPath, "utf8"))
    : JSON.parse(await readStdin());
  const events = mapClaudeHookToVibeEvents(input, { timestamp: timestamp ?? new Date().toISOString() });

  if (printEvents) {
    return {
      events,
      output: `${JSON.stringify(events, null, 2)}\n`
    };
  }

  if (events.length === 0) {
    return {
      events,
      recorded: []
    };
  }

  const resolvedEventDir = eventDir
    ? resolve(eventDir)
    : resolve(dirname(logPath), ".vibelog-events");
  await mkdir(resolvedEventDir, { recursive: true });

  const recorded = [];
  for (const [index, event] of events.entries()) {
    const eventPath = join(
      resolvedEventDir,
      `${sanitizeFilePart(event.timestamp)}-${index + 1}-${event.type}.json`
    );

    await writeFile(eventPath, `${JSON.stringify(event, null, 2)}\n`, "utf8");
    await recordVibeLogEventFile({
      eventPath,
      logPath,
      jsonPath
    });
    recorded.push(eventPath);
  }

  return {
    events,
    recorded
  };
}

function mapUserPromptSubmit(input, timestamp) {
  const prompt = String(input.prompt ?? "");
  if (!ENGINEERING_PROMPT_PATTERN.test(prompt)) return [];

  const redacted = redactSecrets(prompt);
  return [{
    type: "prompt_submitted",
    timestamp,
    agent_or_tool: "Claude Code",
    prompt_type: classifyPromptType(redacted.text),
    prompt_visibility: "summary",
    recording_mode: redacted.redacted ? "redacted" : "exact",
    prompt_summary: summarizeText(redacted.text, "Claude Code engineering execution prompt."),
    prompt_text: redacted.text,
    result: "Captured from Claude Code UserPromptSubmit hook.",
    reuse_notes: `Session: ${input.session_id ?? "unknown"}`
  }];
}

function mapPostToolUse(input, timestamp) {
  const toolName = String(input.tool_name ?? input.tool ?? "unknown");
  const toolInput = input.tool_input ?? {};
  const toolResponse = input.tool_response ?? {};
  const command = typeof toolInput.command === "string" ? toolInput.command : "";

  if (TEST_COMMAND_PATTERN.test(command)) {
    return {
      type: "test_ran",
      timestamp,
      summary: summarizeText(`Claude Code ran ${toolName}: ${command}`, "Claude Code ran a test or verification command."),
      evidence_ref: command,
      result: inferResult(toolResponse),
      details: summarizeToolResponse(toolResponse),
      residual_risk: "Captured from hook payload; review full command output if the result is unclear.",
      source: "Claude Code PostToolUse hook",
      confidence: "medium"
    };
  }

  return {
    type: "tool_used",
    timestamp,
    work_type: WRITE_TOOL_PATTERN.test(toolName) ? "feature" : "chore",
    summary: summarizeText(`Claude Code used ${toolName}.`, "Claude Code tool use recorded."),
    files_changed: extractFiles(toolInput),
    details: summarizeToolInput(toolName, toolInput, toolResponse),
    verification: inferResult(toolResponse),
    follow_up: ["Review whether this tool use changed VibeLog-relevant project state."],
    source: "Claude Code PostToolUse hook",
    confidence: "medium"
  };
}

function mapStop(input, timestamp) {
  const message = redactSecrets(input.last_assistant_message ?? input.response ?? "Claude Code session stopped.").text;

  return {
    type: "handoff_updated",
    timestamp,
    current_state: summarizeText(message, "Claude Code turn ended; review latest logs and repository state."),
    progress_snapshot: {
      project_progress: "18 / 100",
      change_this_task: "+3",
      current_phase: "Claude Code hook adapter",
      completed_this_task: "Mapped Claude Code hook payloads to Vibe Event JSON",
      next_unlock: "Live hook installation and real-session verification",
      main_risk: "This adapter is fixture-verified but not installed into a live Claude Code settings file",
      confidence: "medium"
    },
    completed: ["Claude Code hook event captured"],
    in_progress: [],
    pending: ["Review generated VibeLog updates", "Run live Claude Code hook verification when ready"],
    blockers: [],
    next_actions: ["Inspect VibeLog changes", "Continue with live hook installation only after user approval"],
    context_for_next_agent: [
      `Session: ${input.session_id ?? "unknown"}`,
      `Stop hook active: ${input.stop_hook_active === true ? "true" : "false"}`
    ]
  };
}

function classifyPromptType(prompt) {
  if (/test|verify|验证|测试/iu.test(prompt)) return "test";
  if (/debug|fix|bug|修复|调试/iu.test(prompt)) return "debug";
  if (/refactor|重构/iu.test(prompt)) return "refactor";
  if (/doc|文档/iu.test(prompt)) return "docs";
  if (/deploy|部署/iu.test(prompt)) return "deploy";
  if (/inspect|read|检查|读取/iu.test(prompt)) return "inspect";
  if (/plan|计划/iu.test(prompt)) return "design";
  return "build";
}

function inferResult(response) {
  if (response?.exit_code === 0 || response?.success === true) return "passed";
  if (typeof response?.exit_code === "number" && response.exit_code !== 0) return "failed";
  if (response?.error || response?.success === false) return "failed";
  return "unknown";
}

function summarizeToolResponse(response) {
  const raw = [
    response?.stdout,
    response?.stderr,
    response?.error,
    response?.message
  ].filter(Boolean).join("\n");
  return summarizeText(redactSecrets(raw).text, "No tool response summary was provided.");
}

function summarizeToolInput(toolName, input, response) {
  const fileList = extractFiles(input);
  const status = inferResult(response);
  const fileSummary = fileList.length > 0 ? ` Files: ${fileList.join(", ")}.` : "";
  return redactSecrets(`${toolName} completed with result ${status}.${fileSummary}`).text;
}

function extractFiles(input) {
  const candidates = [
    input.file_path,
    input.path,
    input.notebook_path,
    input.old_string && input.file_path,
    ...(Array.isArray(input.files) ? input.files : [])
  ].filter(Boolean);

  return [...new Set(candidates.map((value) => String(value)))];
}

function summarizeText(text, fallback) {
  const clean = String(text ?? "").replace(/\s+/gu, " ").trim();
  if (!clean) return fallback;
  return clean.length <= 240 ? clean : `${clean.slice(0, 237)}...`;
}

function sanitizeFilePart(value) {
  return String(value ?? new Date().toISOString())
    .replace(/[^a-z0-9._-]+/giu, "-")
    .replace(/^-+|-+$/gu, "");
}

async function readStdin() {
  let data = "";
  for await (const chunk of stdin) {
    data += chunk;
  }
  return data;
}

function parseArgs(argv) {
  const options = {
    inputPath: null,
    logPath: "vibe-log.md",
    jsonPath: "vibe-log.json",
    eventDir: null,
    printEvents: false
  };

  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--input") {
      options.inputPath = args.shift() ?? null;
    } else if (arg === "--log") {
      options.logPath = args.shift() ?? "";
    } else if (arg === "--json") {
      options.jsonPath = args.shift() ?? "";
    } else if (arg === "--event-dir") {
      options.eventDir = args.shift() ?? "";
    } else if (arg === "--print-events") {
      options.printEvents = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (options.logPath === "") throw new Error("--log requires a path");
  if (options.jsonPath === "") throw new Error("--json requires a path");
  if (options.eventDir === "") throw new Error("--event-dir requires a path");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await runClaudeCodeHookAdapter({
    inputPath: options.inputPath ? resolve(options.inputPath) : null,
    logPath: resolve(options.logPath),
    jsonPath: resolve(options.jsonPath),
    eventDir: options.eventDir ? resolve(options.eventDir) : null,
    printEvents: options.printEvents
  });

  if (options.printEvents) {
    process.stdout.write(result.output);
    return;
  }

  console.log(`Claude Code hook adapter recorded ${result.events.length} event(s).`);
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
