---
name: vibelog
description: Use when a user wants to record, reconstruct, update, hand off, automate, or publish a vibe product idea, vibe coding process, implementation status, validation evidence, artifacts, or execution prompts in a VibeLog file.
---

# VibeLog

## Purpose

VibeLog is a Markdown-first process record for vibe-built products.

Core principle:

```txt
User says naturally, agent records structurally.
```

The skill should preserve the full vibe process without forcing the user into manual forms. It is useful even without a website: `vibe-log.md` is the human source of truth, and `vibe-log.json` is the structured export shape for agents, tools, and future VibeHub upload.

Do not require a website, account, server, or upload flow to use this skill. The local log is the product for the first version.

## When To Use

Use this skill when the user wants to:

- Capture a one-line vibe idea.
- Expand scattered thoughts into a structured product idea.
- Record idea changes, pivots, additions, removals, or scope changes.
- Record creation mode without judging whether the human or AI did more of the work.
- Record human-in-the-loop judgment points: direction, taste, tradeoffs, approvals, rejections, risks, scope, naming, privacy, release, and prioritization.
- Start or update a `vibe-log.md`.
- Call the skill in the middle of an existing vibe product and reconstruct prior context.
- Record current implementation status for handoff to another agent.
- Record validation design, verification evidence, manual tests, automated tests, screenshots, command outputs, or release confidence.
- Record normal project development work, including features, bug fixes, refactors, tests, docs, chores, releases, deployments, and config changes.
- Strictly record vibecoding engineering execution prompts used for building, editing, debugging, testing, refactoring, implementation design, documentation, deployment, file inspection, command execution, or research.
- Maintain a Vibe Repo made of process memory plus product artifacts.
- Generate or refresh JSON suitable for future website upload.

Use this skill from automation hooks when an agent environment supports lifecycle events such as `SessionStart`, `UserPromptSubmit`, `PostToolUse`, `Stop`, `PreCompact`, or `PostCompact`.

## Core Model

```txt
Vibe Repo = VibeLog + Project Artifacts
```

VibeLog is process memory:

- idea
- evolution
- decisions
- prompts
- implementation status
- development work
- tests
- verification
- handoff

Project Artifacts are product evidence:

- code
- demo
- screenshots
- design files
- docs
- releases
- test outputs
- deployment links
- agent configs

Artifacts should usually be referenced by path, URL, commit, attachment, or release. Do not copy large artifacts into the log.

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
- `references/vibelog-format.md`: field reference.
- `references/agent-usage-guide.md`: operational guide for agents using VibeLog during sessions.
- `references/claude-code-hooks-adapter.md`: notes for implementing Claude Code hook automation.
- `references/vibe-event-format.md`: structured event contract for recorder and adapter integrations.
- `../../docs/guides/progress-reporting.md`: project progress reporting rule for human-facing task summaries.

## Standard Process Record

VibeLog does not force every user into the same workflow. It standardizes how different vibe workflows are recorded.

Record these process areas when evidence exists:

1. Vibe Intake
2. Idea Expansion
3. Context Capture
4. Scope / Plan
5. Execution Prompt Ledger
6. Build / Development Log
7. Human-in-the-Loop Decisions
8. Validation Design
9. Verification Evidence
10. Bugfix / Incident Log
11. Handoff State
12. Public / Private Projection
13. Branch / Remix Readiness

Use three strictness levels:

- `minimal`: one-line vibe, current idea, status, next step, public summary.
- `core`: minimal plus idea evolution, decisions, execution prompts, development log, validation design, handoff.
- `full`: core plus verification evidence, artifact index, branch/remix metadata, collaborator/release history.

## Automation Event Model

When the skill is used through hooks, prefer continuous recording over a single session-end dump.

Recommended mapping:

