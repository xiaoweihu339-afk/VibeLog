---
name: vibelog
description: Use when a user wants to record, reconstruct, update, hand off, or publish a vibe product idea, vibe coding process, implementation status, or execution prompts in a VibeLog file.
---

# VibeLog

## Purpose

VibeLog keeps a Markdown-first record of a vibe product from messy idea to implementation progress. It is useful even without a website: `vibe-log.md` is the source of truth, and `vibe-log.json` is the upload/export shape.

Do not require a website, account, server, or upload flow to use this skill. The local log is the product for v0.1.

## When To Use

Use this skill when the user wants to:

- Capture a one-line vibe idea.
- Expand scattered thoughts into a structured product idea.
- Record idea changes, pivots, additions, or removals.
- Record human-in-the-loop judgment points: direction, taste, tradeoffs, approvals, rejections, risks, scope, naming, and prioritization.
- Start or update a `vibe-log.md`.
- Call the skill in the middle of an existing vibe product and reconstruct prior context.
- Record current implementation status for handoff to another agent.
- Record normal project development work, including features, bug fixes, refactors, tests, docs, chores, releases, and config changes.
- Strictly record vibecoding engineering execution prompts used for building, editing, debugging, testing, refactoring, implementation design, documentation, deployment, file inspection, command execution, or research.
- Generate or refresh JSON suitable for future website upload.

## Core Files

Prefer these files in the project root:

```txt
vibe-log.md
vibe-log.json
```

If there is no project yet, create the log in the user's chosen idea folder. If no folder is obvious, ask where to put it.

Use these bundled resources when needed:

- `assets/vibe-log-template.md`: starting template.
- `assets/vibe-log.schema.json`: JSON export schema.
- `references/vibelog-format.md`: full format and field reference.

## Workflow

### 1. Locate Or Create The Log

Look for `vibe-log.md` in the current project root. If it exists, read it before doing anything else. If it does not exist, create it from `assets/vibe-log-template.md`.

When creating the log, fill at least:

- `title`
- `one_line_vibe`
- `stage`
- `visibility`
- `created_at`
- `updated_at`
- `One-Line Vibe`
- `Current Idea`

### 2. If Called Mid-Project, Reconstruct First

When the skill is invoked after work has already happened, reconstruct prior context before appending new progress.

Use available evidence in this order:

1. User's current message and conversation context.
2. Existing `vibe-log.md`, if present.
3. Local docs, README files, specs, plans, and product notes.
4. Git history and changed files.
5. Project files that reveal current implementation state.

Record reconstructed material as normal entries, but mark uncertainty explicitly:

```md
**Source:** reconstructed from conversation / git / files / user memory
**Confidence:** high / medium / low
```

Do not invent exact dates, decisions, or prompts. Use an approximate timestamp only if the source supports it; otherwise write `unknown`.

### 3. Maintain The Idea Layer

Every update should preserve the idea history:

- Keep `One-Line Vibe` concise and current.
- Update `Current Idea` when the user's latest direction changes the product.
- Append to `Idea Evolution` for meaningful changes.
- Record firm choices in `Decisions`.
- Record human judgment points in `Human-in-the-Loop`.
- Keep unresolved items in `Open Questions`.

Do not delete old idea history unless the user explicitly asks to redact it.

### 4. Record Human-In-The-Loop Judgment

Use `Human-in-the-Loop` when the human shaped the product in a way future agents should understand.

Record:

- type: `direction`, `scope`, `taste`, `tradeoff`, `approval`, `rejection`, `risk`, `naming`, or `prioritization`
- human input
- agent proposal, if relevant
- final decision
- why it mattered
- impact on idea, design, implementation, or next steps

Use this section for human judgment, not routine mechanical updates. The point is to preserve where the human steered the vibe.

### 5. Maintain The Implementation Layer

Keep `Implementation Status` useful for handoff:

- `Current State`: where the product is now.
- `Completed`: finished work.
- `In Progress`: active work.
- `Pending`: planned work not started.
- `Blocked`: blocked work and reasons.
- `Next Actions`: the smallest useful next steps.
- `Important Context for Next Agent`: files, decisions, pitfalls, and work not to repeat.

If there is code, keep `Project Context` current with important files and run/test commands.

### 6. Record Development Work

Use `Development Log` for normal project development events that a future agent may need to understand.

Record the entry type:

- `feature`
- `bugfix`
- `refactor`
- `test`
- `docs`
- `chore`
- `release`
- `config`

For bug fixes, capture as much of this as is known:

- bug symptom
- root cause
- fix
- verification
- follow-up

Do not pretend to know a root cause. If it is not known, write `unknown` and describe the evidence.

### 7. Record Execution Prompts

Use `Execution Prompts` as the engineering prompt ledger. This is mandatory for prompts that directly guided vibecoding execution.

Record:

- agent or tool used
- prompt type: `build`, `refactor`, `debug`, `test`, `design`, `docs`, `deploy`, or `research`
- prompt visibility: `hidden`, `summary`, or `full`
- recording mode: `exact`, `redacted`, `reconstructed`, or `summary_only`
- safe prompt summary
- exact prompt text for engineering execution prompts unless redacted for secrets or privacy
- result
- reuse notes for future agents

Strict boundary:

- If a prompt asks an agent to build, edit, debug, test, refactor, design implementation, write docs, deploy, inspect files, run commands, or perform engineering research, record it here.
- Record exact prompt text by default for engineering execution prompts.
- Never record secrets, API keys, tokens, private credentials, or private personal data in prompt text. Redact only the sensitive parts and set recording mode to `redacted`.
- If an old prompt is reconstructed from memory, conversation, files, or git history, set recording mode to `reconstructed`.
- Do not put ordinary idea-chat messages here. For chat-like idea exploration, extract only the idea changes, human judgments, decisions, and open questions into their own sections.

### 8. Append Progress Chronologically

Use `Vibe Progress` for chronological updates. Each meaningful session should include:

- stage
- what happened
- tools used
- problems
- next step

Keep progress concise. The log should be readable, not a transcript dump.

### 9. Export JSON

When asked to export or prepare upload data, generate `vibe-log.json` from `vibe-log.md` using the schema in `assets/vibe-log.schema.json`.

Markdown remains the source of truth. If JSON and Markdown disagree, update Markdown first, then regenerate JSON.

## Visibility Rules

Default to private:

- `visibility: private`
- `code_visibility: hidden`
- `prompt_visibility: summary`
- `collaboration_status: closed`

Ask before changing visibility from private to any public value.

Do not expose full prompts by default. Prefer summaries unless the user explicitly wants full prompt logging.

This visibility rule controls what can be published. It does not remove the local requirement to record engineering execution prompts in `Execution Prompts`.

## Handoff Rule

Before ending a work session, make sure the next agent can answer:

- What is this vibe product?
- What is the current idea?
- What has already changed in the idea?
- Where did the human steer, approve, reject, or choose tradeoffs?
- What is implemented?
- What is completed, in progress, pending, or blocked?
- What development work was recently completed, especially bug fixes?
- What prompt directions were important?
- What should happen next?

If the log does not answer these questions, update it.
