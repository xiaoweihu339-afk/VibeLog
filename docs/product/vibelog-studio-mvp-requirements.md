# VibeLog Studio MVP Requirements

## One-Line Product

VibeLog Studio is a local-first workspace for creating, managing, viewing, and exporting Vibe Projects that record idea evolution, human decisions, development progress, bug fixes, and engineering execution prompts.

## Product Thesis

GitHub made code collaboration legible by centering the repository object.

VibeLog Studio should make AI-assisted creation legible by centering the Vibe Project object.

The first MVP should not try to become a full community. It should make one Vibe Project useful enough to create, update, inspect, hand off, export, and eventually publish. Community features should grow from project-level collaboration later.

## GitHub-Inspired Model

GitHub's early strength was not a generic social feed. It made the repository a durable object with history, identity, and collaboration surfaces.

VibeLog Studio follows the same pattern:

```txt
GitHub Repo      -> Vibe Project
README           -> Public Summary + One-Line Vibe
Commit History   -> Idea Evolution + Development Log + Vibe Progress
Issue            -> Open Question / Blocker / Feature Request
Pull Request     -> Proposed Vibe Branch / Collaboration Proposal
Fork             -> Remix / Independent Vibe Branch
Star             -> Save / Like / "I want this"
Contributor      -> Human + Agent Contribution Trail
```

The MVP implements only the first layer: create and manage Vibe Projects locally.

## Goals

- Let a user create a structured Vibe Project from a one-line idea.
- Let a user update a Vibe Project over time without losing idea history.
- Make human-in-the-loop decisions visible and durable.
- Strictly record engineering execution prompts while avoiding chat transcript noise.
- Track implementation status for agent handoff.
- Track normal development work, including bug fixes.
- Export the project as `vibe-log.md` and `vibe-log.json`.
- Keep the architecture ready for future cloud sync, public pages, branches, and collaboration.

## Non-Goals For MVP

- No user accounts.
- No cloud database.
- No public community feed.
- No comments.
- No Vibe Branch or remix workflow.
- No marketplace, bounty, licensing, or payments.
- No real-time collaboration.
- No AI generation features inside the web app.
- No repository import automation.

## Target Users

### Primary User: Vibe Builder

Someone using AI agents or AI coding tools to create products from ideas. They need a structured memory of what changed, what was built, and what prompts mattered.

### Secondary User: Future Agent

An agent that reads a Vibe Project later and needs enough context to continue the work safely.

### Future User: Viewer / Collaborator

Someone who reads a public Vibe Project to understand the idea, progress, human decisions, and possible contribution points.

## MVP User Stories

- As a user, I can create a Vibe Project from a title and one-line vibe.
- As a user, I can see all my Vibe Projects in a dashboard.
- As a user, I can open one Vibe Project and understand its current idea and current implementation state.
- As a user, I can add an update that changes the idea and preserves the previous idea in history.
- As a user, I can add a human-in-the-loop decision.
- As a user, I can add a development log entry.
- As a user, I can add a bugfix record with symptom, root cause, fix, and verification.
- As a user, I can add an engineering execution prompt and mark it as exact, redacted, reconstructed, or summary-only.
- As a user, I can update completed, in-progress, pending, blocked, and next-action status.
- As a user, I can export a Vibe Project to Markdown and JSON.
- As a future agent, I can read the exported files and continue the project without asking the user to repeat old context.

## Core Object: Vibe Project

The Vibe Project is the central product object.

It should be represented in the app as structured data and exported into the VibeLog v0.1 format.

### Required Fields

- `id`
- `title`
- `oneLineVibe`
- `currentIdea`
- `stage`
- `visibility`
- `codeVisibility`
- `promptVisibility`
- `collaborationStatus`
- `tools`
- `tags`
- `createdAt`
- `updatedAt`
- `ideaExpansion`
- `ideaEvolution[]`
- `decisions[]`
- `humanInTheLoop[]`
- `openQuestions[]`
- `implementationStatus`
- `projectContext`
- `executionPrompts[]`
- `developmentLog[]`
- `vibeProgress[]`
- `publicSummary`

## MVP Screens

### 1. Dashboard

Purpose: show the user's local Vibe Projects.

Required UI:

- project list
- project title
- one-line vibe
- stage
- visibility
- updated time
- next action preview
- create project button
- import JSON button

### 2. Create Vibe Project

Purpose: create a project quickly from a small amount of input.

Required fields:

- title
- one-line vibe
- current idea
- stage
- tags
- tools

Defaults:

- `stage: idea`
- `visibility: private`
- `codeVisibility: hidden`
- `promptVisibility: summary`
- `collaborationStatus: closed`

