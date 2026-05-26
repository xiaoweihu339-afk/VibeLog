---
schema: vibelog@0.2-draft
title: "Reading Card Lite"
one_line_vibe: "A tiny study-card generator that turns reading notes into grouped review cards."
stage: prototype
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: agent_led_human_approved
process_level: core
tools: ["Codex", "Node.js", "node:test", "VibeLog"]
tags: ["reading", "study-cards", "dogfood", "vibelog", "agent-verification"]
created_at: "2026-05-26"
updated_at: "2026-05-26"
---

# VibeLog

## One-Line Vibe

A tiny study-card generator that turns reading notes into grouped review cards.

## Creation Mode

**Mode:** agent_led_human_approved

**Notes:** Codex ran this as a scratch dogfood project after the human approved Slice 4 agent-run verification. The human set the higher-level rule: vibe verification should be agent-run whenever possible, and example source code should stay outside the VibeLog skill repository.

## Current Idea

Reading Card Lite is a small local Node.js utility that takes reading notes with theme, concept, explanation, and example fields, then produces grouped Markdown review cards. The prototype is intentionally tiny: no UI, no database, no account system, and no cloud sync.

Its purpose is to test whether VibeLog can record an agent-led vibe coding process with test design, idea change, human decision, exact execution prompt, development work, incident thinking, verification evidence, artifact boundaries, and handoff state.

## Vibe Intake

- Problem: Reading notes often remain scattered and are hard to review later.
- Target users: readers, students, self-learners, researchers
- Desired outcome: Convert notes into grouped review cards that are easy to scan.
- Current stage: prototype
- Tools / agents: Codex, Node.js, node:test, VibeLog

## Idea Expansion

- Product hypothesis: A small transformation core is enough to prove the review-card idea before any UI exists.
- Why it matters: The project has real enough behavior to test implementation, validation, and handoff without bloating the VibeLog repository.
- Core value: Turn reading notes into structured recall material.
- Core features: theme grouping, normalized text, review question generation, duplicate example handling, Markdown export.
- Use cases: summarize an article, prepare review cards after reading, group concepts by theme, hand off notes to another study tool.
- Non-goals: spaced repetition scheduling, accounts, storage, sync, rich editor, mobile UI, AI summarization.
- Assumptions: notes are already extracted; each note has a theme, concept, explanation, and example.

## Idea Evolution

### 2026-05-26

**Type:** initial

**Before:** Slice 4 needed agent-run dogfood verification, but no real unfinished project was available.

**After:** Create Reading Card Lite as a scratch project outside the repository to verify VibeLog with a small but real coding task.

**Reason:** The project needed proof that VibeLog can be used without asking the human to manually prepare a project.

**Source:** implementation plan and current execution

**Confidence:** high

### 2026-05-26

**Type:** refinement

**Before:** Generate study cards from notes.

**After:** Preserve input order for generated cards while sorting grouped Markdown output by theme.

**Reason:** This makes duplicate example handling easier to verify in tests while keeping the exported review material organized.

**Source:** test behavior during dogfood execution

**Confidence:** high

## Scope / Plan

### Current Goal

Use Reading Card Lite to verify VibeLog through a real agent-run scratch project.

### In Scope

- Create a scratch project outside this repository.
- Write tests first for note grouping, card creation, duplicate examples, and Markdown export.
- Implement the minimal Node.js logic needed to pass the tests.
- Generate VibeLog Markdown and JSON for the example.
- Copy only generated VibeLog records into this repository.

### Out of Scope

- UI
- database
- account system
- cloud sync
- spaced repetition algorithm
- publishing scratch source code in this repository

### Acceptance Criteria

- Scratch tests fail before implementation.
- Scratch tests pass after implementation.
- VibeLog records one-line idea, current idea, idea evolution, human-in-the-loop, execution prompts, development log, incident log, validation design, verification evidence, artifact index, handoff state, and public summary.
- Example JSON validates.
- Example Markdown and JSON stay in sync.
- `examples/reading-card-lite/` contains generated VibeLog records only.

### Planned Steps

1. Create scratch folder outside the repository.
2. Write failing Node tests.
3. Implement the minimal reading-card logic.
4. Run scratch tests.
5. Generate example VibeLog Markdown.
6. Export JSON from Markdown.
7. Validate generated example and repository boundary.

## Decisions

