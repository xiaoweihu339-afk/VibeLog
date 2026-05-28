# Agent Compatibility Guide

This guide explains how VibeLog can be used by agents that do not load Codex skills directly.

Status: prototype template pack, smoke-tested in this repository. Live adherence still depends on each agent version and project setup.

Last checked: 2026-05-27.

## Why This Exists

VibeLog should not depend on one agent vendor. The durable core is:

- `vibe-log.md` as human-readable source of truth
- `vibe-log.json` as deterministic machine export
- a strict record of engineering execution prompts
- structured idea evolution, human-in-the-loop decisions, validation design, verification evidence, bug fixes, artifacts, and handoff state

The templates in `agent-templates/` make that core available to common agent instruction systems.

## Automation Limits

Installing VibeLog does not guarantee automatic recording. VibeLog defines what to record and how to export it; automatic capture depends on whether the current agent environment exposes hooks, lifecycle events, plugins, wrappers, or reliable project instruction loading.

Use this rule of thumb:

```txt
VibeLog Standard -> recording format and rules
Agent Adapter    -> when the environment can capture prompts/tools/session events
Human / Agent    -> explicit updates when the environment has no reliable automation
```

## Common Agent Automation Matrix

| Agent environment | Current automatic recording level | Recommended VibeLog path |
| --- | --- | --- |
| Claude Code CLI | Strong when project-local hooks are enabled | Use `CLAUDE.md` plus the Claude Code hook adapter. Prefer stream-first hooks for reviewable JSONL events. |
| Codex / AGENTS-aware agents | Medium to weak; depends on the agent following project instructions | Use `AGENTS.md`, explicit VibeLog calls, and end-of-slice recording. Treat ordinary idea chat as not automatically captured unless the agent records it. |
| Gemini CLI | Medium to weak; depends on `GEMINI.md` loading and agent behavior | Use `GEMINI.md`, then verify Markdown/JSON updates after meaningful sessions. |
| Cursor | Medium to weak; depends on rule loading and model compliance | Use `.cursor/rules/vibelog.mdc`; verify that project rules are active before trusting recording behavior. |
| Windsurf | Medium to weak; depends on workspace rule behavior | Use `.windsurf/rules/vibelog.md`; verify with a small synthetic project before real work. |
| Cline | Medium to weak; depends on `.clinerules` loading and task flow | Use `.clinerules/vibelog.md`; verify that the agent updates `vibe-log.md` before relying on it. |
| Roo-compatible environments | Medium to weak; rule directory behavior varies by mode/version | Use `.roo/rules/` only after checking the local environment loads those rules. |
| GitHub Copilot | Weak for continuous process recording; better for repository guidance | Use `.github/copilot-instructions.md` for expectations, then update VibeLog explicitly. |
| Plain web chat / generic chatbots | Weak; no reliable project-local hook or file-write lifecycle | Manually summarize ideas and decisions into VibeLog, then run export/validation. |
| Future VibeHub native recorder | Target: strong | Future optimization should provide first-class project memory capture, upload, permissions, and reviewable event streams. |

Do not promise users that normal brainstorming will be captured automatically unless the environment has been verified with a live workflow test.

## Supported Templates

| Agent environment | Template path | Notes |
| --- | --- | --- |
| Codex / AGENTS-aware agents | `agent-templates/AGENTS.md` | Copy to project root as `AGENTS.md`. |
| Claude Code | `agent-templates/CLAUDE.md` | Copy to project root as `CLAUDE.md`; optional hooks can be configured separately. |
| Gemini CLI | `agent-templates/GEMINI.md` | Copy to project root as `GEMINI.md`. |
| Cursor | `agent-templates/cursor/.cursor/rules/vibelog.mdc` | Copy into `.cursor/rules/`. |
| Windsurf | `agent-templates/windsurf/.windsurf/rules/vibelog.md` | Copy into `.windsurf/rules/`. |
| Cline | `agent-templates/cline/.clinerules/vibelog.md` | Copy into `.clinerules/`. |
| Roo-compatible environments | `agent-templates/roo-legacy/.roo/rules/vibelog.md` | Copy into `.roo/rules/` and verify local rule loading. |
| GitHub Copilot | `agent-templates/github-copilot/.github/copilot-instructions.md` | Copy into `.github/copilot-instructions.md`. |

## Install Pattern

1. Copy the matching template into the target project.
2. Replace `<path-to-VibeLog>` with the local path to this repository.
3. Keep project logs in the target project:

```txt
vibe-log.md
vibe-log.json
```

4. After Markdown updates, export and validate JSON:

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

## Safety Boundary

The public VibeLog repository may contain reusable templates and sanitized examples only.

Do not commit:

- real root-level project `vibe-log.md` or `vibe-log.json`
- `.vibelog-events/` hook payloads
- raw private prompts or private chat transcripts
- local absolute paths from a personal machine
- secrets, credentials, tokens, or sensitive business data
- experimental dogfood source projects

## Verification Levels

Level 1 - static template smoke test:

```powershell
node --test test/agent-compatibility.test.mjs
```

This verifies template paths, required VibeLog commands, public-repo privacy boundaries, and distribution-plan status.

Level 2 - clean-clone template adoption test:

```powershell
node scripts/verify-github-agent-template-adoption.mjs --remote-url https://github.com/xiaoweihu339-afk/VibeLog.git --workspace <scratch-root>
```

This clones a clean source, installs every template into a synthetic consumer project, initializes VibeLog, exports JSON, validates JSON, and checks that no private project artifacts are present.

Level 3 - project adoption test:

Use a synthetic project and ask the selected agent to create or update `vibe-log.md`, then run the export and validation commands.

Level 4 - live workflow test:

Run a real coding task with the selected agent and verify that idea changes, human decisions, execution prompts, validation evidence, and handoff state were recorded without leaking private data.

## Future Optimization

Future work should improve adapter coverage without weakening the standard:

- better Codex wrapper or app integration when lifecycle hooks become available
- stronger template verification for Cursor, Windsurf, Cline, Roo, Gemini CLI, and GitHub Copilot
- clearer native VibeHub recorder flows for non-programmers
- reviewable event streams before writing permanent Markdown
- agent-specific capability detection so users know whether they have automatic, semi-automatic, or manual recording

## Source References

- OpenAI Codex documents `AGENTS.md` project instructions: https://developers.openai.com/codex/guides/agents-md
- Claude Code documents `CLAUDE.md` memory and hooks: https://code.claude.com/docs/en/memory and https://code.claude.com/docs/en/hooks
- Cursor documents project rules under `.cursor/rules`: https://docs.cursor.com/context/rules
- Gemini CLI documents project context through `GEMINI.md`: https://github.com/google-gemini/gemini-cli/blob/main/docs/index.md
- Windsurf documents workspace rules for Cascade: https://windsurf.com/university/general-education/creating-modifying-rules
- Cline documents `.clinerules/` and AGENTS compatibility: https://docs.cline.bot/customization/cline-rules
- Roo Code documents `.roo/rules-*` instruction directories for custom modes: https://roocodeinc.github.io/Roo-Code/features/custom-modes/
- GitHub Copilot documents repository custom instructions: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
