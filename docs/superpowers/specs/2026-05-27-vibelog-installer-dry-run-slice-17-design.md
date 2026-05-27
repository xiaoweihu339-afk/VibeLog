# VibeLog Installer Dry-Run Slice 17 Design

Date: 2026-05-27

## Goal

Add a dry-run-only installer prototype that shows how VibeLog would be installed into a user-selected local target without writing any files.

## Why This Slice Exists

Slice 16 made the VibeLog data contract stronger. The next adoption risk is installation safety: ordinary users need to know what an installer would copy, what it would overwrite, and how it could be rolled back before any installer is allowed to write outside the repository.

S17 does not install VibeLog. It creates a machine-readable installation plan, rollback plan, and safety summary so the future installer can be tested before it touches global or user directories.

## Scope

In scope:

- Add `scripts/vibelog-install.mjs` as a dry-run-only installer planner.
- Add package metadata for a private local `vibelog-install` bin and npm script.
- Add tests proving dry-run produces a plan and writes nothing.
- Add tests proving `--write` is refused in S17.
- Update the distribution plan to mark local installer scripts as dry-run prototype, not active.
- Add bilingual S17 docs, plan, and report.
- Update README and root VibeLog.

Out of scope:

- No real install.
- No global Codex skill directory writes.
- No global Claude Code settings edits.
- No uninstall execution.
- No package publishing.
- No GitHub push.

## Architecture

Add `scripts/vibelog-install.mjs` with two interfaces:

```js
createInstallPlan({ sourceRoot, targetRoot })
runInstallDryRun({ sourceRoot, targetRoot })
```

The CLI usage is:

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
npm run vibelog:install -- --target "C:\path\to\install-root"
```

The plan includes:

- `dryRun: true`
- `writesPerformed: false`
- source and target paths
- planned operations for skill files, script helpers, and essential docs
- existing target detection
- rollback instructions
- safety gates and warnings

The script rejects `--write` with a clear error because S17 intentionally does not implement writing.

## Acceptance Criteria

- Installer dry-run tests fail before implementation and pass after implementation.
- Dry-run creates no target files or directories.
- `--write` exits non-zero and explains S17 is dry-run only.
- Package metadata remains private.
- Clone-local remains the only active channel.
- `node --test` passes.
- Root VibeLog validates and JSON stays in sync.
- No push or publish occurs.

## Progress Snapshot Target

- Project Progress: 42 / 100
- Change This Task: +3
- Current Phase: safe installer prototyping
- Next Unlock: rollback/uninstall verification
- Main Risk: S17 proves install planning only; it still does not perform or verify real uninstall
- Confidence: high
