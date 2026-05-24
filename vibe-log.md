---
schema: vibelog@0.1
title: "VibeLog"
one_line_vibe: "I want to create a Markdown-first skill that records messy vibe product ideas, idea evolution, implementation status, and execution prompts so any agent can continue the work."
stage: prototype
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
tools:
  - Codex
tags:
  - vibelog
  - agent-skill
  - vibe-coding
created_at: "2026-05-25"
updated_at: "2026-05-25"
---

# VibeLog

## One-Line Vibe

I want to create a Markdown-first skill that records messy vibe product ideas, idea evolution, implementation status, and execution prompts so any agent can continue the work.

## Current Idea

VibeLog is an independent agent skill and logging standard. It is useful before any website exists. It records a vibe product's one-line idea, expanded idea, direction changes, implementation status, handoff context, and vibecoding execution prompts in a human-readable Markdown file that can later be exported to JSON.

The long-term product may become a website for private idea libraries, public idea spaces, vibe progress branches, and product showcases, but the current focus is to build the standalone skill first.

## Idea Expansion

- Problem: Vibe builders often have scattered ideas, midstream pivots, and AI execution prompts that disappear across chats, tools, and agents.
- Target users: people using Codex, Claude Code, Cursor, Windsurf, Lovable, Bolt, Replit, or other AI tools to create vibe products.
- Why it matters: a structured log lets people preserve idea evolution, resume work later, hand off to another agent, and optionally publish progress in the future.
- Core features: one-line idea, idea expansion, idea evolution, decisions, open questions, implementation status, project context, execution prompts, vibe progress, JSON export.
- Use cases: starting a new vibe product, joining a product midstream, reconstructing prior thinking, recording implementation state, and preparing future upload content.

## Idea Evolution

### 2026-05-24
**Type:** initial

**Before:** none

**After:** A website where vibe coding people can share their vibe-built works.

**Reason:** The initial desire was to create a place for vibe coding creators to show what they made.

**Source:** reconstructed from conversation

**Confidence:** high

### 2026-05-24
**Type:** expansion

**Before:** A vibe coding product showcase website.

**After:** A broader platform where both completed vibe products and early ideas can be shared, discussed, and used for collaboration.

**Reason:** Existing showcase sites cover product discovery, but the stronger opportunity is idea sharing and co-creation.

**Source:** reconstructed from conversation

**Confidence:** high

### 2026-05-25
**Type:** refinement

**Before:** Public idea sharing might require approval before others can work from an idea.

**After:** Private ideas stay private; once an idea is published to Public Idea Space, others may create their own vibe branches from it.

**Reason:** Public-by-choice keeps private ideas protected while keeping public collaboration fluid.

**Source:** reconstructed from conversation

**Confidence:** high

### 2026-05-25
**Type:** pivot

**Before:** Build the website first.

**After:** Build the VibeLog skill first, independent of the website.

**Reason:** The skill validates the core behavior before community cold start: whether people and agents will consistently record vibe ideas and process.

**Source:** reconstructed from conversation

**Confidence:** high

### 2026-05-25
**Type:** expansion

**Before:** VibeLog records one-line ideas, idea expansion, changes, and progress.

**After:** VibeLog also supports mid-project invocation, historical reconstruction, implementation handoff state, and execution prompt logging.

**Reason:** A vibe product may switch agents midstream; the next agent needs historical context, current status, and key prompt directions.

**Source:** user request

**Confidence:** high

## Decisions

### 2026-05-25
**Decision:** Make Markdown the source of truth and JSON the export format.

**Why:** Markdown is easy for humans and agents to read; JSON is better for future upload and integration.

### 2026-05-25
**Decision:** Build the standalone VibeLog skill before building the website.

**Why:** The skill can be useful without the site and can create future upload-ready content.

### 2026-05-25
**Decision:** Record execution prompts separately from general progress.

**Why:** Vibecoding prompts are operational context for future agents, but they need visibility controls to avoid leaking sensitive details.

## Open Questions

- Should a future exporter script generate `vibe-log.json` deterministically from Markdown?
- Should the skill be installed immediately into the user's Codex skill directory or kept as a distributable repo package first?
- Which agent ecosystem should get the next adapter after Codex: Claude Code, Cursor rules, or AGENTS.md?

## Implementation Status

### Current State

The VibeLog v0.1 design exists, and the first standalone `skills/vibelog` skill package has been created in the repository.

