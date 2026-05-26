# Recorder Core Guide

The VibeLog recorder core turns structured Vibe Event JSON into Markdown-first VibeLog updates.

## Principle

Adapters should not rewrite VibeLog directly. They should emit small Vibe Event JSON payloads and let the recorder update `vibe-log.md`.

```txt
agent / hook / adapter -> Vibe Event JSON -> recorder core -> vibe-log.md -> vibe-log.json
```

Markdown remains the source of truth. JSON is regenerated from Markdown when needed.

## CLI

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
```

Arguments:

- `--event`: required path to one Vibe Event JSON file.
- `--log`: VibeLog Markdown path. Defaults to `vibe-log.md`.
- `--json`: optional JSON output path. When provided, the recorder regenerates JSON after updating Markdown.

## Supported Event Types

- `prompt_submitted`
- `idea_changed`
- `decision_made`
- `tool_used`
- `test_ran`
- `bug_fixed`
- `handoff_updated`

See `skills/vibelog/references/vibe-event-format.md` for field-level details.

## Example

```json
{
  "type": "test_ran",
  "timestamp": "2026-05-26",
  "summary": "Recorder tests passed.",
  "evidence_ref": "node --test test/record-vibelog-event.test.mjs",
  "result": "passed",
  "residual_risk": "No hook integration yet.",
  "source": "command output",
  "confidence": "high"
}
```

Run:

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
```

## Current Limits

- One CLI call applies one event.
- `handoff_updated` replaces the whole `Handoff State` section.
- The recorder does not inspect git diffs or command output by itself.
- The recorder does not upload anything.
- Hook adapters still need to be built on top of this core.

## Verification

Run:

```powershell
node --test test/record-vibelog-event.test.mjs
node --test
node scripts/validate-vibelog.mjs vibe-log.json
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```
