# VibeLog For Claude Code

Use this project memory when Claude Code is working on a vibe-built product that should keep process memory.

## VibeLog Rules

- Read `vibe-log.md` before meaningful project work when it exists.
- Create `vibe-log.md` from `<path-to-VibeLog>/skills/vibelog/assets/vibe-log-template.md` when the project has no VibeLog yet.
- Keep Markdown as the source of truth and regenerate `vibe-log.json`.
- Record engineering execution prompts in `Execution Prompts`; redact secrets and private data.
- Record human-in-the-loop decisions, idea changes, validation design, verification evidence, bug fixes, artifacts, and handoff state.
- Do not publish private VibeLogs unless the human explicitly opts in.

## Useful Commands

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

## Optional Claude Code Hooks

Preview project-local VibeLog hook settings before writing them:

```powershell
node <path-to-VibeLog>/scripts/configure-claude-code-vibelog-hooks.mjs --project "<path-to-project>" --adapter "<path-to-VibeLog>/scripts/claude-code-hook-adapter.mjs"
```

Use `--write` only after reviewing the generated settings. Keep hooks project-local.
