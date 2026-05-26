# VibeLog Exporter Slice 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first deterministic Markdown-to-JSON exporter and lightweight validator for the VibeLog strict subset used by the BillMate Lite example.

**Architecture:** The exporter is dependency-free Node.js. `scripts/export-vibelog.mjs` owns Markdown parsing, JSON assembly, CLI export, and `--check` drift detection. `scripts/validate-vibelog.mjs` owns practical validation for required core fields and key array shapes.

**Tech Stack:** Node.js ESM, built-in `node:test`, built-in `assert`, built-in `fs`, `path`, and `url`.

---

### Task 1: Exporter Red Tests

**Files:**
- Create: `test/export-vibelog.test.mjs`

- [x] **Step 1: Write failing exporter tests**

Create tests that import `parseVibeLogMarkdown`, `exportVibeLogFile`, and `isSameJsonFile` from `scripts/export-vibelog.mjs`.

The tests must assert:

- BillMate frontmatter exports `title`, `stage`, `visibility`, `tools`, and `tags`.
- BillMate exports `one_line_vibe`, `current_idea`, `idea_evolution`, `human_in_the_loop`, `execution_prompts`, `development_log`, `verification_evidence`, and `handoff_state`.
- Chinese prompt text is preserved.
- Exporting to a temp file writes parseable JSON.
- Check mode detects drift when the output file differs.

- [x] **Step 2: Run exporter tests and confirm RED**

Run:

```powershell
node --test test/export-vibelog.test.mjs
```

Expected: fail because `scripts/export-vibelog.mjs` does not exist.

### Task 2: Exporter Implementation

**Files:**
- Create: `scripts/export-vibelog.mjs`

- [x] **Step 1: Implement strict subset parser**

Implement:

- `parseVibeLogMarkdown(markdown)`
- `exportVibeLogFile(inputPath, outputPath)`
- `isSameJsonFile(inputPath, outputPath)`
- CLI argument parsing for input, `--out`, and `--check`

Supported subset:

- YAML-like frontmatter with strings and inline arrays.
- `##` top-level sections.
- `###` repeated entries.
- bold-label fields such as `**Type:** test`.
- simple bullet lists.
- text sections for `One-Line Vibe`, `Current Idea`, and `Public Summary`.

- [x] **Step 2: Run exporter tests and confirm GREEN**

Run:

```powershell
node --test test/export-vibelog.test.mjs
```

Expected: pass.

### Task 3: Validator Red Tests

**Files:**
- Create: `test/validate-vibelog.test.mjs`

- [x] **Step 1: Write failing validator tests**

Create tests that import `validateVibeLog` from `scripts/validate-vibelog.mjs`.

The tests must assert:

- BillMate exported JSON passes validation.
- Missing `one_line_vibe` fails.
- Invalid `execution_prompts[0].recording_mode` fails.

- [x] **Step 2: Run validator tests and confirm RED**

Run:

```powershell
node --test test/validate-vibelog.test.mjs
```

Expected: fail because `scripts/validate-vibelog.mjs` does not exist.

### Task 4: Validator Implementation

**Files:**
- Create: `scripts/validate-vibelog.mjs`

- [x] **Step 1: Implement lightweight validator**

Implement:

- `validateVibeLog(data)`
- CLI argument parsing for a JSON path
- readable error output
- non-zero exit when validation fails

Required fields:

- `schema`
- `title`
- `one_line_vibe`
- `stage`
- `current_idea`

Required array shape checks when present:

- `idea_evolution`
- `human_in_the_loop`
- `execution_prompts`
- `development_log`
- `verification_evidence`

- [x] **Step 2: Run validator tests and confirm GREEN**

Run:

```powershell
node --test test/validate-vibelog.test.mjs
```

Expected: pass.

### Task 5: Guide And README

**Files:**
- Create: `docs/guides/export-json.md`
- Modify: `README.md`

- [x] **Step 1: Add export guide**

Document:

- Markdown is source of truth.
- How to export JSON.
- How to validate JSON.
- How to run `--check`.
- Slice 3 limitations.

- [x] **Step 2: Link guide from README**

Add `Export JSON` guidance and link to `docs/guides/export-json.md`.

### Task 6: VibeLog Records

**Files:**
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`

- [x] **Step 1: Record execution prompt**

Record the user prompt: `选择方案B开始`.

- [x] **Step 2: Record implementation work**

Add a development log entry for implementing Slice 3 exporter and validator.

- [x] **Step 3: Record verification evidence**

After final verification, record test and CLI evidence.

- [x] **Step 4: Update handoff**

Record that exporter exists, what remains pending, and the next action.

### Task 7: Final Verification And Commit

**Files:**
- All Slice 3 files

- [x] **Step 1: Run all tests**

Run:

```powershell
node --test
```

Expected: all tests pass.

- [x] **Step 2: Export BillMate JSON to temp**

Run:

```powershell
node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out tmp/billmate-lite.vibe-log.json
```

Expected: writes parseable JSON.

- [x] **Step 3: Validate generated JSON**

Run:

```powershell
node scripts/validate-vibelog.mjs tmp/billmate-lite.vibe-log.json
```

Expected: validation passes.

- [x] **Step 4: Check drift detection**

Run:

```powershell
node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out tmp/billmate-lite.vibe-log.json --check
```

Expected: exits 0 when file matches generated output.

- [x] **Step 5: Parse root JSON and schema**

Run:

```powershell
node -e "for (const f of ['vibe-log.json','skills/vibelog/assets/vibe-log.schema.json']) { JSON.parse(require('fs').readFileSync(f,'utf8')); console.log('OK '+f); }"
```

Expected: both parse.

- [x] **Step 6: Run whitespace check**

Run:

```powershell
git diff --check
```

Expected: no output.

- [x] **Step 7: Commit locally**

Run:

```powershell
git add -A
git commit -m "Add VibeLog Markdown JSON exporter"
```

Expected: local commit is created. Do not push.
