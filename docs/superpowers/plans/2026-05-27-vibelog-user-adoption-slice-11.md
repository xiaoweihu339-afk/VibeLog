# VibeLog User Adoption Slice 11 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal ordinary-user CLI path to initialize, enable, verify, and disable VibeLog in a project.

**Architecture:** Add `scripts/vibelog-project.mjs` as a wrapper around the existing exporter, validator, and Claude Code hook generator. Keep the command JSON-first and project-local. Add focused tests, bilingual guides, bilingual reports, README links, and VibeLog updates.

**Tech Stack:** Node.js ESM, `node:test`, PowerShell, existing VibeLog exporter, validator, and hook generator.

---

## File Structure

- Create: `scripts/vibelog-project.mjs`
- Create: `test/vibelog-project.test.mjs`
- Create: `docs/guides/vibelog-project-adoption.md`
- Create: `docs/guides/vibelog-project-adoption.zh.md`
- Create: `docs/reports/slice-11-user-adoption-report.md`
- Create: `docs/reports/slice-11-user-adoption-report.zh.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-user-adoption-slice-11-design.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-user-adoption-slice-11-design.zh.md`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] **Task 1: Write failing CLI workflow tests**

Create `test/vibelog-project.test.mjs` covering init, overwrite refusal, dry-run enable, write enable, verify, disable, and unrelated settings preservation.

Run:

```powershell
node --test test\vibelog-project.test.mjs
```

Expected before implementation: fail because `scripts/vibelog-project.mjs` does not exist.

- [x] **Task 2: Implement `scripts/vibelog-project.mjs`**

Implement exported functions:

- `initVibeLogProject`
- `enableVibeLogHooks`
- `verifyVibeLogProject`
- `disableVibeLogHooks`

Implement CLI subcommands:

- `init`
- `enable-hooks`
- `verify`
- `disable-hooks`

- [x] **Task 3: Run targeted tests**

Run:

```powershell
node --test test\vibelog-project.test.mjs
```

Expected after implementation: pass.

- [x] **Task 4: Run scratch CLI acceptance commands**

Run:

```powershell
node scripts\vibelog-project.mjs init --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption" --title "Slice 11 Adoption Test" --idea "Verify ordinary users can initialize and manage VibeLog safely."
node scripts\vibelog-project.mjs enable-hooks --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --write
node scripts\vibelog-project.mjs verify --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption"
node scripts\vibelog-project.mjs disable-hooks --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption"
```

Expected: init creates valid files, enable writes project-local settings, verify reports ready, disable removes VibeLog hook commands.

- [x] **Task 5: Add bilingual guide and report**

Create `docs/guides/vibelog-project-adoption.md`, `docs/guides/vibelog-project-adoption.zh.md`, `docs/reports/slice-11-user-adoption-report.md`, and `docs/reports/slice-11-user-adoption-report.zh.md`.

- [x] **Task 6: Update README and root VibeLog**

Link the new guide, script, report, and update progress to `28 / 100`.

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
git add scripts/vibelog-project.mjs test/vibelog-project.test.mjs docs/guides/vibelog-project-adoption.md docs/guides/vibelog-project-adoption.zh.md docs/reports/slice-11-user-adoption-report.md docs/reports/slice-11-user-adoption-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-user-adoption-slice-11-design.md docs/superpowers/specs/2026-05-27-vibelog-user-adoption-slice-11-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-user-adoption-slice-11.md docs/superpowers/plans/2026-05-27-vibelog-user-adoption-slice-11.zh.md README.md vibe-log.md vibe-log.json
git commit -m "Add VibeLog user adoption CLI"
```

Do not push.
