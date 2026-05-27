# VibeLog Release Bundle Slice 20 Design

Date: 2026-05-27

## Goal

Add a scratch-only release bundle verifier that proves a clean extracted VibeLog package can be consumed outside the working repository.

## Why This Step Matters

S13 verified clone-local adoption. S17-S19 verified installer dry-run, rollback, and backup/restore safety inside scratch targets. S20 connects those paths through a downloadable-package shape: if someone receives a clean archive, the skill, CLI, and safety verifiers should still work together before any GitHub push, release, or npm publish is considered.

## Scope

Included:

- Add `scripts/verify-release-bundle.mjs`.
- Add `test/verify-release-bundle.test.mjs`.
- Expose a private npm script and bin entry for release bundle verification.
- Verify `npm pack` output from a scratch directory without publishing.
- Extract the `.tgz` and run VibeLog CLI adoption plus installer safety verifiers from the extracted package.
- Update distribution gates, README, bilingual plan/report docs, and VibeLog.

Excluded:

- No GitHub push.
- No GitHub release creation.
- No npm publish.
- No global installer.
- No user-visible installer write mode.
- No global Claude Code or Codex settings edits.

## Behavior

The verifier runs `npm pack --json --pack-destination <scratch-root>`, extracts the generated `.tgz`, checks required package paths, confirms forbidden paths are absent, initializes a consumer project, previews and writes project-local hooks inside scratch only, verifies readiness, disables hooks, then runs the rollback and backup/restore verifiers from the extracted package.

## Acceptance Criteria

- Release bundle verifier tests pass.
- Package metadata exposes the verifier entrypoint.
- Required skill, script, docs, and package files are present in the bundle.
- `.git`, `node_modules`, and test sources are absent from the bundle.
- The extracted package can initialize and verify a consumer project.
- Installer rollback and backup/restore verifiers pass from the extracted package.
- Full `node --test` passes.
- VibeLog JSON validates and matches Markdown.
- No push or publish occurs.

## Progress Snapshot

- Project Progress: 51 / 100
- Change This Task: +3
- Current Phase: distribution readiness and release safety
- Next Unlock: push milestone review or user-visible installer write-mode design
- Main Risk: release-bundle verification is local and scratch-only; public release still needs license, final release notes, and explicit approval
- Confidence: high