```txt
SessionStart      -> read VibeLog and inject concise project context
UserPromptSubmit  -> classify prompt, record exact engineering execution prompts when needed
PostToolUse       -> record file edits, commands, test outputs, verification evidence, artifacts
Stop              -> summarize the turn, update implementation status and handoff state
PreCompact        -> preserve essential context before compaction
PostCompact       -> record compaction happened and refresh handoff state if useful
```

When an adapter can emit structured events, prefer the recorder core boundary:

```txt
Vibe Event JSON -> scripts/record-vibelog-event.mjs -> vibe-log.md -> vibe-log.json
```

For Claude Code, use `references/claude-code-hooks-adapter.md` before implementing hooks.

## Workflow

### 1. Locate Or Create The Log

Look for `vibe-log.md` in the current project root. If it exists, read it before updating. If it does not exist, create it from `assets/vibe-log-template.md`.

When creating the log, fill at least:

- `title`
- `one_line_vibe`
- `stage`
- `visibility`
- `creation_mode`
- `process_level`
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

Do not invent exact dates, decisions, test results, or prompts. Use `unknown` when the source does not support a precise value.

### 3. Classify The Event

Before writing, classify the current event:

- new idea
- idea expansion
- idea change
- scope change
- human decision
- engineering execution prompt
- feature work
- bugfix
- refactor
- test design
- verification result
- artifact update
- public summary update
- handoff update
- branch or remix intent

Append to the relevant section. Do not dump transcripts.

### 4. Maintain The Idea Layer

Every update should preserve idea history:

- Keep `One-Line Vibe` concise and current.
- Update `Current Idea` when the user's latest direction changes the product.
- Append to `Idea Evolution` for meaningful changes.
- Record firm choices in `Decisions`.
- Record human judgment points in `Human-in-the-Loop`.
- Keep unresolved items in `Open Questions`.

Do not delete old idea history unless the user explicitly asks to redact it.

### 5. Record Creation Mode Without Judgment

Use `creation_mode` to describe the work pattern, not to rank it:

- `human_led_ai_assisted`
- `human_ai_co_created`
- `agent_led_human_approved`
- `fully_agent_built`
- `multi_human_multi_agent`
- `unknown`

VibeLog records the true process. It does not discriminate against fully AI-built work.

### 6. Record Human-In-The-Loop Judgment

Use `Human-in-the-Loop` when the human shaped the product in a way future agents should understand.

Record:

- type: `direction`, `scope`, `taste`, `tradeoff`, `approval`, `rejection`, `risk`, `naming`, `prioritization`, `privacy`, or `release`
- human input
- agent proposal, if relevant
- final decision
- why it mattered
- impact on idea, design, implementation, validation, or next steps

Use this section for judgment, not routine mechanical updates.

### 7. Maintain Scope, Plan, And Implementation Status

Use `Scope / Plan` to capture the current work boundary:

- goal
- in scope
- out of scope
- acceptance criteria
- planned steps

Keep `Implementation Status` useful for handoff:

- `Current State`: where the product is now.
- `Completed`: finished work.
- `In Progress`: active work.
- `Pending`: planned work not started.
- `Blocked`: blocked work and reasons.
- `Next Actions`: the smallest useful next steps.
- `Important Context for Next Agent`: files, decisions, pitfalls, and work not to repeat.

If there is code, keep `Project Context` current with important files and run/test commands.

### 8. Record Execution Prompts

Use `Execution Prompts` as the engineering prompt ledger. This is mandatory for prompts that directly guided vibecoding execution.

Record:

- agent or tool used
- prompt type: `build`, `refactor`, `debug`, `test`, `design`, `docs`, `deploy`, `inspect`, or `research`
- prompt visibility: `hidden`, `summary`, or `full`
- recording mode: `exact`, `redacted`, `reconstructed`, or `summary_only`
- safe prompt summary
- exact prompt text for engineering execution prompts unless redacted for secrets or privacy
- result
- reuse notes for future agents

Strict boundary:

