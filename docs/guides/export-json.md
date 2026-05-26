# Export JSON

VibeLog is Markdown-first. Treat `vibe-log.md` as the source of truth, then regenerate `vibe-log.json` for tools, uploads, search, or future website import.

Slice 3 adds a deterministic exporter for the strict Markdown subset used by the current templates and examples.

## Export

From the repository root:

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
```

Export an example:

```powershell
node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out tmp/billmate-lite.vibe-log.json
```

## Validate

Run the lightweight validator on an exported JSON file:

```powershell
node scripts/validate-vibelog.mjs vibe-log.json
```

The validator checks practical core requirements:

- required identity fields such as `schema`, `title`, `one_line_vibe`, `stage`, and `current_idea`
- known schema and stage values
- key array fields such as `idea_evolution`, `human_in_the_loop`, `execution_prompts`, `development_log`, and `verification_evidence`
- `execution_prompts[].recording_mode` values

This is not full JSON Schema validation yet. It is a small gate for catching common drift before upload or handoff.

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

The tests cover the BillMate Lite dogfood example, JSON writing, drift detection, and validator failures.

## Current Limits

The exporter intentionally supports a strict subset:

- YAML-like frontmatter with strings, booleans, and inline arrays
- `##` top-level sections
- `###` repeated entries
- bold-label fields such as `**Type:** feature`
- simple bullet lists
- text sections for `One-Line Vibe`, `Current Idea`, and `Public Summary`

Avoid free-form Markdown structures inside fields if you need deterministic JSON export. Keep rich narrative in normal Markdown text, but keep structured data in the template's existing headings and bold-label fields.
