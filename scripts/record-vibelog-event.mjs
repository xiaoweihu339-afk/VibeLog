import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { exportVibeLogFile } from "./export-vibelog.mjs";

export const SUPPORTED_EVENT_TYPES = new Set([
  "prompt_submitted",
  "idea_changed",
  "decision_made",
  "tool_used",
  "test_ran",
  "bug_fixed",
  "handoff_updated",
  "progress_updated"
]);

const sectionByType = {
  prompt_submitted: "Execution Prompts",
  idea_changed: "Idea Evolution",
  decision_made: "Human-in-the-Loop",
  tool_used: "Development Log",
  test_ran: "Verification Evidence",
  bug_fixed: "Bugfix / Incident Log",
  progress_updated: "Vibe Progress"
};

const requiredFieldsByType = {
  prompt_submitted: [
    "timestamp",
    "agent_or_tool",
    "prompt_type",
    "prompt_visibility",
    "recording_mode",
    "prompt_summary",
    "prompt_text",
    "result"
  ],
  idea_changed: ["timestamp", "change_type", "before", "after", "reason"],
  decision_made: [
    "timestamp",
    "decision_type",
    "human_input",
    "final_decision",
    "why_it_mattered",
    "impact"
  ],
  tool_used: ["timestamp", "work_type", "summary", "details", "verification"],
  test_ran: ["timestamp", "summary", "evidence_ref", "result"],
  bug_fixed: ["timestamp", "summary", "bug_symptom", "root_cause", "fix", "verification"],
  handoff_updated: ["timestamp", "current_state", "completed", "pending", "next_actions"],
  progress_updated: ["timestamp", "stage", "what_happened"]
};

export function applyVibeLogEvent(markdown, event) {
  validateEvent(event);
  const nextMarkdown = updateFrontmatterDate(markdown, event.timestamp);

  if (event.type === "handoff_updated") {
    return replaceSection(nextMarkdown, "Handoff State", renderHandoffState(event));
  }

  return appendEntry(
    nextMarkdown,
    sectionByType[event.type],
    renderEntry(event)
  );
}

export async function recordVibeLogEventFile({ eventPath, logPath = "vibe-log.md", jsonPath = null }) {
  if (!eventPath) throw new Error("--event is required");

  const event = JSON.parse(await readFile(eventPath, "utf8"));
  const markdown = await readFile(logPath, "utf8");
  const updatedMarkdown = applyVibeLogEvent(markdown, event);

  await writeFile(logPath, updatedMarkdown, "utf8");
  if (jsonPath) {
    await exportVibeLogFile(logPath, jsonPath);
  }

  return {
    type: event.type,
    logPath,
    jsonPath
  };
}

export async function loadVibeEventsFile(eventsPath) {
  if (!eventsPath) throw new Error("--events is required");
  const text = await readFile(eventsPath, "utf8");
  return parseVibeEvents(text, eventsPath);
}

export function parseVibeEvents(text, sourceName = "Vibe Event stream") {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(`${sourceName} must contain at least one Vibe Event`);
  }

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    return normalizeEventList(parsed, sourceName);
  }

  if (trimmed.startsWith("{") && !trimmed.includes("\n")) {
    const parsed = JSON.parse(trimmed);
    return normalizeEventList(parsed, sourceName);
  }

  const events = text
    .split(/\r?\n/u)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .map(({ line, lineNumber }) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(`Invalid JSON in ${sourceName} line ${lineNumber}: ${error.message}`);
      }
    });

  return normalizeEventList(events, sourceName);
}

export async function recordVibeLogEventsFile({ eventsPath, logPath = "vibe-log.md", jsonPath = null }) {
  if (!eventsPath) throw new Error("--events is required");

  const events = await loadVibeEventsFile(eventsPath);
  const markdown = await readFile(logPath, "utf8");
  const updatedMarkdown = events.reduce(applyVibeLogEvent, markdown);

  await writeFile(logPath, updatedMarkdown, "utf8");
  if (jsonPath) {
    await exportVibeLogFile(logPath, jsonPath);
  }

  return {
    count: events.length,
    logPath,
    jsonPath
  };
}

function normalizeEventList(value, sourceName) {
  const events = Array.isArray(value) ? value : [value];
  if (events.length === 0) {
    throw new Error(`${sourceName} must contain at least one Vibe Event`);
  }

  for (const event of events) {
    validateEvent(event);
  }

  return events;
}

