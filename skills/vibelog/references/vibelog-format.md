# VibeLog Format Reference

## Source Of Truth

`vibe-log.md` is the source of truth. `vibe-log.json` is generated for upload or integration.

## Markdown Sections

Required sections:

```md
# VibeLog

## One-Line Vibe
## Current Idea
## Idea Expansion
## Idea Evolution
## Decisions
## Human-in-the-Loop
## Open Questions
## Implementation Status
## Project Context
## Execution Prompts
## Development Log
## Vibe Progress
## Public Summary
```

## Frontmatter

```yaml
schema: vibelog@0.1
title: ""
one_line_vibe: ""
stage: idea
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
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

`idea_evolution.type`:

```txt
initial
expansion
pivot
refinement
removal
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
```

`execution_prompts.prompt_type`:

```txt
build
refactor
debug
test
design
deploy
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
config
```

## Mid-Project Reconstruction

If a log is created after work has already begun, add reconstructed entries to `Idea Evolution`, `Decisions`, `Human-in-the-Loop`, `Implementation Status`, `Execution Prompts`, `Development Log`, and `Vibe Progress` as needed.

Use this metadata inside reconstructed entries:

```md
**Source:** reconstructed from conversation / git / files / user memory
**Confidence:** high / medium / low
```

Use `unknown` instead of inventing timestamps or prompt text.

## JSON Export

The JSON shape should follow `assets/vibe-log.schema.json`. Keep unknown arrays as `[]` and unknown strings as `""`.
