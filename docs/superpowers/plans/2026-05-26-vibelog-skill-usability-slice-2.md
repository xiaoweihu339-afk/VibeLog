# VibeLog Skill Usability Slice 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small guide pack that makes the VibeLog skill easier to start, manually test, validate, and use by future agents without adding website or app source code.

**Architecture:** This is a skill-first documentation slice. Public user guidance lives in `docs/guides/`, agent-specific operational guidance lives beside the skill references, and root README plus root VibeLog link the new artifacts together.

**Tech Stack:** Markdown documentation, existing VibeLog Markdown/JSON records, Node.js JSON parsing for verification, Git for local commits.

---

### Task 1: Add Quickstart Guide

**Files:**
- Create: `docs/guides/quickstart.md`

- [ ] **Step 1: Create the guide**

Add a focused first-time path covering what VibeLog is, new-project use, existing-project use, expected files, Markdown/JSON relationship, and privacy defaults.

- [ ] **Step 2: Verify the guide exists**

Run: `Test-Path docs\guides\quickstart.md`

Expected: `True`

### Task 2: Add Example Scenario

**Files:**
- Create: `docs/guides/example-scenario.md`

- [ ] **Step 1: Create the scenario**

Add the AI reading card tool scenario with a one-line vibe, starting idea, human decisions, idea changes, execution prompts, implementation status, validation design, and handoff prompts.

- [ ] **Step 2: Verify the guide exists**

Run: `Test-Path docs\guides\example-scenario.md`

Expected: `True`

### Task 3: Add Manual Test Guide

**Files:**
- Create: `docs/guides/manual-test-guide.md`

- [ ] **Step 1: Create the test guide**

Add test setup, isolated checks, combined workflow checks, expected pass criteria, and failure signals. Include the user's principle: each part must work alone and the combined workflow must work end to end.

- [ ] **Step 2: Verify the guide exists**

Run: `Test-Path docs\guides\manual-test-guide.md`

Expected: `True`

### Task 4: Add Validation Checklist

**Files:**
- Create: `docs/guides/validation-checklist.md`

- [ ] **Step 1: Create the checklist**

Add human readability, agent readability, prompt ledger, implementation status, validation design, verification evidence, JSON parseability, privacy, and handoff checks.

- [ ] **Step 2: Verify the checklist exists**

Run: `Test-Path docs\guides\validation-checklist.md`

Expected: `True`

### Task 5: Add Agent Usage Reference

**Files:**
- Create: `skills/vibelog/references/agent-usage-guide.md`
- Modify: `skills/vibelog/SKILL.md`

- [ ] **Step 1: Create the agent guide**

Add agent-facing rules for when to call VibeLog, how to classify events, what to record exactly, what to summarize, how to update handoff state, how to avoid transcript dumping, and how to handle uncertainty.

- [ ] **Step 2: Link the guide from the skill**

Add `references/agent-usage-guide.md` to the bundled resources list in `skills/vibelog/SKILL.md`.

- [ ] **Step 3: Verify the guide exists**

Run: `Test-Path skills\vibelog\references\agent-usage-guide.md`

Expected: `True`

### Task 6: Update User-Facing Indexes

**Files:**
- Modify: `README.md`
- Keep: `docs/superpowers/specs/2026-05-26-vibelog-skill-usability-slice-2-design.zh.md`

- [ ] **Step 1: Update README**

Add a `Guides` section linking to the new quickstart, manual test guide, example scenario, validation checklist, and agent usage guide.

- [ ] **Step 2: Preserve Chinese design translation**

Keep `docs/superpowers/specs/2026-05-26-vibelog-skill-usability-slice-2-design.zh.md` as the Chinese translation of the Slice 2 design.

- [ ] **Step 3: Verify referenced files exist**

Run:

```powershell
@(
  'docs\guides\quickstart.md',
  'docs\guides\manual-test-guide.md',
  'docs\guides\example-scenario.md',
  'docs\guides\validation-checklist.md',
  'skills\vibelog\references\agent-usage-guide.md',
  'docs\superpowers\specs\2026-05-26-vibelog-skill-usability-slice-2-design.zh.md'
) | ForEach-Object { "$_=$((Test-Path $_))" }
```

Expected: every line ends with `=True`.

### Task 7: Update VibeLog Records

**Files:**
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

- [ ] **Step 1: Record execution prompt**

Add the user's execution approval prompt to `Execution Prompts`.

- [ ] **Step 2: Record development work**

Add a `Development Log` entry for implementing Slice 2 guide pack.

- [ ] **Step 3: Record artifacts and handoff**

Add the new guides and plan to `Artifact Index`, update `Handoff State`, and append `Vibe Progress`.

- [ ] **Step 4: Keep JSON aligned**

Update `vibe-log.json` to mirror the same key changes.

### Task 8: Verify And Commit

**Files:**
- All Slice 2 files

- [ ] **Step 1: Run JSON parse checks**

Run:

```powershell
node -e "for (const f of ['vibe-log.json','skills/vibelog/assets/vibe-log.schema.json']) { JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('OK '+f); }"
```

Expected:

```txt
OK vibe-log.json
OK skills/vibelog/assets/vibe-log.schema.json
```

- [ ] **Step 2: Run placeholder scan**

Run:

```powershell
Select-String -Path docs\guides\*.md,skills\vibelog\references\agent-usage-guide.md -Pattern "TBD|TODO|PLACEHOLDER|FIXME|\?\?"
```

Expected: no output.

- [ ] **Step 3: Run whitespace check**

Run: `git diff --check`

Expected: no output.

- [ ] **Step 4: Verify app source remains absent**

Run: `Test-Path apps\vibelog-studio`

Expected: `False`

- [ ] **Step 5: Commit locally**

Run:

```powershell
git add -A
git commit -m "Add VibeLog skill usability guides"
```

Expected: a local commit is created. Do not push.
