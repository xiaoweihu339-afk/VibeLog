# Export JSON

VibeLog is Markdown-first. Treat `vibe-log.md` as the source of truth, then regenerate `vibe-log.json` for tools, uploads, search, or future website import.

Slice 3 added a deterministic exporter for the strict Markdown subset used by the current templates and examples. Slice 16 adds stronger schema validation for exported JSON.

## Export

From the repository root:

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
```

Export an example:

```powershell
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out tmp/public-sample.vibe-log.json
```

## Validate

Run the validator on an exported JSON file:

```powershell
node scripts/validate-vibelog.mjs vibe-log.json
```

The validator enforces the VibeLog schema subset used by `skills/vibelog/assets/vibe-log.schema.json`:

- required fields and required nested objects
- type checks, including string-or-array fields used by the current Markdown exporter
- enum checks for schema, stage, visibility, creation mode, prompt types, verification results, artifact types, and similar controlled values
- unexpected-field checks where the schema sets `additionalProperties: false`
- practical VibeLog checks such as non-empty identity strings and readable execution prompt fields

This is not full JSON Schema support. It is a dependency-free subset designed for the current VibeLog data contract, examples, upload preparation, and agent handoff.

## Check Drift

Use `--check` when `vibe-log.json` should already match `vibe-log.md`:

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

The command exits with a non-zero status if the JSON is stale or different.

## Run Tests

```powershell
node --test
```

The tests cover the public sample example, JSON writing, drift detection, and validator failures.

## Current Limits

The exporter intentionally supports a strict subset:

- YAML-like frontmatter with strings, booleans, and inline arrays
- `##` top-level sections
- `###` repeated entries
- bold-label fields such as `**Type:** feature`
- simple bullet lists
- text sections for `One-Line Vibe`, `Current Idea`, and `Public Summary`

Avoid free-form Markdown structures inside fields if you need deterministic JSON export. Keep rich narrative in normal Markdown text, but keep structured data in the template's existing headings and bold-label fields.
