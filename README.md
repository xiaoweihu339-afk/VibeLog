# VibeLog

VibeLog is a Markdown-first agent skill and process record standard for vibe-built products.

It helps humans and agents preserve the parts of vibe coding that usually disappear: the one-line idea, idea changes, human-in-the-loop decisions, implementation status, validation design, verification evidence, development logs, bug fixes, handoff state, artifacts, and engineering execution prompts.

```txt
Vibe Repo = VibeLog + Project Artifacts
VibeLog = process memory
Project Artifacts = code, demos, tests, docs, screenshots, releases, or other product evidence
```

## Current Version

This repository is at **VibeLog v0.2 draft**.

The current draft focuses on a reusable local skill, a stable Markdown-to-JSON contract, deterministic helper scripts, copyable agent templates, and opt-in automation hooks. It is designed to work before any VibeHub website exists.

## Core Principle

```txt
User says naturally, agent records structurally.
```

The human should be able to create in a normal conversation. The agent or hook adapter should keep the project memory structured, readable, and machine-exportable.

## What VibeLog Records

- `One-Line Vibe`: one sentence describing what is being built.
- `Current Idea`: the latest version of the product idea.
- `Idea Evolution`: how the idea changed over time.
- `Human-in-the-Loop`: decisions made by the human, including direction, taste, risk, scope, approval, rejection, privacy, naming, and release choices.
- `Implementation Status`: completed, in-progress, pending, blocked, and next actions.
- `Validation Design`: success criteria, isolated checks, combined workflow checks, edge cases, and risks.
- `Verification Evidence`: command results, test evidence, demos, screenshots, manual QA, and residual risk.
- `Execution Prompts`: a strict ledger for engineering execution prompts.
- `Development Log`: features, tests, docs, refactors, releases, chores, and bug fixes.
- `Bugfix / Incident Log`: symptoms, root causes, fixes, verification, and follow-up.
- `Project Context`: important files, commands, known issues, and areas not to change.
- `Artifact Index`: links or references to code, demos, docs, releases, prompt libraries, and exported VibeLog files.
- `Handoff State`: the concise state a future human or agent needs to continue safely.
- `Public Summary`: a future upload or showcase summary.

## Key Rule

Engineering execution prompts must be recorded in `Execution Prompts`.

Chat-like ideation should not be copied as a transcript. It should be distilled into `Idea Evolution`, `Human-in-the-Loop`, `Decisions`, or `Open Questions`.

## Public Repository Boundary

This repository is the reusable VibeLog skill and toolchain. It should not contain private project memory.

Do not commit:

- root-level project `vibe-log.md` or `vibe-log.json` from real work
- `.vibelog-events/` hook event payloads
- scratch workspace outputs
- raw private prompts or chat transcripts
- local absolute paths from a personal machine
- experimental dogfood source projects

Only sanitized, synthetic, or explicitly public VibeLog examples belong under `examples/`.

## Quick Start

Copy the skill into your Codex skills directory:

```powershell
Copy-Item -Recurse .\skills\vibelog "$env:USERPROFILE\.codex\skills\vibelog" -Force
```

Then ask Codex to use it:

```txt
Use the vibelog skill to create or update a VibeLog for this project.
```

For a new project, VibeLog creates these files in that project:

```txt
vibe-log.md
vibe-log.json
```

For an existing project, the agent should read current files, docs, git history, existing VibeLog data, and conversation context before updating the log.

See [Quickstart](docs/guides/quickstart.md) and [Agent usage guide](skills/vibelog/references/agent-usage-guide.md).

## Agent Templates

Agents that cannot load Codex skills directly can still adopt the VibeLog workflow through copyable templates in `agent-templates/`.

Current template targets:

- Codex and other agents that read `AGENTS.md`
- Claude Code through `CLAUDE.md`
- Gemini CLI through `GEMINI.md`
- Cursor through `.cursor/rules/vibelog.mdc`
- Windsurf through `.windsurf/rules/vibelog.md`
- Cline through `.clinerules/vibelog.md`
- Roo-compatible environments through `.roo/rules/vibelog.md`
- GitHub Copilot through `.github/copilot-instructions.md`

See [Agent compatibility](docs/guides/agent-compatibility.md) and [Agent compatibility 中文](docs/guides/agent-compatibility.zh.md).

## Clone-Local CLI

This repository is marked `private` in `package.json` because the current package path is for clone-local reuse, not npm publishing.

From a cloned repository:

```powershell
npm run vibelog -- --help
npm run vibelog -- init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
npm run vibelog -- verify --project "C:\path\to\project"
```

## Export JSON

`vibe-log.md` is the source of truth. Regenerate JSON when a tool, website, agent handoff, or future VibeHub upload flow needs structured data:

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node scripts/validate-vibelog.mjs vibe-log.json
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

