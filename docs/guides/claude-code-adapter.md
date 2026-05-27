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

Append to a local event stream without updating VibeLog immediately:

```powershell
node scripts/claude-code-hook-adapter.mjs --input hook.json --event-stream .vibelog-events/session.jsonl
```

Then consume the stream through the recorder core:

```powershell
node scripts/record-vibelog-event.mjs --events .vibelog-events/session.jsonl --log vibe-log.md --json vibe-log.json
```

When used by Claude Code hooks, omit `--input`; the adapter reads hook JSON from stdin.

Use direct record mode for small local experiments. Prefer event stream mode when multiple hook invocations should be reviewed, batched, or replayed before writing `vibe-log.md`.

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
- Event stream mode writes JSONL only; it does not modify `vibe-log.md` or `vibe-log.json` until the recorder consumes the stream.

## Example Settings

See:

```txt
skills/vibelog/assets/claude-code-hooks.settings.example.json
```

Copy the relevant commands into your Claude Code settings only after reviewing paths for your local project.

For safer project-local setup, prefer the dry-run-first generator:

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

Add `--write` only after reviewing the generated settings.

## Verification

Run:

```powershell
node --test test/claude-code-hook-adapter.test.mjs
node --test
```

The focused adapter test covers:

- individual hook-to-event mapping
- direct record mode
- event stream append mode
- multiple hook inputs accumulated into one JSONL stream and consumed by the recorder

For scratch-local live verification, run:

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\claude-live-hook-test-live" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --live --prompt "Reply with OK. Do not use tools." --max-budget-usd 0.05
```

See [Live Hook Verification](live-hook-verification.md).

For project-local setup, see [Claude Code Opt-In Install](claude-code-opt-in-install.md).

## Current Limits

- This is fixture-verified and scratch-live verified, but not installed into a real user project by default.
- Event stream mode is fixture-verified; live hook verification still uses the reviewed project-local command path and should be updated separately if stream-first hooks become the default.
- `Stop` handoff is conservative and does not inspect the whole repository.
- More nuanced idea extraction should be added later after deterministic prompt/tool/test capture is stable.
