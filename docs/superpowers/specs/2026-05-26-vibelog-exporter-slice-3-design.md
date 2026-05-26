# VibeLog Exporter Slice 3 Design

## Purpose

Slice 3 adds the first deterministic Markdown-to-JSON exporter for VibeLog.

The previous dogfood work proved that VibeLog can record a realistic agent-led project, but it also exposed the main weakness: `vibe-log.md` and `vibe-log.json` are still synchronized manually. That is not strong enough for a reusable skill, future hooks, or VibeHub upload.

This slice makes Markdown the practical source of truth and gives agents a repeatable way to generate JSON.

## Context

Current rules already say:

```txt
Markdown is the source of truth.
JSON is generated for upload or integration.
```

Current repository evidence:

- `skills/vibelog/references/vibelog-format.md` defines the format.
- `skills/vibelog/assets/vibe-log.schema.json` defines the JSON shape.
- `examples/billmate-lite/vibe-log.md` is the first strong dogfood input.
- `examples/billmate-lite/vibe-log.json` is the expected structured output shape.
- Root `vibe-log.md` and `vibe-log.json` are larger real-world project records.

The first exporter should start with a stable subset that is useful and testable. It does not need to parse every optional nuance in the whole standard.

## Goals

1. Export `vibe-log.md` into `vibe-log.json` deterministically.
2. Support the core fields used by `examples/billmate-lite/`.
3. Preserve Unicode text, including Chinese prompt text.
4. Make exporter output parseable and stable across repeated runs.
5. Add validation that catches missing required core fields.
6. Keep the repository skill-first and avoid website or app source work.

## Non-Goals

- Do not build a web UI.
- Do not implement cloud upload.
- Do not implement hooks in this slice.
- Do not parse every possible Markdown variation.
- Do not require third-party npm dependencies.
- Do not push to GitHub without explicit user approval.

## Approaches Considered

### Approach A: Loose Regex Exporter

Parse sections and fields with lightweight string helpers.

Tradeoff: Fast and dependency-free, but brittle if Markdown structure drifts.

### Approach B: Strict VibeLog Subset Parser

Use a small deterministic parser that recognizes known headings, frontmatter, bold-label fields, and list formats used by current examples.

Tradeoff: Slightly more code than loose regex, but safer and easier to test. Unsupported sections can be exported as empty arrays or raw strings until later slices.

### Approach C: Add A Markdown Parsing Dependency

Use a library such as `remark` or `markdown-it`.

Tradeoff: More robust AST parsing, but adds dependency management before the project needs it.

## Recommendation

Use Approach B.

The first exporter should be strict enough to be predictable, but small enough to keep the skill portable. It should parse the known VibeLog subset used by `examples/billmate-lite/` and fail clearly when required fields are missing.

## Deliverables

### 1. Exporter Script

Path:

```txt
scripts/export-vibelog.mjs
```

Responsibilities:

- read a Markdown file
- parse YAML-like frontmatter
- parse top-level VibeLog sections
- export structured JSON
- preserve Unicode
- write pretty JSON with two-space indentation

Proposed CLI:

```powershell
node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out tmp/billmate-lite.vibe-log.json
```

Default behavior:

- input defaults to `vibe-log.md`
- output defaults to `vibe-log.json`
- `--check` exits non-zero if generated JSON differs from the current output file

### 2. Validation Script

Path:

```txt
scripts/validate-vibelog.mjs
```

Responsibilities:

- parse a VibeLog JSON file
- verify required core fields exist
- verify key arrays have expected shapes when present
- report readable errors

This is not full JSON Schema validation yet. It is a practical validation gate for current examples.

### 3. Export Guide

Path:

```txt
docs/guides/export-json.md
```

Responsibilities:

- explain Markdown as source of truth
- show how to export JSON
- show how to run check mode
- explain what the exporter supports in Slice 3
- explain known limitations

### 4. Tests

Path:

```txt
test/export-vibelog.test.mjs
test/validate-vibelog.test.mjs
```

Test fixtures:

```txt
examples/billmate-lite/vibe-log.md
examples/billmate-lite/vibe-log.json
```

Expected coverage:

- frontmatter export
- one-line vibe export
- current idea export
- idea evolution entries
- decisions
- human-in-the-loop entries
- implementation status
- validation design
- verification evidence
- artifact index
- execution prompts
- development log
- bugfix / incident log
- handoff state
- public summary
- Unicode preservation
- missing required field validation
- check mode detects drift

