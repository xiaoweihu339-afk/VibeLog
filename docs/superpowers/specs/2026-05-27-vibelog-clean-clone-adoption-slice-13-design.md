# VibeLog Clean Clone Adoption Slice 13 Design

Date: 2026-05-27

## Goal

Verify that a fresh local clone of the VibeLog repository can run the clone-local package entry and complete the ordinary project adoption workflow.

## Why This Slice Exists

Slice 12 proved that `npm run vibelog` works inside the current working tree. That is useful, but it does not prove that another user or agent can start from a clean repository copy.

Slice 13 turns the package path into adoption evidence: clone the repository into a scratch directory, run the package entry from that clone, initialize a separate target project, preview hooks, write hooks, verify readiness, disable hooks, and confirm global Claude Code settings are unchanged.

## Scope

In scope:

- Add a clean clone adoption verifier script.
- Add automated tests for the verifier and CLI output.
- Use a scratch directory outside the repository.
- Run `git clone --local --no-hardlinks` from the source repository.
- Run the VibeLog package entry from the clean clone with `npm run vibelog`.
- Verify `init`, `enable-hooks` dry-run, `enable-hooks --write`, `verify`, and `disable-hooks`.
- Check that dry-run does not create settings.
- Check that global Claude Code settings are unchanged.
- Add bilingual Slice 13 report.
- Update README and root VibeLog.

Out of scope:

- Pushing to GitHub.
- Publishing to npm.
- Installing a global command.
- Running live Claude Code.
- Testing every possible user project shape.

## Architecture

Add `scripts/verify-clean-clone-adoption.mjs`.

The verifier creates a unique run directory under the requested workspace:

```txt
<workspace>/
`-- run-<unique>/
    |-- vibelog-clean-clone/
    `-- target-project/
```

It runs package commands from `vibelog-clean-clone` and points `--project` to `target-project`. The hook adapter path also comes from the clean clone, not the original working tree.

## Safety Rules

- The verifier writes only inside the provided scratch workspace.
- The target project is separate from the clean clone.
- Dry-run must not create `.claude/settings.json`.
- Write mode may create only `<target-project>/.claude/settings.json`.
- Global Claude Code settings are fingerprinted before and after verification.
- The verifier does not push, publish, or upload data.

## Testing Design

Individual checks:

- The verifier function creates a clean clone and target project.
- The package help command prints `vibelog-project`.
- `init` creates valid `vibe-log.md` and `vibe-log.json`.
- dry-run does not write target settings.
- write mode writes target settings.
- `verify` reports `ready: true` before disable.
- `disable-hooks` removes three VibeLog hook commands.
- global Claude Code settings remain unchanged.

Combined checks:

- The script CLI prints JSON and exits 0 when the clean clone workflow passes.
- Full `node --test` passes with the new verifier tests included.

## Acceptance Criteria

- `node --test test\verify-clean-clone-adoption.test.mjs` passes.
- `node scripts\verify-clean-clone-adoption.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-13-clean-clone-adoption"` exits 0 and returns `"passed": true`.
- `node --test` passes.
- Root VibeLog is updated and JSON is in sync.
- No GitHub push or npm publish occurs.

## Progress Snapshot Target

- Project Progress: 34 / 100
- Change This Task: +3
- Current Phase: clean clone adoption verification
- Next Unlock: installer/package-manager design or stronger schema validation
- Main Risk: the verification uses a local clone path, not a remote clone or public package registry
- Confidence: medium-high
