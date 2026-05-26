# VibeLog Slice 4 Design: Vibe-Driven Skill Verification

## Purpose

Slice 4 proves that VibeLog can be verified through vibe-style agent execution instead of human checklist labor.

The key principle is:

```txt
If an agent can vibe-verify it, do not make the human manually verify it.
```

The human should review direction, important decisions, and the final report. The agent should create the scenario, run the dogfood flow, update VibeLog, export JSON, validate JSON, and produce evidence.

## Background

Earlier slices established the foundation:

- Slice 1.5 restored the repository to a skill-first shape.
- Slice 2 added guide documents for human and agent use.
- BillMate Lite proved VibeLog can record an agent-simulated mini project.
- Slice 3 added deterministic Markdown-to-JSON export and lightweight validation.

The remaining problem is that the validation language still leans too much on manual review. Slice 4 should convert that into an agent-run verification protocol.

## Goals

1. Replace "manual test first" framing with "agent dogfood verification first".
2. Define a repeatable protocol for an agent to verify VibeLog without a real user project.
3. Keep the human role focused on direction and final review, not form-filling.
4. Generate a new example VibeLog from a scratch vibe project.
5. Verify isolated VibeLog capabilities and the combined end-to-end workflow.
6. Preserve the skill-first repository boundary: examples contain generated VibeLog records only, not scratch project source code.

## Non-Goals

- Do not build the VibeHub website.
- Do not build a Claude Code hook adapter in this slice.
- Do not push to GitHub without separate explicit approval.
- Do not put scratch app source code in this repository.
- Do not require the user to manually fill a checklist.
- Do not replace future full JSON Schema validation.

## Core Principle

Slice 4 should treat verification as a vibe process:

```txt
agent receives a natural task
-> agent creates or simulates a small vibe project
-> agent records the process with VibeLog
-> agent exports JSON
-> agent validates JSON
-> agent checks isolated and combined behavior
-> agent reports evidence to the human
```

The human can still reject the result if the log feels fake, incomplete, or not useful. But the first pass should be generated and checked by the agent.

## Considered Approaches

### Approach A: Keep Manual Checklist Verification

Continue using `docs/guides/manual-test-guide.md` and ask the human or agent to manually inspect each field.

Trade-off: simple, but it does not match the vibe principle. It makes the human do work the agent can do.

### Approach B: Agent Dogfood Protocol

Write a protocol that tells the agent how to run a scratch vibe scenario, update VibeLog, export JSON, validate it, and produce an evidence report.

Trade-off: more structured than a casual test, but still lightweight and aligned with VibeLog's core idea.

### Approach C: Full Automation Harness

Build a script that generates a complete fake project flow and asserts every expected VibeLog field.

Trade-off: useful later, but too rigid for the current standard. VibeLog should first prove it can handle natural agent work, not only scripted fixtures.

## Recommendation

Use Approach B.

The first useful Slice 4 output should be an agent-readable dogfood protocol plus a generated example. This matches the long-term direction: VibeLog should work while the user vibes naturally and the agent records structurally.

## Deliverables

### 1. Vibe Verification Guide

Path:

```txt
docs/guides/vibe-verification-guide.md
```

Purpose:

- Replace manual-verification framing with agent-run verification.
- Explain the human role and the agent role.
- Define isolated checks and combined checks.
- Show the exact commands for export, validation, and drift checks.

### 2. Dogfood Protocol

Path:

```txt
docs/guides/agent-dogfood-protocol.md
```

Purpose:

- Give future agents a repeatable procedure.
- Tell agents how to create a scratch folder outside the repo.
- Tell agents to copy only generated VibeLog records into `examples/`.
- Require exact recording of engineering execution prompts.
- Require a final evidence report.

### 3. Generated Example

Recommended path:

```txt
examples/reading-card-lite/
```

Contents:

```txt
README.md
vibe-log.md
vibe-log.json
```

The example should come from a scratch vibe project, such as an AI reading card tool. It should include a real idea change, a human-in-the-loop decision, an execution prompt, development logs, bugfix or incident handling, validation design, verification evidence, and handoff state.

No source code from the scratch project should be copied into the repository.

### 4. Optional Integrity Test

Path:

```txt
test/vibelog-examples.test.mjs
```

Purpose:

- Validate that example `vibe-log.json` files parse.
- Validate generated examples with `validateVibeLog`.
- Check that example folders do not contain source-code project files such as `src`, `package.json`, or app test folders unless explicitly approved.

This is optional for Slice 4 if the guide and example already prove the flow. It becomes valuable if examples keep growing.

### 5. VibeLog Update

Update root `vibe-log.md` and regenerate `vibe-log.json` to record:

- Slice 4 design decision.
- Exact execution prompt: `好开始slice4`.
- The principle that vibe verification should replace manual verification where possible.
- The pending implementation plan.

## Verification Model

Slice 4 keeps the user's two-part test principle, but applies it to agent dogfooding:

```txt
1. Isolated checks: each VibeLog capability can be verified on its own.
2. Combined checks: the whole vibe process can run end to end.
```

### Isolated Checks

The agent should verify that the generated example includes:

- `One-Line Vibe`
- `Current Idea`
- `Idea Evolution`
- `Human-in-the-Loop`
- `Execution Prompts`
- `Development Log`
- `Bugfix / Incident Log`
- `Validation Design`
- `Verification Evidence`
- `Artifact Index`
- `Handoff State`
- `Public Summary`

### Combined Checks

The agent should run:

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test
```

Expected result:

- Export succeeds.
- Validation succeeds.
- Drift check succeeds.
- Test suite passes.
- The example folder contains only generated VibeLog records and README.

## Human Review

The human should not manually inspect every field as the first validation method.

The human review should answer:

- Does the generated VibeLog feel like a real vibe process?
- Does the log preserve meaningful human judgment?
- Can a future agent continue from the handoff?
- Are prompts recorded strictly enough?
- Did the agent avoid adding scratch source code to the skill repo?

## Error Handling

If export fails:

- Fix the Markdown structure or exporter only after identifying the exact unsupported pattern.
- Add a regression test before changing exporter behavior.

If validation fails:

- Prefer fixing the generated VibeLog record.
- Change the validator only if the validation rule is too strict for the standard.

If the example feels fake:

- Re-run the dogfood scenario with a better scratch task.
- Add more explicit human-in-the-loop and bugfix evidence.

If source code leaks into `examples/`:

- Remove it before commit.
- Keep only generated VibeLog files and README.

## Acceptance Criteria

Slice 4 is accepted when:

- The vibe verification guide exists.
- The agent dogfood protocol exists.
- A new generated example exists under `examples/`.
- The example was generated from a scratch vibe flow, not handwritten as a static fixture.
- The example JSON is produced from Markdown by the exporter.
- The example passes the lightweight validator.
- The full test suite passes.
- Root VibeLog records the Slice 4 work.
- The repository remains skill-first and contains no scratch app source.

## Risks

- The dogfood scenario may become too polished and fake.
- The agent may overfit to expected fields instead of recording real process evidence.
- The protocol may become too long for future agents to use.
- The validator may still be too lightweight to catch semantic gaps.

Mitigation:

- Keep the scenario small.
- Require at least one idea change and one bugfix or incident.
- Keep the protocol procedural and short.
- Use future slices for full schema validation.

## Next Step

After this design is approved, write the Slice 4 implementation plan. The implementation plan should create the two guides first, then run the dogfood scenario, then export, validate, update VibeLog, verify, and commit locally.
