# VibeHub Long-Term Product Document

## 1. One-Line Product

VibeHub is a GitHub-like platform for vibe-built products, centered on Vibe Repositories that record, validate, showcase, branch, remix, and collaborate on ideas built through human and AI workflows.

中文一句话：

VibeHub 是一个面向 vibe-built 产品的 GitHub 式平台，核心对象是 Vibe Repo：它把一个想法的演化、human/agent 决策、执行提示词、开发进度、测试验证、代码产物和最终成果沉淀为可读、可交接、可公开、可协作的项目容器。

## 2. Product Thesis

GitHub made code collaboration legible by centering the repository object.

VibeHub should make AI-assisted creation legible by centering the Vibe Repository object.

The opportunity is not just a gallery for AI-made projects. The stronger opportunity is to create the missing process layer for vibe coding:

- people naturally express ideas in conversation
- agents turn those ideas into code, documents, tests, and demos
- ideas change often during the process
- human decisions are mixed with agent suggestions
- important prompts disappear in chat history
- tests and validation are often weak or missing
- future agents lack context when continuing a project
- public sharing lacks a reliable process record

VibeHub should solve this by making every vibe-built project a durable object with process memory and product evidence.

## 3. Core Belief

User says naturally, agent records structurally.

The user should not be forced to fill complicated forms while creating. VibeLog should work as a bottom-layer skill during the vibe process. It should automatically distill scattered conversations, prompt instructions, human decisions, development work, bugs, and verification evidence into a standardized record.

VibeHub should not discriminate based on how much the human personally built.

Accepted creation modes include:

- Human-led, AI-assisted
- Human-AI co-created
- Agent-led, human-approved
- Fully agent-built
- Multi-human, multi-agent collaboration

The platform should record the true process, not judge the purity of the creation method.

## 4. Why Now

Agentic coding is moving from one-off prompting toward workflow-based software creation.

Common patterns from leading tools already point in this direction:

- Explore, plan, implement, commit
- Issue, branch, pull request, review, merge
- Task, sandbox, work log, tests, handoff
- Persistent project instructions such as `AGENTS.md` or `CLAUDE.md`
- Agent verification with tests, screenshots, expected outputs, and logs
- Human review before shipping

These workflows still mainly sit around code repositories. VibeHub adds the missing layer above code:

- idea evolution
- human intent
- agent prompts
- test design
- validation evidence
- public/private sharing
- remix and collaboration around ideas

## 5. Product Stack

VibeHub should be understood as four layers.

```txt
VibeLog Skill
Bottom-layer automatic recording skill used during vibe coding.

VibeLog Standard
Markdown-first and JSON-exportable process record format.

Vibe Repo
Project container made of standardized VibeLog plus project artifacts.

VibeHub
Platform for managing, showcasing, searching, collaborating on, branching, and remixing Vibe Repos.
```

## 6. Core Object: Vibe Repo

Vibe Repo has two core parts:

```txt
Vibe Repo = VibeLog + Project Artifacts
```

### 6.1 VibeLog

VibeLog is the process memory.

It records:

- one-line vibe
- current idea
- idea expansion
- idea evolution
- creation participation mode
- human-in-the-loop decisions
- agent execution prompts
- scope and plan
- implementation status
- development log
- bugfix log
- validation design
- verification evidence
- handoff state
- public summary
- visibility choices

VibeLog must support constant change. Vibe coding is not linear. Users often pivot, reject earlier plans, change target users, swap tools, restart implementation, or hand the work to another agent. These changes are not noise. They are valuable project history.

### 6.2 Project Artifacts

Project Artifacts are product evidence.

They include:

- code repository
- demo URL
- deployment environment
- screenshots
- videos
- design files
- documents
- test outputs
- release notes
- package files
- datasets
- prompt libraries
- agent configuration files

Artifacts should usually be referenced by path, URL, commit, attachment, or release, not copied wholesale into VibeLog.

## 7. VibeLog Process Standard v0.1

The goal is not to force everyone into the same workflow. The goal is to make different vibe workflows recordable in the same structure.

### 7.1 Standard Process Stages

```txt
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
```

### 7.2 Vibe Intake

Purpose: capture the project seed.

Records:

- one-line vibe
- title
- target user
- problem
- desired outcome
- current stage
- creation mode
- tools or agents used

### 7.3 Idea Expansion

Purpose: turn scattered thoughts into product shape.

Records:

- product hypothesis
- core value
- main use cases
- feature candidates
- non-goals
- assumptions
- open questions

### 7.4 Context Capture

Purpose: make future sessions and future agents aware of the project environment.

Records:

- existing docs
- important files
- codebase status
- relevant commands
- tech stack
- dependencies
- constraints
- known risks
- areas not to change

### 7.5 Scope / Plan

Purpose: define what this work session or milestone is trying to accomplish.

