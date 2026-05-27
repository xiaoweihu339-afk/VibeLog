# Claude Code Real Project Opt-In Slice 10 Design

Date: 2026-05-27

## Goal

Verify that the VibeLog Claude Code opt-in hook path works inside a realistic project-local workspace without editing global Claude Code settings.

## Why This Slice Exists

Slice 8 proved that VibeLog can generate project-local hook settings. Slice 7 proved that hook payloads can update a scratch VibeLog through the adapter. Slice 10 connects those two paths: a real project-like folder opts in, writes local settings, and then the generated settings command updates `vibe-log.md` and `vibe-log.json`.

This is necessary before packaging or recommending the workflow to normal users.

## Scope

In scope:

- Create a scratch project outside this repository.
- Include ordinary project files such as `package.json`, source, and tests.
- Keep the scratch source outside this repository.
- Run the existing opt-in settings generator in dry-run mode.
- Run the generator in explicit write mode.
- Read the generated project-local `.claude/settings.json`.
- Execute the generated hook command with representative Claude hook payloads.
- Verify that `vibe-log.md`, `vibe-log.json`, and `.vibelog-events/` update inside the scratch project.
- Record bilingual evidence and the root VibeLog update.

Out of scope:

- Installing hooks into global Claude Code settings.
- Running a full paid Claude Code live session by default.
- Adding website features.
- Packaging VibeLog for public distribution.

## Architecture

Add a focused verifier script:

```txt
scripts/verify-claude-code-opt-in-project.mjs
```

The script creates or refreshes a scratch project, calls `configureClaudeCodeVibeLogHooks`, inspects the generated settings, executes hook commands from those settings with `CLAUDE_PROJECT_DIR` set, and validates the resulting VibeLog.

The verifier is intentionally not a daemon and not a background installer. It is an acceptance test harness for the safe adoption path.

## Safety Rules

- The default workspace is under `C:\Users\HXW\Documents\vibelog-scratch\slice-10-real-project-opt-in`.
- The verifier refuses global Claude settings paths through the existing generator guard.
- The verifier must only write inside the selected scratch project.
- The repository stores only the verifier, tests, reports, and VibeLog records.
- No push is performed.

## Testing Design

Individual checks:

- Dry-run does not create `.claude/settings.json`.
- Write mode creates only `<project>/.claude/settings.json`.
- Generated settings include `UserPromptSubmit`, `PostToolUse`, and `Stop`.
- Generated command uses `CLAUDE_PROJECT_DIR`.
- Hook events update Markdown, JSON, and event files.

Combined check:

- One command creates a scratch project, installs project-local hooks, runs representative prompt/tool/test/stop events through the generated settings command, and verifies the exported VibeLog is valid.

## Acceptance Criteria

- `node --test test\verify-claude-code-opt-in-project.test.mjs` passes.
- `node scripts\verify-claude-code-opt-in-project.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-10-real-project-opt-in" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"` returns a passing JSON result.
- `node --test` passes.
- Root `vibe-log.md` and `vibe-log.json` are updated and in sync.
- A bilingual Slice 10 report exists.

## Progress Snapshot Target

- Project Progress: 25 / 100
- Change This Task: +2
- Current Phase: real-project opt-in acceptance
- Next Unlock: package/install path for normal users
- Main Risk: this validates generated hook commands with fixture payloads, not a full live Claude Code paid session by default
- Confidence: medium