### Completed

- Created the VibeLog v0.1 design document.
- Added mid-project reconstruction and execution prompt logging to the standard.
- Created `skills/vibelog/SKILL.md`.
- Created `skills/vibelog/references/vibelog-format.md`.
- Created `skills/vibelog/assets/vibe-log-template.md`.
- Created `skills/vibelog/assets/vibe-log.schema.json`.
- Created `skills/vibelog/agents/openai.yaml`.
- Created this project-level `vibe-log.md` by reconstructing prior conversation context.

### In Progress

- Validating that the skill package is coherent and usable.

### Pending

- Decide whether to install the skill into the local Codex skills directory.
- Add a deterministic JSON exporter if needed.
- Add a sample `vibe-log.json` export for this project.
- Create adapters for other agent environments.

### Blocked

- `skill-creator` quick validation could not run because the current Python environment is missing the `yaml` package.

### Next Actions

- Run lightweight manual validation on skill metadata and schema.
- Review the skill wording for trigger clarity and token efficiency.
- Ask the user whether to install the skill locally after the repo version is accepted.

### Important Context for Next Agent

- The current priority is the standalone VibeLog skill, not the website.
- The website remains a long-term vision but should not drive the first implementation.
- Markdown must remain the source of truth.
- Execution prompts should default to summaries, not full prompt dumps.
- Public visibility changes require explicit user confirmation.

## Project Context

### Repo / Workspace

`C:\Users\HXW\Documents\vibecoding`

### Important Files

- `docs/superpowers/specs/2026-05-25-vibelog-v0.1-design.md`: VibeLog v0.1 standard design.
- `skills/vibelog/SKILL.md`: main skill instructions.
- `skills/vibelog/references/vibelog-format.md`: detailed format reference.
- `skills/vibelog/assets/vibe-log-template.md`: starter Markdown template.
- `skills/vibelog/assets/vibe-log.schema.json`: JSON export schema.
- `skills/vibelog/agents/openai.yaml`: Codex UI metadata.
- `vibe-log.md`: this project's own VibeLog.

### Run / Test Commands

- `node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('skills/vibelog/assets/vibe-log.schema.json','utf8')); console.log('schema json ok')"`
- `rg -n "[^\\x00-\\x7F]" docs skills vibe-log.md vibe-log.json`

### Known Issues

- `quick_validate.py` from `skill-creator` needs PyYAML, which is not available in the current Python environment.

### Do Not Change

- Do not shift focus back to the website before the standalone skill is usable.
- Do not make public upload behavior required for v0.1.

## Execution Prompts

### 2026-05-25
**Agent / Tool:** Codex

**Prompt Type:** design

**Prompt Visibility:** summary

**Prompt Summary:** User asked to define VibeLog v0.1 as a Markdown-first standard with JSON export for future website upload.

**Prompt Text:** hidden

**Result:** Created and committed the VibeLog v0.1 design document.

**Reuse Notes:** Use this direction when aligning future skill and website schema work.

### 2026-05-25
**Agent / Tool:** Codex

**Prompt Type:** build

**Prompt Visibility:** summary

**Prompt Summary:** User asked to detach from the website and build the skill first, adding mid-project invocation, historical reconstruction, and vibecoding execution prompt logging.

**Prompt Text:** hidden

**Result:** Created the first VibeLog skill package and this reconstructed project log.

**Reuse Notes:** Future agents should continue from the standalone skill package and keep website work secondary.

## Vibe Progress

### 2026-05-25
**Stage:** brief

**What Happened:** Defined VibeLog v0.1 as a Markdown-first standard with JSON export.

**Tools Used:** Codex

**Problems:** Needed to keep the standard independent from the future website.

**Next:** Build the standalone skill.

**Source:** reconstructed from conversation

**Confidence:** high

### 2026-05-25
**Stage:** prototype

**What Happened:** Created the standalone `skills/vibelog` package and added mid-project reconstruction plus execution prompt logging.

**Tools Used:** Codex

**Problems:** `quick_validate.py` could not run because PyYAML is missing.

**Next:** Validate manually, review with the user, then decide whether to install locally.

**Source:** current work session

**Confidence:** high

## Public Summary

VibeLog is a Markdown-first skill and standard for recording vibe product ideas, idea evolution, implementation status, handoff context, and vibecoding execution prompts. It is designed to work independently before any website exists, while keeping a future JSON upload path open.
