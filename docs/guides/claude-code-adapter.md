# Claude Code Adapter Guide

The Claude Code adapter converts Claude Code hook JSON input into Vibe Event JSON, then records those events through the VibeLog recorder core.

## Command

Print mapped events without writing files:

```powershell
node scripts/claude-code-hook-adapter.mjs --input hook.json --print-events
```

Record into VibeLog:

```powershell
node scripts/claude-code-hook-adapter.mjs --input hook.json --log vibe-log.md --json vibe-log.json --event-dir .vibelog-events
```

When used by Claude Code hooks, omit `--input`; the adapter reads hook JSON from stdin.

## Supported Hook Events

- `UserPromptSubmit`: records engineering execution prompts as `prompt_submitted`.
- `PostToolUse`: records test commands as `test_ran`; records other tool use as `tool_used`.
- `Stop`: records a conservative `handoff_updated` event.

## Safety Defaults

- No upload.
- No GitHub push.
- No automatic hook installation.
- Secret-like values are redacted before writing Vibe Events.
- Ordinary idea chat is ignored in this first adapter version.

## Example Settings

See:

```txt
skills/vibelog/assets/claude-code-hooks.settings.example.json
```

Copy the relevant commands into your Claude Code settings only after reviewing paths for your local project.

## Verification

Run:

```powershell
node --test test/claude-code-hook-adapter.test.mjs
node --test
```

For scratch-local live verification, run:

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\claude-live-hook-test-live" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --live --prompt "Reply with OK. Do not use tools." --max-budget-usd 0.05
```

See [Live Hook Verification](live-hook-verification.md).

## Current Limits

- This is fixture-verified and scratch-live verified, but not installed into a real user project by default.
- `Stop` handoff is conservative and does not inspect the whole repository.
- More nuanced idea extraction should be added later after deterministic prompt/tool/test capture is stable.
