# VibeLog Format Reference

## Source Of Truth

`vibe-log.md` is the source of truth. `vibe-log.json` is generated for upload or integration.

Markdown should be concise enough for humans to read. JSON should be structured enough for agents and VibeHub to parse.

## Core Formula

```txt
Vibe Repo = VibeLog + Git code repository references + Project Artifacts
VibeLog = process memory
Git code repository references = code history and branch state
Project Artifacts = product evidence
```

## Markdown Sections

Recommended sections:

```md
# VibeLog

## One-Line Vibe
## Creation Mode
## Current Idea
## Vibe Intake
## Idea Expansion
## Idea Evolution
## Scope / Plan
## Decisions
## Human-in-the-Loop
## Open Questions
## Implementation Status
## Validation Design
## Verification Evidence
## Project Context
## Code Repositories
## Artifact Index
## Execution Prompts
## Development Log
## Bugfix / Incident Log
## Handoff State
## Public / Private Projection
## Branch / Remix Readiness
## Vibe Progress
## Public Summary
```

## Frontmatter

```yaml
schema: vibelog@0.2-draft
title: ""
one_line_vibe: ""
stage: idea
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
creation_mode: unknown
process_level: core
tools: []
tags: []
created_at: ""
updated_at: ""
```

## Enums

`stage`:

```txt
idea
brief
prototype
mvp
beta
shipped
paused
abandoned
```

`visibility`:

```txt
private
public_idea
public_progress
public_product
```

`code_visibility`:

```txt
hidden
open_source
team_only
not_applicable
```

`prompt_visibility`:

```txt
hidden
summary
full
```

`collaboration_status`:

```txt
closed
open_to_feedback
looking_for_builder
looking_for_designer
looking_for_partner
looking_for_users
looking_for_investment
```

`creation_mode`:

```txt
human_led_ai_assisted
human_ai_co_created
agent_led_human_approved
fully_agent_built
multi_human_multi_agent
unknown
```

`process_level`:

```txt
minimal
core
full
```

`idea_evolution.type`:

```txt
initial
expansion
pivot
refinement
removal
scope_change
```

`human_in_the_loop.type`:

```txt
direction
scope
taste
tradeoff
approval
rejection
risk
naming
prioritization
privacy
release
```

`execution_prompts.prompt_type`:

```txt
build
refactor
debug
test
design
docs
deploy
inspect
research
```

`execution_prompts.recording_mode`:

```txt
exact
redacted
reconstructed
summary_only
```

Engineering execution prompts belong in `Execution Prompts` with exact text unless sensitive content must be redacted. Ordinary idea chat does not belong there; distill it into `Idea Evolution`, `Human-in-the-Loop`, `Decisions`, or `Open Questions`.

`development_log.type`:

```txt
feature
bugfix
refactor
test
docs
chore
release
deployment
config
```

`verification_evidence.type`:

```txt
command_output
test_result
screenshot
demo
manual_qa
review
deployment
```

`verification_evidence.result`:

```txt
passed
failed
partial
not_run
```

`artifact_index.type`:

```txt
code_repo
demo
design
document
screenshot
video
test_output
release
dataset
prompt_library
agent_config
other
```

`code_repositories.provider`:

```txt
github
gitlab
bitbucket
local
vibehub_future
other
```

`code_repositories.sync_status`:

```txt
unlinked
local_only
linked
pushed
mirrored
hosted
```

Use `code_repositories` to connect the VibeLog process layer to the code layer. VibeLog does not replace Git. It records the Git repositories, branches, commits, demos, and artifacts that belong to the vibe project.

Example:

```json
{
  "provider": "github",
  "url": "https://github.com/user/project",
  "remote_name": "origin",
  "default_branch": "main",
  "current_branch": "main",
  "latest_commit_sha": "abc123",
  "sync_status": "pushed",
  "code_visibility": "open_source",
  "demo_url": "https://project.example.com",
  "linked_commits": [
    {
      "sha": "abc123",
      "branch": "main",
      "message": "Add export flow",
      "summary": "Implemented Markdown and JSON export.",
      "vibelog_entry_ref": "development_log:2026-05-26-export-flow"
    }
  ]
}
```

## Process Levels

`minimal` should be usable for lightweight idea capture:

- one-line vibe
- current idea
- stage
- current status
- next action
- public summary

`core` should be used for active vibe projects:

- minimal fields
- idea evolution
- decisions
- human-in-the-loop
- execution prompts
- implementation status
- development log
- validation design
- handoff state

`full` should be used for serious public projects, teams, or future marketplace use:

- core fields
- verification evidence
- artifact index
- bugfix / incident log
- branch / remix readiness
- public / private projection

## Automation Events

Recommended hook mapping:

```txt
SessionStart      -> read VibeLog and provide concise context
UserPromptSubmit  -> classify user prompt and record engineering prompts
PostToolUse       -> capture file edits, commands, tests, artifacts, verification evidence
Stop              -> summarize turn, update implementation status and handoff
PreCompact        -> preserve essential context before compaction
PostCompact       -> record compaction and refresh handoff if useful
```

The goal is continuous process capture. Do not wait for a perfect session-end event.

## Mid-Project Reconstruction

If a log is created after work has already begun, add reconstructed entries to `Idea Evolution`, `Decisions`, `Human-in-the-Loop`, `Implementation Status`, `Execution Prompts`, `Development Log`, `Validation Design`, `Verification Evidence`, `Handoff State`, and `Vibe Progress` as needed.

Use this metadata inside reconstructed entries:

```md
**Source:** reconstructed from conversation / git / files / user memory
**Confidence:** high / medium / low
```

Use `unknown` instead of inventing timestamps, prompt text, root causes, or verification results.

## JSON Export

The JSON shape should follow `assets/vibe-log.schema.json`. Keep unknown arrays as `[]` and unknown strings as `""`.

If Markdown and JSON disagree, update Markdown first, then regenerate JSON.
