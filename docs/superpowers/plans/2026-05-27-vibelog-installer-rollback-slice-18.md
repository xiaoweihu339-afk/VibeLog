# VibeLog Installer Rollback Slice 18 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development before implementation and superpowers:verification-before-completion before reporting completion. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a scratch-only verifier that proves VibeLog installer files can be copied into a temporary target and rolled back.

**Architecture:** Keep the public installer dry-run-only. Add a separate verifier script that imports the install plan, copies planned files into a scratch target, removes the target, and reports machine-readable evidence.

**Tech Stack:** Node.js ESM, `node:test`, JSON, Markdown.

---

## Files

- Create: `scripts/verify-installer-rollback.mjs`
- Create: `test/vibelog-installer-rollback.test.mjs`
- Modify: `package.json`
- Modify: `test/vibelog-package.test.mjs`
- Modify: `docs/distribution/vibelog-distribution-plan.json`
- Modify: `test/vibelog-distribution-plan.test.mjs`
- Modify: `docs/guides/vibelog-installer-dry-run.md`
- Modify: `docs/guides/vibelog-installer-dry-run.zh.md`
- Modify: `docs/guides/vibelog-installer-package-manager-plan.md`
- Modify: `docs/guides/vibelog-installer-package-manager-plan.zh.md`
- Create: `docs/reports/slice-18-installer-rollback-report.md`
- Create: `docs/reports/slice-18-installer-rollback-report.zh.md`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] Write failing rollback verifier tests.
- [x] Run targeted test and confirm it fails because `scripts/verify-installer-rollback.mjs` is missing.
- [x] Implement scratch-only rollback verifier.
- [x] Run targeted rollback verifier tests and confirm they pass.
- [x] Add private package entries for the verifier.
- [x] Update distribution plan and package metadata tests.
- [x] Update bilingual guides, reports, README, and root VibeLog.
- [x] Run isolated verification.
- [x] Run combined verification.
- [ ] Commit locally without pushing.

## Verification Commands

```powershell
node --test test\vibelog-installer-rollback.test.mjs
node --test test\vibelog-installer-rollback.test.mjs test\vibelog-installer-dry-run.test.mjs test\vibelog-package.test.mjs test\vibelog-distribution-plan.test.mjs
node scripts\verify-installer-rollback.mjs --scratch-root "C:\Users\HXW\Documents\vibelog-scratch\slice-18-installer-rollback"
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
node --test
git diff --check
```
