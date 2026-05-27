# VibeLog Instructions For GitHub Copilot

Use VibeLog when this repository needs process memory for a vibe-built product.

- Read `vibe-log.md` before meaningful work if it exists.
- Create `vibe-log.md` from `<path-to-VibeLog>/skills/vibelog/assets/vibe-log-template.md` if missing.
- Keep `vibe-log.md` as source of truth and regenerate `vibe-log.json`.
- Record engineering execution prompts in `Execution Prompts`.
- Distill idea chat into idea evolution, human-in-the-loop decisions, open questions, or current idea.
- Record implementation status, validation design, verification evidence, development logs, bug fixes, artifacts, and handoff state.
- Redact secrets, credentials, tokens, private personal data, and sensitive business data.

Use these commands after Markdown updates:

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```
