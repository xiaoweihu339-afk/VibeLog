# VibeLog Clean Clone Adoption Slice 13 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify that a fresh local clone of VibeLog can complete the clone-local package adoption workflow.

**Architecture:** Add a Node.js verifier that creates a scratch run directory, clones the repository locally, runs `npm run vibelog` from the clean clone, and verifies a separate target project. The verifier reports JSON so tests, reports, and future agents can consume the result.

**Tech Stack:** Node.js ESM, `node:test`, npm scripts, Git CLI, PowerShell.

---

## File Structure

- Create: `scripts/verify-clean-clone-adoption.mjs`
- Create: `test/verify-clean-clone-adoption.test.mjs`
- Create: `docs/reports/slice-13-clean-clone-adoption-report.md`
- Create: `docs/reports/slice-13-clean-clone-adoption-report.zh.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-clean-clone-adoption-slice-13-design.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-clean-clone-adoption-slice-13-design.zh.md`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] **Task 1: Write failing clean clone verifier tests**

Create `test/verify-clean-clone-adoption.test.mjs` with tests that import `runCleanCloneAdoptionVerification` and execute the CLI script.

Run:

```powershell
node --test test\verify-clean-clone-adoption.test.mjs
```

Expected before implementation: fail because `scripts/verify-clean-clone-adoption.mjs` does not exist.

- [x] **Task 2: Implement clean clone verifier**

Create `scripts/verify-clean-clone-adoption.mjs` with:

- `runCleanCloneAdoptionVerification`
- local `git clone --local --no-hardlinks`
- Windows-safe npm command execution through `cmd.exe`
- JSON parsing for npm script output
- global Claude Code settings fingerprint checks
- CLI argument parsing for `--repo` and `--workspace`

- [x] **Task 3: Run targeted verifier tests**

Run:

```powershell
node --test test\verify-clean-clone-adoption.test.mjs
```

Expected: pass.

- [x] **Task 4: Run scratch clean clone acceptance command**

Run:

```powershell
node scripts\verify-clean-clone-adoption.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-13-clean-clone-adoption"
```

Expected: JSON output contains `"passed": true`, `verify.ready` is `true`, `disable.removedHookCount` is `3`, and `globalClaudeSettingsUnchanged` is `true`.

- [x] **Task 5: Add bilingual Slice 13 report**

Create:

- `docs/reports/slice-13-clean-clone-adoption-report.md`
- `docs/reports/slice-13-clean-clone-adoption-report.zh.md`

Include verification evidence and the project progress snapshot.

- [x] **Task 6: Update README and root VibeLog**

Link the verifier script, report, and next step. Update `vibe-log.md`, then regenerate `vibe-log.json`.

- [x] **Task 7: Final verification and local commit**

Run:

```powershell
node --test
node scripts\verify-clean-clone-adoption.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-13-clean-clone-adoption"
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

Then commit locally:

```powershell
git add scripts/verify-clean-clone-adoption.mjs test/verify-clean-clone-adoption.test.mjs docs/reports/slice-13-clean-clone-adoption-report.md docs/reports/slice-13-clean-clone-adoption-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-clean-clone-adoption-slice-13-design.md docs/superpowers/specs/2026-05-27-vibelog-clean-clone-adoption-slice-13-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-clean-clone-adoption-slice-13.md docs/superpowers/plans/2026-05-27-vibelog-clean-clone-adoption-slice-13.zh.md README.md vibe-log.md vibe-log.json
git commit -m "Add clean clone VibeLog adoption verification"
```

Do not push.
