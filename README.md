# VibeLog

VibeLog is a Markdown-first agent skill and process record standard for vibe-built products.

It helps agents and humans record the full lifecycle of a vibe product: the one-line idea, idea expansion, idea evolution, creation mode, human-in-the-loop decisions, implementation status, validation design, verification evidence, development logs, bug fixes, product artifacts, handoff state, and engineering execution prompts.

## Current Version

This repository is currently at **VibeLog v0.2 draft**.

The first version proved the core idea: a local Markdown-first VibeLog can preserve idea evolution, human decisions, development progress, and execution prompts.

The second version upgrades VibeLog into a **hook-friendly process record standard** designed for automatic updates during real vibe coding sessions, starting with a planned Claude Code hook adapter.

```txt
Vibe Repo = VibeLog + Project Artifacts
VibeLog = process memory
Project Artifacts = product evidence
```

## Why This Exists

Vibe coding is often messy:

- Ideas change in chat.
- Human decisions are mixed with agent suggestions.
- Important prompts disappear across sessions.
- Bugs and fixes are scattered across commits, chats, and memory.
- Tests and validation evidence are often missing or hard to trust.
- A new agent often has no idea what has already happened.

VibeLog turns that process into a durable project memory.

## Design Principle

```txt
User says naturally, agent records structurally.
```

The user should keep creating in a natural conversation. The agent or hook adapter should classify the process and update the structured VibeLog.

## What VibeLog Records

- `One-Line Vibe`: one sentence describing what is being built.
- `Current Idea`: the latest version of the product idea.
- `Idea Expansion`: problem, users, value, features, and use cases.
- `Idea Evolution`: how the idea changed over time.
- `Creation Mode`: how humans and agents participated, without ranking or judging the mode.
- `Human-in-the-Loop`: where the human made direction, taste, scope, tradeoff, approval, rejection, risk, naming, or prioritization decisions.
- `Implementation Status`: current state, completed work, in-progress work, pending work, blockers, and next actions.
- `Validation Design`: success criteria, core user paths, manual tests, automated tests, edge cases, and risks.
- `Verification Evidence`: test results, command output summaries, screenshots, demos, manual QA, and residual risk.
- `Project Context`: important files, commands, known issues, and areas not to change.
- `Artifact Index`: references to code, demos, screenshots, design files, releases, test outputs, prompt libraries, and agent configs.
- `Execution Prompts`: strict ledger for engineering execution prompts used during vibe coding.
- `Development Log`: normal engineering work such as features, bug fixes, refactors, tests, docs, releases, and chores.
- `Handoff State`: the concise state a future human or agent needs to continue safely.
- `Vibe Progress`: chronological product progress.
- `Public Summary`: a future website-ready summary.

## Key Rule

Engineering execution prompts must be recorded in `Execution Prompts`.

Chat-like idea exploration should not be copied as a transcript. It should be distilled into `Idea Evolution`, `Human-in-the-Loop`, `Decisions`, or `Open Questions`.

VibeLog is designed for automation hooks. A future Claude Code or Codex adapter can update it continuously during events such as prompt submission, tool use, turn stop, and context compaction.

## Repository Identity

This repository is skill-first. Its primary purpose is to make the `vibelog` skill, schema, and documentation easy for others to reuse.

Example projects are kept under `examples/` as generated VibeLog records only. They are not included as application source code in this repository.

## Automation Direction

The first automation target is Claude Code because its hook system can call deterministic scripts during the coding lifecycle.

Recommended event mapping:

```txt
SessionStart      -> load concise VibeLog context
UserPromptSubmit  -> classify user prompt and record engineering prompts
PostToolUse       -> record file edits, commands, tests, and artifacts
Stop              -> update progress, implementation status, handoff, and JSON export
PreCompact        -> preserve essential context before compaction
PostCompact       -> refresh handoff state if useful
```

