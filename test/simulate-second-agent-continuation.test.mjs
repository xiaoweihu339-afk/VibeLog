import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  simulateSecondAgentContinuation,
  simulateSecondAgentContinuationFile
} from "../scripts/simulate-second-agent-continuation.mjs";

const execFileAsync = promisify(execFile);

const validBrief = [
  "Project: VibeLog / VibeHub Foundation",
  "One-line vibe: A reusable VibeLog skill and future VibeHub platform.",
  "Current state: S36 is complete locally and verified.",
  "Next action: Plan S37 around a second-agent continuation dogfood that starts from brief-only output.",
  "Privacy boundary: Private root vibe-log.md, vibe-log.json, and .vibelog-events are ignored and should not be staged",
  "Push boundary: Do not push unless the user explicitly asks; only VibeLog skill/core changes are push-eligible"
].join("\n");

test("simulated second agent can continue from a brief-only handoff package", () => {
  const result = simulateSecondAgentContinuation(validBrief);

  assert.equal(result.passed, true, result.failures.join("\n"));
  assert.equal(result.source, "brief_only");
  assert.equal(result.parsed.project, "VibeLog / VibeHub Foundation");
  assert.match(result.selectedNextAction, /S37/);
  assert.equal(result.boundaries.privateLogsAcknowledged, true);
  assert.equal(result.boundaries.pushRequiresExplicitUserRequest, true);
  assert.match(result.simulatedAgentDecision, /continue/);
});

test("simulated second agent rejects full JSON instead of brief-only input", () => {
  const result = simulateSecondAgentContinuation(JSON.stringify({
    title: "VibeLog / VibeHub Foundation",
    handoff_state: { next_actions: ["Do the next task"] }
  }));

  assert.equal(result.passed, false);
  assert.match(result.failures.join("\n"), /brief-only/i);
  assert.match(result.failures.join("\n"), /JSON/i);
});

test("simulated second agent fails when privacy or push boundaries are missing", () => {
  const result = simulateSecondAgentContinuation([
    "Project: VibeLog / VibeHub Foundation",
    "One-line vibe: A reusable VibeLog skill.",
    "Current state: S36 is complete.",
    "Next action: Plan S37."
  ].join("\n"));

  assert.equal(result.passed, false);
  assert.match(result.failures.join("\n"), /Privacy boundary/);
  assert.match(result.failures.join("\n"), /Push boundary/);
});

test("CLI reads a brief file and prints simulated continuation JSON", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-second-agent-"));
  const briefPath = join(dir, "handoff-brief.txt");

  try {
    await writeFile(briefPath, `${validBrief}\n`, "utf8");

    const fileResult = await simulateSecondAgentContinuationFile({ briefPath });
    assert.equal(fileResult.passed, true);

    const { stdout } = await execFileAsync("node", [
      resolve("scripts/simulate-second-agent-continuation.mjs"),
      "--brief",
      briefPath
    ], { cwd: resolve(".") });
    const cliResult = JSON.parse(stdout);

    assert.equal(cliResult.passed, true);
    assert.match(cliResult.selectedNextAction, /S37/);
    assert.equal(cliResult.boundaries.pushRequiresExplicitUserRequest, true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI exits non-zero for weak brief-only package", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-second-agent-weak-"));
  const briefPath = join(dir, "handoff-brief.txt");

  try {
    await writeFile(briefPath, "Project: VibeLog\nNext action: continue\n", "utf8");

    await assert.rejects(
      () => execFileAsync("node", [
        resolve("scripts/simulate-second-agent-continuation.mjs"),
        "--brief",
        briefPath
      ], { cwd: resolve(".") }),
      (error) => {
        const output = JSON.parse(error.stdout);
        assert.equal(output.passed, false);
        assert.match(output.failures.join("\n"), /Current state/);
        return true;
      }
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