### 2026-05-26

**Decision:** Keep Reading Card Lite source code outside the VibeLog repository.

**Why:** This repository is skill-first. Examples should show generated VibeLog records, not turn the skill repository into an application source repository.

**Impact:** The example directory contains only `README.md`, `vibe-log.md`, and `vibe-log.json`.

### 2026-05-26

**Decision:** Use automated agent dogfood verification instead of asking the human to manually inspect every step.

**Why:** The user's principle is that anything an agent can vibe-verify should not become human manual work.

**Impact:** Slice 4 focuses on repeatable commands, example integrity tests, exporter checks, validator checks, and concise evidence reporting.

## Human-in-the-Loop

### 2026-05-26

**Type:** direction

**Human Input:** 原则是可以vibe验证就不要手动验证，slice4开始之前还要准备什么？

**Agent Proposal:** Build Slice 4 around agent-run dogfood verification, with human review focused on direction and evidence rather than manual chore checking.

**Final Decision:** The dogfood run should be agent-verified first.

**Why It Mattered:** This shaped the verification philosophy for the VibeLog skill and future VibeHub workflow.

**Impact:** The repository now includes a repeatable dogfood protocol and example integrity test.

### 2026-05-26

**Type:** scope

**Human Input:** 作为案例上传，明确只是上传这次工程执行下自动生成的vibelog，而不是工程源码。

**Agent Proposal:** Store only generated VibeLog artifacts in `examples/`, while scratch source remains local and outside the repo.

**Final Decision:** Example source code is excluded from this repository.

**Why It Mattered:** It protects the skill-first structure and keeps the repository reusable.

**Impact:** Reading Card Lite source remains at `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`.

## Open Questions

- Should future examples be fully bilingual or use English content plus Chinese README notes?
- Should the next slice implement automatic hook-style recording before adding more examples?
- Should scratch project paths be redacted in future public exports?

## Implementation Status

### Current State

Reading Card Lite is a local scratch project with tested note grouping, card creation, duplicate example handling, and Markdown export logic. This repository contains only the generated VibeLog example.

### Completed

- Created scratch project at `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`.
- Wrote tests first in `test/reading-card-lite.test.mjs`.
- Confirmed RED with `ERR_MODULE_NOT_FOUND` before implementation.
- Implemented `src/reading-card-lite.mjs`.
- Confirmed GREEN with 3 passing scratch tests.
- Generated this VibeLog Markdown.

### In Progress

- Exporting and validating generated JSON.
- Running repository example integrity tests.

### Pending

- Final repository verification.
- Root VibeLog update.
- Slice 4 bilingual report.

### Blocked

- No blockers.

### Next Actions

- Export `examples/reading-card-lite/vibe-log.json`.
- Validate example JSON.
- Run drift check and full repository tests.
- Confirm repository boundary.

### Important Context for Next Agent

- Do not copy scratch `src/`, `test/`, or `package.json` into this repository.
- The scratch app is evidence for VibeLog verification, not a product being shipped here.
- The important reusable artifact is the process record.

## Validation Design

### Success Criteria

- Agent can run a scratch project without human manual setup.
- Scratch tests prove behavior before and after implementation.
- VibeLog records the idea, changes, human decisions, exact engineering prompt, development work, incident thinking, validation, verification, artifacts, and handoff.
- Example JSON validates.
- Example Markdown and JSON stay synchronized.
- Example directory contains generated records only.

### Core User Paths

- Provide reading notes.
- Group notes by theme.
- Generate study cards with review questions.
- Avoid duplicate example text across cards.
- Export grouped cards as Markdown.

### Manual Test Steps

- Read `examples/reading-card-lite/vibe-log.md`.
- Confirm the log explains the idea, status, evidence, and handoff.
- Confirm the example directory contains generated VibeLog records only.

### Automated Test Strategy

- Use `npm test` in the scratch project.
- Use `node scripts/export-vibelog.mjs` for JSON export.
- Use `node scripts/validate-vibelog.mjs` for JSON validation.
- Use `node --test test/vibelog-examples.test.mjs` for repository-boundary and example-integrity checks.
- Use `node --test` for the full repository test suite.

### Edge Cases

- Duplicate examples across different themes.
- Extra whitespace in notes.
- Output grouping order.
- Missing future UI or storage should not affect core record validity.

### Regression Points