- If a prompt asks an agent to build, edit, debug, test, refactor, design implementation, write docs, deploy, inspect files, run commands, or perform engineering research, record it here.
- Record exact prompt text locally by default for engineering execution prompts.
- Never record secrets, API keys, tokens, private credentials, or private personal data in prompt text. Redact only the sensitive parts and set recording mode to `redacted`.
- If an old prompt is reconstructed from memory, conversation, files, or git history, set recording mode to `reconstructed`.
- Do not put ordinary idea-chat messages here. For chat-like idea exploration, extract only idea changes, human judgments, decisions, and open questions.

### 9. Record Development Work

Use `Development Log` for normal project development events that a future agent may need to understand.

Entry types:

- `feature`
- `bugfix`
- `refactor`
- `test`
- `docs`
- `chore`
- `release`
- `deployment`
- `config`

Record:

- what changed
- why it changed
- affected files or artifacts
- tool or agent used
- verification status
- follow-up

For bug fixes, capture as much of this as is known:

- bug symptom
- root cause
- fix
- verification
- prevention or follow-up

Do not pretend to know a root cause. If it is not known, write `unknown` and describe the evidence.

### 10. Maintain Validation Design

Use `Validation Design` to define how to know whether the vibe-built product works.

Record:

- success criteria
- core user paths
- manual test steps
- automated test strategy
- edge cases
- regression points
- performance expectations
- safety or privacy checks
- validation owner

Validation is a first-class part of the vibe process.

### 11. Record Verification Evidence

Use `Verification Evidence` for checks that actually happened.

Record:

- command output summary
- test result
- screenshot or demo reference
- manual QA result
- known failures
- residual risk
- release confidence

Do not claim verification without evidence.

### 12. Maintain Artifact Index

Use `Artifact Index` for product evidence references:

- code repo
- demo URL
- design file
- screenshot
- video
- test output
- release
- prompt library
- agent config

Reference artifacts instead of embedding large content in the log.

### 13. Append Progress Chronologically

Use `Vibe Progress` for chronological updates. Each meaningful session should include:

- stage
- what happened
- tools used
- problems
- next step

Keep progress concise. The log should be readable, not a transcript dump.

### 14. Maintain Handoff State

Before ending a turn or session, make sure the next agent can answer:

- What is this vibe product?
- What is the current idea?
- What has already changed in the idea?
- Where did the human steer, approve, reject, or choose tradeoffs?
- What is implemented?
- What is completed, in progress, pending, or blocked?
- What validation is designed?
- What verification evidence exists?
- What development work was recently completed, especially bug fixes?
- What prompt directions were important?
- What artifacts matter?
- What should happen next?

If the log does not answer these questions, update it.

### 15. Export JSON

When asked to export or prepare upload data, generate `vibe-log.json` from `vibe-log.md` using the schema in `assets/vibe-log.schema.json`.

Markdown remains the source of truth. If JSON and Markdown disagree, update Markdown first, then regenerate JSON.

### 16. Report Conservative Project Progress

When completing a meaningful task, include a project progress snapshot in the final human-facing report.

Use the long-term VibeHub vision as `100%`, not the local repository task list. Keep the number conservative.

Current baseline for this project:

```txt
Project Progress: 16 / 100
```

This baseline reflects S23 VibeLog self-update loop verification. Read local `vibe-log.md` first when it exists, because private dogfood state may be newer than public docs.

Include:

- overall progress out of `100`
- change from this task
- current phase
- what this task completed
- next unlock
- main risk or missing capability
- confidence

Use `docs/guides/progress-reporting.md` and `docs/guides/progress-reporting.zh.md` for the full rule.

## Visibility Rules

Default to private:

- `visibility: private`
- `code_visibility: hidden`
- `prompt_visibility: summary`
- `collaboration_status: closed`

Ask before changing visibility from private to any public value.

Do not expose full prompts by default. Prefer summaries unless the user explicitly wants full prompt logging.

This visibility rule controls what can be published. It does not remove the local requirement to record engineering execution prompts in `Execution Prompts`.
