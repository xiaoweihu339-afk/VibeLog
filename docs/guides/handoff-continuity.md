# Handoff Continuity

Use this guide when checking whether a VibeLog is ready for another human or agent to continue the project.

Handoff continuity is stricter than JSON validity. A valid `vibe-log.json` proves structure. Handoff continuity asks whether the next agent can safely answer:

- what the project is
- where the project stands now
- what the human decided
- what verification evidence exists
- what the next action is
- what privacy, staging, push, or agent-environment boundaries must not be crossed

## Command

Run:

```powershell
node scripts\verify-handoff-continuity.mjs vibe-log.json
```

The command prints JSON with:

- `passed`
- `score`
- `failures`
- `warnings`
- `checks`
- `continuationBrief`

The default minimum score is `70`. Use `--min-score` for a stricter local gate:

```powershell
node scripts\verify-handoff-continuity.mjs vibe-log.json --min-score 90
```

Use `--brief-only` when preparing a small handoff package for another agent:

```powershell
node scripts\verify-handoff-continuity.mjs vibe-log.json --min-score 90 --brief-only
```

This prints only the continuation brief, not the full JSON result. It is the safest text to paste into a second-agent continuation prompt.

## Isolated Checks

The verifier checks the exported JSON for:

- project identity: `title`, `one_line_vibe`, and `current_idea`
- handoff state: `current_state`, `completed`, `pending`, and `next_actions`
- progress snapshot: `Project Progress`, `Next Unlock`, and `Main Risk`
- human-in-the-loop evidence
- passed verification evidence
- privacy boundary in `context_for_next_agent`
- push or staging boundary in `context_for_next_agent`

These are local deterministic checks. They do not call an external agent.

## Workflow Checks

Use the verifier after the normal VibeLog workflow:

```powershell
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\verify-handoff-continuity.mjs vibe-log.json
```

The workflow passes only when:

- Markdown exports to JSON.
- JSON validates against the schema subset.
- Handoff continuity passes.
- The `continuationBrief` gives a next agent enough context to continue without reading the full conversation.
- The `--brief-only` output can be used as the second-agent handoff package.

## Failure Meaning

A failed handoff continuity check means the VibeLog may still be structurally valid, but it is not yet reliable as an agent handoff source.

Fix the missing information in Markdown first, regenerate JSON, then rerun the verifier.

Do not weaken the verifier to pass a test. If the project cannot explain its next action, boundary, or evidence, report that failure.