See [Export JSON](docs/guides/export-json.md).

## Record Events

Use the recorder core when an agent, hook, or adapter has a structured Vibe Event JSON payload:

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
```

See [Recorder Core](docs/guides/recorder-core.md) and [Vibe Event Format](skills/vibelog/references/vibe-event-format.md).

## Claude Code Adapter

The first automation target is Claude Code because its hook system can call deterministic scripts during the coding lifecycle.

```powershell
node scripts/claude-code-hook-adapter.mjs --log vibe-log.md --json vibe-log.json --event-dir .vibelog-events
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

The hook generator is dry-run by default. Use `--write` only after reviewing the generated project-local settings.

Recommended event mapping:

```txt
SessionStart      -> load concise VibeLog context
UserPromptSubmit  -> classify user prompt and record engineering prompts
PostToolUse       -> record file edits, commands, tests, and artifacts
Stop              -> update progress, implementation status, handoff, and JSON export
PreCompact        -> preserve essential context before compaction
PostCompact       -> refresh handoff state if useful
```

See [Claude Code Adapter](docs/guides/claude-code-adapter.md), [Claude Code Opt-In Install](docs/guides/claude-code-opt-in-install.md), and [Claude Code adapter notes](skills/vibelog/references/claude-code-hooks-adapter.md).

## Repository Structure

```txt
.
|-- AGENTS.md
|-- agent-templates/
|-- package.json
|-- skills/
|   `-- vibelog/
|       |-- SKILL.md
|       |-- agents/
|       |-- assets/
|       `-- references/
|-- docs/
|   |-- distribution/
|   |-- guides/
|   |-- product/
|   `-- releases/
|-- examples/
|   `-- public-sample/
|       |-- README.md
|       |-- vibe-log.md
|       `-- vibe-log.json
|-- scripts/
`-- test/
```

## Important Scripts

- `scripts/export-vibelog.mjs`: export deterministic JSON from Markdown.
- `scripts/validate-vibelog.mjs`: validate exported VibeLog JSON against the current schema subset.
- `scripts/record-vibelog-event.mjs`: apply one structured Vibe Event payload to Markdown and optionally regenerate JSON.
- `scripts/claude-code-hook-adapter.mjs`: map Claude Code hook JSON input to Vibe Event JSON and call the recorder core.
- `scripts/configure-claude-code-vibelog-hooks.mjs`: preview or write project-local Claude Code VibeLog hook settings.
- `scripts/vibelog-project.mjs`: project adoption CLI for init, hook preview/enable, verification, and hook disable.
- `scripts/vibelog-install.mjs`: dry-run installer planner.
- `scripts/verify-release-bundle.mjs`: scratch-only release bundle verifier.

## Examples

`examples/public-sample/` is a synthetic public-safe VibeLog example. It demonstrates the format without publishing private prompts, local paths, scratch output, or real project data.

Example folders may contain only:

- `README.md`
- `vibe-log.md`
- `vibe-log.json`

## Documentation

- [Quickstart](docs/guides/quickstart.md)
- [Export JSON](docs/guides/export-json.md)
- [Recorder Core](docs/guides/recorder-core.md)
- [Claude Code Adapter](docs/guides/claude-code-adapter.md)
- [Claude Code Opt-In Install](docs/guides/claude-code-opt-in-install.md)
- [VibeLog Project Adoption](docs/guides/vibelog-project-adoption.md)
- [VibeLog Install and Distribution](docs/guides/vibelog-install-distribution.md)
- [Agent compatibility](docs/guides/agent-compatibility.md)
- [Agent compatibility 中文](docs/guides/agent-compatibility.zh.md)
- [Vibe verification guide](docs/guides/vibe-verification-guide.md)
- [Agent dogfood protocol](docs/guides/agent-dogfood-protocol.md)
- [Validation checklist](docs/guides/validation-checklist.md)
- [VibeHub long-term product document](docs/product/vibehub-long-term-product-document.md)
- [VibeLog Studio MVP requirements](docs/product/vibelog-studio-mvp-requirements.md)
- [v0.2 draft release notes](docs/releases/v0.2-draft.md)

## Test

Run the full repository test suite:

```powershell
node --test
```

Useful targeted checks:

```powershell
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json
node scripts/validate-vibelog.mjs examples/public-sample/vibe-log.json
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json --check
node scripts/verify-release-bundle.mjs --repo "C:\path\to\VibeLog" --scratch-root "C:\path\to\scratch-root"
```

## Current Status

VibeLog v0.2 draft is ready for local skill testing, JSON export, schema validation, project-local adoption, copyable agent-template smoke testing, Claude Code hook preview, scratch-only verification, and sanitized public example review.

It is not yet a polished public package manager release. The next major step is to test the skill across more real agent sessions while keeping private VibeLogs outside this repository.

## License

No license has been selected yet.
