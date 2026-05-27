# VibeLog Installer Rollback Slice 18 Design

Date: 2026-05-27

## Goal

Add a scratch-only rollback verifier for the VibeLog installer path. The verifier proves that planned installer writes can be copied into a temporary target and removed again before any user-visible installer write mode exists.

## Why This Step Matters

S17 proved install planning. S18 proves reversibility in a controlled scratch target. This is the safety gate between "we can describe install work" and "we may later allow install work outside the repository."

## Scope

Included:

- Add `scripts/verify-installer-rollback.mjs`.
- Add `test/vibelog-installer-rollback.test.mjs`.
- Expose a private npm script for rollback verification.
- Keep `scripts/vibelog-install.mjs --write` refused.
- Update distribution gates, README, bilingual guides, reports, and VibeLog.

Excluded:

- No public installer write mode.
- No global Codex skill directory writes.
- No global Claude Code settings edits.
- No package publish.
- No GitHub push.

## Behavior

The verifier creates or uses a scratch root, creates an `install-root` inside it, copies the planned installer files, verifies key installed paths exist, deletes the scratch install target, and confirms the target no longer exists.

The verifier refuses an existing target. This protects unrelated files inside scratch directories and keeps the first rollback proof limited to content created by the verifier itself.

## Acceptance Criteria

- Targeted rollback verifier tests pass.
- The verifier writes only inside scratch targets.
- The verifier removes the scratch install target after verification.
- Existing scratch targets are refused and preserved.
- The public installer still refuses `--write`.
- Full `node --test` passes.
- VibeLog JSON validates and matches Markdown.

## Progress Snapshot

- Project Progress: 45 / 100
- Change This Task: +3
- Current Phase: safe installer prototyping
- Next Unlock: backup/restore verification or release-bundle verification
- Main Risk: S18 proves rollback for newly created scratch content only, not backup/restore over existing user targets
- Confidence: high
