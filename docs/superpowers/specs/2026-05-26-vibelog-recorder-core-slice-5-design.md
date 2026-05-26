# VibeLog Recorder Core Slice 5 Design

## Goal

Build the first platform-neutral recorder core for VibeLog: a small local CLI that accepts a structured Vibe Event JSON file, updates `vibe-log.md`, and optionally regenerates `vibe-log.json`.

## Product Rationale

Slice 4 proved that an agent can dogfood VibeLog and produce verification evidence. Slice 5 turns that proof into a reusable recording path. The long-term VibeHub vision needs a stable bottom layer before any specific hook adapter or website feature can be trusted.

## Non-Goals

- No background daemon.
- No Claude Code hook implementation.
- No Codex hook implementation.
- No web upload.
- No database.
- No full JSON Schema validation.
- No automatic transcript dump.

## Architecture

Slice 5 adds a deterministic event-to-Markdown recorder:

```txt
Vibe Event JSON -> record-vibelog-event.mjs -> vibe-log.md -> export-vibelog.mjs -> vibe-log.json
```

Markdown remains the source of truth. The recorder only appends or replaces known VibeLog sections using the existing Markdown format that the exporter already understands.

## Vibe Event Types

The first version supports seven event types:

- `prompt_submitted`: append to `Execution Prompts`
- `idea_changed`: append to `Idea Evolution`
- `decision_made`: append to `Human-in-the-Loop`
- `tool_used`: append to `Development Log`
- `test_ran`: append to `Verification Evidence`
- `bug_fixed`: append to `Bugfix / Incident Log`
- `handoff_updated`: replace `Handoff State`

## File Responsibilities

- `scripts/record-vibelog-event.mjs`: CLI and library functions for applying one event to one VibeLog file.
- `test/record-vibelog-event.test.mjs`: red/green tests for event mapping, CLI behavior, JSON export, and combined session flow.
- `docs/guides/recorder-core.md`: user-facing guide for the recorder CLI.
- `docs/guides/recorder-core.zh.md`: Chinese guide.
- `skills/vibelog/references/vibe-event-format.md`: stable event contract reference for future adapters.

## Error Handling

The recorder rejects:

- missing event type
- unsupported event type
- malformed JSON
- missing required fields for a supported event
- missing input event path

Errors should be explicit enough for an adapter or agent to fix the event payload.

## Testing

Testing follows the project rule:

- isolated checks: each event type updates the intended section
- combined checks: a simulated session applies multiple events, exports JSON, validates the result, and keeps Markdown/JSON synchronized

## Acceptance Criteria

- Tests fail before the recorder exists.
- Recorder tests pass after implementation.
- CLI can update a temporary VibeLog from an event JSON file.
- CLI can regenerate JSON when `--json` is provided.
- Existing exporter, validator, example integrity tests, and full suite still pass.
- Root VibeLog records Slice 5 execution and progress.

## Progress Expectation

If Slice 5 is implemented and verified, conservative long-term progress moves from `12 / 100` to `15 / 100`.
