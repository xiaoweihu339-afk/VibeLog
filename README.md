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

The first platform-neutral recording path is the recorder core:

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
```

The first hook adapter target is Claude Code:

```powershell
node scripts/claude-code-hook-adapter.mjs --log vibe-log.md --json vibe-log.json --event-dir .vibelog-events
```

The scratch-local live hook verifier is:

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\claude-live-hook-test-live" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --live --prompt "Reply with OK. Do not use tools." --max-budget-usd 0.05
```

The project-local opt-in hook settings generator is:

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

The real-project-style opt-in acceptance verifier is:

```powershell
node scripts/verify-claude-code-opt-in-project.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-10-real-project-opt-in" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

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
|       |   |-- claude-code-hooks.settings.example.json
|       |   |-- vibe-log-template.md
|       |   `-- vibe-log.schema.json
|       `-- references/
|           |-- claude-code-hooks-adapter.md
|           |-- vibe-event-format.md
|           `-- vibelog-format.md
|-- docs/
|   |-- guides/
|   |   |-- agent-dogfood-protocol.md
|   |   |-- agent-dogfood-protocol.zh.md
|   |   |-- claude-code-adapter.md
|   |   |-- claude-code-adapter.zh.md
|   |   |-- export-json.md
|   |   |-- progress-reporting.md
|   |   |-- progress-reporting.zh.md
|   |   |-- recorder-core.md
|   |   |-- recorder-core.zh.md
|   |   |-- quickstart.md
|   |   |-- manual-test-guide.md
|   |   |-- example-scenario.md
|   |   |-- vibe-verification-guide.md
|   |   |-- vibe-verification-guide.zh.md
|   |   `-- validation-checklist.md
|   |-- product/
|   |   |-- vibelog-studio-mvp-requirements.md
|   |   `-- vibehub-long-term-product-document.md
|   |-- reports/
|   |   |-- slice-4-vibe-verification-report.md
|   |   |-- slice-4-vibe-verification-report.zh.md
|   |   |-- slice-5-recorder-core-report.md
|   |   |-- slice-5-recorder-core-report.zh.md
|   |   |-- slice-6-claude-code-adapter-report.md
|   |   `-- slice-6-claude-code-adapter-report.zh.md
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
|   |-- billmate-lite/
|   |   |-- README.md
|   |   |-- vibe-log.md
|   |   `-- vibe-log.json
|   `-- reading-card-lite/
|       |-- README.md
|       |-- vibe-log.md
|       `-- vibe-log.json
|-- scripts/
|   |-- claude-code-hook-adapter.mjs
|   |-- configure-claude-code-vibelog-hooks.mjs
|   |-- export-vibelog.mjs
|   |-- record-vibelog-event.mjs
|   |-- verify-claude-code-live-hook.mjs
|   `-- validate-vibelog.mjs
|-- test/
|   |-- claude-code-hook-adapter.test.mjs
|   |-- configure-claude-code-vibelog-hooks.test.mjs
|   |-- export-vibelog.test.mjs
|   |-- record-vibelog-event.test.mjs
|   |-- verify-claude-code-live-hook.test.mjs
|   |-- validate-vibelog.test.mjs
|   `-- vibelog-examples.test.mjs
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

## Record Events

