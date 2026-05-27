# Live Hook Verification Guide

This guide verifies that the Claude Code hook adapter can run through a local Claude Code hook configuration and update a scratch VibeLog.

## Safety Boundary

- Uses a scratch workspace only.
- Writes only local `.claude/settings.json` inside the scratch workspace.
- Does not modify global Claude Code settings.
- Does not push to GitHub.
- Does not upload project source.
- Uses a small `--max-budget-usd` cap for live Claude Code runs.

## Prerequisites

```powershell
claude --version
node --version
```

The verifier is designed around Claude Code hooks. Check the current official hook documentation before turning this into a real project install:

```txt
https://code.claude.com/docs/en/hooks
```

## Fixture Verification

Run the local command-path verifier without calling Claude:

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\claude-live-hook-test" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

For stream-first verification, add `--event-mode stream`:

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\claude-live-hook-test" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream
```

Expected result:

- `fixture.fixturePassed` is `true`.
- `commandsRun` includes `UserPromptSubmit`, `PostToolUse`, and `Stop`.
- Scratch `vibe-log.md` and `vibe-log.json` are updated.
- In stream mode, `fixture.eventStreamExists` is `true`, `fixture.streamEventCount` is `4`, and `fixture.markdownUpdatedBeforeConsume` is `false`.

## Live Verification

Run a tiny Claude Code session only when live verification is explicitly desired:

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\claude-live-hook-test-live" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --live --prompt "Build a tiny scratch verification note. Do not use tools." --max-budget-usd 0.05 --timeout-ms 120000
```

Expected result:

- `live.attempted` is `true`.
- `live.passed` is `true`.
- `hookResponses` includes a successful `Stop` hook.
- Scratch `vibe-log.md` contains `Claude Code hook event captured`.
- In stream mode, `live.eventStreamExists` is `true`, `live.streamEventCount` is greater than `0`, and `live.markdownUpdatedBeforeConsume` is `false`.

The verifier uses Claude Code `stream-json` output with `--include-hook-events`, so it can judge the hook lifecycle directly instead of guessing from plain text output.

## Failure Interpretation

- `spawn claude ENOENT`: Claude Code is not available on the process path.
- `Exceeded USD budget`: the budget cap is too low for the current model/session.
- `authentication_failed`: Claude Code loaded settings and may have run early hooks, but the model turn could not complete; treat this as a partial runtime probe, not a completed live verification.
- No hook responses: settings were not loaded, failed validation, or hooks are disabled.
- Hook response records `0 event(s)` for `UserPromptSubmit`: this can be valid when the prompt is ordinary chat rather than an engineering execution prompt.

## What This Proves

This slice proves the adapter can run from a generated local Claude Code settings file, receive hook JSON through stdin, call the recorder core, and update VibeLog files in a scratch workspace.

With `--event-mode stream`, it also proves the stream-first path can accumulate events before recorder consumption. A full live pass additionally requires an authenticated Claude Code session that reaches `Stop` or `SessionEnd`.

It does not install hooks into a real user project by default.
