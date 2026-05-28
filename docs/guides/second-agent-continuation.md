# Second-Agent Continuation

Use this guide to test whether a VibeLog handoff package is enough for a separate agent to continue the project.

S37 is intentionally conservative: it adds a deterministic local simulation before using a real second agent. The simulation reads only the `--brief-only` handoff package. It does not read the full conversation, `vibe-log.md`, `vibe-log.json`, or `.vibelog-events/`.

## Step 1. Create The Brief-Only Package

Run:

```powershell
node scripts\verify-handoff-continuity.mjs vibe-log.json --min-score 90 --brief-only
```

Save that output to a local scratch file when you want a repeatable check.

## Step 2. Simulate The Second Agent

Run:

```powershell
node scripts\simulate-second-agent-continuation.mjs --brief handoff-brief.txt
```

The simulator checks that the brief-only package contains:

- `Project`
- `One-line vibe`
- `Current state`
- `Next action`
- `Privacy boundary`
- `Push boundary`

It rejects full JSON input. This keeps the test honest: the simulated second agent must rely on the same compact context a real agent would receive.

## Pass Criteria

The simulation passes when:

- the brief-only package is plain text, not JSON
- the next action is clear
- private VibeLog files or event streams are acknowledged as private or ignored
- pushing requires an explicit user request
- the simulated agent can name the next action without asking the user to repeat the project history

## Next Layer

After the simulation passes, run a real second-agent dogfood session. That future test should give the agent only the brief-only package and a tiny VibeLog skill/core task.

Do not use Claude Code Desktop / DeepSeek for this path. Do not push unless the user explicitly asks.
