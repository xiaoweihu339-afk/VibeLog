# Claude Code Hook Adapter Slice 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Claude Code hook adapter that maps hook JSON input to Vibe Event JSON and records those events through the recorder core.

**Architecture:** Add `scripts/claude-code-hook-adapter.mjs` as a small ESM CLI/library. It reads hook JSON from stdin or `--input`, maps `UserPromptSubmit`, `PostToolUse`, and `Stop` to Vibe Events, redacts secret-like text, and either prints events or records them through `scripts/record-vibelog-event.mjs`.

**Tech Stack:** Node.js ESM, built-in `node:test`, existing `record-vibelog-event.mjs`, Markdown docs.

---

## File Structure

- Create: `scripts/claude-code-hook-adapter.mjs`
- Create: `test/claude-code-hook-adapter.test.mjs`
- Create: `docs/guides/claude-code-adapter.md`
- Create: `docs/guides/claude-code-adapter.zh.md`
- Create: `skills/vibelog/assets/claude-code-hooks.settings.example.json`
- Modify: `skills/vibelog/references/claude-code-hooks-adapter.md`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`
- Create: `docs/reports/slice-6-claude-code-adapter-report.md`
- Create: `docs/reports/slice-6-claude-code-adapter-report.zh.md`

## Task 1: Red Tests

- [ ] Create `test/claude-code-hook-adapter.test.mjs`.
- [ ] Add tests for UserPromptSubmit, ignored chat prompt, PostToolUse test command, PostToolUse edit/write, Stop, CLI print mode, CLI record mode, and redaction.
- [ ] Run `node --test test/claude-code-hook-adapter.test.mjs`.
- [ ] Expected result: fail because `scripts/claude-code-hook-adapter.mjs` does not exist.

## Task 2: Adapter Implementation

- [ ] Create `scripts/claude-code-hook-adapter.mjs`.
- [ ] Export `mapClaudeHookToVibeEvents`, `runClaudeCodeHookAdapter`, and `redactSecrets`.
- [ ] Implement stdin / `--input` parsing.
- [ ] Implement `--print-events`, `--log`, `--json`, and `--event-dir`.
- [ ] Implement UserPromptSubmit mapping.
- [ ] Implement PostToolUse mapping.
- [ ] Implement Stop mapping.
- [ ] Implement secret redaction.
- [ ] Run adapter-specific tests until green.

## Task 3: Docs And Example Config

- [ ] Add bilingual Claude Code adapter guide.
- [ ] Add example Claude Code settings JSON.
- [ ] Update Claude adapter reference.
- [ ] Update README links and structure.

## Task 4: Records And Reports

- [ ] Record Slice 6 in root VibeLog.
- [ ] Regenerate root JSON.
- [ ] Create bilingual Slice 6 reports.
- [ ] Progress snapshot should move to `18 / 100` after verification.

## Task 5: Final Verification And Commit

- [ ] Run `node --test`.
- [ ] Run `node scripts/validate-vibelog.mjs vibe-log.json`.
- [ ] Run `node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check`.
- [ ] Run `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`.
- [ ] Run `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check`.
- [ ] Run `git diff --check`.
- [ ] Commit locally with message `Implement Claude Code hook adapter`.
- [ ] Do not push.
