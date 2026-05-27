# Vibe Event Format

Vibe Event JSON is the adapter boundary for automatic VibeLog recording. A recorder may consume one event at a time or an ordered local event stream.

## Core Shape

Every event is a JSON object with:

```json
{
  "type": "test_ran",
  "timestamp": "2026-05-26"
}
```

`timestamp` should use an ISO-like date or datetime. The first 10 characters update `updated_at` when they match `YYYY-MM-DD`.

## Event Streams

Use event streams when a session, hook, or adapter accumulates multiple process facts before writing to `vibe-log.md`.

Supported local stream shapes:

- JSON array of Vibe Event objects.
- JSONL where each non-empty line is one Vibe Event object.

Events are applied in file order:

```jsonl
{"type":"prompt_submitted","timestamp":"2026-05-27T09:00:00+08:00","agent_or_tool":"Codex","prompt_type":"build","prompt_visibility":"summary","recording_mode":"exact","prompt_summary":"Execute S24.","prompt_text":"Execute S24.","result":"Prompt captured."}
{"type":"test_ran","timestamp":"2026-05-27T09:05:00+08:00","summary":"Focused tests passed.","evidence_ref":"node --test test/record-vibelog-event.test.mjs","result":"passed"}
```

## Supported Types

### `prompt_submitted`

Appends to `Execution Prompts`.

Required fields:

- `timestamp`
- `agent_or_tool`
- `prompt_type`
- `prompt_visibility`
- `recording_mode`
- `prompt_summary`
- `prompt_text`
- `result`

Optional fields:

- `reuse_notes`

### `idea_changed`

Appends to `Idea Evolution`.

Required fields:

- `timestamp`
- `change_type`
- `before`
- `after`
- `reason`

Optional fields:

- `source`
- `confidence`

### `decision_made`

Appends to `Human-in-the-Loop`.

Required fields:

- `timestamp`
- `decision_type`
- `human_input`
- `final_decision`
- `why_it_mattered`
- `impact`

Optional fields:

- `agent_proposal`

### `tool_used`

Appends to `Development Log`.

Required fields:

- `timestamp`
- `work_type`
- `summary`
- `details`
- `verification`

Optional fields:

- `files_changed`
- `follow_up`
- `source`
- `confidence`

### `test_ran`

Appends to `Verification Evidence`.

Required fields:

- `timestamp`
- `summary`
- `evidence_ref`
- `result`

Optional fields:

- `evidence_type`
- `details`
- `residual_risk`
- `source`
- `confidence`

### `bug_fixed`

Appends to `Bugfix / Incident Log`.

Required fields:

- `timestamp`
- `summary`
- `bug_symptom`
- `root_cause`
- `fix`
- `verification`

Optional fields:

- `follow_up`

### `handoff_updated`

Replaces `Handoff State`.

Required fields:

- `timestamp`
- `current_state`
- `completed`
- `pending`
- `next_actions`

Optional fields:

- `progress_snapshot`
- `in_progress`
- `blockers`
- `context_for_next_agent`

### `progress_updated`

Appends to `Vibe Progress`.

Required fields:

- `timestamp`
- `stage`
- `what_happened`

Optional fields:

- `tools_used`
- `problems`
- `next`
- `source`
- `confidence`

## Adapter Rules

- Emit one event per meaningful process fact.
- Do not send chat transcripts as `prompt_submitted`.
- Send exact engineering execution prompts locally unless secrets require redaction.
- Redact credentials before writing event JSON.
- Keep public/private decisions in VibeLog metadata and projection fields, not in the event transport itself.
