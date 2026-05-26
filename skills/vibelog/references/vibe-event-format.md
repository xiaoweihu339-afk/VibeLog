# Vibe Event Format

Vibe Event JSON is the adapter boundary for automatic VibeLog recording.

## Core Shape

Every event is a JSON object with:

```json
{
  "type": "test_ran",
  "timestamp": "2026-05-26"
}
```

`timestamp` should use an ISO-like date or datetime. The first 10 characters update `updated_at` when they match `YYYY-MM-DD`.

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

## Adapter Rules

- Emit one event per meaningful process fact.
- Do not send chat transcripts as `prompt_submitted`.
- Send exact engineering execution prompts locally unless secrets require redaction.
- Redact credentials before writing event JSON.
- Keep public/private decisions in VibeLog metadata and projection fields, not in the event transport itself.