function validateEvent(event) {
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new Error("Vibe Event must be a JSON object");
  }

  if (!event.type) throw new Error("Vibe Event missing required field: type");
  if (!SUPPORTED_EVENT_TYPES.has(event.type)) {
    throw new Error(`Unsupported Vibe Event type: ${event.type}`);
  }

  for (const field of requiredFieldsByType[event.type]) {
    if (event[field] === undefined || event[field] === null || event[field] === "") {
      throw new Error(`Vibe Event ${event.type} missing required field: ${field}`);
    }
  }
}

function updateFrontmatterDate(markdown, timestamp) {
  const date = String(timestamp).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return markdown;

  if (/^updated_at:\s*".*?"\s*$/m.test(markdown)) {
    return markdown.replace(/^updated_at:\s*".*?"\s*$/m, `updated_at: "${date}"`);
  }

  return markdown;
}

function appendEntry(markdown, sectionName, entryMarkdown) {
  const sectionHeading = `## ${sectionName}`;
  const sectionStart = markdown.indexOf(sectionHeading);

  if (sectionStart === -1) {
    return ensureTrailingNewline(markdown) + `\n${sectionHeading}\n\n${entryMarkdown}\n`;
  }

  const contentStart = sectionStart + sectionHeading.length;
  const nextSectionStart = findNextSectionStart(markdown, contentStart);
  const insertionIndex = nextSectionStart === -1 ? markdown.length : nextSectionStart;
  const before = markdown.slice(0, insertionIndex).replace(
    /\n\nNo bugfix or incident entry (?:yet|for this update)\.\s*$/u,
    "\n"
  );
  const after = markdown.slice(insertionIndex);

  return `${before.replace(/\s*$/u, "\n\n")}${entryMarkdown}\n${after}`;
}

function replaceSection(markdown, sectionName, contentMarkdown) {
  const sectionHeading = `## ${sectionName}`;
  const sectionStart = markdown.indexOf(sectionHeading);

  if (sectionStart === -1) {
    return ensureTrailingNewline(markdown) + `\n${sectionHeading}\n\n${contentMarkdown}\n`;
  }

  const contentStart = sectionStart + sectionHeading.length;
  const nextSectionStart = findNextSectionStart(markdown, contentStart);
  const insertionEnd = nextSectionStart === -1 ? markdown.length : nextSectionStart;
  const before = markdown.slice(0, contentStart);
  const after = markdown.slice(insertionEnd);

  return `${before}\n\n${contentMarkdown}\n${after}`;
}

function findNextSectionStart(markdown, startIndex) {
  const match = /\n## [^\n]+\n/u.exec(markdown.slice(startIndex));
  return match ? startIndex + match.index + 1 : -1;
}

function renderEntry(event) {
  const renderers = {
    prompt_submitted: renderPromptSubmitted,
    idea_changed: renderIdeaChanged,
    decision_made: renderDecisionMade,
    tool_used: renderToolUsed,
    test_ran: renderTestRan,
    bug_fixed: renderBugFixed,
    progress_updated: renderProgressUpdated
  };

  return renderers[event.type](event);
}

function renderPromptSubmitted(event) {
  return renderEntryBlock(event.timestamp, [
    ["Agent / Tool", event.agent_or_tool],
    ["Prompt Type", event.prompt_type],
    ["Prompt Visibility", event.prompt_visibility],
    ["Recording Mode", event.recording_mode],
    ["Prompt Summary", event.prompt_summary],
    ["Prompt Text", event.prompt_text],
    ["Result", event.result],
    ["Reuse Notes", event.reuse_notes]
  ]);
}

function renderIdeaChanged(event) {
  return renderEntryBlock(event.timestamp, [
    ["Type", event.change_type],
    ["Before", event.before],
    ["After", event.after],
    ["Reason", event.reason],
    ["Source", event.source],
    ["Confidence", event.confidence]
  ]);
}

function renderDecisionMade(event) {
  return renderEntryBlock(event.timestamp, [
    ["Type", event.decision_type],
    ["Human Input", event.human_input],
    ["Agent Proposal", event.agent_proposal],
    ["Final Decision", event.final_decision],
    ["Why It Mattered", event.why_it_mattered],
    ["Impact", event.impact]
  ]);
}

function renderToolUsed(event) {
  return renderEntryBlock(event.timestamp, [
    ["Type", event.work_type],
    ["Summary", event.summary],
    ["Files Changed", event.files_changed],
    ["Details", event.details],
    ["Verification", event.verification],
    ["Follow-up", event.follow_up],
    ["Source", event.source],
    ["Confidence", event.confidence]
  ]);
}

function renderTestRan(event) {
  return renderEntryBlock(event.timestamp, [
    ["Type", event.evidence_type ?? "test_result"],
    ["Summary", event.summary],
    ["Evidence Ref", event.evidence_ref],
    ["Result", event.result],
    ["Details", event.details],
    ["Residual Risk", event.residual_risk],
    ["Source", event.source],
    ["Confidence", event.confidence]
  ]);
}

