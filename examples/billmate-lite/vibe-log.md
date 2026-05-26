---
schema: vibelog@0.2-draft
title: "BillMate Lite"
one_line_vibe: "A tiny bill splitter that turns shared expenses into clear per-person settlement suggestions."
stage: prototype
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: agent_led_human_approved
process_level: core
tools: ["Codex", "Node.js", "node:test"]
tags: ["billing", "dogfood", "manual-test", "vibelog"]
created_at: "2026-05-26"
updated_at: "2026-05-26"
---

# VibeLog

## One-Line Vibe

A tiny bill splitter that turns shared expenses into clear per-person settlement suggestions.

## Creation Mode

**Mode:** agent_led_human_approved

**Notes:** The human suggested that the agent could simulate a small billing project to test VibeLog. Codex chose the exact small project shape, implemented it, ran tests, and recorded the process.

## Current Idea

BillMate Lite is a small local Node.js domain utility for shared bills. Given expenses with a payer, amount, description, and participants, it calculates who should pay whom so the group can settle up with minimal transfers.

The prototype intentionally stays small: no UI, no accounts, no cloud sync, and no persistence. Its purpose is to test whether VibeLog can record a realistic mini vibe project from idea through test, implementation, verification, and handoff.

## Vibe Intake

- Problem: Shared expenses are easy to discuss casually but hard to settle cleanly without a small calculation step.
- Target users: Friends, roommates, or travelers who need a simple settlement suggestion after shared spending.
- Desired outcome: Convert a few shared expense records into clear settlement rows.
- Current stage: prototype
- Tools / agents: Codex, Node.js, node:test

## Idea Expansion

- Product hypothesis: A tiny, testable core calculation is enough to prove the billing idea before any UI exists.
- Why it matters: Billing is familiar, concrete, and good for testing VibeLog because it has product intent, implementation behavior, validation, and edge cases.
- Core value: Tell each person exactly whom to pay and how much.
- Core features: expense input model, equal participant split, settlement simplification, invalid expense validation.
- Use cases: split dinner, groceries, taxi, trip costs, roommate expenses.
- Non-goals: accounts, payment processing, database storage, UI, currency conversion, receipt scanning.
- Assumptions: equal split is enough for the first test; all amounts are in one currency; participants are named strings.

## Idea Evolution

### 2026-05-26

**Type:** initial

**Before:** none

**After:** Create a tiny bill splitter as a scratch project to test VibeLog without needing the user to manually provide a real project.

**Reason:** The user asked whether the agent could simulate a small billing project instead of requiring manual testing.

**Source:** user prompt and agent execution

**Confidence:** high

### 2026-05-26

**Type:** refinement

**Before:** A generic billing test project.

**After:** A Node.js settlement-calculation core with tests, no UI, and no persistence.

**Reason:** A small domain core is enough to exercise execution prompts, development logs, validation design, verification evidence, and handoff while keeping the scratch project disposable.

**Source:** agent design choice

**Confidence:** high

## Scope / Plan

### Current Goal

Use a scratch billing project to dogfood VibeLog end to end.

### In Scope

- Create a scratch project outside the VibeLog repository.
- Write tests first for bill settlement behavior.
- Implement the smallest passing Node.js calculation module.
- Record the process in `vibe-log.md` and `vibe-log.json`.
- Copy only generated VibeLog files back to the VibeLog repository as an example.

### Out of Scope

- UI
- database
- cloud sync
- payment integrations
- publishing the scratch source code in the VibeLog repository

### Acceptance Criteria

- Scratch project tests fail before implementation.
- Scratch project tests pass after implementation.
- VibeLog records idea, human decision, execution prompt, development work, bug/incident thinking, validation, verification, artifacts, and handoff.
- JSON parses.
- The VibeLog repository example contains generated logs only, not scratch app source.

### Planned Steps

1. Create scratch project.
2. Write failing tests.
3. Implement `calculateSettlements`.
4. Run tests.
5. Generate VibeLog Markdown and JSON.
6. Copy generated logs into the main repo example directory.

## Decisions

### 2026-05-26

**Decision:** Use a billing splitter as the simulated dogfood project.

**Why:** It is small, concrete, and has enough logic to produce real tests and verification evidence.

**Impact:** The test can prove VibeLog works with code artifacts while keeping app source outside the skill repository.

### 2026-05-26

**Decision:** Keep scratch app source outside the VibeLog repository.

**Why:** The VibeLog repository is skill-first and should not become a mixed app/source monorepo.

**Impact:** Only generated VibeLog files are suitable for copying into `examples/`.

## Human-in-the-Loop

### 2026-05-26

**Type:** direction

**Human Input:** "必须得我手动吗？你不可以模拟一个小项目，做一个账单啥的小项目去测试吗？"

