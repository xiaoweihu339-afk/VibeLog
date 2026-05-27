# VibeLog Agent Instructions

Use VibeLog when this project needs durable memory for a vibe-built product: idea, idea changes, human decisions, engineering execution prompts, implementation status, validation design, verification evidence, artifacts, development logs, bug fixes, and handoff state.

## Core Rules

- Keep `vibe-log.md` as the human-readable source of truth.
- Generate `vibe-log.json` from Markdown for agents, tools, and future upload.
- Record engineering execution prompts in `Execution Prompts` when they ask an agent to build, edit, debug, test, refactor, design implementation, write docs, deploy, inspect files, run commands, or do engineering research.
- Do not copy ordinary idea chat as a transcript. Distill it into idea evolution, decisions, human-in-the-loop entries, or open questions.
- Redact secrets, credentials, tokens, private personal data, and sensitive business data.
- Default visibility is private unless the human explicitly chooses to publish.

## Workflow

1. If `vibe-log.md` exists, read it before changing the project.
2. If it does not exist, create it from `<path-to-VibeLog>/skills/vibelog/assets/vibe-log-template.md`.
3. During work, update implementation status, development log, bugfix / incident log, validation design, verification evidence, artifact index, and handoff state when evidence exists.
4. Before ending a meaningful task, update handoff state and next actions.
5. Export and validate JSON:

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

Use the full skill reference at `<path-to-VibeLog>/skills/vibelog/SKILL.md` when more detail is needed.
