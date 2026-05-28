# VibeLog Agent Usage Guide

This guide is for agents using the VibeLog skill during real project sessions.

Use `skills/vibelog/SKILL.md` as the canonical rule set. Use this file as the operational checklist.

## Core Doctrine

VibeLog is a vibe coding process memory standard, not a publishing or push workflow.

The agent's job is to let the human vibe naturally while the agent records structurally. Start from the one-line idea, then maintain idea evolution, human-in-the-loop decisions, engineering execution prompts, implementation status, validation design, verification evidence, bug fixes, and handoff state.

Markdown is the human-readable source of truth. JSON is an export for agents, tools, future upload, search, remix, and collaboration. Push readiness belongs only to distribution safety for the reusable skill repository; it is not the VibeLog core.

## When To Call VibeLog

Call VibeLog when the user asks to:

- start a vibe project
- record or reconstruct project context
- change product direction
- hand a project to another agent
- record implementation status
- record tests, validation, bugs, fixes, or artifacts
- prepare a project for future upload or public sharing

Also call it when engineering work is happening and the project already has a `vibe-log.md`.

## Agent Automation Limits

Installing VibeLog does not guarantee automatic recording. The standard is portable, but capture timing depends on the agent environment:

- Claude Code CLI: use project-local hooks for the strongest current automation.
- Codex / AGENTS-aware agents: use `AGENTS.md`, explicit VibeLog calls, and end-of-slice recording; ordinary idea chat is not automatically captured unless the agent writes it.
- Gemini CLI: use `GEMINI.md`, then verify Markdown/JSON after meaningful sessions.
- Cursor: use `.cursor/rules/vibelog.mdc` and verify rule loading.
- Windsurf: use `.windsurf/rules/vibelog.md` and verify workspace rule behavior.
- Cline: use `.clinerules/vibelog.md` and verify the task flow updates VibeLog.
- Roo-compatible environments: verify `.roo/rules/` loading for the local mode/version.
- GitHub Copilot: use repository custom instructions for guidance, then update VibeLog explicitly.
- Plain web chat: summarize manually and run recorder/export commands.

Future optimization should add stronger adapters, wrappers, capability checks, and VibeHub-native recording flows. Until then, report the real automation level instead of implying all agents behave like Claude Code hooks.

## Event Classification

Before writing, classify the event:

- `new idea`
- `idea expansion`
- `idea change`
- `scope change`
- `human decision`
- `engineering execution prompt`
- `feature work`
- `bugfix`
- `refactor`
- `test design`
- `verification result`
- `progress update`
- `artifact update`
- `handoff update`
- `privacy or visibility decision`
- `branch or remix intent`

Write the update into the matching section. Do not create a transcript dump.

## What Must Be Recorded Exactly

Record exact local prompt text for engineering execution prompts unless sensitive:

- build requests
- edit requests
- debug requests
- test requests
- refactor requests
- implementation design requests
- documentation requests that guide project execution
- deployment requests
- file inspection requests
- command execution requests
- engineering research requests

Set:

```txt
prompt_type: build | refactor | debug | test | design | docs | deploy | inspect | research
recording_mode: exact | redacted | reconstructed | summary_only
```

If the prompt includes secrets, credentials, tokens, private personal data, or sensitive business information, redact only the sensitive parts and set `recording_mode: redacted`.

## What Should Be Summarized

Summarize ordinary idea chat into structured records:

- idea changes go to `Idea Evolution`
- firm choices go to `Decisions`
- human steering goes to `Human-in-the-Loop`
- unresolved items go to `Open Questions`

Do not copy long brainstorming conversations into `Execution Prompts`.

## Human-In-The-Loop Rules

Use `Human-in-the-Loop` when the human shapes:

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

Record:

- human input
- agent proposal, if relevant
- final decision
- why it mattered
- impact on idea, design, implementation, validation, or next steps

## Reconstruction Rules

If VibeLog is created mid-project, inspect evidence first:

1. conversation context
2. existing `vibe-log.md`
3. README and docs
4. git history
5. project files

Mark reconstructed material:

```md
**Source:** reconstructed from conversation / git / files / user memory
**Confidence:** high / medium / low
```

Use `unknown` instead of inventing exact dates, prompts, root causes, or verification results.

## Handoff State Rules

Before ending a meaningful session, update handoff state so the next agent can answer:

- what is being built
- what the current idea is
- what changed
- where the human made important decisions
- what is implemented
- what is pending or blocked
- how to test the project
- what verification evidence exists
- what artifacts matter
- what the next smallest useful action is

If the handoff state is vague, update it before stopping.

## Progress Reporting Rules

Every completed meaningful task should report conservative project progress to the human.

Use the long-term VibeHub vision as `100%`, not the local repo's immediate tasks. The current baseline after S41 is:

```txt
Project Progress: 36 / 100
```

This baseline reflects S41 core doctrine alignment after S40 public skill readiness: VibeLog's core is explicitly guarded as vibe coding process memory, not a GitHub push tool, while public readiness remains a distribution safety gate. Read local `vibe-log.md` first when it exists, because private dogfood state may be newer than public docs.

Final reports should include:

- overall progress out of `100`
- change this task
- current phase
- completed this task
- next unlock
- main risk
- confidence

Use `docs/guides/progress-reporting.md` and `docs/guides/progress-reporting.zh.md`. If a task only clarifies wording, rules, or documentation, the progress change is usually `+0`.

## Verification Rules

Stay skeptical, verify strictly.

Only record verification evidence for checks that actually happened.

Good evidence:

- command output
- test result
- manual QA result
- screenshot or demo reference
- known failure with residual risk

Do not trust claims, agent reports, or plausible-looking output without actual evidence. Do not record passed because the implementation looks plausible. Run or describe the actual check, then record known gaps and residual risk.

When testing whether another agent can continue from VibeLog, run:

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node scripts/validate-vibelog.mjs vibe-log.json
node scripts/verify-handoff-continuity.mjs vibe-log.json
node scripts/verify-handoff-continuity.mjs vibe-log.json --min-score 90 --brief-only
node scripts/simulate-second-agent-continuation.mjs --brief handoff-brief.txt
node scripts/verify-second-agent-continuation-report.mjs --brief handoff-brief.txt --report second-agent-report.json
```

Use `docs/guides/handoff-continuity.md` for the full handoff continuity rule.
Use `docs/guides/second-agent-continuation.md` before running a real second-agent dogfood.
Use `docs/guides/real-second-agent-dogfood.md` when verifying a fresh agent that receives only the brief-only package.

For reusable skill push-preflight, use isolated checks and workflow checks:

```powershell
node scripts/verify-public-skill-readiness.mjs
node --test test\verify-public-skill-readiness.test.mjs test\vibelog-package.test.mjs
node --test test\verify-clean-clone-adoption.test.mjs test\verify-release-bundle.test.mjs
node --test
```

Use `docs/guides/public-skill-readiness.md` before treating the VibeLog skill repository as push-ready.

## Privacy Rules

Default to private:

```yaml
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
```

Never publish or upload without explicit user approval.

Never expose secrets, API keys, tokens, credentials, or private personal data.

## JSON Rules

Markdown is the source of truth.

If `vibe-log.md` and `vibe-log.json` disagree, update Markdown first, then refresh JSON.

At minimum, parse JSON after editing:

```powershell
node -e "JSON.parse(require('fs').readFileSync('vibe-log.json','utf8')); console.log('OK vibe-log.json')"
```