**Agent Proposal:** Simulate a small billing project in a scratch directory, run it like a real project, and use it to test VibeLog.

**Final Decision:** The test is agent-simulated. The human does not need to manually create the project.

**Why It Mattered:** This tests whether VibeLog can support real agent-led workflow, which is central to the long-term product vision.

**Impact:** Slice 2.1 becomes an agent-simulated dogfood test instead of a human manual test.

## Open Questions

- Should future examples use English, Chinese, or bilingual logs?
- Should the next dogfood test include a deterministic Markdown-to-JSON exporter?
- Should scratch project source remain disposable, or should a separate demo-source repository be created later?

## Implementation Status

### Current State

The scratch BillMate Lite project has a tested Node.js calculation module and a generated VibeLog.

### Completed

- Created scratch project at `C:\Users\HXW\Documents\vibelog-scratch\billmate-lite`.
- Added `package.json`.
- Added `test/bill-splitter.test.js`.
- Added `src/bill-splitter.js`.
- Ran tests red before implementation.
- Ran tests green after implementation.
- Created this VibeLog Markdown and JSON.

### In Progress

- Copying generated logs into the main VibeLog repository as an example.

### Pending

- Add `examples/billmate-lite/` to the main VibeLog repository.
- Verify copied example JSON parses.
- Update root VibeLog with this dogfood test result.

### Blocked

- No blockers.

### Next Actions

- Copy generated VibeLog files as example output only.
- Run JSON parse checks.
- Commit the example locally if accepted.

### Important Context for Next Agent

- Do not copy `src/`, `test/`, or `package.json` into the VibeLog repository.
- The scratch project can remain outside the repo as local evidence.
- This example exists to validate VibeLog process recording, not to ship a billing product.

## Validation Design

### Success Criteria

- A test-first scratch implementation can be represented in VibeLog.
- A future agent can understand the billing idea, implementation status, test evidence, and next actions from the log.
- The generated JSON parses.
- The main repo receives only generated log files as an example.

### Core User Paths

- Enter shared expenses.
- Calculate balances.
- Return settlement rows.
- Reject invalid expense input.

### Manual Test Steps

1. Read `vibe-log.md`.
2. Confirm the one-line vibe and current idea are clear.
3. Confirm execution prompt and development log are present.
4. Run `npm test` in the scratch directory.
5. Parse `vibe-log.json`.
6. Read handoff state as a new agent.

### Automated Test Strategy

Use Node's built-in `node:test` runner.

### Edge Cases

- amount is zero or negative
- participants list is empty
- multiple expenses simplify into fewer settlement rows
- cent rounding across participant splits

### Regression Points

- Do not produce settlements for invalid expenses.
- Do not require UI or persistence for the core calculation.
- Do not add scratch source code to the VibeLog skill repository.

### Risks / Safety / Privacy Checks

- No real financial data is used.
- All names and expenses are fake.
- The scratch project remains private/local.

## Verification Evidence

### 2026-05-26

**Type:** test_result

**Summary:** Watched tests fail before implementation because `src/bill-splitter.js` did not exist.

**Evidence Ref:** `npm test` in `C:\Users\HXW\Documents\vibelog-scratch\billmate-lite`

**Result:** failed

**Residual Risk:** This proves the tests detected missing implementation, not final correctness.

**Source:** command output

**Confidence:** high

### 2026-05-26

**Type:** test_result

**Summary:** Node test suite passed after implementing `calculateSettlements`.

**Evidence Ref:** `npm test`

**Result:** passed

**Details:** 3 tests passed: one shared bill split, multiple bill simplification, invalid expense rejection.

**Residual Risk:** This is a small domain test only. It does not cover currencies, unequal splits, UI, persistence, or payment flows.

**Source:** command output

**Confidence:** high

## Project Context

### Repo / Workspace

`C:\Users\HXW\Documents\vibelog-scratch\billmate-lite`

### Important Files

- `package.json`: local Node test script.
- `test/bill-splitter.test.js`: behavior tests.
- `src/bill-splitter.js`: settlement calculation implementation.
- `vibe-log.md`: human-readable process record.
- `vibe-log.json`: structured process record.

### Run / Test Commands

- `npm test`
- `node -e "JSON.parse(require('fs').readFileSync('vibe-log.json','utf8')); console.log('OK vibe-log.json')"`

### Known Issues

- No deterministic Markdown-to-JSON exporter was used; Markdown and JSON were generated manually for this dogfood test.

### Do Not Change

- Do not copy scratch app source into the VibeLog repository.
- Do not treat this as a production billing product.

## Code Repositories

### Local Scratch Repository

- Provider: local
- URL / Path: `C:\Users\HXW\Documents\vibelog-scratch\billmate-lite`
- Sync status: local_only
- Code visibility: hidden
- Latest verification: `npm test` passed