function renderBugFixed(event) {
  return renderEntryBlock(event.timestamp, [
    ["Summary", event.summary],
    ["Bug Symptom", event.bug_symptom],
    ["Root Cause", event.root_cause],
    ["Fix", event.fix],
    ["Verification", event.verification],
    ["Follow-up", event.follow_up]
  ]);
}

function renderProgressUpdated(event) {
  return renderEntryBlock(event.timestamp, [
    ["Stage", event.stage],
    ["What Happened", event.what_happened],
    ["Tools Used", event.tools_used],
    ["Problems", event.problems],
    ["Next", event.next],
    ["Source", event.source],
    ["Confidence", event.confidence]
  ]);
}

function renderEntryBlock(heading, fields) {
  return [
    `### ${heading}`,
    "",
    ...fields
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .flatMap(([label, value]) => renderField(label, value))
  ].join("\n").trimEnd() + "\n";
}

function renderField(label, value) {
  if (Array.isArray(value)) {
    return [
      `**${label}:**`,
      ...value.map((item) => `- ${formatListValue(item)}`),
      ""
    ];
  }

  return [`**${label}:** ${String(value)}`, ""];
}

function formatListValue(value) {
  const text = String(value);
  return text.includes("`") ? text : `\`${text}\``;
}

function renderHandoffState(event) {
  const sections = [
    ["Current State", event.current_state],
    ["Project Progress Snapshot", renderProgressSnapshot(event.progress_snapshot)],
    ["Completed", event.completed],
    ["In Progress", event.in_progress ?? []],
    ["Pending", event.pending],
    ["Blockers", event.blockers ?? []],
    ["Next Actions", event.next_actions],
    ["Context For Next Agent", event.context_for_next_agent ?? []]
  ];

  return sections
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([heading, value]) => renderHandoffSection(heading, value))
    .join("\n\n");
}

function renderHandoffSection(heading, value) {
  if (Array.isArray(value)) {
    const body = value.length > 0
      ? value.map((item) => `- ${String(item)}`).join("\n")
      : "- none";
    return `### ${heading}\n\n${body}`;
  }

  return `### ${heading}\n\n${String(value)}`;
}

function renderProgressSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") return "";

  const labels = [
    ["project_progress", "Project Progress"],
    ["change_this_task", "Change This Task"],
    ["current_phase", "Current Phase"],
    ["completed_this_task", "Completed This Task"],
    ["next_unlock", "Next Unlock"],
    ["main_risk", "Main Risk"],
    ["confidence", "Confidence"]
  ];

  return labels
    .filter(([key]) => snapshot[key] !== undefined && snapshot[key] !== null)
    .map(([key, label]) => `- ${label}: ${snapshot[key]}`)
    .join("\n");
}

function ensureTrailingNewline(markdown) {
  return markdown.endsWith("\n") ? markdown : `${markdown}\n`;
}

function parseArgs(argv) {
  const options = {
    eventPath: null,
    eventsPath: null,
    logPath: "vibe-log.md",
    jsonPath: null
  };

  const args = [...argv];
  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--event") {
      options.eventPath = args.shift() ?? null;
    } else if (arg === "--events") {
      options.eventsPath = args.shift() ?? null;
    } else if (arg === "--log") {
      options.logPath = args.shift() ?? "";
    } else if (arg === "--json") {
      options.jsonPath = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (Boolean(options.eventPath) === Boolean(options.eventsPath)) {
    throw new Error("Provide exactly one of --event or --events");
  }
  if (options.eventPath === "") throw new Error("--event requires a path");
  if (options.eventsPath === "") throw new Error("--events requires a path");
  if (!options.logPath) throw new Error("--log requires a path");
  if (options.jsonPath === "") throw new Error("--json requires a path");

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = options.eventsPath
    ? await recordVibeLogEventsFile({
      eventsPath: resolve(options.eventsPath),
      logPath: resolve(options.logPath),
      jsonPath: options.jsonPath ? resolve(options.jsonPath) : null
    })
    : await recordVibeLogEventFile({
      eventPath: resolve(options.eventPath),
      logPath: resolve(options.logPath),
      jsonPath: options.jsonPath ? resolve(options.jsonPath) : null
    });

  const jsonMessage = result.jsonPath ? ` and regenerated ${result.jsonPath}` : "";
  const recorded = result.count === undefined ? result.type : `${result.count} events`;
  console.log(`Recorded ${recorded} in ${result.logPath}${jsonMessage}`);
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
