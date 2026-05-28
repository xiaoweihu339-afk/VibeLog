import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import {
  verifyHandoffContinuity,
  verifyHandoffContinuityFile
} from "../scripts/verify-handoff-continuity.mjs";

const execFileAsync = promisify(execFile);

function validHandoffLog(overrides = {}) {
  return {
    schema: "vibelog@0.2-draft",
    title: "VibeLog / VibeHub Foundation",
    one_line_vibe: "A reusable process memory layer for vibe-built products.",
    stage: "prototype",
    current_idea: "VibeLog records idea evolution, human decisions, tests, and handoff state for future agents.",
    visibility: "private",
    human_in_the_loop: [
      {
        date: "2026-05-28",
        type: "architecture",
        human_input: "Keep private logs local.",
        final_decision: "Do not publish root vibe-log.md by default.",
        why_it_mattered: "The log can include private prompts and unfinished decisions.",
        impact: "Keep public examples sanitized."
      }
    ],
    verification_evidence: [
      {
        date: "2026-05-28",
        type: "test_result",
        summary: "Focused and workflow tests passed.",
        evidence_ref: "node --test",
        result: "passed"
      }
    ],
    handoff_state: {
      current_state: "S34 is complete; S35 should verify handoff continuity before a second agent dogfood.",
      completed: ["S34 human decision capture"],
      in_progress: [],
      pending: ["S35 deterministic handoff continuity gate"],
      blockers: [],
      next_actions: ["Run S35 verifier against the local VibeLog before using another agent."],
      context_for_next_agent: [
        "Private root vibe-log.md, vibe-log.json, and .vibelog-events are ignored and should not be staged.",
        "Do not push unless the user explicitly asks and only for VibeLog skill changes.",
        "Claude Code Desktop / DeepSeek remains out of scope."
      ],
      project_progress_snapshot: [
        "Project Progress: 30 / 100",
        "Change This Task: +1",
        "Current Phase: Hook/adapters and automatic process recording",
        "Completed This Task: S34 human-in-the-loop live dogfood gate and decision-type normalization",
        "Next Unlock: Repeat human-decision dogfood in a longer real project session and prepare multi-agent handoff evidence",
        "Main Risk: Long-running production sessions, multi-agent handoffs, and Vibe Repo storage are still not proven",
        "Confidence: medium"
      ]
    },
    ...overrides
  };
}

test("passes when VibeLog contains enough continuity evidence for the next agent", () => {
  const result = verifyHandoffContinuity(validHandoffLog());

  assert.equal(result.passed, true, result.failures.join("\n"));
  assert.equal(result.score, 100);
  assert.match(result.continuationBrief, /VibeLog \/ VibeHub Foundation/);
  assert.match(result.continuationBrief, /S34 is complete/);
  assert.match(result.continuationBrief, /Run S35 verifier/);
  assert.match(result.continuationBrief, /Push boundary: Do not push unless the user explicitly asks/);
  assert.deepEqual(result.failures, []);
});

test("uses next actions as the push boundary source when context only says not staged", () => {
  const result = verifyHandoffContinuity(validHandoffLog({
    handoff_state: {
      ...validHandoffLog().handoff_state,
      context_for_next_agent: [
        "Private root vibe-log.md, vibe-log.json, and .vibelog-events are ignored and should not be staged.",
        "Claude Code Desktop / DeepSeek remains out of scope."
      ],
      next_actions: [
        "Plan S37.",
        "Do not push unless the user explicitly asks; only VibeLog skill/core changes are push-eligible."
      ]
    }
  }));

  assert.equal(result.passed, true, result.failures.join("\n"));
  assert.match(result.continuationBrief, /Push boundary: Do not push unless the user explicitly asks/);
});

test("fails with actionable messages when the handoff cannot support continuation", () => {
  const result = verifyHandoffContinuity(validHandoffLog({
    verification_evidence: [],
    human_in_the_loop: [],
    handoff_state: {
      current_state: "",
      completed: [],
      in_progress: [],
      pending: [],
      blockers: [],
      next_actions: [],
      context_for_next_agent: [],
      project_progress_snapshot: ["Project Progress: 30 / 100"]
    }
  }));

  assert.equal(result.passed, false);
  assert.ok(result.score < 70);
  assert.match(result.failures.join("\n"), /current_state/);
  assert.match(result.failures.join("\n"), /next_actions/);
  assert.match(result.failures.join("\n"), /human-in-the-loop/i);
  assert.match(result.failures.join("\n"), /verification evidence/i);
  assert.match(result.failures.join("\n"), /privacy boundary/i);
  assert.match(result.failures.join("\n"), /Next Unlock/i);
  assert.match(result.failures.join("\n"), /Main Risk/i);
});

test("CLI verifies a VibeLog JSON file and prints a continuation brief", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-handoff-continuity-"));
  const jsonPath = join(dir, "vibe-log.json");

  try {
    await writeFile(jsonPath, `${JSON.stringify(validHandoffLog(), null, 2)}\n`, "utf8");

    const fileResult = await verifyHandoffContinuityFile({ jsonPath });
    assert.equal(fileResult.passed, true);
    assert.match(fileResult.continuationBrief, /Next action/);

    const { stdout } = await execFileAsync("node", [
      resolve("scripts/verify-handoff-continuity.mjs"),
      jsonPath
    ], { cwd: resolve(".") });
    const cliResult = JSON.parse(stdout);

    assert.equal(cliResult.passed, true);
    assert.equal(cliResult.score, 100);
    assert.match(cliResult.continuationBrief, /Privacy boundary/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI brief-only mode prints only the continuation brief", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-handoff-brief-only-"));
  const jsonPath = join(dir, "vibe-log.json");

  try {
    await writeFile(jsonPath, `${JSON.stringify(validHandoffLog(), null, 2)}\n`, "utf8");

    const { stdout } = await execFileAsync("node", [
      resolve("scripts/verify-handoff-continuity.mjs"),
      jsonPath,
      "--brief-only"
    ], { cwd: resolve(".") });

    assert.match(stdout, /^Project: VibeLog \/ VibeHub Foundation/m);
    assert.match(stdout, /Next action: Run S35 verifier/);
    assert.match(stdout, /Privacy boundary:/);
    assert.doesNotMatch(stdout, /^\s*\{/);
    assert.doesNotMatch(stdout, /"passed"/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("CLI exits non-zero for a weak handoff", async () => {
  const dir = await mkdtemp(join(tmpdir(), "vibelog-handoff-continuity-weak-"));
  const jsonPath = join(dir, "vibe-log.json");

  try {
    await writeFile(jsonPath, `${JSON.stringify(validHandoffLog({
      handoff_state: {
        current_state: "",
        completed: [],
        in_progress: [],
        pending: [],
        blockers: [],
        next_actions: [],
        context_for_next_agent: [],
        project_progress_snapshot: []
      }
    }), null, 2)}\n`, "utf8");

    await assert.rejects(
      () => execFileAsync("node", [
        resolve("scripts/verify-handoff-continuity.mjs"),
        jsonPath
      ], { cwd: resolve(".") }),
      (error) => {
        const output = JSON.parse(error.stdout);
        assert.equal(output.passed, false);
        assert.match(output.failures.join("\n"), /next_actions/);
        return true;
      }
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
