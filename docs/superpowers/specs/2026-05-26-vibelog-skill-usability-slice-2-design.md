# VibeLog Skill Usability Slice 2 Design

## Purpose

Slice 2 makes VibeLog easier to use, test, and reuse before any website or app source work resumes.

The repository has been corrected back to a skill-first shape. This slice builds on that correction by adding the missing usability layer around the existing skill:

- how to start using VibeLog in a project
- how to manually test that the skill works
- how to run one realistic example scenario
- how to judge whether a VibeLog is useful for humans and agents
- how agents should update the log during normal vibe coding

This is not a VibeHub website slice and not a VibeLog Studio app slice.

## Context

VibeLog's core bet is:

```txt
User says naturally, agent records structurally.
```

The current repo already contains:

- `skills/vibelog/SKILL.md`
- `skills/vibelog/assets/vibe-log-template.md`
- `skills/vibelog/assets/vibe-log.schema.json`
- `skills/vibelog/references/vibelog-format.md`
- `skills/vibelog/references/claude-code-hooks-adapter.md`
- `examples/vibelog-studio/`
- root `vibe-log.md` and `vibe-log.json`

What is still weak is the first-time user path. A user can read the README, but there is not yet a clear end-to-end manual test proving that the skill can create, update, verify, and hand off a VibeLog without a website.

## Goals

1. Make the skill testable by a user who does not have a real active project.
2. Make the skill understandable to future agents that need to update VibeLog consistently.
3. Define a small manual test flow that covers both isolated sections and the combined workflow.
4. Keep the repository skill-first and avoid adding app source code.
5. Prepare the ground for later automation adapters, especially Claude Code hooks and future Codex-compatible workflows.

## Non-Goals

- Do not rebuild VibeLog Studio source code in this repository.
- Do not implement a website, dashboard, or local web app.
- Do not add cloud sync, accounts, public pages, or marketplace features.
- Do not implement a deterministic Markdown-to-JSON exporter in this slice.
- Do not publish or push changes without explicit user approval.

## Approaches Considered

### Approach A: README-Only Quickstart

Add a longer README section with all instructions.

Tradeoff: simple, but README becomes too large and hard to maintain.

### Approach B: Skill Usability Pack

Add focused guide documents under `docs/guides/`, then link them from README and the skill reference.

Tradeoff: more files, but each file has one purpose and can be tested independently.

### Approach C: Build Tooling First

Start with a CLI or exporter so users can run a command.

Tradeoff: useful later, but premature. The process standard and manual flow need to be proven before automating them.

## Recommendation

Use Approach B.

Slice 2 should add a small documentation and testing pack around the skill, not code tooling. This keeps the repo reusable and gives both humans and agents a concrete way to prove the skill works before the project grows into automation or website features.

## Deliverables

### 1. Quickstart Guide

Path:

```txt
docs/guides/quickstart.md
```

Purpose:

Help a new user install or invoke the skill and create their first VibeLog.

Must cover:

- what VibeLog is
- when to use it
- how to start in a new project
- how to start in an existing project
- what files should appear
- what a good first update looks like
- how Markdown and JSON relate
- privacy defaults

### 2. Manual Test Guide

Path:

```txt
docs/guides/manual-test-guide.md
```

Purpose:

Give the user a way to test VibeLog without an unfinished real project.

Must cover:

- test setup
- a small fake project idea
- expected agent behavior
- individual section checks
- combined workflow checks
- expected pass/fail criteria

This guide must follow the user's testing principle:

```txt
Each independent part must be able to work on its own.
The combined workflow must also work end to end.
Only then is the slice accepted.
```

### 3. Example Scenario

Path:

```txt
docs/guides/example-scenario.md
```

Purpose:

Provide a reusable fake vibe project that can exercise the skill.

Recommended scenario:

```txt
An AI reading card tool that turns article notes into reusable study cards.
```

Why this scenario:

- small enough for manual testing
- has a clear one-line idea
- supports idea changes
- supports human-in-the-loop decisions
- can include execution prompts
- can include implementation status and validation design
- does not require app source code

### 4. Validation Checklist

Path:

```txt
docs/guides/validation-checklist.md
```

Purpose:

Define how to judge whether a generated or updated VibeLog is useful.

Must include checks for:

- one-line vibe clarity
- current idea freshness
- idea evolution history
- human-in-the-loop records
- execution prompt ledger
- implementation status
- validation design
- verification evidence
- handoff state
- Markdown readability
- JSON parseability
- privacy and visibility defaults

