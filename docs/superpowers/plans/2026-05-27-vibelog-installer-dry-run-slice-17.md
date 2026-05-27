# VibeLog Installer Dry-Run Slice 17 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development before implementation and superpowers:verification-before-completion before reporting completion.

**Goal:** Add a dry-run-only installer planner that previews VibeLog install operations without writing files.

**Architecture:** Implement a dependency-free Node.js script that builds an install plan from the current repository to a user-selected target root. Keep writing out of scope and explicitly reject `--write`.

**Tech Stack:** Node.js ESM, `node:test`, JSON, Markdown.

---

## File Structure

- Create: `scripts/vibelog-install.mjs`
- Create: `test/vibelog-installer-dry-run.test.mjs`
- Create: `docs/guides/vibelog-installer-dry-run.md`
- Create: `docs/guides/vibelog-installer-dry-run.zh.md`
- Create: `docs/reports/slice-17-installer-dry-run-report.md`
- Create: `docs/reports/slice-17-installer-dry-run-report.zh.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-installer-dry-run-slice-17-design.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-installer-dry-run-slice-17-design.zh.md`
- Modify: `docs/distribution/vibelog-distribution-plan.json`
- Modify: `test/vibelog-distribution-plan.test.mjs`
- Modify: `test/vibelog-package.test.mjs`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] **Task 1: Write failing installer dry-run tests**

Create `test/vibelog-installer-dry-run.test.mjs` to check:

- `createInstallPlan` returns dry-run operations and rollback steps.
- no files or directories are created in the target root.
- CLI JSON output works.
- `--write` is refused.

Run:

```powershell
node --test test\vibelog-installer-dry-run.test.mjs
```

Expected before implementation: fail because `scripts/vibelog-install.mjs` does not exist.

- [x] **Task 2: Implement dry-run installer planner**

Create `scripts/vibelog-install.mjs` with `createInstallPlan`, `runInstallDryRun`, argument parsing, JSON output, and `--write` rejection.

- [x] **Task 3: Add package metadata and distribution plan updates**

Add private local bin/script entries and update `docs/distribution/vibelog-distribution-plan.json` so local installer scripts are `prototype_dry_run`, not active. Update package and distribution tests.

- [x] **Task 4: Add bilingual installer dry-run guide and report**

Create bilingual guide and report explaining the dry-run-only boundary, planned operations, rollback plan, and what S17 does not do.

- [x] **Task 5: Update README, root VibeLog, and JSON export**

Update README, record S17 in `vibe-log.md`, update progress to `42 / 100`, and regenerate `vibe-log.json`.

- [x] **Task 6: Final verification and local commit**

Run:

```powershell
node --test
node scripts\vibelog-install.mjs --target "C:\Users\HXW\Documents\vibelog-scratch\slice-17-installer-dry-run"
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

Then commit locally:

```powershell
git add scripts/vibelog-install.mjs test/vibelog-installer-dry-run.test.mjs docs/guides/vibelog-installer-dry-run.md docs/guides/vibelog-installer-dry-run.zh.md docs/reports/slice-17-installer-dry-run-report.md docs/reports/slice-17-installer-dry-run-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-installer-dry-run-slice-17-design.md docs/superpowers/specs/2026-05-27-vibelog-installer-dry-run-slice-17-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-installer-dry-run-slice-17.md docs/superpowers/plans/2026-05-27-vibelog-installer-dry-run-slice-17.zh.md docs/distribution/vibelog-distribution-plan.json test/vibelog-distribution-plan.test.mjs test/vibelog-package.test.mjs package.json README.md vibe-log.md vibe-log.json
git commit -m "Add VibeLog installer dry-run prototype"
```

Do not push.
