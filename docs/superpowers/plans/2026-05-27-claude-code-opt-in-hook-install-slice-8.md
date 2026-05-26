# Claude Code Opt-In Hook Install Slice 8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a safe dry-run-first generator for project-local Claude Code VibeLog hook settings.

**Architecture:** Add one focused Node.js ESM CLI that generates and optionally writes `<project>/.claude/settings.json`. The CLI performs safety checks, merges existing settings, preserves unrelated entries, and only writes when `--write` is explicitly provided.

**Tech Stack:** Node.js ESM, built-in `node:test`, existing Claude Code adapter, existing VibeLog exporter/validator.

---

## File Structure

- Create: `scripts/configure-claude-code-vibelog-hooks.mjs`
- Create: `test/configure-claude-code-vibelog-hooks.test.mjs`
- Create: `docs/guides/claude-code-opt-in-install.md`
- Create: `docs/guides/claude-code-opt-in-install.zh.md`
- Create: `docs/reports/slice-8-opt-in-hook-install-report.md`
- Create: `docs/reports/slice-8-opt-in-hook-install-report.zh.md`
- Modify: `README.md`
- Modify: `docs/guides/claude-code-adapter.md`
- Modify: `docs/guides/claude-code-adapter.zh.md`
- Modify: `skills/vibelog/references/claude-code-hooks-adapter.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Task 1: Red Tests

- [x] Create generator tests.
- [x] Test dry-run does not write `.claude/settings.json`.
- [x] Test write mode creates project-local settings when `vibe-log.md` exists.
- [x] Test existing settings are preserved and duplicate VibeLog hook commands are avoided.
- [x] Test unsafe global `.claude` paths are rejected.
- [x] Run `node --test test/configure-claude-code-vibelog-hooks.test.mjs`.
- [x] Expected: fail because the generator script does not exist.

## Task 2: Generator Implementation

- [x] Create `scripts/configure-claude-code-vibelog-hooks.mjs`.
- [x] Export `buildHookSettings`, `configureClaudeCodeVibeLogHooks`, and `parseArgs`.
- [x] Implement dry-run as the default.
- [x] Implement `--write`, `--project`, `--adapter`, and `--allow-missing-log`.
- [x] Implement project-local safety checks and global `.claude` rejection.
- [x] Implement existing settings merge and duplicate command avoidance.
- [x] Run the targeted test until green.

## Task 3: CLI Verification

- [x] Run dry-run CLI against `C:\Users\HXW\Documents\vibelog-scratch\slice-8-install-test`.
- [x] Run write CLI against a scratch project containing `vibe-log.md`.
- [x] Confirm settings are written only under the scratch project.
- [x] Confirm missing `vibe-log.md` blocks write mode by default.

## Task 4: Docs And Report

- [x] Add bilingual opt-in install guide.
- [x] Update README and Claude adapter references.
- [x] Add bilingual Slice 8 report.
- [x] Update root VibeLog and regenerate JSON.

## Task 5: Final Verification And Commit

- [x] Run `node --test`.
- [x] Run `node scripts/validate-vibelog.mjs vibe-log.json`.
- [x] Run `node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check`.
- [x] Run `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`.
- [x] Run `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check`.
- [x] Run `git diff --check`.
- [x] Run placeholder scan for Slice 8 design, plan, guide, and report files.
- [ ] Commit locally with message `Add Claude Code opt-in hook installer`.
- [ ] Do not push.
