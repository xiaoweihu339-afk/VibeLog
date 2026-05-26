# Vibe Verification Guide

VibeLog verification should be agent-run first. The human reviews direction, realism, and final evidence; the agent runs repeatable checks and records the result.

## Principle

If an agent can vibe-verify it, do not make the human manually verify it.

Manual review should focus on judgment, not chores. The agent should create the scenario, run the commands, export the structured data, validate the output, and report evidence.

## Human Role

- Approve or reject the product direction.
- Reject logs that feel fake, over-polished, or disconnected from the real work.
- Judge whether the handoff state is understandable to another person or agent.
- Decide whether the public/private projection is acceptable.
- Make taste, scope, risk, naming, privacy, and release decisions.

## Agent Role

- Create or run a scratch vibe scenario outside the repository when a real project is unavailable.
- Record the process in VibeLog while preserving idea changes and human decisions.
- Record exact engineering execution prompts when those prompts directly guide building, editing, debugging, testing, refactoring, documentation, deployment, file inspection, command execution, or engineering research.
- Export Markdown to JSON.
- Validate JSON.
- Run isolated and combined checks.
- Report evidence, known gaps, residual risk, and conservative project progress.

## Isolated Checks

Each generated VibeLog should include:

- one-line idea
- current idea
- idea evolution
- human-in-the-loop decisions
- execution prompts
- development log
- bugfix or incident log
- validation design
- verification evidence
- artifact index
- handoff state
- public summary

## Combined Checks

Run the exporter, validator, drift check, and repository test suite together. The generated example folder must contain generated VibeLog records only, not scratch project source code.

Recommended commands:

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test
```

## Progress Snapshot

When reporting completion, include the conservative project progress snapshot from `docs/guides/progress-reporting.md`.

The snapshot is measured against the long-term VibeHub / Vibe Repo ecosystem, not just the local repository task list. Keep the number conservative and explain the next unlock.
