# Claude Code Opt-In Hook Install Slice 8 Design

## Goal

Create the first safe adoption path for enabling VibeLog Claude Code hooks in a real project without touching global Claude Code settings.

## Product Rationale

Slice 7 proved the hook chain in a scratch workspace. Slice 8 turns that proof into a reusable project-level adoption step. A user should be able to inspect the planned `.claude/settings.json` change before writing anything, then explicitly opt in when ready.

## Code Principle

Keep the implementation simple, safe, and functional:

- simple: one generator script, one test file, one guide
- safe: dry-run by default, project-local settings only, no global settings, no push, no upload
- functional: generate valid VibeLog hook settings and refuse unsafe writes

## Non-Goals

- Do not install hooks globally.
- Do not run a live Claude Code session in this slice.
- Do not edit unrelated Claude settings outside the target project.
- Do not add package publishing or marketplace packaging.
- Do not build the VibeHub website.

## Architecture

```txt
real project path
  -> safety checks
  -> generated hook command
  -> merged project .claude/settings.json preview
  -> optional --write
  -> existing adapter / recorder chain
```

The generator should preserve unrelated existing settings. It should add VibeLog hooks for `UserPromptSubmit`, `PostToolUse`, and `Stop` without duplicating the same command.

## Generator Behavior

`scripts/configure-claude-code-vibelog-hooks.mjs` should:

1. accept `--project <path>` and `--adapter <path>`
2. default to dry-run mode
3. require `--write` before writing files
4. reject writes when `vibe-log.md` is missing unless `--allow-missing-log` is provided
5. reject global `.claude` paths
6. create or merge project `.claude/settings.json`
7. preserve unrelated existing settings and hooks
8. report target paths, readiness, warnings, and whether a write happened

## Settings Shape

Generated hooks should call the existing adapter:

```powershell
node <adapter> --log <project-vibe-log> --json <project-vibe-json> --event-dir <project-event-dir>
```

On Windows, generated hook entries should include `shell: "powershell"` and use `$env:CLAUDE_PROJECT_DIR` paths. On other platforms, they should use `$CLAUDE_PROJECT_DIR` paths.

## Safety Rules

- Dry-run must not create `.claude/settings.json`.
- Write mode must only write under `<project>/.claude/settings.json`.
- Existing non-VibeLog settings must survive a merge.
- Existing VibeLog hook entries must not be duplicated.
- Missing `vibe-log.md` should block writes by default because the hook would otherwise update an unexpected empty target.

## Acceptance Criteria

- Tests fail before the generator exists.
- Tests pass after implementation.
- Dry-run returns generated settings and does not write files.
- Write mode creates project-local `.claude/settings.json` when `vibe-log.md` exists.
- Existing settings are preserved and duplicate VibeLog hooks are avoided.
- Unsafe global `.claude` target paths are rejected.
- Bilingual install guide and Slice 8 report are added.
- Root VibeLog records the task, verification, and progress snapshot.

## Progress Expectation

If the generator, guide, tests, and report pass full verification, project progress moves from `20 / 100` to `22 / 100`.