### 5. Agent Usage Reference

Path:

```txt
skills/vibelog/references/agent-usage-guide.md
```

Purpose:

Give agents a concise operational guide for using VibeLog during real sessions.

Must cover:

- when to call the skill
- how to classify events
- what must be recorded exactly
- what should be summarized
- how to update handoff state
- how to avoid transcript dumping
- how to avoid exposing secrets
- how to handle uncertainty during reconstruction

## Documentation Links

Update `README.md` to point users to the new guides.

Recommended structure:

```txt
Quick Start -> docs/guides/quickstart.md
Manual Testing -> docs/guides/manual-test-guide.md
Example Scenario -> docs/guides/example-scenario.md
Validation Checklist -> docs/guides/validation-checklist.md
Agent Usage -> skills/vibelog/references/agent-usage-guide.md
```

Update `skills/vibelog/SKILL.md` only if needed to reference the new agent usage guide. Avoid duplicating the entire guide inside the skill file.

## Data Flow

Manual user path:

```txt
User reads quickstart
-> asks an agent to use VibeLog
-> agent creates or updates vibe-log.md
-> agent refreshes vibe-log.json when asked or when preparing upload
-> user runs manual checklist
-> another agent can read the log and continue
```

Guide-based test path:

```txt
Read example scenario
-> create a scratch VibeLog
-> add idea change
-> add human-in-the-loop decision
-> add execution prompt
-> add development or bugfix log
-> add validation design
-> add verification evidence
-> update handoff state
-> parse JSON
-> review with validation checklist
```

## Error Handling And Privacy

The guides should make these defaults explicit:

- project visibility starts as `private`
- code visibility starts as `hidden`
- prompt visibility starts as `summary`
- exact execution prompts are recorded locally unless sensitive
- secrets and private credentials must be redacted
- uncertain reconstructed history must be marked with source and confidence
- JSON syntax passing is not the same as full semantic validation

## Testing Design

### Individual Checks

Each guide should be independently useful:

- README links resolve to existing files.
- Quickstart can be followed without reading product strategy docs.
- Manual test guide has concrete steps and expected outcomes.
- Example scenario has enough detail to create a VibeLog.
- Validation checklist can be applied to any VibeLog.
- Agent usage guide gives clear event classification rules.

### Combined Workflow Check

The integrated Slice 2 test is:

1. Use the quickstart to start a scratch VibeLog from the example scenario.
2. Follow the manual test guide to add structured updates.
3. Apply the validation checklist to the resulting Markdown.
4. Parse the resulting JSON with Node.js.
5. Read the handoff state as if a new agent is taking over.

The slice passes only if the individual guides are coherent and the combined path produces a VibeLog that a human and future agent can understand.

## Acceptance Criteria

- `docs/guides/quickstart.md` exists and explains the first-time path.
- `docs/guides/manual-test-guide.md` exists and includes individual plus combined testing.
- `docs/guides/example-scenario.md` exists and gives a realistic fake project.
- `docs/guides/validation-checklist.md` exists and can be used as a review checklist.
- `skills/vibelog/references/agent-usage-guide.md` exists and gives agent-facing rules.
- README links to the new guides.
- The root VibeLog records Slice 2 design work and next actions.
- `vibe-log.json` parses.
- `skills/vibelog/assets/vibe-log.schema.json` parses.
- No app source code is added.
- No push to GitHub happens without explicit user approval.

## Risks

### Risk: Too Much Documentation

Mitigation:

Keep each guide short and task-specific. Avoid repeating long schema details that already exist in `vibelog-format.md`.

### Risk: Manual Testing Feels Artificial

Mitigation:

Use a fake project that still has realistic vibe coding events: idea change, human decision, execution prompt, implementation state, validation, and handoff.

### Risk: Agent Instructions Become Duplicated

Mitigation:

Keep canonical rules in `skills/vibelog/SKILL.md` and use the new agent usage guide as operational guidance.

### Risk: Users Confuse VibeLog With A Website

Mitigation:

The guides should repeatedly show that VibeLog works locally first, and VibeHub is a future upload/collaboration layer.

## Open Questions Resolved For Slice 2

- Should this slice add app code? No.
- Should this slice add CLI tooling? No.
- Should this slice include a fake test project? Yes, as a scenario and generated log flow, not source code.
- Should this slice commit locally? Yes, after user-approved local work and verification.
- Should this slice push? No, not without a separate explicit user request.

## Next Step After This Spec

If the user approves this design, create an implementation plan for Slice 2 and then implement the guide pack with verification.
