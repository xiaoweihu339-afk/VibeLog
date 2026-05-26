# Claude Code Live Hook Verification Slice 7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and run a safe local verifier for Claude Code hook adapter behavior in a scratch workspace.

**Architecture:** Add `scripts/verify-claude-code-live-hook.mjs` as a focused verifier that creates scratch VibeLog files, writes local `.claude/settings.json`, runs fixture hook payloads through the actual adapter command path, and optionally attempts a tiny real `claude -p` session with `--live`.

**Tech Stack:** Node.js ESM, built-in `node:test`, existing Claude Code adapter, existing recorder/exporter/validator, Claude Code CLI when available.

---

## File Structure

- Create: `scripts/verify-claude-code-live-hook.mjs`
- Create: `test/verify-claude-code-live-hook.test.mjs`
- Create: `docs/guides/live-hook-verification.md`
- Create: `docs/guides/live-hook-verification.zh.md`
- Modify: `README.md`
- Modify: `skills/vibelog/references/claude-code-hooks-adapter.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`
- Create: `docs/reports/slice-7-live-hook-verification-report.md`
- Create: `docs/reports/slice-7-live-hook-verification-report.zh.md`

## Task 1: Red Tests

- [x] Create verifier tests.
- [x] Test local settings generation.
- [x] Test fixture verification updates Markdown and JSON.
- [x] Test live mode is opt-in.
- [x] Run `node --test test/verify-claude-code-live-hook.test.mjs`.
- [x] Expected: fail because verifier script does not exist.

## Task 2: Verifier Implementation

- [x] Create verifier script.
- [x] Export `createScratchVibeLog`, `writeClaudeLocalSettings`, `runFixtureVerification`, and `runLiveVerification`.
- [x] Implement CLI args: `--workspace`, `--adapter`, `--live`, `--prompt`, `--max-budget-usd`.
- [x] Ensure no global settings path is written.
- [x] Run verifier tests until green.

## Task 3: Run Verification

- [x] Run fixture verification in `C:\Users\HXW\Documents\vibelog-scratch\claude-live-hook-test`.
- [x] If Claude CLI is available, run live verification with a tiny prompt and budget cap.
- [x] Record whether live verification passed or was blocked.

## Task 4: Docs And Report

- [x] Add bilingual live hook verification guide.
- [x] Update Claude adapter reference and README.
- [x] Create bilingual Slice 7 report.
- [x] Update root VibeLog and regenerate JSON.

## Task 5: Final Verification And Commit

- [x] Run `node --test`.
- [x] Run `node scripts/validate-vibelog.mjs vibe-log.json`.
- [x] Run `node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check`.
- [x] Run `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`.
- [x] Run `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check`.
- [x] Run `git diff --check`.
- [ ] Commit locally with message `Verify Claude Code live hook path`.
- [ ] Do not push.
