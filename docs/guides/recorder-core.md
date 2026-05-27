# Recorder Core Guide

The VibeLog recorder core turns structured Vibe Event JSON into Markdown-first VibeLog updates. It can apply one event or an ordered local event stream.

## Principle

Adapters should not rewrite VibeLog directly. They should emit small Vibe Event JSON payloads and let the recorder update `vibe-log.md`.

```txt
agent / hook / adapter -> Vibe Event JSON or JSONL stream -> recorder core -> vibe-log.md -> vibe-log.json
```

Markdown remains the source of truth. JSON is regenerated from Markdown when needed.

## CLI

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
node scripts/record-vibelog-event.mjs --events events.jsonl --log vibe-log.md --json vibe-log.json
```

Arguments:

- `--event`: path to one Vibe Event JSON file.
- `--events`: path to a JSON array or JSONL event stream. Events are applied in file order.
- `--log`: VibeLog Markdown path. Defaults to `vibe-log.md`.
- `--json`: optional JSON output path. When provided, the recorder regenerates JSON after updating Markdown.

Provide exactly one of `--event` or `--events`.

## Supported Event Types

- `prompt_submitted`
- `idea_changed`
- `decision_made`
- `tool_used`
- `test_ran`
- `bug_fixed`
- `handoff_updated`
- `progress_updated`

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

Event stream example:

```jsonl
{"type":"prompt_submitted","timestamp":"2026-05-27T09:00:00+08:00","agent_or_tool":"Codex","prompt_type":"build","prompt_visibility":"summary","recording_mode":"exact","prompt_summary":"Execute S24.","prompt_text":"Execute S24.","result":"Prompt captured."}
{"type":"test_ran","timestamp":"2026-05-27T09:05:00+08:00","summary":"Focused S24 tests passed.","evidence_ref":"node --test test/record-vibelog-event.test.mjs","result":"passed"}
```

Run:

```powershell
node scripts/record-vibelog-event.mjs --events events.jsonl --log vibe-log.md --json vibe-log.json
```

## Current Limits

- One CLI call applies either one event or one ordered event stream.
- `handoff_updated` replaces the whole `Handoff State` section.
- The recorder does not inspect git diffs or command output by itself.
- The recorder does not upload anything.
- Live hook adapters still need separate environment verification.

## Verification

Run:

```powershell
node --test test/record-vibelog-event.test.mjs
node --test
node scripts/validate-vibelog.mjs vibe-log.json
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```
