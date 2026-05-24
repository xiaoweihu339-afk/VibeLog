# VibeLog

VibeLog is a Markdown-first agent skill and logging standard for vibe-built products.

It helps agents and humans record the full lifecycle of a vibe product: the one-line idea, idea expansion, idea evolution, human-in-the-loop decisions, implementation status, development logs, bug fixes, and engineering execution prompts.

## Why This Exists

Vibe coding is often messy:

- Ideas change in chat.
- Human decisions are mixed with agent suggestions.
- Important prompts disappear across sessions.
- Bugs and fixes are scattered across commits, chats, and memory.
- A new agent often has no idea what has already happened.

VibeLog turns that process into a durable project memory.

## What VibeLog Records

- `One-Line Vibe`: one sentence describing what is being built.
- `Current Idea`: the latest version of the product idea.
- `Idea Expansion`: problem, users, value, features, and use cases.
- `Idea Evolution`: how the idea changed over time.
- `Human-in-the-Loop`: where the human made direction, taste, scope, tradeoff, approval, rejection, risk, naming, or prioritization decisions.
- `Implementation Status`: current state, completed work, in-progress work, pending work, blockers, and next actions.
- `Project Context`: important files, commands, known issues, and areas not to change.
- `Execution Prompts`: strict ledger for engineering execution prompts used during vibe coding.
- `Development Log`: normal engineering work such as features, bug fixes, refactors, tests, docs, releases, and chores.
- `Vibe Progress`: chronological product progress.
- `Public Summary`: a future website-ready summary.

## Key Rule

Engineering execution prompts must be recorded in `Execution Prompts`.

Chat-like idea exploration should not be copied as a transcript. It should be distilled into `Idea Evolution`, `Human-in-the-Loop`, `Decisions`, or `Open Questions`.

## Repository Structure

```txt
.
|-- skills/
|   `-- vibelog/
|       |-- SKILL.md
|       |-- agents/
|       |   `-- openai.yaml
|       |-- assets/
|       |   |-- vibe-log-template.md
|       |   `-- vibe-log.schema.json
|       `-- references/
|           `-- vibelog-format.md
|-- docs/
|   `-- superpowers/
|       `-- specs/
|           `-- 2026-05-25-vibelog-v0.1-design.md
|-- vibe-log.md
`-- vibe-log.json
```

## Quick Start

Copy the skill into your Codex skills directory:

```powershell
Copy-Item -Recurse .\skills\vibelog "$env:USERPROFILE\.codex\skills\vibelog" -Force
```

Then ask Codex to use VibeLog:

```txt
Use the vibelog skill to create or update a VibeLog for this project.
```

For a new project, the skill creates:

```txt
vibe-log.md
vibe-log.json
```

For an existing project, it reads current files, docs, git history, and conversation context to reconstruct prior idea and implementation history before appending new progress.

## Files

### `vibe-log.md`

The human-readable source of truth. Agents should update this file first.

### `vibe-log.json`

The structured export format. Future websites or tools can use it for upload, search, timelines, or product showcase pages.

### `vibe-log.schema.json`

The JSON schema for VibeLog v0.1 exports.

## Current Status

This repository contains the VibeLog v0.1 prototype:

- skill instructions
- Markdown template
- JSON schema
- format reference
- design spec
- self-recorded project VibeLog

It is ready for local testing and GitHub upload. It is not yet a polished public package.

## Next Steps

- Add a deterministic Markdown-to-JSON exporter.
- Install and test the skill in real Codex sessions.
- Add adapters for other agent environments, such as Claude Code, Cursor rules, or AGENTS.md.
- Decide on a license before broad public reuse.

## License

No license has been selected yet.
