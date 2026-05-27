# Claude Code Real Project Opt-In Slice 10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify the VibeLog Claude Code opt-in hook path in a realistic scratch project with project-local settings only.

**Architecture:** Add one verifier script that creates a scratch project, runs the opt-in generator, reads generated settings, executes representative hook events through the generated command, and validates the resulting VibeLog. Add a focused test file plus bilingual reports.

**Tech Stack:** Node.js ESM, `node:test`, PowerShell, existing VibeLog exporter, validator, recorder, adapter, and opt-in generator.

---

## File Structure

- Create: `scripts/verify-claude-code-opt-in-project.mjs`
- Create: `test/verify-claude-code-opt-in-project.test.mjs`
- Create: `docs/reports/slice-10-real-project-opt-in-report.md`
- Create: `docs/reports/slice-10-real-project-opt-in-report.zh.md`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] **Task 1: Write the failing acceptance test**

Create `test/verify-claude-code-opt-in-project.test.mjs` with tests that import `runOptInProjectVerification`, run it against a temp project, and assert dry-run, write, settings command execution, VibeLog JSON validity, and event file creation.

Run:

```powershell
node --test test\verify-claude-code-opt-in-project.test.mjs
```

Expected before implementation: fail because `scripts/verify-claude-code-opt-in-project.mjs` does not exist.

- [x] **Task 2: Implement the verifier**

Create `scripts/verify-claude-code-opt-in-project.mjs` with:

- `createRealProjectFixture`
- `runSettingsHookCommand`
- `runOptInProjectVerification`
- CLI args: `--workspace`, `--adapter`

The verifier must write only inside the target scratch workspace.

- [x] **Task 3: Run the targeted verifier test**

Run:

```powershell
node --test test\verify-claude-code-opt-in-project.test.mjs
```

Expected after implementation: pass.

- [x] **Task 4: Run the scratch acceptance command**

Run:

```powershell
node scripts\verify-claude-code-opt-in-project.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-10-real-project-opt-in" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

Expected: JSON output with `passed: true`.

- [x] **Task 5: Add bilingual reports and README links**

Create English and Chinese reports under `docs/reports/`. Add the report links to README.

- [x] **Task 6: Update root VibeLog**

Record the exact execution prompt, development log, verification evidence, artifact index, handoff state, and project progress snapshot.

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
git add scripts/verify-claude-code-opt-in-project.mjs test/verify-claude-code-opt-in-project.test.mjs docs/reports/slice-10-real-project-opt-in-report.md docs/reports/slice-10-real-project-opt-in-report.zh.md docs/superpowers/specs/2026-05-27-claude-code-real-project-opt-in-slice-10-design.md docs/superpowers/specs/2026-05-27-claude-code-real-project-opt-in-slice-10-design.zh.md docs/superpowers/plans/2026-05-27-claude-code-real-project-opt-in-slice-10.md docs/superpowers/plans/2026-05-27-claude-code-real-project-opt-in-slice-10.zh.md README.md vibe-log.md vibe-log.json
git commit -m "Verify real project opt-in hooks"
```

Do not push.