Records:

- goal
- in-scope work
- out-of-scope work
- acceptance criteria
- risks
- planned steps

### 7.6 Execution Prompt Ledger

Purpose: strictly record prompts that directly guide engineering execution.

Records:

- agent or tool
- prompt type
- exact prompt text or redacted text
- safe summary
- recording mode
- result
- reuse notes

Strict rule:

Ordinary idea chat should not be copied as transcript. It should be distilled into idea evolution, decisions, human-in-the-loop entries, or open questions.

Engineering execution prompts should be recorded by default when they ask an agent to build, edit, debug, test, refactor, inspect files, run commands, deploy, write docs, or perform implementation research.

### 7.7 Build / Development Log

Purpose: record normal project development.

Entry types:

- feature
- bugfix
- refactor
- test
- docs
- chore
- release
- config
- deployment

Records:

- what changed
- why it changed
- affected files or artifacts
- tool or agent used
- verification status
- follow-up

### 7.8 Human-in-the-Loop Decisions

Purpose: preserve where the human shaped the vibe.

Records:

- decision type
- human input
- agent proposal, if relevant
- final decision
- why it mattered
- impact

Decision types:

- direction
- scope
- taste
- tradeoff
- approval
- rejection
- risk
- naming
- prioritization
- privacy
- release

### 7.9 Validation Design

Purpose: define how to know whether the vibe-built product works.

Records:

- success criteria
- core user paths
- manual test steps
- automated test strategy
- edge cases
- regression points
- performance expectations
- safety or privacy checks
- validation owner

Validation Design should be a first-class section because vibe-built products can look finished while remaining unverified.

### 7.10 Verification Evidence

Purpose: record what was actually checked.

Records:

- command outputs summary
- test results
- screenshots
- demo result
- manual QA result
- known failures
- residual risk
- release confidence

### 7.11 Bugfix / Incident Log

Purpose: make problems and repairs visible.

Records:

- symptom
- root cause
- fix
- affected area
- verification
- prevention or follow-up

Unknown root causes should be marked as unknown. The log should not pretend certainty.

### 7.12 Handoff State

Purpose: allow another agent or human to continue.

Records:

- current state
- completed work
- in-progress work
- pending work
- blockers
- next actions
- important context for next agent
- files and commands to inspect first

### 7.13 Public / Private Projection

Purpose: control what can be published to VibeHub.

Defaults:

- project visibility: private
- code visibility: hidden
- prompt visibility: summary
- collaboration status: closed

Records:

- public summary
- demo visibility
- code visibility
- prompt visibility
- collaboration status
- remix permission
- license or usage note

### 7.14 Branch / Remix Readiness

Purpose: prepare future collaboration.

Records:

- whether remix is allowed
- what can be reused
- what should not be reused
- suggested contribution areas
- branch relationship to original idea
- attribution requirements

## 8. VibeLog Strictness Levels

VibeLog should support different depths of use.

### Minimal

For lightweight users and early ideas.

Includes:

- one-line vibe
- current idea
- stage
- current status
- next step
- public summary

### Core

For active vibe projects.

Includes Minimal plus:

- idea evolution
- human-in-the-loop decisions
- execution prompt ledger
- implementation status
- development log
- validation design
- handoff state

### Full

For serious products, teams, public projects, or future marketplace use.

Includes Core plus:

- verification evidence
- bugfix or incident log
- artifact index
- branch or remix metadata
- collaborator history
- release history
- visibility policy

## 9. Underlying Skill Design

The first real product should be the VibeLog skill.

It should behave like a bottom-layer process recorder during vibe coding.

### 9.1 Skill Mission

Automatically maintain a readable and agent-readable process record while the user vibes naturally.

### 9.2 Skill Principle

The skill should not interrupt the creative flow unless necessary.

It should:

- observe the current user request
- classify the event type
- update the correct VibeLog sections
- preserve history
- avoid transcript dumping
- protect private information
- keep Markdown and JSON aligned

### 9.3 Event Classification

The skill should classify user and agent activity into event types:

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
- public summary update
- handoff update
- branch or remix intent

### 9.4 Automatic Update Rules

When the user describes a new product idea:

- update Vibe Intake
- create or update One-Line Vibe
- create Current Idea

When the user changes direction:

- append Idea Evolution
- update Current Idea
- record Human-in-the-Loop if the human made a meaningful choice

When the user asks the agent to build, modify, debug, test, deploy, inspect files, or write implementation docs:

- append Execution Prompt Ledger
- later append Development Log based on work performed

When the agent changes files:

- append Development Log
- update Implementation Status

When tests or manual checks are discussed:

- update Validation Design or Verification Evidence

When a bug appears:

- append Bugfix / Incident Log

When a session ends:

- update Handoff State

When the user chooses public/private visibility:

