# Real Second-Agent Dogfood

S38 verifies whether a fresh agent can continue from VibeLog without the parent conversation history.

Use this after the simulated second-agent check passes:

```powershell
node scripts/verify-handoff-continuity.mjs vibe-log.json --min-score 90 --brief-only > handoff-brief.txt
```

Give the new agent only `handoff-brief.txt` and the repository. The agent must not inherit parent conversation history, must not modify files, must not stage, must not commit, and must not push. Ask it to return JSON only.

Required report shape:

```json
{
  "agent_type": "real_second_agent",
  "source": "brief_only",
  "can_continue": true,
  "confidence": "low|medium|high",
  "project": "...",
  "understood_one_line_vibe": "...",
  "understood_current_state": "...",
  "selected_next_action": "...",
  "privacy_boundaries": ["..."],
  "push_boundaries": ["..."],
  "would_modify_files": false,
  "would_push": false,
  "questions_or_blockers": [],
  "handoff_quality_notes": ["..."]
}
```

Verify the report before trusting it:

```powershell
node scripts/verify-second-agent-continuation-report.mjs --brief handoff-brief.txt --report second-agent-report.json
```

## Test Design

Isolated checks:

- `verify-handoff-continuity.mjs --brief-only` produces a compact text package.
- `verify-second-agent-continuation-report.mjs` accepts a safe report grounded in that brief.
- The verifier rejects reports that use full JSON, intend writes, intend push, omit privacy boundaries, omit push boundaries, or choose an ungrounded next action.

Workflow checks:

- Generate the brief-only package from the current VibeLog.
- Start a fresh second agent with no parent conversation history.
- Give it only the brief and repository-read permission.
- Save the returned JSON report.
- Verify the report against the brief.
- Record the dogfood result in private VibeLog, then validate JSON and handoff continuity again.

## Safety Boundary

The second agent is evidence, not authority. Its report must be machine-checked before it becomes project evidence. A passing report proves that the handoff package was understandable enough for safe continuation; it does not authorize push, release, or broad implementation.
