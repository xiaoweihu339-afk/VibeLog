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

Level 2 - project adoption test:

Use a synthetic project and ask the selected agent to create or update `vibe-log.md`, then run the export and validation commands.

Level 3 - live workflow test:

Run a real coding task with the selected agent and verify that idea changes, human decisions, execution prompts, validation evidence, and handoff state were recorded without leaking private data.

## Source References

- OpenAI Codex documents `AGENTS.md` project instructions: https://developers.openai.com/codex/guides/agents-md
- Claude Code documents `CLAUDE.md` memory and hooks: https://code.claude.com/docs/en/memory and https://code.claude.com/docs/en/hooks
- Cursor documents project rules under `.cursor/rules`: https://docs.cursor.com/context/rules
- Gemini CLI documents project context through `GEMINI.md`: https://github.com/google-gemini/gemini-cli/blob/main/docs/index.md
- Windsurf documents workspace rules for Cascade: https://windsurf.com/university/general-education/creating-modifying-rules
- Cline documents `.clinerules/` and AGENTS compatibility: https://docs.cline.bot/customization/cline-rules
- Roo Code documents `.roo/rules-*` instruction directories for custom modes: https://roocodeinc.github.io/Roo-Code/features/custom-modes/
- GitHub Copilot documents repository custom instructions: https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