### 5. README Updates

Add a short section:

```txt
Export JSON
```

It should link to `docs/guides/export-json.md` and show one command.

### 6. VibeLog Updates

Root `vibe-log.md` and `vibe-log.json` should record:

- Slice 3 design decision
- implementation scope
- validation plan
- later verification evidence

## Supported Markdown Subset

Slice 3 should support the Markdown style already produced by VibeLog:

### Frontmatter

```yaml
---
schema: vibelog@0.2-draft
title: "BillMate Lite"
tools: ["Codex", "Node.js"]
---
```

Parser rules:

- strings may be quoted or unquoted
- simple inline arrays are supported
- booleans can be parsed if introduced later
- unknown frontmatter keys are preserved as strings when safe

### Top-Level Sections

Top-level sections are `##` headings.

The exporter maps known section names to JSON fields. Unknown sections can be ignored in Slice 3 unless needed for error reporting.

### Entry Sections

Repeated entries use `###` headings under a known section.

Examples:

```md
## Idea Evolution

### 2026-05-26

**Type:** initial
**Before:** none
**After:** ...
```

Parser rules:

- `###` heading becomes `timestamp` when it looks like a date
- bold labels become object fields
- field names are normalized to snake_case
- multi-paragraph values remain joined text

### Lists

Simple bullet lists under known fields are parsed as arrays.

Example:

```md
### Completed

- Tests written first.
- Tests passed after implementation.
```

### Text Blocks

Sections such as `Current Idea` and `Public Summary` are exported as trimmed strings.

## Data Flow

```txt
vibe-log.md
-> parse frontmatter
-> split top-level sections
-> parse known sections
-> normalize field names
-> assemble VibeLog JSON object
-> validate core fields
-> write vibe-log.json
```

## Error Handling

Exporter errors should be human-readable:

- missing input file
- missing frontmatter
- missing `One-Line Vibe`
- missing `Current Idea`
- malformed entry field
- output path cannot be written

Validation errors should include field names:

```txt
Missing required field: one_line_vibe
Invalid execution_prompts[0].recording_mode: expected exact, redacted, reconstructed, or summary_only
```

## Testing Design

Use Node's built-in test runner.

TDD order:

1. Write failing tests for frontmatter parsing.
2. Implement frontmatter parsing.
3. Write failing tests for section splitting.
4. Implement section splitting.
5. Write failing tests for BillMate export core fields.
6. Implement known-section parsing.
7. Write failing tests for validation failures.
8. Implement validation script.
9. Write failing test for check mode drift.
10. Implement check mode.

## Acceptance Criteria

- `node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out tmp/billmate-lite.vibe-log.json` writes JSON.
- Generated JSON parses with Node.js.
- Generated JSON includes at least:
  - `title`
  - `one_line_vibe`
  - `stage`
  - `current_idea`
  - `idea_evolution`
  - `human_in_the_loop`
  - `execution_prompts`
  - `development_log`
  - `verification_evidence`
  - `handoff_state`
- Chinese prompt text is preserved.
- `node scripts/validate-vibelog.mjs tmp/billmate-lite.vibe-log.json` passes.
- `node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out examples/billmate-lite/vibe-log.json --check` can detect whether the checked file differs.
- Tests pass with `node --test`.
- README and export guide document usage.
- No website, app source, cloud upload, or GitHub push is added.

## Known Limitations For Slice 3

- The exporter targets the current VibeLog Markdown style, not arbitrary Markdown.
- It does not need to parse deeply nested schemas perfectly.
- It does not perform full JSON Schema validation.
- It may not round-trip root `vibe-log.md` perfectly in the first slice if the root log has legacy formatting.
- It should prioritize `examples/billmate-lite/` as the first canonical fixture.

## Risks

### Risk: Parser Becomes Too Broad

Mitigation:

Support the known style first. Add new cases only with fixtures and tests.

### Risk: Generated JSON Differs From Handwritten JSON

Mitigation:

Use the generated output as the new canonical output only after review. In this slice, focus first on stable fields and check-mode detection.

### Risk: Unicode Corruption

Mitigation:

Use UTF-8 reads and writes. Add an explicit Unicode preservation test using Chinese prompt text.

### Risk: Hooks Depend On Exporter Too Early

Mitigation:

Keep hooks out of Slice 3. Hooks can call the exporter in a later slice after it is proven.

## Next Step After This Spec

If the user approves this design, create an implementation plan for Slice 3 and implement the exporter with test-first development.
