# VibeLog Strong Schema Validation Slice 16 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development before implementation and superpowers:verification-before-completion before reporting completion.

**Goal:** Strengthen VibeLog JSON validation by enforcing the existing schema file without adding external dependencies.

**Architecture:** Keep `validateVibeLog(data)` as the public API. Add a small recursive schema subset validator and keep the existing practical VibeLog checks beside it.

**Tech Stack:** Node.js ESM, `node:test`, JSON, Markdown.

---

## File Structure

- Modify: `scripts/validate-vibelog.mjs`
- Modify: `skills/vibelog/assets/vibe-log.schema.json`
- Modify: `test/validate-vibelog.test.mjs`
- Create: `docs/reports/slice-16-strong-schema-validation-report.md`
- Create: `docs/reports/slice-16-strong-schema-validation-report.zh.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-strong-schema-validation-slice-16-design.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-strong-schema-validation-slice-16-design.zh.md`
- Modify: `docs/guides/export-json.md`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] **Task 1: Add failing schema validation tests**

Extend `test/validate-vibelog.test.mjs` with invalid enum, missing required field, unexpected field, and nested enum failure cases.

Run:

```powershell
node --test test\validate-vibelog.test.mjs
```

Expected before implementation: fail because the old validator does not enforce schema-level rules.

- [x] **Task 2: Add dependency-free schema subset validation**

Update `scripts/validate-vibelog.mjs` to load `skills/vibelog/assets/vibe-log.schema.json` and validate `type`, type arrays, `enum`, `required`, `properties`, `items`, and `additionalProperties: false`.

- [x] **Task 3: Align schema with current generated VibeLog data**

Update `vibe-log.schema.json` so the enforced schema accepts current root and example exports while still catching invalid fields and enum drift.

- [x] **Task 4: Update docs and Slice 16 reports**

Update README and export guide, then add bilingual Slice 16 reports with verification evidence and a progress snapshot.

- [x] **Task 5: Update root VibeLog and JSON export**

Record Slice 16 in `vibe-log.md`, add the new artifacts, update progress to `39 / 100`, then regenerate `vibe-log.json`.

- [x] **Task 6: Final verification and local commit**

Run:

```powershell
node --test
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\validate-vibelog.mjs examples\vibelog-studio\vibe-log.json
node scripts\validate-vibelog.mjs examples\reading-card-lite\vibe-log.json
node scripts\validate-vibelog.mjs examples\billmate-lite\vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

Then commit locally:

```powershell
git add scripts/validate-vibelog.mjs skills/vibelog/assets/vibe-log.schema.json test/validate-vibelog.test.mjs docs/reports/slice-16-strong-schema-validation-report.md docs/reports/slice-16-strong-schema-validation-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-strong-schema-validation-slice-16-design.md docs/superpowers/specs/2026-05-27-vibelog-strong-schema-validation-slice-16-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-strong-schema-validation-slice-16.md docs/superpowers/plans/2026-05-27-vibelog-strong-schema-validation-slice-16.zh.md docs/guides/export-json.md README.md vibe-log.md vibe-log.json
git commit -m "Add stronger VibeLog schema validation"
```

Do not push.
