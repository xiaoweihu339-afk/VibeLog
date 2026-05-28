#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_MIN_SCORE = 70;
const PRIVACY_BOUNDARY_PATTERN = /private|privacy|ignored|not staged|do not commit|vibe-log|\.vibelog-events/iu;
const EXPLICIT_PUSH_BOUNDARY_PATTERN = /do not push|unless the user explicitly asks|push-eligible|explicitly asks/iu;

export async function verifyHandoffContinuityFile({ jsonPath = "vibe-log.json", minScore = DEFAULT_MIN_SCORE } = {}) {
  const resolvedJsonPath = resolve(jsonPath);
  const data = JSON.parse(await readFile(resolvedJsonPath, "utf8"));
  return {
    jsonPath: resolvedJsonPath,
    ...verifyHandoffContinuity(data, { minScore })
  };
}

export function verifyHandoffContinuity(data, { minScore = DEFAULT_MIN_SCORE } = {}) {
  const failures = [];
  const warnings = [];

  if (!isPlainObject(data)) {
    return {
      passed: false,
      score: 0,
      minScore,
      failures: ["VibeLog root must be an object"],
      warnings,
      checks: [],
      continuationBrief: ""
    };
  }

  const handoff = isPlainObject(data.handoff_state) ? data.handoff_state : {};
  const boundaryText = [
    ...arrayOrEmpty(handoff.context_for_next_agent),
    ...arrayOrEmpty(handoff.next_actions)
  ];
  const checks = [
    check(hasText(data.title), "identity.title", "Missing project title."),
    check(hasText(data.one_line_vibe), "identity.one_line_vibe", "Missing one_line_vibe."),
    check(hasText(data.current_idea), "identity.current_idea", "Missing current_idea."),
    check(isPlainObject(data.handoff_state), "handoff_state", "Missing handoff_state object."),
    check(hasText(handoff.current_state), "handoff_state.current_state", "Missing handoff_state.current_state."),
    check(hasMeaningfulItems(handoff.completed), "handoff_state.completed", "Missing handoff_state.completed entries."),
    check(hasMeaningfulItems(handoff.pending), "handoff_state.pending", "Missing handoff_state.pending entries."),
    check(hasMeaningfulItems(handoff.next_actions), "handoff_state.next_actions", "Missing handoff_state.next_actions entries."),
    check(progressSnapshotContains(handoff.project_progress_snapshot, /Project Progress:\s*\d+\s*\/\s*100/iu), "progress.project_progress", "Missing Project Progress value in handoff progress snapshot."),
    check(progressSnapshotContains(handoff.project_progress_snapshot, /Next Unlock:/iu), "progress.next_unlock", "Missing Next Unlock in handoff progress snapshot."),
    check(progressSnapshotContains(handoff.project_progress_snapshot, /Main Risk:/iu), "progress.main_risk", "Missing Main Risk in handoff progress snapshot."),
    check(hasMeaningfulItems(data.human_in_the_loop), "human_in_the_loop", "Missing human-in-the-loop decision evidence."),
    check(hasPassedVerification(data.verification_evidence), "verification_evidence", "Missing passed verification evidence."),
    check(hasBoundary(boundaryText, PRIVACY_BOUNDARY_PATTERN), "boundary.privacy", "Missing privacy boundary in context_for_next_agent."),
    check(hasBoundary(boundaryText, EXPLICIT_PUSH_BOUNDARY_PATTERN), "boundary.push", "Missing explicit push boundary in context_for_next_agent or next_actions.")
  ];

  for (const item of checks) {
    if (!item.passed) failures.push(`${item.id}: ${item.message}`);
  }

  if (!hasBoundary(handoff.context_for_next_agent, /Desktop|DeepSeek/iu)) {
    warnings.push("context_for_next_agent does not mention Desktop / DeepSeek boundaries.");
  }

  const score = calculateScore(checks);
  const passed = failures.length === 0 && score >= minScore;

  return {
    passed,
    score,
    minScore,
    failures,
    warnings,
    checks,
    continuationBrief: renderContinuationBrief(data, handoff)
  };
}

function check(passed, id, message) {
  return { id, passed: Boolean(passed), message };
}

function calculateScore(checks) {
  if (checks.length === 0) return 0;
  const passedCount = checks.filter((item) => item.passed).length;
  return Math.round((passedCount / checks.length) * 100);
}

function renderContinuationBrief(data, handoff) {
  const title = valueOrUnknown(data.title);
  const vibe = valueOrUnknown(data.one_line_vibe);
  const state = valueOrUnknown(handoff.current_state);
  const nextAction = firstMeaningful(handoff.next_actions) ?? "unknown";
  const boundaryText = [
    ...arrayOrEmpty(handoff.context_for_next_agent),
    ...arrayOrEmpty(handoff.next_actions)
  ];
  const privacyBoundary = firstMatching(boundaryText, PRIVACY_BOUNDARY_PATTERN) ?? "unknown";
  const pushBoundary = firstMatching(boundaryText, EXPLICIT_PUSH_BOUNDARY_PATTERN) ?? "unknown";

  return [
    `Project: ${title}`,
    `One-line vibe: ${vibe}`,
    `Current state: ${state}`,
    `Next action: ${nextAction}`,
    `Privacy boundary: ${privacyBoundary}`,
    `Push boundary: ${pushBoundary}`
  ].join("\n");
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasMeaningfulItems(value) {
  return Array.isArray(value) && value.some((item) => {
    const text = String(item ?? "").trim();
    return text.length > 0 && !/^none$/iu.test(text);
  });
}

function hasPassedVerification(value) {
  return Array.isArray(value) && value.some((item) => {
    if (!isPlainObject(item)) return false;
    return /passed|pass|success/iu.test(String(item.result ?? ""));
  });
}

function hasBoundary(items, pattern) {
  return Array.isArray(items) && items.some((item) => pattern.test(String(item ?? "")));
}

function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

function progressSnapshotContains(snapshot, pattern) {
  const lines = Array.isArray(snapshot) ? snapshot : [snapshot];
  return lines.some((line) => pattern.test(String(line ?? "")));
}

function firstMeaningful(items) {
  if (!Array.isArray(items)) return null;
  return items.find((item) => {
    const text = String(item ?? "").trim();
    return text.length > 0 && !/^none$/iu.test(text);
  }) ?? null;
}

function firstMatching(items, pattern) {
  if (!Array.isArray(items)) return null;
  return items.find((item) => pattern.test(String(item ?? ""))) ?? null;
}

function valueOrUnknown(value) {
  return hasText(value) ? value.trim() : "unknown";
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {
    jsonPath: "vibe-log.json",
    minScore: DEFAULT_MIN_SCORE,
    briefOnly: false
  };

  if (args[0] && !args[0].startsWith("--")) {
    options.jsonPath = args.shift();
  }

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--min-score") {
      options.minScore = Number.parseInt(args.shift() ?? "", 10);
    } else if (arg === "--brief-only") {
      options.briefOnly = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.jsonPath) throw new Error("VibeLog JSON path is required");
  if (!Number.isInteger(options.minScore) || options.minScore < 0 || options.minScore > 100) {
    throw new Error("--min-score must be an integer from 0 to 100");
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await verifyHandoffContinuityFile(options);
  console.log(options.briefOnly ? result.continuationBrief : JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : "";
if (import.meta.url === invokedPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
