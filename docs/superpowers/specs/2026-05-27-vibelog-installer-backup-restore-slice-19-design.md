# VibeLog Installer Backup/Restore Slice 19 Design

Date: 2026-05-27

## Goal

Add a scratch-only backup/restore verifier for existing installer targets. The verifier proves that an existing target with user-owned content can be backed up, overwritten by the installer plan, and restored to its exact pre-install snapshot.

## Why This Step Matters

S18 proved rollback for newly created scratch targets. S19 covers the riskier real-world case: the target already contains user files. Before any installer write mode can exist, VibeLog needs evidence that existing content can be protected and restored.

## Scope

Included:

- Add `scripts/verify-installer-backup-restore.mjs`.
- Add `test/vibelog-installer-backup-restore.test.mjs`.
- Expose a private npm script for backup/restore verification.
- Update distribution gates, README, bilingual guides, reports, and VibeLog.
- Keep the public installer dry-run-only.

Excluded:

- No public installer write mode.
- No writes outside scratch targets.
- No global Codex skill directory writes.
- No global Claude Code settings edits.
- No package publish.
- No GitHub push.

## Behavior

The verifier creates a scratch target with existing user-owned content under every installer operation target. It snapshots that target, backs up the operation targets, simulates installer copy operations, restores the backups, and compares the restored target with the original snapshot.

The verifier also checks that unrelated user content remains present and that installer-created files do not remain after restore.

## Acceptance Criteria

- Backup/restore verifier tests pass.
- The verifier writes only inside scratch targets.
- Existing target content is restored exactly.
- Unrelated user files are preserved.
- New installer files are removed after restore.
- The public installer still refuses `--write`.
- Full `node --test` passes.
- VibeLog JSON validates and matches Markdown.

## Progress Snapshot

- Project Progress: 48 / 100
- Change This Task: +3
- Current Phase: safe installer prototyping
- Next Unlock: release-bundle verification or explicit installer write-mode design
- Main Risk: S19 proves scratch backup/restore only; user-visible write mode still needs approval and a narrower UX design
- Confidence: high
