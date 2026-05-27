# VibeLog Install and Distribution Guide

This guide describes the current safe distribution path for VibeLog.

VibeLog is not published to npm yet. The supported path in Slice 12 is clone-local usage: clone or copy this repository, install no extra runtime dependencies, and run the local npm script or Node entrypoint.

## Safety Boundary

- The package is marked `private`.
- No `npm publish` path is enabled.
- No command pushes to GitHub.
- No command uploads private project data.
- Hook setup remains project-local and opt-in.
- Claude Code hooks are written only when `--write` is provided.

## Requirements

- Node.js 20 or newer is recommended.
- npm must be available on PATH.
- PowerShell examples assume Windows paths.

Check the local toolchain:

```powershell
node --version
npm --version
```

## Clone-Local Usage

From this repository root:

```powershell
npm run vibelog -- --help
```

Equivalent direct Node entrypoint:

```powershell
node scripts\vibelog-project.mjs --help
```

## Initialize a Project

```powershell
npm run vibelog -- init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
```

Expected result:

- `vibe-log.md` is created in the target project.
- `vibe-log.json` is exported from the Markdown source.
- Existing `vibe-log.md` is not overwritten unless `--force` is provided.

## Preview Hook Setup

```powershell
npm run vibelog -- enable-hooks --project "C:\path\to\project" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

Expected result:

- Settings are printed for review.
- No file is written.
- `dryRun` is `true`.

## Write Project-Local Hooks

```powershell
npm run vibelog -- enable-hooks --project "C:\path\to\project" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --write
```

Expected result:

- `<project>/.claude/settings.json` is written.
- Only project-local settings are changed.
- Existing unrelated settings are preserved.

## Verify and Disable

```powershell
npm run vibelog -- verify --project "C:\path\to\project"
npm run vibelog -- disable-hooks --project "C:\path\to\project"
```

`verify` checks that the Markdown log exists, JSON exists, JSON is valid, Markdown and JSON are in sync, and project-local hooks are enabled.

`disable-hooks` removes only VibeLog hook commands. It leaves the VibeLog files and unrelated Claude Code settings intact.

## Validation Commands

Individual check:

```powershell
node --test test\vibelog-package.test.mjs
```

Combined repository check:

```powershell
node --test
npm run vibelog -- --help
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

## Future Distribution

Later slices can add a clean clone verification script, installer notes, and a real package manager path. Those steps should keep the same principles: Markdown remains the source of truth, JSON is an export, project privacy is default, and publishing or pushing requires explicit human approval.