## Artifact Index

### Scratch project source

**Type:** code_repo

**Ref:** `C:\Users\HXW\Documents\vibelog-scratch\billmate-lite`

**Visibility:** private

**Notes:** Local-only scratch source for dogfood validation. Not copied into the VibeLog skill repository.

### Test output

**Type:** test_output

**Ref:** `npm test`

**Visibility:** private

**Notes:** 3 passing Node tests after implementation.

## Execution Prompts

### 2026-05-26

**Agent / Tool:** Codex

**Prompt Type:** build

**Prompt Visibility:** summary

**Recording Mode:** exact

**Prompt Summary:** User asked whether the agent could simulate a small billing project instead of requiring manual testing.

**Prompt Text:** 必须得我手动吗？你不可以模拟一个小项目，做一个账单啥的小项目去测试吗？

**Result:** Created a scratch BillMate Lite project, wrote tests first, implemented a small settlement calculator, ran verification, and generated VibeLog files.

**Reuse Notes:** Use agent-simulated scratch projects to dogfood VibeLog before asking the human to provide real unfinished work.

## Development Log

### 2026-05-26

**Type:** test

**Summary:** Added failing tests for bill settlement behavior.

**Files Changed:** `package.json`, `test/bill-splitter.test.js`

**Details:** Added Node built-in test coverage for one shared bill, multiple bill simplification, and invalid expense rejection.

**Bug Symptom:** not applicable

**Root Cause:** not applicable

**Fix:** not applicable

**Verification:** `npm test` failed with `ERR_MODULE_NOT_FOUND` because implementation did not exist yet.

**Follow-up:** Implement `src/bill-splitter.js`.

### 2026-05-26

**Type:** feature

**Summary:** Implemented settlement calculation.

**Files Changed:** `src/bill-splitter.js`

**Details:** Added `calculateSettlements`, validation, cent-based equal splitting, and debtor/creditor settlement simplification.

**Bug Symptom:** not applicable

**Root Cause:** not applicable

**Fix:** not applicable

**Verification:** `npm test` passed with 3 tests.

**Follow-up:** Add unequal split support only if a future user story needs it.

## Bugfix / Incident Log

### 2026-05-26

**Summary:** Prevented invalid expenses from entering settlement calculation.

**Bug Symptom:** An expense with zero amount or no participants would make the settlement output meaningless.

**Root Cause:** Validation needed to be explicit before calculation.

**Fix:** Added input validation for payer, positive amount, and non-empty participants.

**Verification:** `rejects invalid expenses before calculating settlements` passed in `npm test`.

**Follow-up:** Add validation for duplicate participant names if future inputs come from free-form UI.

## Handoff State

### Current State

BillMate Lite is a local scratch project with a tested bill splitting core. It exists only to dogfood VibeLog.

### Completed

- Tests written first.
- Tests failed before implementation.
- `calculateSettlements` implemented.
- Tests passed after implementation.
- VibeLog Markdown and JSON generated.

### In Progress

- Copying generated VibeLog files into the main VibeLog repository example directory.

### Pending

- Verify copied example JSON parses.
- Update root VibeLog with this dogfood result.

### Blockers

- No blockers.

### Next Actions

- Copy `vibe-log.md` and `vibe-log.json` to `examples/billmate-lite/`.
- Do not copy scratch source code.
- Use this example to decide whether the next slice should be exporter automation.

### Context For Next Agent

- This scratch project is intentionally tiny.
- The important artifact is the generated VibeLog, not the billing code.
- The scratch source path is local and private.

## Public / Private Projection

- Public summary: BillMate Lite is a tiny local bill splitter used to dogfood VibeLog's process recording.
- Code visibility: hidden
- Prompt visibility: summary
- Collaboration status: closed
- Remix permission: unknown
- License / usage note: no license selected

## Branch / Remix Readiness

- Remix allowed: false
- What can be reused: the generated VibeLog example after the main repository license is chosen
- What should not be reused: scratch source path or any private local context
- Suggested contribution areas: deterministic exporter, more dogfood examples, validation checklist improvements
- Attribution requirements: pending license decision

## Vibe Progress

### 2026-05-26

**Stage:** prototype

**What Happened:** Simulated a small billing project to dogfood VibeLog.

**Tools Used:** Codex, Node.js, VibeLog

**Problems:** Needed to test VibeLog without requiring the human to provide a real unfinished project.

**Next:** Copy generated logs into the VibeLog repository as example output only.

**Source:** current work session

**Confidence:** high

## Public Summary

BillMate Lite is a tiny local bill splitter used to dogfood VibeLog. The example proves that VibeLog can record an agent-simulated project from idea through tests, implementation, verification, and handoff without requiring website features or app source in the skill repository.
