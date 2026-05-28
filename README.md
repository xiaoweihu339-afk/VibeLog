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
Stay skeptical, verify strictly.
```

The human should be able to create in a normal conversation. The agent or hook adapter should keep the project memory structured, readable, and machine-exportable.

Do not trust claims, agent reports, or plausible-looking output without evidence. Record uncertainty, run the strongest practical checks, and only mark work as passed when evidence supports it.

## Core Doctrine

VibeLog is a vibe coding process memory standard, not a GitHub push tool.

The core loop is:

```txt
human vibes naturally -> agent records structurally -> Markdown stays readable -> JSON stays machine-usable
```

VibeLog starts from a one-line idea and preserves how a vibe product changes while it is being made: idea evolution, human-in-the-loop decisions, engineering execution prompts, implementation status, validation design, verification evidence, bug fixes, and handoff state.

`vibe-log.md` is the human-readable source of truth. `vibe-log.json` is the structured export for agents, tools, future VibeHub upload, search, remix, and collaboration. Public skill readiness is a distribution safety gate for this repository; it is not the VibeLog core.

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

Before any human-approved push, run the public skill readiness gate:

```powershell
node scripts/verify-public-skill-readiness.mjs
npm run vibelog:verify-public-skill-readiness
```

This gate checks private root logs, package entrypoints, public docs, and tracked text for local personal paths or token-like secrets. Passing the gate does not authorize a push; push still requires explicit human approval and a reviewed commit.

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

### Automation Expectations

Installing VibeLog does not guarantee automatic recording. The skill and templates define the record format and agent behavior, but automatic capture depends on each agent environment:

- Claude Code CLI can provide strong automation when project-local hooks are enabled.
- Codex currently relies on `AGENTS.md`, explicit VibeLog calls, and end-of-slice recording unless a wrapper or future lifecycle hook is added.
- Cursor, Windsurf, Cline, Roo, Gemini CLI, and GitHub Copilot depend on their own rule-loading or instruction mechanisms and must be verified per project.
- Plain chat environments usually need manual summaries and explicit recorder/export commands.

Future optimization will add stronger adapters, wrappers, capability checks, and VibeHub-native recording flows as agent platforms expose better lifecycle events.

To verify the template pack from a clean clone into a synthetic consumer project:

```powershell
npm run vibelog:verify-github-agent-template-adoption -- --remote-url https://github.com/xiaoweihu339-afk/VibeLog.git --workspace "C:\path\to\scratch-root"
```

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
node scripts/verify-handoff-continuity.mjs vibe-log.json
node scripts/verify-handoff-continuity.mjs vibe-log.json --min-score 90 --brief-only
node scripts/verify-second-agent-continuation-report.mjs --brief handoff-brief.txt --report second-agent-report.json
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

See [Export JSON](docs/guides/export-json.md).

## Record Events

Use the recorder core when an agent, hook, or adapter has one structured Vibe Event JSON payload:

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
```

Use an event stream when a session, hook, or adapter accumulates multiple events:

```powershell
node scripts/record-vibelog-event.mjs --events events.jsonl --log vibe-log.md --json vibe-log.json
```

`--events` accepts a JSON array or JSONL file. Events are applied in file order.

See [Recorder Core](docs/guides/recorder-core.md) and [Vibe Event Format](skills/vibelog/references/vibe-event-format.md).

## Claude Code Adapter

The first automation target is Claude Code because its hook system can call deterministic scripts during the coding lifecycle.

```powershell
node scripts/claude-code-hook-adapter.mjs --log vibe-log.md --json vibe-log.json --event-dir .vibelog-events
node scripts/claude-code-hook-adapter.mjs --event-stream .vibelog-events/session.jsonl
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream
```

The direct adapter command writes VibeLog immediately. The `--event-stream` command appends JSONL events only; run `record-vibelog-event.mjs --events` later to consume the stream.

The hook generator is dry-run by default. Use `--write` only after reviewing the generated project-local settings. Use `--event-mode stream` when project hooks should accumulate JSONL events before the recorder updates VibeLog.

Recommended event mapping:

```txt
SessionStart      -> load concise VibeLog context
UserPromptSubmit  -> classify user prompt and record engineering prompts
PostToolUse       -> record file edits, commands, tests, and artifacts
Stop              -> update progress, implementation status, handoff, and JSON export
PreCompact        -> preserve essential context before compaction
PostCompact       -> refresh handoff state if useful
```

