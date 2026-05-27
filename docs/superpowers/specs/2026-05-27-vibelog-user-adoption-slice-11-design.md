# VibeLog User Adoption Slice 11 Design

Date: 2026-05-27

## Goal

Create the first ordinary-user path for starting VibeLog in a project: initialize a log, preview or enable Claude Code hooks, verify readiness, and disable those hooks safely.

## Why This Slice Exists

Slice 10 proved the project-local hook path works in a realistic scratch project. That still leaves a user-facing gap: a normal user should not need to know the internals of the exporter, hook generator, and verifier scripts before trying VibeLog.

S11 turns the existing pieces into a small adoption command surface while keeping the implementation conservative.

## Scope

In scope:

- Add one user-facing CLI script: `scripts/vibelog-project.mjs`.
- Support `init`, `enable-hooks`, `verify`, and `disable-hooks`.
- Keep `enable-hooks` dry-run by default and require `--write` to modify settings.
- Create a valid `vibe-log.md` and `vibe-log.json` during init.
- Verify log validity, JSON sync, project-local settings, and VibeLog hook presence.
- Remove only VibeLog hook commands during disable, preserving unrelated Claude settings.
- Add bilingual user guide, plan, report, README links, and VibeLog records.

Out of scope:

- Public package publishing.
- Global Claude Code settings edits.
- Automatic paid Claude Code live sessions.
- Website or UI work.

## Architecture

`scripts/vibelog-project.mjs` wraps the lower-level tools:

```txt
init          -> render minimal VibeLog Markdown -> export JSON
enable-hooks  -> configureClaudeCodeVibeLogHooks(...)
verify        -> validate JSON, check drift, inspect project-local settings
disable-hooks -> remove claude-code-hook-adapter.mjs commands from project settings
```

The script outputs JSON for every command so agents and future UI code can read the result.

## Safety Rules

- No command writes outside the target project except reading the adapter path.
- `enable-hooks` is dry-run unless `--write` is provided.
- `init` refuses to overwrite an existing `vibe-log.md` unless `--force` is provided.
- `disable-hooks` removes only commands that include `claude-code-hook-adapter.mjs`.
- The CLI never edits global Claude Code settings.
- The CLI never pushes or uploads data.

## Testing Design

Individual checks:

- `init` creates `vibe-log.md` and `vibe-log.json` and validates the JSON.
- `init` refuses to overwrite an existing log by default.
- `enable-hooks` dry-run does not write settings.
- `enable-hooks --write` creates project-local settings.
- `verify` reports readiness after init and hook enablement.
- `disable-hooks` removes VibeLog hook commands and preserves unrelated settings.

Combined check:

- A temp project can run `init -> enable-hooks --write -> verify -> disable-hooks -> verify` without touching global settings.

## Acceptance Criteria

- `node --test test\vibelog-project.test.mjs` passes.
- `node scripts\vibelog-project.mjs init --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption" --title "Slice 11 Adoption Test" --idea "Verify ordinary users can initialize and manage VibeLog safely."` returns JSON with `created: true`.
- `node scripts\vibelog-project.mjs enable-hooks --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --write` returns JSON with `wrote: true`.
- `node scripts\vibelog-project.mjs verify --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption"` returns JSON with `ready: true`.
- `node scripts\vibelog-project.mjs disable-hooks --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption"` returns JSON with removed hook count greater than zero.
- `node --test` passes.
- Root VibeLog is updated and JSON is in sync.

## Progress Snapshot Target

- Project Progress: 28 / 100
- Change This Task: +3
- Current Phase: ordinary-user adoption path
- Next Unlock: packaging and install distribution
- Main Risk: the CLI is still local-repository based, not yet a packaged command installed globally or through a package manager
- Confidence: medium-high
