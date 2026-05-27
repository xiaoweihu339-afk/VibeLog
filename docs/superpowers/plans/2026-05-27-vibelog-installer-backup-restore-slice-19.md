# VibeLog Installer Backup/Restore Slice 19 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development before implementation and superpowers:verification-before-completion before reporting completion. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a scratch-only verifier that proves existing installer targets can be backed up, overwritten in a simulation, and restored exactly.

**Architecture:** Keep the public installer dry-run-only. Add a separate verifier script that seeds an existing scratch target, snapshots it, backs up installer operation targets, simulates install copy operations, restores backups, and compares the final target to the original snapshot.

**Tech Stack:** Node.js ESM, `node:test`, JSON, Markdown.

---

## Files

- Create: `scripts/verify-installer-backup-restore.mjs`
- Create: `test/vibelog-installer-backup-restore.test.mjs`
- Modify: `package.json`
- Modify: `test/vibelog-package.test.mjs`
- Modify: `docs/distribution/vibelog-distribution-plan.json`
- Modify: `test/vibelog-distribution-plan.test.mjs`
- Modify: `docs/guides/vibelog-installer-dry-run.md`
- Modify: `docs/guides/vibelog-installer-dry-run.zh.md`
- Modify: `docs/guides/vibelog-installer-package-manager-plan.md`
- Modify: `docs/guides/vibelog-installer-package-manager-plan.zh.md`
- Create: `docs/reports/slice-19-installer-backup-restore-report.md`
- Create: `docs/reports/slice-19-installer-backup-restore-report.zh.md`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] Write failing backup/restore verifier tests.
- [x] Run targeted test and confirm it fails because `scripts/verify-installer-backup-restore.mjs` is missing.
- [x] Implement scratch-only backup/restore verifier.
- [x] Run targeted backup/restore verifier tests and confirm they pass.
- [x] Add private package entries for the verifier.
- [x] Update distribution plan and package metadata tests.
- [x] Update bilingual guides, reports, README, and root VibeLog.
- [x] Run isolated verification.
- [x] Run flow verification.
- [ ] Commit locally without pushing.

## Verification Commands

```powershell
node --test test\vibelog-installer-backup-restore.test.mjs
node --test test\vibelog-installer-backup-restore.test.mjs test\vibelog-installer-rollback.test.mjs test\vibelog-installer-dry-run.test.mjs test\vibelog-package.test.mjs test\vibelog-distribution-plan.test.mjs
node scripts\verify-installer-backup-restore.mjs --scratch-root "C:\Users\HXW\Documents\vibelog-scratch\slice-19-installer-backup-restore"
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
node --test
git diff --check
```