- Do not add scratch source code to `examples/reading-card-lite/`.
- Do not let `vibe-log.json` drift from `vibe-log.md`.
- Do not drop required VibeLog sections from generated examples.

### Risks / Safety / Privacy Checks

- No real personal reading notes are used.
- The scratch source path is local-only.
- The example is private by default until the human chooses a publication policy.

## Verification Evidence

### 2026-05-26

**Type:** test_result

**Summary:** Watched scratch tests fail before implementation because `src/reading-card-lite.mjs` did not exist.

**Evidence Ref:** `npm test` in `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`

**Result:** failed

**Details:** Node reported `ERR_MODULE_NOT_FOUND` for `src/reading-card-lite.mjs`.

**Residual Risk:** This proves the tests caught missing implementation, not final behavior.

**Source:** command output

**Confidence:** high

### 2026-05-26

**Type:** test_result

**Summary:** Scratch tests passed after implementing the reading-card logic.

**Evidence Ref:** `npm test` in `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`

**Result:** passed

**Details:** 3 tests passed: grouping notes by normalized theme, creating cards without duplicate examples, and exporting grouped Markdown cards.

**Residual Risk:** The scratch product is intentionally small and does not cover UI, storage, sync, or AI note extraction.

**Source:** command output

**Confidence:** high

## Project Context

### Repo / Workspace

`C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`

### Important Files

- `package.json`: scratch test script.
- `test/reading-card-lite.test.mjs`: behavior tests.
- `src/reading-card-lite.mjs`: scratch implementation.
- `examples/reading-card-lite/vibe-log.md`: generated VibeLog record in this repository.
- `examples/reading-card-lite/vibe-log.json`: generated JSON export in this repository.

### Run / Test Commands

- `npm test`
- `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json`
- `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`
- `node --test test/vibelog-examples.test.mjs`
- `node --test`

### Known Issues

- This is a scratch utility, not a production reading app.
- The example does not include screenshots because the scratch project has no UI.

### Do Not Change

- Do not add scratch source files to the VibeLog repository.
- Do not present Reading Card Lite as a shipped product.

## Code Repositories

### Local Scratch Workspace

- Provider: local
- URL / Path: `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`
- Sync status: local_only
- Code visibility: hidden
- Latest verification: `npm test` passed

## Artifact Index

### Scratch project source

**Type:** code_workspace

**Ref:** `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`

**Visibility:** private

**Notes:** Local-only scratch source for dogfood validation. Not copied into the VibeLog skill repository.

### Generated example Markdown

**Type:** vibelog_markdown

**Ref:** `examples/reading-card-lite/vibe-log.md`

**Visibility:** private

**Notes:** Human-readable process record generated from this dogfood run.

### Generated example JSON

**Type:** vibelog_json

**Ref:** `examples/reading-card-lite/vibe-log.json`

**Visibility:** private

**Notes:** Structured export generated from the Markdown source of truth.

## Execution Prompts

### 2026-05-26

**Agent / Tool:** Codex

**Prompt Type:** build

**Prompt Visibility:** summary

**Recording Mode:** exact

**Prompt Summary:** Retry and execute Slice 4 dogfood verification locally without pushing.

**Prompt Text:** 重试

**Result:** Codex resumed Slice 4, wrote red example-integrity tests, created guides, ran a scratch Reading Card Lite project with TDD, and generated this VibeLog example.

**Reuse Notes:** A short human trigger can still be a build prompt when it resumes an approved implementation plan.

### 2026-05-26

**Agent / Tool:** Codex

**Prompt Type:** build

**Prompt Visibility:** summary

**Recording Mode:** reconstructed

**Prompt Summary:** Execute the plan-defined scratch Reading Card Lite dogfood task.

**Prompt Text:** Create a scratch Reading Card Lite project outside this repository, write tests first, confirm RED, implement the minimal Node.js logic, confirm GREEN, then copy only generated VibeLog records into `examples/reading-card-lite/`.

**Result:** Scratch tests passed and generated VibeLog records were created.

**Reuse Notes:** This is a reusable agent dogfood prompt pattern for future examples.

## Development Log

### 2026-05-26

**Type:** test

**Summary:** Added scratch tests for Reading Card Lite behavior.

**Files Changed:** `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\package.json`, `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\test\reading-card-lite.test.mjs`

