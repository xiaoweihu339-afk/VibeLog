# VibeLog Rule

Use VibeLog when this project needs structured memory of a vibe-built product.

## Required Behavior

- Read `vibe-log.md` before meaningful work if it exists.
- Create `vibe-log.md` from `<path-to-VibeLog>/skills/vibelog/assets/vibe-log-template.md` if missing.
- Keep Markdown as source of truth.
- Export `vibe-log.json` after Markdown changes.
- Record human decisions, idea changes, execution prompts, implementation status, validation design, verification evidence, development logs, bug fixes, artifacts, and handoff state.
- Redact secrets, credentials, tokens, private personal data, and sensitive business data.
- Keep private logs private unless the human explicitly opts into publication.

## Commands

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```