### 3. Vibe Project Detail

Purpose: the "repo page" equivalent for a Vibe Project.

Required sections:

- header with title, one-line vibe, stage, and visibility
- current idea
- implementation status
- idea evolution timeline
- human-in-the-loop decisions
- development log
- execution prompts
- vibe progress
- public summary
- export actions

Execution prompt text should be collapsed by default.

### 4. Add Update

Purpose: append structured updates without forcing the user to edit raw Markdown.

Supported update types:

- idea change
- human decision
- implementation status update
- development log
- bugfix
- execution prompt
- vibe progress
- open question

The form can be one flexible update composer in MVP. It does not need separate polished editors for every section.

### 5. Export View

Purpose: preview and download generated files.

Required actions:

- preview Markdown
- copy Markdown
- download `vibe-log.md`
- preview JSON
- copy JSON
- download `vibe-log.json`

## Storage Strategy

MVP should be local-first.

Use browser storage for v1, but hide storage behind a repository interface so future cloud sync does not require rewriting UI logic.

Recommended abstraction:

```ts
interface VibeRepository {
  listProjects(): Promise<VibeProject[]>
  getProject(id: string): Promise<VibeProject | null>
  createProject(input: CreateVibeProjectInput): Promise<VibeProject>
  updateProject(id: string, patch: VibeProjectPatch): Promise<VibeProject>
  deleteProject(id: string): Promise<void>
  importProject(data: VibeProject): Promise<VibeProject>
  exportProject(id: string): Promise<VibeProjectExport>
}
```

Initial implementation:

```txt
LocalVibeRepository -> localStorage or IndexedDB
Future implementation -> SupabaseVibeRepository / ApiVibeRepository
```

## Architecture Requirements

The MVP should be small, but its boundaries should match the long-term platform.

### Domain Layer

Owns the VibeLog data model, enums, validation, and update rules.

Examples:

- `VibeProject`
- `IdeaEvolutionEntry`
- `HumanInTheLoopEntry`
- `ExecutionPromptEntry`
- `DevelopmentLogEntry`
- `ImplementationStatus`

### Repository Layer

Owns persistence. UI should not directly call `localStorage`.

### Export Layer

Owns Markdown and JSON generation.

The app stores structured data, then exports `vibe-log.md` and `vibe-log.json`.

### Presentation Layer

Owns pages, forms, timeline views, and export views.

### Validation Layer

Validate project data before saving and before exporting.

Recommended: TypeScript types plus runtime validation such as Zod.

## Suggested Tech Stack

- Next.js
- React
- TypeScript
- Zod for runtime validation
- Local storage abstraction using localStorage or IndexedDB
- CSS Modules or Tailwind for styling
- File download APIs for export

Reasoning:

- Next.js supports future public pages and SEO.
- TypeScript protects the schema-heavy model.
- Zod keeps runtime data safe.
- Local-first storage keeps the MVP fast while repository abstraction preserves future cloud migration.

## Future Platform Hooks

The MVP should not implement these, but should avoid blocking them:

- account ownership
- private and public projects
- public Vibe Project pages
- Vibe Branches
- project comments
- collaboration requests
- creator profiles
- team/studio ownership
- GitHub repository links
- AI agent direct write API
- Markdown-to-JSON CLI
- JSON upload endpoint

## Success Criteria

The MVP is successful if:

- A user can create at least one Vibe Project in under 2 minutes.
- A user can add an idea change and see the prior idea preserved.
- A user can add a human-in-the-loop decision.
- A user can add an exact engineering execution prompt.
- A user can add a bugfix entry with symptom, root cause, fix, and verification.
- A user can export valid `vibe-log.md` and `vibe-log.json`.
- A future agent can read the exported Markdown and understand the project state.

## Risks

- The app becomes a form-heavy database instead of a lightweight creative workspace.
- Users may not want to manually fill too many structured fields.
- Execution prompts may contain secrets if redaction is not clear.
- Local-only storage can feel fragile without export reminders.
- Starting with too much community functionality would delay the core object.

## MVP Scope Decision

Build VibeLog Studio as a local-first project workspace, not a social platform.

The first product milestone is:

```txt
Create Vibe Project -> Update VibeLog -> View Project Page -> Export Markdown/JSON
```

That is the VibeLog equivalent of early GitHub's repository page.

## Open Questions

- Should local storage use localStorage for speed or IndexedDB for resilience?
- Should Markdown export be editable in the app before download?
- Should execution prompt text be encrypted locally in a later version?
- Should the first deployed version warn users that data is browser-local?
- Should the product name remain VibeLog Studio or become VibeLog after the app exists?
