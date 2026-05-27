# VibeLog Packaging Slice 12 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe clone-local package entry and help output for the VibeLog project adoption CLI.

**Architecture:** Add `package.json` with a private package boundary, a `vibelog-project` bin entry, and npm scripts. Add help output to `scripts/vibelog-project.mjs`, then document the clone-local install path.

**Tech Stack:** Node.js ESM, npm scripts, `node:test`, PowerShell.

---

## File Structure

- Create: `package.json`
- Create: `test/vibelog-package.test.mjs`
- Create: `docs/guides/vibelog-install-distribution.md`
- Create: `docs/guides/vibelog-install-distribution.zh.md`
- Create: `docs/reports/slice-12-packaging-report.md`
- Create: `docs/reports/slice-12-packaging-report.zh.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-packaging-slice-12-design.md`
- Create: `docs/superpowers/specs/2026-05-27-vibelog-packaging-slice-12-design.zh.md`
- Modify: `scripts/vibelog-project.mjs`
- Modify: `README.md`
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

## Tasks

- [x] **Task 1: Write failing packaging tests**

Create `test/vibelog-package.test.mjs` that checks `package.json`, the bin file, direct help output, and npm-script help output.

Run:

```powershell
node --test test\vibelog-package.test.mjs
```

Expected before implementation: fail because `package.json` is missing.

- [x] **Task 2: Add package metadata and CLI help**

Create `package.json`, add a shebang to `scripts/vibelog-project.mjs`, and implement `--help` / `help`.

- [x] **Task 3: Run targeted packaging tests**

Run:

```powershell
node --test test\vibelog-package.test.mjs
npm run vibelog -- --help
```

Expected: both pass.

- [x] **Task 4: Add bilingual install/distribution guide and report**

Create the guide and report files listed above.

- [x] **Task 5: Update README and root VibeLog**

Link the package entry, guide, report, and progress snapshot.

- [x] **Task 6: Final verification and local commit**

Run:

```powershell
node --test
npm run vibelog -- --help
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

Then commit locally:

```powershell
git add package.json scripts/vibelog-project.mjs test/vibelog-package.test.mjs docs/guides/vibelog-install-distribution.md docs/guides/vibelog-install-distribution.zh.md docs/reports/slice-12-packaging-report.md docs/reports/slice-12-packaging-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-packaging-slice-12-design.md docs/superpowers/specs/2026-05-27-vibelog-packaging-slice-12-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-packaging-slice-12.md docs/superpowers/plans/2026-05-27-vibelog-packaging-slice-12.zh.md README.md vibe-log.md vibe-log.json
git commit -m "Add clone-local VibeLog packaging path"
```

Do not push.
