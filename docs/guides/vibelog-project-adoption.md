# VibeLog Project Adoption Guide

This guide is the shortest safe path for using VibeLog in a normal local project.

## Safety Model

- Project-local only.
- No global Claude Code settings edits.
- No GitHub push.
- No upload.
- Hook enablement is dry-run unless `--write` is provided.
- Disable removes only VibeLog hook commands and preserves unrelated settings.

## Initialize VibeLog

```powershell
node scripts\vibelog-project.mjs init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
```

Expected result:

- `vibe-log.md` exists.
- `vibe-log.json` exists.
- JSON is generated from Markdown.

## Preview Hooks

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

Expected result:

- `dryRun` is `true`.
- `wrote` is `false`.
- The generated settings are printed for review.

## Enable Hooks

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --write
```

Expected result:

- `<project>/.claude/settings.json` exists.
- VibeLog hooks are present for `UserPromptSubmit`, `PostToolUse`, and `Stop`.
- Existing unrelated settings are preserved.

## Verify Readiness

```powershell
node scripts\vibelog-project.mjs verify --project "C:\path\to\project"
```

Expected result:

- `ready` is `true`.
- VibeLog JSON is valid.
- Markdown and JSON are in sync.
- Project-local hooks are enabled.

## Disable Hooks

```powershell
node scripts\vibelog-project.mjs disable-hooks --project "C:\path\to\project"
```

Expected result:

- VibeLog hook commands are removed.
- Non-VibeLog settings remain.
- `vibe-log.md` and `vibe-log.json` remain in the project.

## What This Does Not Do

- It does not run Claude Code automatically.
- It does not install a global command.
- It does not publish the project.
- It does not make private ideas public.
