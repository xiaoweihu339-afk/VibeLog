#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function simulateSecondAgentContinuationFile({ briefPath } = {}) {
  if (!briefPath) throw new Error("--brief is required");
  const resolvedBriefPath = resolve(briefPath);
  const brief = await readFile(resolvedBriefPath, "utf8");
  return {
    briefPath: resolvedBriefPath,
    ...simulateSecondAgentContinuation(brief)
  };
}

export function simulateSecondAgentContinuation(briefText) {
  const brief = String(briefText ?? "").trim();
  const failures = [];
  const warnings = [];

  if (!brief) {
    return failedResult({ failures: ["Brief-only package is empty."], warnings });
  }

  if (/^\s*[{[]/u.test(brief)) {
    return failedResult({
      failures: ["Second-agent simulation requires brief-only text, not full JSON input."],
      warnings
    });
  }

  const parsed = parseBrief(brief);
  requireField(parsed.project, "Project", failures);
  requireField(parsed.oneLineVibe, "One-line vibe", failures);
  requireField(parsed.currentState, "Current state", failures);
  requireField(parsed.nextAction, "Next action", failures);
  requireField(parsed.privacyBoundary, "Privacy boundary", failures);
  requireField(parsed.pushBoundary, "Push boundary", failures);

  const boundaries = {
    privateLogsAcknowledged: /private|privacy|ignored|not staged|do not commit|vibe-log|\.vibelog-events|私有|隐私|不要提交/iu.test(parsed.privacyBoundary ?? ""),
    pushRequiresExplicitUserRequest: /do not push|unless the user explicitly asks|push-eligible|explicitly asks|不要推送|明确/iu.test(parsed.pushBoundary ?? "")
  };

  if (parsed.privacyBoundary && !boundaries.privateLogsAcknowledged) {
    failures.push("Privacy boundary does not acknowledge private logs or ignored event data.");
  }

  if (parsed.pushBoundary && !boundaries.pushRequiresExplicitUserRequest) {
    failures.push("Push boundary does not require an explicit user request.");
  }

  const passed = failures.length === 0;

  return {
    passed,
    source: "brief_only",
    failures,
    warnings,
    parsed,
    selectedNextAction: parsed.nextAction ?? "",
    boundaries,
    simulatedAgentDecision: passed
      ? `Proceed from the brief-only package and continue with: ${parsed.nextAction}`
      : "Do not continue; request a stronger handoff package first."
  };
}

function failedResult({ failures, warnings }) {
  return {
    passed: false,
    source: "brief_only",
    failures,
    warnings,
    parsed: {},
    selectedNextAction: "",
    boundaries: {
      privateLogsAcknowledged: false,
      pushRequiresExplicitUserRequest: false
    },
    simulatedAgentDecision: "Do not continue; request a stronger handoff package first."
  };
}

function parseBrief(brief) {
  const fields = {};
  for (const line of brief.split(/\r?\n/u)) {
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

function requireField(value, label, failures) {
  if (typeof value !== "string" || value.trim().length === 0) {
    failures.push(`${label} is required in the brief-only package.`);
  }
}

function parseArgs(argv) {
  const args = [...argv];
  const options = { briefPath: null };

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === "--brief") {
      options.briefPath = args.shift() ?? "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!options.briefPath) throw new Error("--brief is required");
  return options;
}

async function main() {
  const result = await simulateSecondAgentContinuationFile(parseArgs(process.argv.slice(2)));
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