**Details:** Tests cover normalized theme grouping, study card creation, duplicate example handling, and grouped Markdown export.

**Verification:** `npm test` failed before implementation with `ERR_MODULE_NOT_FOUND`.

**Follow-up:** Implement `src/reading-card-lite.mjs`.

**Source:** current work session

**Confidence:** high

### 2026-05-26

**Type:** feature

**Summary:** Implemented Reading Card Lite scratch logic.

**Files Changed:** `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\src\reading-card-lite.mjs`

**Details:** Added theme grouping, normalized note handling, study card generation, duplicate example prefixing, review question generation, and grouped Markdown export.

**Verification:** `npm test` passed with 3 tests.

**Follow-up:** Use generated VibeLog records as the repository example.

**Source:** current work session

**Confidence:** high

### 2026-05-26

**Type:** docs

**Summary:** Generated the Reading Card Lite VibeLog example.

**Files Changed:** `examples/reading-card-lite/README.md`, `examples/reading-card-lite/vibe-log.md`

**Details:** The example documents the scratch project process while keeping source code outside the repository.

**Verification:** Pending JSON export and repository tests.

**Follow-up:** Export JSON and run integrity checks.

**Source:** current work session

**Confidence:** high

## Bugfix / Incident Log

### 2026-05-26

**Summary:** Prevented duplicate example text from appearing across generated study cards.

**Bug Symptom:** Two notes could use the same example text even when they belonged to different concepts, making review cards harder to distinguish.

**Root Cause:** The desired behavior needed explicit uniqueness tracking during card generation.

**Fix:** Track used examples and prefix a duplicate example with the card concept.

**Verification:** The scratch test `creates study cards and avoids duplicate examples across themes` passed after implementation.

**Follow-up:** If this becomes a real app, add user-facing duplicate warnings or richer example editing.

## Handoff State

### Current State

Reading Card Lite exists as a local scratch project used to verify VibeLog dogfood behavior. The VibeLog repository contains only generated example records.

### Completed

- Scratch folder created outside the repository.
- Scratch tests written first.
- RED run observed before implementation.
- Scratch implementation added.
- GREEN run observed with 3 passing tests.
- Example Markdown generated.

### In Progress

- Exporting and validating example JSON.
- Running repository integrity tests.

### Pending

- Complete full Slice 4 verification.
- Update root VibeLog and Slice 4 reports.

### Blockers

- No blockers.

### Next Actions

- Export example JSON.
- Validate example JSON.
- Run example integrity tests and full repository tests.
- Confirm repository boundary contains only generated VibeLog artifacts.

### Context For Next Agent

- Scratch source remains at `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`.
- Do not copy scratch source into this repository.
- This example validates process recording, not a production reading-card product.

### Project Progress Snapshot

Project Progress: 12 / 100

Change This Task: +2

Current Phase: Agent dogfood verification

Next Unlock: Hook / adapter automatic recording

Main Risk: Hook automation has not been implemented yet

Confidence: medium

## Public / Private Projection

- Public summary: Reading Card Lite is a scratch dogfood example showing how VibeLog records an agent-run mini project from tests to handoff.
- Code visibility: hidden
- Prompt visibility: summary
- Collaboration status: closed
- Remix permission: unknown
- License / usage note: no license selected

## Branch / Remix Readiness

- Remix allowed: false
- What can be reused: the generated VibeLog example structure after license decisions are made
- What should not be reused: private local scratch source path in a public export
- Suggested contribution areas: hook adapters, automatic prompt capture, richer validation schema, more dogfood examples
- Attribution requirements: pending license decision

## Vibe Progress

### 2026-05-26

**Stage:** prototype

**What Happened:** Ran Reading Card Lite as a scratch agent dogfood project to verify VibeLog recording.

**Tools Used:** Codex, Node.js, node:test, VibeLog

**Problems:** Needed a repeatable verification scenario without asking the human to manually supply a new unfinished project.

**Next:** Export JSON, validate example, run integrity tests, update root VibeLog, and write Slice 4 report.

**Source:** current work session

**Confidence:** high

## Public Summary

Reading Card Lite is a scratch dogfood example showing that VibeLog can record an agent-run mini project from idea through test design, RED/GREEN implementation, incident thinking, verification evidence, artifact boundaries, and handoff. The source code stays outside the VibeLog skill repository; only generated VibeLog records are included here.
