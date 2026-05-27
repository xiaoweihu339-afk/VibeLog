# VibeLog Packaging Slice 12 Design

Date: 2026-05-27

## Goal

Make the local VibeLog adoption CLI easier to discover and invoke after a user clones the repository, without publishing a public package yet.

## Why This Slice Exists

Slice 11 created the ordinary project adoption CLI, but users still need to know the exact script path. S12 adds a minimal package boundary: package metadata, a bin entry, npm scripts, help output, and bilingual install guidance.

This keeps the project in a safe pre-release state while reducing first-use friction.

## Scope

In scope:

- Add `package.json` with `type`, `bin`, and scripts.
- Add a shebang and help output to `scripts/vibelog-project.mjs`.
- Verify package metadata points to an executable CLI file.
- Verify `node scripts/vibelog-project.mjs --help` and `npm run vibelog -- --help`.
- Add bilingual install/distribution guide.
- Add bilingual Slice 12 report.
- Update README and root VibeLog.

Out of scope:

- Publishing to npm.
- Global install instructions as the primary path.
- Editing global Claude Code settings.
- Website or marketplace distribution.

## Architecture

`package.json` exposes:

```json
{
  "bin": {
    "vibelog-project": "./scripts/vibelog-project.mjs"
  },
  "scripts": {
    "test": "node --test",
    "vibelog": "node scripts/vibelog-project.mjs"
  }
}
```

The bin points to the existing project adoption CLI. The npm script provides a clone-local invocation path before public packaging.

## Safety Rules

- The package is marked private for now.
- No publish step is added.
- Help output must state that commands are project-local and do not push or upload.
- Existing VibeLog principles remain unchanged.

## Testing Design

Individual checks:

- `package.json` parses and exposes `vibelog-project`.
- The bin file exists and has a Node shebang.
- `node scripts/vibelog-project.mjs --help` prints usage text.
- `npm run vibelog -- --help` prints the same command family.

Combined check:

- Full `node --test` passes with packaging tests included.

## Acceptance Criteria

- `node --test test\vibelog-package.test.mjs` passes.
- `npm run vibelog -- --help` exits 0 and prints `vibelog-project`.
- `node --test` passes.
- Root VibeLog is updated and JSON is in sync.

## Progress Snapshot Target

- Project Progress: 31 / 100
- Change This Task: +3
- Current Phase: packaging and install distribution
- Next Unlock: clean clone adoption verification
- Main Risk: this is still clone-local packaging, not a public release or global install path
- Confidence: medium-high
