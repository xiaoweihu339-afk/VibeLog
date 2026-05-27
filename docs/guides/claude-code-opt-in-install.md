# Claude Code Opt-In Install Guide

This guide shows how to safely enable VibeLog recording for a real Claude Code project.

## Safety Model

- Project-local only: writes `<project>/.claude/settings.json`.
- Dry-run by default.
- Requires explicit `--write` to change files.
- Does not edit global Claude Code settings.
- Does not push to GitHub.
- Does not upload source code.
- Blocks write mode when `vibe-log.md` is missing unless `--allow-missing-log` is provided.

## Before You Start

Confirm the target project has a VibeLog:

```powershell
Test-Path C:\path\to\project\vibe-log.md
```

Confirm Claude Code is installed:

```powershell
claude --version
```

Check the current official Claude Code hook docs before using this in a public or shared project:

```txt
https://docs.anthropic.com/en/docs/claude-code/hooks
```

## Dry Run

Preview the settings that would be generated:

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

Expected result:

- `dryRun` is `true`.
- `wrote` is `false`.
- `settingsPath` is inside the target project.
- `generatedSettings.hooks` includes `UserPromptSubmit`, `PostToolUse`, and `Stop`.

To preview stream-first hooks that append JSONL events before VibeLog is updated:

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream
```

## Write Project Settings

After reviewing the dry-run output:

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --write
```

Use `--event-mode stream --write` only after reviewing that the generated hook command writes to `.vibelog-events/session.jsonl`.

Expected result:

- `dryRun` is `false`.
- `wrote` is `true`.
- `<project>/.claude/settings.json` exists.
- Existing unrelated settings remain preserved.

## Verify After Install

Inspect the generated settings:

```powershell
Get-Content C:\path\to\project\.claude\settings.json
```

Then run a tiny Claude Code session inside the target project and inspect `vibe-log.md` afterward. Do this only after you are comfortable with the generated settings.

For stream-first hooks, consume the local event stream after hook events are produced:

```powershell
node scripts/record-vibelog-event.mjs --events C:\path\to\project\.vibelog-events\session.jsonl --log C:\path\to\project\vibe-log.md --json C:\path\to\project\vibe-log.json
```

## Rollback

Remove only the VibeLog hook groups from:

```txt
<project>/.claude/settings.json
```

If the file was created only for VibeLog and contains no other settings, deleting it is enough.

## What This Does Not Do

- It does not install globally.
- It does not run Claude Code automatically.
- It does not publish or upload VibeLog data.
- It does not make private ideas public.

## Troubleshooting

- `Missing vibe-log.md`: create or copy a VibeLog before writing hooks.
- `Refusing to configure global Claude settings path`: choose a real project folder, not `~/.claude`.
- Hook appears not to run: use Claude Code `stream-json` output with `--include-hook-events` to inspect hook lifecycle events.
- Stream-first hooks produce events but VibeLog does not change: run the recorder `--events` command against `.vibelog-events/session.jsonl`.