- update Public / Private Projection

### 9.5 Human Readability And Agent Readability

Markdown is the human source of truth.

JSON is the structured export for agents, tools, and VibeHub.

The skill should write concise human-readable sections and generate JSON that follows a schema. If Markdown and JSON disagree, Markdown wins, then JSON is regenerated.

### 9.6 Privacy Rules

Default to private.

Never publish or expose:

- API keys
- credentials
- private personal data
- hidden business information
- full prompts marked as hidden
- private code references marked as hidden

Engineering execution prompts should still be locally recorded, but public export can show summary, redacted, or hidden versions.

### 9.7 Skill MVP

The skill MVP should support:

- creating `vibe-log.md`
- updating `vibe-log.md`
- exporting `vibe-log.json`
- reconstructing prior context from docs, git, and conversation
- recording idea evolution
- recording execution prompts
- recording human decisions
- recording implementation status
- recording development and bugfix logs
- recording validation design
- recording handoff state

## 10. Short-Term Product MVP

The first platform MVP should not try to become a full public community.

It should prove that a Vibe Repo is useful.

### 10.1 MVP Name

Working name:

```txt
VibeHub MVP
```

Possible narrower name:

```txt
VibeLog Studio
```

Recommendation:

Use VibeLog Studio for the local-first tool and VibeHub for the long-term platform.

### 10.2 MVP Goal

Let a user create, inspect, update, export, and hand off one or more Vibe Repos.

### 10.3 MVP Success Test

A person or agent who did not participate in the project should be able to read the exported Vibe Repo and answer within 10 minutes:

- what is this product?
- why does it exist?
- how has the idea changed?
- where did the human make key decisions?
- what prompts mattered?
- what has been built?
- how should it be tested?
- what is verified?
- what is still pending?
- what should happen next?

### 10.4 MVP Features

Required:

- create Vibe Repo
- edit one-line vibe and current idea
- append idea evolution
- append human-in-the-loop decision
- append execution prompt
- append development log
- append bugfix log
- add validation design
- add verification evidence
- update implementation status
- manage visibility settings
- export Markdown
- export JSON
- import JSON

Not required:

- user accounts
- public feed
- comments
- payments
- marketplace
- real-time collaboration
- full branch/remix system
- automatic GitHub sync
- AI generation inside the web app

### 10.5 MVP Screens

Dashboard:

- list local Vibe Repos
- show title, one-line vibe, stage, visibility, updated time, next action
- create/import actions

Create Vibe Repo:

- title
- one-line vibe
- current idea
- stage
- creation mode
- tools
- tags

Vibe Repo Detail:

- repo header
- current idea
- implementation status
- idea timeline
- human decisions
- execution prompts
- validation design
- verification evidence
- development log
- artifacts
- public summary
- export actions

Update Composer:

- choose update type
- write natural update
- optional structured fields
- append to relevant section

Export View:

- preview Markdown
- preview JSON
- copy
- download

### 10.6 MVP Technical Direction

The MVP should be local-first and structured for future cloud migration.

Recommended direction:

- TypeScript
- React / Next.js
- Zod schema validation
- localStorage or IndexedDB behind repository abstraction
- Markdown export
- JSON schema export
- file import/export

Important architectural rule:

The UI should not be tightly coupled to local browser storage. Use a repository interface so future sync can replace local storage with a server-backed repository.

## 11. Long-Term VibeHub Platform

VibeHub should grow only after Vibe Repo becomes useful.

### Phase 1: VibeLog Skill And Standard

Goal:

Make VibeLog useful without any website.

Deliverables:

- VibeLog Process Standard v0.1
- working VibeLog skill
- Markdown template
- JSON schema
- example Vibe Repos
- self-recorded VibeHub Vibe Repo

### Phase 2: Local-First VibeLog Studio

Goal:

Make Vibe Repos easy to create, inspect, update, import, and export.

Deliverables:

- dashboard
- Vibe Repo detail page
- update composer
- export/import
- local persistence
- validation schema

### Phase 3: Public Vibe Repo Showcase

Goal:

Let users publish selected Vibe Repo summaries.

Deliverables:

- public project pages
- visibility controls
- demo/code/prompt visibility settings
- tags and discovery
- profile pages

### Phase 4: Collaboration And Remix

Goal:

Let people build around shared ideas.

Deliverables:

- collaboration requests
- comment threads
- contribution areas
- Vibe Branch
- remix attribution
- progress comparison between branches

### Phase 5: Marketplace And Opportunity Layer

Goal:

Support higher-value matching and transactions if the community proves demand.

Possible features:

- idea bounties
- paid collaboration
- hiring signals
- project acquisition
- template marketplace
- prompt pack marketplace
- agent workflow marketplace

This phase should not be built until public Vibe Repos and collaboration show real usage.

## 12. GitHub Analogy