See [Stable Live Hook Workflow](docs/guides/stable-live-hook-workflow.md), [稳定 live hook 工作流](docs/guides/stable-live-hook-workflow.zh.md), [Claude Code Adapter](docs/guides/claude-code-adapter.md), [Claude Code Opt-In Install](docs/guides/claude-code-opt-in-install.md), and [Claude Code adapter notes](skills/vibelog/references/claude-code-hooks-adapter.md).

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
- `scripts/verify-handoff-continuity.mjs`: check whether `handoff_state`, progress, evidence, and boundaries are strong enough for another agent to continue; use `--brief-only` to print a compact second-agent handoff package.
- `scripts/simulate-second-agent-continuation.mjs`: simulate a second agent using only the brief-only package before running a real second-agent dogfood.
- `scripts/verify-second-agent-continuation-report.mjs`: verify a real second-agent JSON report against the brief-only package before trusting it as dogfood evidence.
- `scripts/record-vibelog-event.mjs`: apply one structured Vibe Event payload or an ordered event stream to Markdown and optionally regenerate JSON.
- `scripts/claude-code-hook-adapter.mjs`: map Claude Code hook JSON input to Vibe Event JSON, either recording directly or appending an event stream.
- `scripts/configure-claude-code-vibelog-hooks.mjs`: preview or write project-local Claude Code VibeLog hook settings.
- `scripts/vibelog-project.mjs`: project adoption CLI for init, hook preview/enable, verification, and hook disable.
- `scripts/vibelog-install.mjs`: dry-run installer planner.
- `scripts/verify-public-skill-readiness.mjs`: public skill push-preflight verifier for privacy boundaries, package entrypoints, docs, and tracked text.
- `scripts/verify-release-bundle.mjs`: scratch-only release bundle verifier.
- `scripts/verify-github-agent-template-adoption.mjs`: clean-clone agent template adoption verifier.

## Examples

`examples/public-sample/` is a synthetic public-safe VibeLog example. It demonstrates the format without publishing private prompts, local paths, scratch output, or real project data.

Example folders may contain only:

- `README.md`
- `vibe-log.md`
- `vibe-log.json`

## Documentation

- [Quickstart](docs/guides/quickstart.md)
- [Export JSON](docs/guides/export-json.md)
- [Handoff Continuity](docs/guides/handoff-continuity.md)
- [交接连续性](docs/guides/handoff-continuity.zh.md)
- [Second-Agent Continuation](docs/guides/second-agent-continuation.md)
- [第二 agent 接手验证](docs/guides/second-agent-continuation.zh.md)
- [Real Second-Agent Dogfood](docs/guides/real-second-agent-dogfood.md)
- [真实第二 agent 接力](docs/guides/real-second-agent-dogfood.zh.md)
- [Recorder Core](docs/guides/recorder-core.md)
- [Claude Code Adapter](docs/guides/claude-code-adapter.md)
- [Claude Code Opt-In Install](docs/guides/claude-code-opt-in-install.md)
- [Stable Live Hook Workflow](docs/guides/stable-live-hook-workflow.md)
- [稳定 live hook 工作流](docs/guides/stable-live-hook-workflow.zh.md)
- [Public Skill Readiness](docs/guides/public-skill-readiness.md)
- [公开 Skill Readiness](docs/guides/public-skill-readiness.zh.md)
- [VibeLog Project Adoption](docs/guides/vibelog-project-adoption.md)
- [VibeLog Install and Distribution](docs/guides/vibelog-install-distribution.md)
- [Agent compatibility](docs/guides/agent-compatibility.md)
- [Agent compatibility 中文](docs/guides/agent-compatibility.zh.md)
- [Vibe verification guide](docs/guides/vibe-verification-guide.md)
- [Agent dogfood protocol](docs/guides/agent-dogfood-protocol.md)
- [Validation checklist](docs/guides/validation-checklist.md)
- [VibeHub long-term product document](docs/product/vibehub-long-term-product-document.md)
- [VibeLog Studio MVP requirements](docs/product/vibelog-studio-mvp-requirements.md)
- [VibeHub product layer boundary](docs/product/vibehub-product-layer-boundary.md)
- [VibeHub engineering startup boundary](docs/product/vibehub-engineering-startup.md)
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
node scripts/verify-public-skill-readiness.mjs
node scripts/verify-github-agent-template-adoption.mjs --remote-url https://github.com/xiaoweihu339-afk/VibeLog.git --workspace "C:\path\to\scratch-root"
node scripts/verify-release-bundle.mjs --repo "C:\path\to\VibeLog" --scratch-root "C:\path\to\scratch-root"
```

## Current Status

VibeLog v0.2 draft is ready for local skill testing, JSON export, schema validation, handoff continuity verification with brief-only handoff packages, simulated second-agent continuation checks, project-local adoption, copyable agent-template smoke testing, clean-clone agent-template adoption verification, Claude Code hook preview, stream-first scratch/live runtime probing with readiness preflight, stable live hook workflow guidance, longer multi-turn, less-scripted, and human-in-the-loop live dogfood verification, sanitized public example review, and repeatable public skill readiness checks.

It is not yet a polished public package manager release. The next major step is to test the skill across more real agent sessions while keeping private VibeLogs outside this repository.

## License

No license has been selected yet.
