# Claude Code Hooks Adapter Notes

Use this reference when implementing a Claude Code adapter for automatic VibeLog updates.

Check current Claude Code hook docs before final implementation because hook schemas can evolve:

```txt
https://code.claude.com/docs/en/hooks
```

## Goal

Make VibeLog update automatically while the user vibes naturally.

The adapter should not replace the VibeLog skill. It should call a deterministic updater that writes `vibe-log.md` first and regenerates `vibe-log.json` second.

## Recommended Events

### SessionStart

Purpose:

- locate `vibe-log.md`
- extract concise context
- add current idea, status, next actions, and important constraints to Claude's context

Do not load the entire log unless it is short.

### UserPromptSubmit

Purpose:

- classify the prompt
- record exact engineering execution prompts when the prompt asks Claude to build, edit, debug, test, refactor, deploy, inspect files, run commands, or write implementation docs
- distill ordinary idea chat into idea evolution, decisions, or open questions

Do not dump every chat message into `Execution Prompts`.

### PostToolUse

Purpose:

- record file edits
- record shell commands and useful command output summaries
- record test and verification evidence
- add changed artifacts to `Artifact Index` when useful

Post-tool hooks can observe what happened, but they should not invent why it happened.

### Stop

Purpose:

- summarize the turn
- update `Implementation Status`
- update `Handoff State`
- append `Vibe Progress`
- regenerate `vibe-log.json`

If tests failed or handoff is incomplete, the hook may request continuation depending on the environment's hook semantics.

### PreCompact

Purpose:

- preserve essential current context before compaction
- make sure `Handoff State` is current

### PostCompact

Purpose:

- note compaction if useful
- refresh minimal handoff context

## Updater Contract

The hook scripts should call one updater command with an event payload:

```txt
vibelog-updater --event <event-name> --payload <json-file-or-stdin>
```

The updater should:

1. read hook JSON from stdin or a temp file
2. locate the project root
3. read `vibe-log.md`
4. classify the event
5. append or update only relevant sections
6. preserve previous history
7. redact secrets
8. write `vibe-log.md`
9. regenerate `vibe-log.json`
10. emit a concise status message

## Privacy Rules

Default public projection:

```txt
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
```

Never write secrets, tokens, credentials, private keys, or private personal data into either Markdown or JSON.

If a prompt contains secrets, redact only the sensitive part and set `recording_mode: redacted`.

## Minimal Viable Adapter

First implementation should support:

- `UserPromptSubmit`
- `PostToolUse`
- `Stop`

Add `SessionStart` after the updater can produce concise context safely.

Add `PreCompact` and `PostCompact` after the basic loop is reliable.

## Current Local Adapter

This repository now includes the first local adapter:

```powershell
node scripts/claude-code-hook-adapter.mjs --log vibe-log.md --json vibe-log.json --event-dir .vibelog-events
```

The adapter reads Claude Code hook JSON from stdin. For local fixture testing, pass `--input hook.json`.

Useful commands:

```powershell
node scripts/claude-code-hook-adapter.mjs --input hook.json --print-events
node scripts/claude-code-hook-adapter.mjs --input hook.json --log vibe-log.md --json vibe-log.json --event-dir .vibelog-events
node --test test/claude-code-hook-adapter.test.mjs
```

Example settings live at:

```txt
skills/vibelog/assets/claude-code-hooks.settings.example.json
```

Do not copy the example settings into a real project without reviewing paths and confirming that local automatic recording is desired.

## Scratch Live Verifier

Slice 7 adds a scratch-local verifier that creates local `.claude/settings.json`, runs fixture hook payloads through the real adapter command path, and optionally launches a tiny Claude Code session:

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\claude-live-hook-test-live" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --live --prompt "Reply with OK. Do not use tools." --max-budget-usd 0.05
```

The live verifier uses Claude Code `stream-json` output with `--include-hook-events` so it can confirm that hook responses happened. It still does not install hooks into a real project or modify global settings.

## Opt-In Project Install Generator

Slice 8 adds a safer project-local settings generator:

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

The generator is dry-run by default. It reports the generated settings without writing files. Add `--write` only after reviewing the output. It writes only `<project>/.claude/settings.json`, preserves unrelated settings, avoids duplicate VibeLog hook commands, and blocks write mode when `vibe-log.md` is missing unless `--allow-missing-log` is provided.

## Success Test

A fresh agent should be able to read the generated VibeLog and answer:

- what is being built
- how the idea changed
- what the human decided
- what prompts drove engineering work
- what changed in files or artifacts
- what validation is planned
- what verification evidence exists
- what is next

If the log cannot answer these, the adapter is not done.