Use the recorder core when an agent, hook, or adapter has a structured Vibe Event JSON payload:

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
```

See [Recorder Core](docs/guides/recorder-core.md) and [Vibe Event Format](skills/vibelog/references/vibe-event-format.md).

## Claude Code Adapter

Use the Claude Code adapter when a Claude Code hook should record Vibe Events automatically:

```powershell
node scripts/claude-code-hook-adapter.mjs --log vibe-log.md --json vibe-log.json --event-dir .vibelog-events
```

For setup notes, see [Claude Code Adapter](docs/guides/claude-code-adapter.md) and the example settings file at [claude-code-hooks.settings.example.json](skills/vibelog/assets/claude-code-hooks.settings.example.json).

For scratch-local live verification, see [Live Hook Verification](docs/guides/live-hook-verification.md).

For project-local opt-in setup, see [Claude Code Opt-In Install](docs/guides/claude-code-opt-in-install.md).

## Files

### `vibe-log.md`

The human-readable source of truth. Agents should update this file first.

### `vibe-log.json`

The structured export format. Future websites or tools can use it for upload, search, timelines, or product showcase pages.

### `vibe-log.schema.json`

The JSON schema for VibeLog v0.2 draft exports.

### `scripts/`

Dependency-free Node.js tools for deterministic Markdown-to-JSON export and lightweight validation.

- `export-vibelog.mjs`: regenerate JSON from Markdown.
- `record-vibelog-event.mjs`: apply one structured Vibe Event JSON file to Markdown and optionally regenerate JSON.
- `claude-code-hook-adapter.mjs`: map Claude Code hook JSON input to Vibe Event JSON and call the recorder core.
- `configure-claude-code-vibelog-hooks.mjs`: dry-run-first generator for project-local Claude Code VibeLog hook settings.
- `verify-claude-code-live-hook.mjs`: create scratch Claude Code settings, run fixture hook payloads, and optionally verify a tiny live Claude Code hook session.
- `verify-claude-code-opt-in-project.mjs`: verify project-local opt-in hooks in a realistic scratch project by executing generated settings commands.
- `validate-vibelog.mjs`: lightweight VibeLog JSON validator.

### `docs/product/`

Product strategy and MVP requirements for the future VibeHub / VibeLog Studio direction.

### `docs/guides/`

Practical guides for using and testing the skill:

- [Quickstart](docs/guides/quickstart.md)
- [Claude Code Adapter](docs/guides/claude-code-adapter.md)
- [Claude Code Adapter 指南](docs/guides/claude-code-adapter.zh.md)
- [Claude Code Opt-In Install](docs/guides/claude-code-opt-in-install.md)
- [Claude Code Opt-In 安装指南](docs/guides/claude-code-opt-in-install.zh.md)
- [Export JSON](docs/guides/export-json.md)
- [Project progress reporting](docs/guides/progress-reporting.md)
- [项目进度汇报机制](docs/guides/progress-reporting.zh.md)
- [Recorder Core](docs/guides/recorder-core.md)
- [Recorder Core 指南](docs/guides/recorder-core.zh.md)
- [Live Hook Verification](docs/guides/live-hook-verification.md)
- [Live Hook 验证指南](docs/guides/live-hook-verification.zh.md)
- [Vibe verification guide](docs/guides/vibe-verification-guide.md)
- [Vibe 验证指南](docs/guides/vibe-verification-guide.zh.md)
- [Agent dogfood protocol](docs/guides/agent-dogfood-protocol.md)
- [Agent Dogfood 协议](docs/guides/agent-dogfood-protocol.zh.md)
- [Manual test guide](docs/guides/manual-test-guide.md)
- [Example scenario](docs/guides/example-scenario.md)
- [Validation checklist](docs/guides/validation-checklist.md)
- [Agent usage guide](skills/vibelog/references/agent-usage-guide.md)

### `docs/releases/`

Human-readable version notes.

### `docs/reports/`

User-review reports for completed slices:

- [Slice 4 vibe verification report](docs/reports/slice-4-vibe-verification-report.md)
- [Slice 4 Vibe 验证报告](docs/reports/slice-4-vibe-verification-report.zh.md)
- [Slice 5 recorder core report](docs/reports/slice-5-recorder-core-report.md)
- [Slice 5 Recorder Core 报告](docs/reports/slice-5-recorder-core-report.zh.md)
- [Slice 6 Claude Code adapter report](docs/reports/slice-6-claude-code-adapter-report.md)
- [Slice 6 Claude Code Adapter 报告](docs/reports/slice-6-claude-code-adapter-report.zh.md)
- [Slice 7 live hook verification report](docs/reports/slice-7-live-hook-verification-report.md)
- [Slice 7 Live Hook 验证报告](docs/reports/slice-7-live-hook-verification-report.zh.md)
- [Slice 8 opt-in hook install report](docs/reports/slice-8-opt-in-hook-install-report.md)
- [Slice 8 Opt-In Hook 安装报告](docs/reports/slice-8-opt-in-hook-install-report.zh.md)
- [Slice 9 first audit fixes report](docs/reports/slice-9-first-audit-fixes-report.md)
- [Slice 9 第一次全面检查修复报告](docs/reports/slice-9-first-audit-fixes-report.zh.md)
- [Slice 10 real project opt-in report](docs/reports/slice-10-real-project-opt-in-report.md)
- [Slice 10 真实项目 Opt-In 验收报告](docs/reports/slice-10-real-project-opt-in-report.zh.md)

### `examples/`

Generated VibeLog examples from real or dogfood sessions. These examples show process records, not app source code.

- `examples/vibelog-studio/`: generated log from the earlier VibeLog Studio dogfood session.
- `examples/billmate-lite/`: generated log from an agent-simulated billing project dogfood test.
- `examples/reading-card-lite/`: generated log from an agent-run scratch project dogfood test.

## Current Status

This repository contains the VibeLog v0.2 draft prototype:

- skill instructions
- Markdown template
- JSON schema
- format reference
- Claude Code hook adapter notes
- scratch-local live Claude Code hook verifier
- project-local opt-in Claude Code hook settings generator
- deterministic Markdown-to-JSON exporter
- lightweight JSON validator
- design spec
- self-recorded project VibeLog

It is ready for local testing, generated example review, scratch-local Claude Code hook verification, and dry-run project-local hook settings generation. It is not yet a polished public package.

## Next Steps

- Test the opt-in hook generator across real user projects.
- Add full JSON Schema validation.
- Install and test the skill in real agent sessions.
- Add adapters for other agent environments, such as Codex hooks, Cursor rules, or AGENTS.md.
- Add more generated VibeLog examples produced by real agent sessions.
- Decide on a license before broad public reuse.

## License

No license has been selected yet.
