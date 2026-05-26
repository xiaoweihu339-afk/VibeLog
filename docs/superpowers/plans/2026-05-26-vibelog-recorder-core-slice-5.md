# VibeLog Recorder Core Slice 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local recorder core that applies structured Vibe Event JSON to VibeLog Markdown and optionally regenerates JSON.

**Architecture:** Add `scripts/record-vibelog-event.mjs` as a small ESM CLI/library. It maps seven event types to existing VibeLog Markdown sections, uses `export-vibelog.mjs` when JSON output is requested, and keeps Markdown as the source of truth.

**Tech Stack:** Node.js ESM, built-in `node:test`, existing VibeLog exporter and validator, Markdown docs.

---

## File Structure

- Create: `scripts/record-vibelog-event.mjs`
- Create: `test/record-vibelog-event.test.mjs`
- Create: `docs/guides/recorder-core.md`
- Create: `docs/guides/recorder-core.zh.md`
- Create: `skills/vibelog/references/vibe-event-format.md`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`
- Create: `docs/reports/slice-5-recorder-core-report.md`
- Create: `docs/reports/slice-5-recorder-core-report.zh.md`

## Task 1: Red Tests

- [ ] Create `test/record-vibelog-event.test.mjs`.
- [ ] Add tests for `prompt_submitted`, `test_ran`, `bug_fixed`, `handoff_updated`, CLI JSON export, and combined session flow.
- [ ] Run `node --test test/record-vibelog-event.test.mjs`.
- [ ] Expected result: fail because `scripts/record-vibelog-event.mjs` does not exist.

## Task 2: Recorder Implementation

- [ ] Create `scripts/record-vibelog-event.mjs`.
- [ ] Export `applyVibeLogEvent`, `recordVibeLogEventFile`, and `SUPPORTED_EVENT_TYPES`.
- [ ] Implement required-field validation for each event type.
- [ ] Implement append behavior for entry sections.
- [ ] Implement replace behavior for `handoff_updated`.
- [ ] Implement CLI args: `--event`, `--log`, and optional `--json`.
- [ ] Run `node --test test/record-vibelog-event.test.mjs`.
- [ ] Expected result: pass.

## Task 3: Docs

- [ ] Add English and Chinese recorder guides.
- [ ] Add `skills/vibelog/references/vibe-event-format.md`.
- [ ] Link the new docs from `README.md`.

## Task 4: Records And Reports

- [ ] Use the new recorder or direct VibeLog update to record Slice 5 execution.
- [ ] Regenerate root `vibe-log.json`.
- [ ] Create bilingual Slice 5 reports.
- [ ] Progress snapshot should move to `15 / 100` only after implementation is verified.

## Task 5: Final Verification And Commit

- [ ] Run `node --test`.
- [ ] Run `node scripts/validate-vibelog.mjs vibe-log.json`.
- [ ] Run `node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check`.
- [ ] Run `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`.
- [ ] Run `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check`.
- [ ] Run `git diff --check`.
- [ ] Commit locally with message `Implement VibeLog recorder core`.
- [ ] Do not push.