```txt
Git repository       -> Vibe Repository
README               -> Public Summary + One-Line Vibe
Commit history       -> Idea Evolution + Development Log
Issue                -> Open Question / Blocker / Feature Request
Pull request         -> Proposed Vibe Branch / Collaboration Proposal
Fork                 -> Remix / Independent Vibe Branch
Contributor          -> Human + Agent Contribution Trail
CI                   -> Validation Design + Verification Evidence
Release              -> Vibe Product Release
Star                 -> Save / Like / I want this
```

The lesson from GitHub is not to copy the interface. The lesson is to create a strong object first, then grow collaboration and community around it.

## 13. Positioning

VibeHub should avoid weak positioning:

- not just an AI project gallery
- not just a prompt database
- not just a note-taking app
- not just a GitHub wrapper
- not just an idea marketplace

Stronger positioning:

VibeHub is the process and collaboration layer for vibe-built products.

## 14. Target Users

### Vibe Builder

Someone using AI tools to turn ideas into products. They need memory, structure, and handoff.

### Non-Technical Creator

Someone with ideas but little coding background. They need a way to express, track, validate, and eventually collaborate around product ideas.

### Agent User / AI PM

Someone who delegates work to agents and needs reliable planning, progress, testing, and review records.

### Collaborator

Someone who wants to join, remix, fork, or learn from a public Vibe Repo.

### Future Recruiter / Investor / Buyer

Someone who wants to understand not only the final product, but how the creator thinks, decides, validates, and ships.

## 15. Key Differentiators

- Process-first, not feed-first
- Vibe Repo as core object
- Markdown for humans, JSON for agents
- Automatic skill-based recording
- Human and agent contributions both visible
- No discrimination against fully AI-built work
- Validation and testing as first-class records
- Private by default, public by choice
- Built for future remix and collaboration

## 16. Risks

### Risk: Users do not want to maintain logs

Mitigation:

Make the skill automatic. Do not rely on manual form filling.

### Risk: Logs become noisy transcripts

Mitigation:

Strictly separate execution prompt ledger from idea chat. Distill ordinary discussion into structured changes and decisions.

### Risk: The standard is too heavy

Mitigation:

Support Minimal, Core, and Full levels.

### Risk: Public sharing creates IP confusion

Mitigation:

Default to private. Require explicit visibility and remix permission settings.

### Risk: Marketplace is premature

Mitigation:

Delay transactions until Vibe Repo usage and collaboration are proven.

### Risk: Existing platforms absorb the workflow

Mitigation:

Make VibeLog portable and platform-agnostic. VibeHub should own the process standard and repository object, not depend on one agent vendor.

## 17. Metrics

Early skill metrics:

- number of VibeLogs created
- number of sessions continued using a prior VibeLog
- successful handoff rate
- JSON export validity
- user-reported usefulness after project restart

MVP metrics:

- Vibe Repos created
- Vibe Repos updated more than once
- exports generated
- imports completed
- average number of structured updates per repo
- percentage of repos with validation design
- percentage of repos with handoff state

Public platform metrics:

- public Vibe Repos published
- demos clicked
- repos saved
- remix requests
- collaboration requests
- successful branch/remix projects

## 18. First Concrete Step

The first step should be:

```txt
Finalize VibeLog Process Standard v0.1 and test it on VibeHub itself.
```

This means VibeHub should become the first serious Vibe Repo.

The project should record:

- this product thesis
- the evolution from idea community to Vibe Repo platform
- the decision to build the skill first
- the decision to support all human/AI participation modes
- the decision to make validation design first-class
- the current MVP requirements
- the next implementation plan

If VibeHub's own Vibe Repo helps future agents continue the project, the foundation is validated.

## 19. Open Questions

- Should the public product name be VibeHub, VibeLog, or something else?
- Should VibeLog be positioned as a skill, a format, or a protocol?
- What is the minimum useful JSON schema for v0.1?
- Should public ideas default to remixable, or should remix permission be explicit?
- How should attribution work when many agents and humans contribute?
- How much execution prompt text should be visible publicly?
- Should code artifacts live inside VibeHub, or should VibeHub reference GitHub/GitLab repos?
- Should the first MVP be a local web app, a CLI, or only the skill plus files?

## 20. Recommended Strategy

Do not start with the full community.

Start with the standard and the skill.

Recommended order:

```txt
1. VibeLog Process Standard v0.1
2. VibeLog skill improvement
3. Example Vibe Repos
4. Local-first VibeLog Studio
5. Public Vibe Repo pages
6. Collaboration and remix
7. Marketplace only if usage proves demand
```

The core bet is:

As vibe coding becomes common, the scarce asset will not be generated code alone. The scarce asset will be structured process memory: idea evolution, human judgment, prompts, validation, progress, and handoff.

VibeHub should own that layer.
