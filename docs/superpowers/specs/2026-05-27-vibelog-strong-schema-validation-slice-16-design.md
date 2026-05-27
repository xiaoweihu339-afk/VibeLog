# VibeLog Strong Schema Validation Slice 16 Design

Date: 2026-05-27

## Goal

Make `scripts/validate-vibelog.mjs` enforce the VibeLog JSON schema directly, while keeping the repository dependency-free and preserving Markdown as the source of truth.

## Why This Slice Exists

The previous validator caught only a small set of practical errors: missing identity strings, known stages, array-shaped core sections, and execution prompt recording modes. That was useful for early exporter work, but it was not strong enough for future installers, package distribution, upload flows, or agent handoff.

Slice 16 turns the schema file into an active contract. The validator should reject invalid enums, missing required objects, unexpected fields, and invalid nested values before VibeLog is shared, packaged, or uploaded.

## Scope

In scope:

- Load `skills/vibelog/assets/vibe-log.schema.json` inside the validator.
- Add a small dependency-free JSON Schema subset validator.
- Support the schema features VibeLog currently uses: `type`, type arrays, `enum`, `required`, `properties`, `items`, and `additionalProperties: false`.
- Keep the existing human-readable validation errors.
- Update the schema so it matches the current Markdown exporter and generated examples.
- Add regression tests for schema enum failures, missing required fields, unexpected fields, and nested enum failures.
- Update README, export guide, reports, root VibeLog, and JSON export.

Out of scope:

- Adding Ajv or another npm dependency.
- Supporting the full JSON Schema specification.
- Changing Markdown-first source-of-truth behavior.
- Publishing a package, pushing to GitHub, or changing package visibility.

## Architecture

`validate-vibelog.mjs` keeps one public function:

```js
validateVibeLog(data)
```

That function now runs two layers:

1. Schema validation from `skills/vibelog/assets/vibe-log.schema.json`.
2. Existing practical checks for non-empty identity strings and execution prompt readability.

The schema subset validator is intentionally small. It recursively walks objects and arrays, checks required fields, validates enum values, validates primitive types, and rejects unknown properties when the schema says `additionalProperties: false`.

## Acceptance Criteria

- New schema validation tests fail before implementation and pass after implementation.
- `node --test test\validate-vibelog.test.mjs` passes.
- `node --test test\vibelog-examples.test.mjs` passes with all examples validated by the stronger validator.
- `node --test` passes.
- Root and example `vibe-log.json` files validate.
- `vibe-log.json` remains in sync with `vibe-log.md`.
- No external dependency is added.
- No push or publish occurs.

## Progress Snapshot Target

- Project Progress: 39 / 100
- Change This Task: +3
- Current Phase: data contract hardening
- Next Unlock: installer dry-run prototype or remote clone/release-bundle verification
- Main Risk: this is still a focused JSON Schema subset, not full JSON Schema support
- Confidence: high
