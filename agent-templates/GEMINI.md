# VibeLog For Gemini CLI

Use this context when Gemini CLI is helping with a vibe-built product and the project should keep structured process memory.

## Required Behavior

- Read `vibe-log.md` first if it exists.
- Create `vibe-log.md` from `<path-to-VibeLog>/skills/vibelog/assets/vibe-log-template.md` if the project has no VibeLog yet.
- Update Markdown before JSON.
- Record idea evolution, human-in-the-loop decisions, execution prompts, implementation status, validation design, verification evidence, development logs, bug fixes, artifacts, and handoff state.
- Record exact engineering execution prompts locally unless secrets or privacy require redaction.
- Do not treat normal idea chat as a transcript; summarize it into structured sections.

## JSON Export

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

For the full process, read `<path-to-VibeLog>/skills/vibelog/SKILL.md`.