See [Claude Code adapter notes](skills/vibelog/references/claude-code-hooks-adapter.md).

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
|           |-- claude-code-hooks-adapter.md
|           `-- vibelog-format.md
|-- docs/
|   |-- guides/
|   |   |-- export-json.md
|   |   |-- progress-reporting.md
|   |   |-- progress-reporting.zh.md
|   |   |-- quickstart.md
|   |   |-- manual-test-guide.md
|   |   |-- example-scenario.md
|   |   `-- validation-checklist.md
|   |-- product/
|   |   |-- vibelog-studio-mvp-requirements.md
|   |   `-- vibehub-long-term-product-document.md
|   |-- releases/
|   |   `-- v0.2-draft.md
|   `-- superpowers/
|       `-- specs/
|           `-- 2026-05-25-vibelog-v0.1-design.md
|-- examples/
|   |-- vibelog-studio/
|   |   |-- README.md
|   |   |-- vibe-log.md
|   |   `-- vibe-log.json
|   `-- billmate-lite/
|       |-- README.md
|       |-- vibe-log.md
|       `-- vibe-log.json
|-- scripts/
|   |-- export-vibelog.mjs
|   `-- validate-vibelog.mjs
|-- test/
|   |-- export-vibelog.test.mjs
|   `-- validate-vibelog.test.mjs
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

## Export JSON

`vibe-log.md` is the source of truth. Regenerate JSON when a website, tool, or future VibeHub upload flow needs structured data:

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
```

Validate the generated JSON:

```powershell
node scripts/validate-vibelog.mjs vibe-log.json
```

Check whether an existing JSON export is stale:

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

See [Export JSON](docs/guides/export-json.md) for the supported Markdown subset and current limitations.

## Files

### `vibe-log.md`

The human-readable source of truth. Agents should update this file first.

### `vibe-log.json`

The structured export format. Future websites or tools can use it for upload, search, timelines, or product showcase pages.

### `vibe-log.schema.json`

The JSON schema for VibeLog v0.2 draft exports.

### `scripts/`

Dependency-free Node.js tools for deterministic Markdown-to-JSON export and lightweight validation.

### `docs/product/`

Product strategy and MVP requirements for the future VibeHub / VibeLog Studio direction.

### `docs/guides/`

Practical guides for using and testing the skill:

- [Quickstart](docs/guides/quickstart.md)
- [Export JSON](docs/guides/export-json.md)
- [Project progress reporting](docs/guides/progress-reporting.md)
- [项目进度汇报机制](docs/guides/progress-reporting.zh.md)
- [Manual test guide](docs/guides/manual-test-guide.md)
- [Example scenario](docs/guides/example-scenario.md)
- [Validation checklist](docs/guides/validation-checklist.md)
- [Agent usage guide](skills/vibelog/references/agent-usage-guide.md)

### `docs/releases/`

Human-readable version notes.

### `examples/`

Generated VibeLog examples from real or dogfood sessions. These examples show process records, not app source code.

- `examples/vibelog-studio/`: generated log from the earlier VibeLog Studio dogfood session.
- `examples/billmate-lite/`: generated log from an agent-simulated billing project dogfood test.

## Current Status

This repository contains the VibeLog v0.2 draft prototype:

- skill instructions
- Markdown template
- JSON schema
- format reference
- Claude Code hook adapter notes
- deterministic Markdown-to-JSON exporter
- lightweight JSON validator
- design spec
- self-recorded project VibeLog

It is ready for local testing and Claude Code adapter implementation. It is not yet a polished public package.

## Next Steps

- Build and test a Claude Code hook adapter.
- Add full JSON Schema validation.
- Install and test the skill in real agent sessions.
- Add adapters for other agent environments, such as Codex hooks, Cursor rules, or AGENTS.md.
- Add more generated VibeLog examples produced by real agent sessions.
- Decide on a license before broad public reuse.

## License

No license has been selected yet.
