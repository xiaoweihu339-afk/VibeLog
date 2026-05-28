import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  verifySecondAgentContinuationReport,
  verifySecondAgentContinuationReportFile
} from "../scripts/verify-second-agent-continuation-report.mjs";

const execFileAsync = promisify(execFile);

const validBrief = [
  "Project: VibeLog / VibeHub Foundation",
  "One-line vibe: A reusable VibeLog skill and future VibeHub platform that let humans and agents record, share, verify, and continue vibe-built products.",
  "Current state: S37 is complete locally and verified. VibeLog now has a simulated second-agent continuation runner.",
  "Next action: Run root VibeLog validate and handoff continuity after this S37 log update",
  "Privacy boundary: Private root vibe-log.md, vibe-log.json, and .vibelog-events are ignored and should not be staged",
  "Push boundary: Do not push unless the user explicitly asks; only VibeLog skill/core changes are push-eligible"
].join("\n");

const validReport = {
  agent_type: "real_second_agent",
  source: "brief_only",
  can_continue: true,
  confidence: "high",
  project: "VibeLog / VibeHub Foundation",
  understood_one_line_vibe: "A reusable VibeLog skill and future VibeHub platform that let humans and agents record, share, verify, and continue vibe-built products.",
  understood_current_state: "S37 is complete locally and verified. VibeLog has a simulated second-agent continuation runner.",
  selected_next_action: "Run root VibeLog validate and handoff continuity after the S37 log update.",
  privacy_boundaries: [
    "Do not stage or commit private root vibe-log.md.",
    "Do not stage or commit private root vibe-log.json.",
    "Do not stage or commit .vibelog-events/."
  ],
  push_boundaries: [
    "Do not push unless explicitly asked by the user.",
    "Only VibeLog skill/core changes are push-eligible."
  ],
  would_modify_files: false,
  would_push: false,
  questions_or_blockers: [],
  handoff_quality_notes: [
    "The brief is sufficient for safe continuation because it includes project identity, current state, next action, privacy boundary, and push boundary."
  ]
};

test("accepts a real second-agent continuation report grounded in the brief-only package", () => {
  const result = verifySecondAgentContinuationReport({
    briefText: validBrief,
    report: validReport
  });

  assert.equal(result.passed, true, result.failures.join("\n"));
  assert.equal(result.source, "brief_only");
  assert.equal(result.boundaries.privateLogsAcknowledged, true);
  assert.equal(result.boundaries.pushRequiresExplicitUserRequest, true);
  assert.equal(result.actions.groundedInBrief, true);
  assert.equal(result.actions.noWriteIntent, true);
  assert.equal(result.actions.noPushIntent, true);
});

test("rejects reports that are not brief-only real second-agent reports", () => {
  const result = verifySecondAgentContinuationReport({
    briefText: validBrief,
    report: {
      ...validReport,
      source: "full_json",
      agent_type: "simulated_second_agent"
    }
  });

  assert.equal(result.passed, false);
  assert.match(result.failures.join("\n"), /source must be brief_only/);
  assert.match(result.failures.join("\n"), /agent_type must be real_second_agent/);
});

test("rejects reports that intend to modify files or push", () => {
  const result = verifySecondAgentContinuationReport({
    briefText: validBrief,
    report: {
      ...validReport,
      would_modify_files: true,
      would_push: true
    }
  });

  assert.equal(result.passed, false);
  assert.match(result.failures.join("\n"), /would_modify_files must be false/);
  assert.match(result.failures.join("\n"), /would_push must be false/);
});

test("rejects reports that claim continuation while listing questions or blockers", () => {
  const result = verifySecondAgentContinuationReport({
    briefText: validBrief,
    report: {
      ...validReport,
      can_continue: true,
      questions_or_blockers: ["Need confirmation before proceeding."]
    }
  });

  assert.equal(result.passed, false);
  assert.match(result.failures.join("\n"), /questions_or_blockers/);
});

test("rejects reports that miss privacy, push, or grounded next-action evidence", () => {
  const result = verifySecondAgentContinuationReport({
    briefText: validBrief,
    report: {
      ...validReport,
      selected_next_action: "Invent a marketing launch plan.",
      privacy_boundaries: ["Be careful."],
      push_boundaries: ["Push when tests pass."]
    }
  });

  assert.equal(result.passed, false);
  assert.match(result.failures.join("\n"), /privacy/i);
  assert.match(result.failures.join("\n"), /push/i);
  assert.match(result.failures.join("\n"), /grounded/i);
});

test("CLI verifies a second-agent report against a brief-only file", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-real-second-agent-"));
  const briefPath = join(dir, "handoff-brief.txt");
  const reportPath = join(dir, "second-agent-report.json");

  try {
    await writeFile(briefPath, `${validBrief}\n`, "utf8");
    await writeFile(reportPath, `${JSON.stringify(validReport, null, 2)}\n`, "utf8");

    const fileResult = await verifySecondAgentContinuationReportFile({ briefPath, reportPath });
    assert.equal(fileResult.passed, true);

    const { stdout } = await execFileAsync("node", [
      resolve("scripts/verify-second-agent-continuation-report.mjs"),
      "--brief",
      briefPath,
      "--report",
      reportPath
    ], { cwd: resolve(".") });
    const cliResult = JSON.parse(stdout);

    assert.equal(cliResult.passed, true);
    assert.equal(cliResult.reportPath, resolve(reportPath));
    assert.equal(cliResult.briefPath, resolve(briefPath));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI exits non-zero for an unsafe report", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-real-second-agent-unsafe-"));
  const briefPath = join(dir, "handoff-brief.txt");
  const reportPath = join(dir, "second-agent-report.json");

  try {
    await writeFile(briefPath, `${validBrief}\n`, "utf8");
    await writeFile(reportPath, `${JSON.stringify({ ...validReport, would_push: true }, null, 2)}\n`, "utf8");

    await assert.rejects(
      () => execFileAsync("node", [
        resolve("scripts/verify-second-agent-continuation-report.mjs"),
        "--brief",
        briefPath,
        "--report",
        reportPath
      ], { cwd: resolve(".") }),
      (error) => {
        const output = JSON.parse(error.stdout);
        assert.equal(output.passed, false);
        assert.match(output.failures.join("\n"), /would_push/);
        return true;
      }
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
