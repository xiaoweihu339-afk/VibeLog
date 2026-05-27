# VibeLog Release Bundle Slice 20 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development before implementation and superpowers:verification-before-completion before reporting completion. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a scratch-only verifier that proves a clean extracted VibeLog release bundle can run the adoption CLI and installer safety verifiers.

**Architecture:** Use `npm pack` as the local bundle source, extract the generated `.tgz` to scratch, run commands only from the extracted package, and report explicit safety flags for no push, no publish, and no global settings edits.

**Tech Stack:** Node.js ESM, `node:test`, npm pack, system `tar`, JSON, Markdown.

---

## Files

- Create: `scripts/verify-release-bundle.mjs`
- Create: `test/verify-release-bundle.test.mjs`
- Modify: `package.json`
- Modify: `test/vibelog-package.test.mjs`
- Modify: `docs/distribution/vibelog-distribution-plan.json`
- Modify: `test/vibelog-distribution-plan.test.mjs`
- Modify: `docs/guides/vibelog-installer-package-manager-plan.md`
- Modify: `docs/guides/vibelog-installer-package-manager-plan.zh.md`
- Modify: `README.md`
- Create: `docs/reports/slice-20-release-bundle-report.md`
- Create: `docs/reports/slice-20-release-bundle-report.zh.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] Write failing release bundle verifier and package metadata tests.
- [x] Run targeted tests and confirm failure because `scripts/verify-release-bundle.mjs` and package entries are missing.
- [x] Implement scratch-only release bundle verifier.
- [x] Add private package entries for the verifier.
- [x] Update distribution plan and distribution tests.
- [x] Update bilingual guides, reports, README, and root VibeLog.
- [x] Run isolated verification.
- [x] Run flow verification.
- [ ] Commit locally without pushing.

## Verification Commands

```powershell
node --test test\verify-release-bundle.test.mjs
node --test test\vibelog-package.test.mjs
node --test test\vibelog-distribution-plan.test.mjs
node scripts\verify-release-bundle.mjs --repo "C:\Users\HXW\Documents\vibecoding" --scratch-root "C:\Users\HXW\Documents\vibelog-scratch\slice-20-release-bundle"
node --test test\verify-release-bundle.test.mjs test\verify-clean-clone-adoption.test.mjs test\vibelog-installer-backup-restore.test.mjs test\vibelog-installer-rollback.test.mjs test\vibelog-installer-dry-run.test.mjs test\vibelog-package.test.mjs test\vibelog-distribution-plan.test.mjs
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
node --test
git diff --check
```
