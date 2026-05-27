# VibeLog Installer and Package Manager Slice 15 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tested installer/package-manager distribution roadmap without publishing or installing globally.

**Architecture:** Store distribution strategy in a machine-readable JSON plan, document it in bilingual guides, and add tests that enforce safety gates. Keep all changes local to repository docs, tests, and VibeLog records.

**Tech Stack:** Node.js ESM, `node:test`, JSON, Markdown.

---

## File Structure

- Create: `docs/distribution/vibelog-distribution-plan.json`
- Create: `docs/guides/vibelog-installer-package-manager-plan.md`
- Create: `docs/guides/vibelog-installer-package-manager-plan.zh.md`
- Create: `docs/reports/slice-15-installer-package-manager-report.md`
- Create: `docs/reports/slice-15-installer-package-manager-report.zh.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-installer-package-manager-slice-15-design.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-installer-package-manager-slice-15-design.zh.md`
- Create: `test/vibelog-distribution-plan.test.mjs`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] **Task 1: Write failing distribution plan tests**

Create `test/vibelog-distribution-plan.test.mjs` to check the distribution plan JSON, bilingual docs, and `package.json` privacy.

Run:

```powershell
node --test test\vibelog-distribution-plan.test.mjs
```

Expected before implementation: fail because `docs/distribution/vibelog-distribution-plan.json` and guide docs do not exist.

- [x] **Task 2: Add machine-readable distribution plan**

Create `docs/distribution/vibelog-distribution-plan.json` with active clone-local channel, deferred npm channel, future release bundle, future installer scripts, future agent templates, and safety gates.

- [x] **Task 3: Add bilingual distribution roadmap docs**

Create:

- `docs/guides/vibelog-installer-package-manager-plan.md`
- `docs/guides/vibelog-installer-package-manager-plan.zh.md`

Explain current channel, future channels, release gates, and what S15 intentionally does not do.

- [x] **Task 4: Run targeted distribution plan tests**

Run:

```powershell
node --test test\vibelog-distribution-plan.test.mjs
```

Expected: pass.

- [x] **Task 5: Add bilingual Slice 15 report**

Create:

- `docs/reports/slice-15-installer-package-manager-report.md`
- `docs/reports/slice-15-installer-package-manager-report.zh.md`

Include verification evidence and project progress snapshot.

- [x] **Task 6: Update README and root VibeLog**

Link the distribution plan, guide docs, report, and update progress from `34 / 100` to `36 / 100`. Regenerate `vibe-log.json`.

- [x] **Task 7: Final verification and local commit**

Run:

```powershell
node --test
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

Then commit locally:

```powershell
git add docs/distribution/vibelog-distribution-plan.json docs/guides/vibelog-installer-package-manager-plan.md docs/guides/vibelog-installer-package-manager-plan.zh.md docs/reports/slice-15-installer-package-manager-report.md docs/reports/slice-15-installer-package-manager-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-installer-package-manager-slice-15-design.md docs/superpowers/specs/2026-05-27-vibelog-installer-package-manager-slice-15-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-installer-package-manager-slice-15.md docs/superpowers/plans/2026-05-27-vibelog-installer-package-manager-slice-15.zh.md test/vibelog-distribution-plan.test.mjs README.md vibe-log.md vibe-log.json
git commit -m "Add VibeLog installer distribution roadmap"
```

Do not push.
