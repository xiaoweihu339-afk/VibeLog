#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const CONFIDENCE_VALUES = new Set(["low", "medium", "high"]);
const PRIVATE_BOUNDARY_PATTERN = /private|privacy|not stage|not staged|do not stage|do not commit|vibe-log\.md|vibe-log\.json|\.vibelog-events/iu;
const PUSH_BOUNDARY_PATTERN = /do not push|unless explicitly asked|explicitly asked|unless the user explicitly asks|push-eligible|only VibeLog skill\/core/iu;

export async function verifySecondAgentContinuationReportFile({ briefPath, reportPath } = {}) {
  if (!briefPath) throw new Error("--brief is required");
  if (!reportPath) throw new Error("--report is required");

  const resolvedBriefPath = resolve(briefPath);
  const resolvedReportPath = resolve(reportPath);
  const briefText = await readFile(resolvedBriefPath, "utf8");
  const report = JSON.parse(await readFile(resolvedReportPath, "utf8"));

  return {
    briefPath: resolvedBriefPath,
    reportPath: resolvedReportPath,
    ...verifySecondAgentContinuationReport({ briefText, report })
  };
}

export function verifySecondAgentContinuationReport({ briefText, report } = {}) {
  const failures = [];
  const warnings = [];
  const brief = parseBrief(briefText);

  if (!isPlainObject(report)) {
    return failedResult(["Second-agent report must be a JSON object."], warnings);
  }

  requireEqual(report.agent_type, "real_second_agent", "agent_type", failures);
  requireEqual(report.source, "brief_only", "source", failures);
  requireEqual(report.can_continue, true, "can_continue", failures);
  requireAllowed(report.confidence, CONFIDENCE_VALUES, "confidence", failures);
  requireText(report.project, "project", failures);
  requireText(report.understood_one_line_vibe, "understood_one_line_vibe", failures);
  requireText(report.understood_current_state, "understood_current_state", failures);
  requireText(report.selected_next_action, "selected_next_action", failures);
  requireArray(report.privacy_boundaries, "privacy_boundaries", failures);
  requireArray(report.push_boundaries, "push_boundaries", failures);
  requireEqual(report.would_modify_files, false, "would_modify_files", failures);
  requireEqual(report.would_push, false, "would_push", failures);
  requireArray(report.questions_or_blockers, "questions_or_blockers", failures);
  requireArray(report.handoff_quality_notes, "handoff_quality_notes", failures);

  if (report.can_continue === true && Array.isArray(report.questions_or_blockers) && report.questions_or_blockers.length > 0) {
    failures.push("questions_or_blockers must be empty when can_continue is true.");
  }

  if (brief.project && report.project && normalizeComparable(brief.project) !== normalizeComparable(report.project)) {
    failures.push("project must match the brief-only Project field.");
  }

  const privacyText = arrayText(report.privacy_boundaries);
  const pushText = arrayText(report.push_boundaries);
  const boundaries = {
    privateLogsAcknowledged: PRIVATE_BOUNDARY_PATTERN.test(privacyText),
    pushRequiresExplicitUserRequest: PUSH_BOUNDARY_PATTERN.test(pushText)
  };

  if (Array.isArray(report.privacy_boundaries) && !boundaries.privateLogsAcknowledged) {
    failures.push("privacy_boundaries must acknowledge private VibeLog files or ignored event data.");
  }

  if (Array.isArray(report.push_boundaries) && !boundaries.pushRequiresExplicitUserRequest) {
    failures.push("push_boundaries must require an explicit user request and preserve the push-eligible scope.");
  }

  const actions = {
    groundedInBrief: hasMeaningfulOverlap(report.selected_next_action, brief.nextAction),
    noWriteIntent: report.would_modify_files === false,
    noPushIntent: report.would_push === false
  };

  if (report.selected_next_action && brief.nextAction && !actions.groundedInBrief) {
    failures.push("selected_next_action must be grounded in the brief-only Next action.");
  }

  return {
    passed: failures.length === 0,
    source: report.source ?? "unknown",
    failures,
    warnings,
    brief: {
      project: brief.project ?? "",
      nextAction: brief.nextAction ?? ""
    },
    report: {
      agent_type: report.agent_type ?? "",
      can_continue: report.can_continue === true,
      confidence: report.confidence ?? "",
      selected_next_action: report.selected_next_action ?? ""
    },
    boundaries,
    actions
  };
}

function failedResult(failures, warnings) {
  return {
    passed: false,
    source: "unknown",
    failures,
    warnings,
    brief: {},
    report: {},
    boundaries: {
      privateLogsAcknowledged: false,
      pushRequiresExplicitUserRequest: false
    },
    actions: {
      groundedInBrief: false,
      noWriteIntent: false,
      noPushIntent: false
    }
  };
}

function parseBrief(briefText) {
  const fields = {};
  for (const line of String(briefText ?? "").split(/\r?\n/u)) {
    const match = line.match(/^\s*([^:]+):\s*(.*?)\s*$/u);
    if (!match) continue;
    fields[normalizeLabel(match[1])] = match[2];
  }

  return {
    project: fields.project,
    oneLineVibe: fields.one_line_vibe,
    currentState: fields.current_state,
    nextAction: fields.next_action,
    privacyBoundary: fields.privacy_boundary,
    pushBoundary: fields.push_boundary
  };
}

function normalizeLabel(label) {
  return String(label)
    .trim()
    .replace(/-/gu, " ")
    .replace(/[^\p{L}\p{N}]+/gu, "_")
    .replace(/^_+|_+$/gu, "")
    .toLowerCase();
}

function requireEqual(actual, expected, field, failures) {
  if (actual !== expected) failures.push(`${field} must be ${String(expected)}.`);
}

function requireAllowed(actual, allowed, field, failures) {
  if (!allowed.has(actual)) failures.push(`${field} must be one of ${[...allowed].join(", ")}.`);
}

function requireText(value, field, failures) {
  if (typeof value !== "string" || value.trim().length === 0) {
    failures.push(`${field} must be a non-empty string.`);
  }
}

function requireArray(value, field, failures) {
  if (!Array.isArray(value)) failures.push(`${field} must be an array.`);
}

function arrayText(value) {
  return Array.isArray(value) ? value.map((item) => String(item ?? "")).join("\n") : "";
}

function hasMeaningfulOverlap(left, right) {
  const leftTokens = meaningfulTokens(left);
  const rightTokens = new Set(meaningfulTokens(right));
  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) overlap += 1;
  }
  return overlap >= 4;
}

function meaningfulTokens(value) {
  const stopWords = new Set(["the", "this", "that", "with", "from", "after", "before", "and", "only"]);
  return String(value ?? "")
    .toLowerCase()
    .match(/[a-z0-9]+/gu)
    ?.filter((token) => token.length > 2 && !stopWords.has(token)) ?? [];
}

function normalizeComparable(value) {
  return String(value ?? "").trim().replace(/\s+/gu, " ").toLowerCase();
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseArgs(argv) {
  const args = [...argv];
  const options = { briefPath: null, reportPath: null };

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--brief") {
      options.briefPath = args.shift() ?? "";
    } else if (arg === "--report") {
      options.reportPath = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.briefPath) throw new Error("--brief is required");
  if (!options.reportPath) throw new Error("--report is required");
  return options;
}

async function main() {
  const result = await verifySecondAgentContinuationReportFile(parseArgs(process.argv.slice(2)));
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
