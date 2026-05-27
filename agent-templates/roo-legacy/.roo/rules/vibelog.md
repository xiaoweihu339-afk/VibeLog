# VibeLog Rule For Roo-Compatible Setups

Use this template in Roo-compatible environments that load workspace rules from `.roo/rules/`. Verify the rule-loading behavior in your local agent version before relying on it for release work.

Use VibeLog when the project needs durable process memory:

- Read `vibe-log.md` first.
- Create `vibe-log.md` from `<path-to-VibeLog>/skills/vibelog/assets/vibe-log-template.md` when missing.
- Update Markdown before JSON.
- Record idea evolution, human-in-the-loop decisions, engineering execution prompts, implementation status, validation design, verification evidence, development logs, bug fixes, artifacts, and handoff state.
- Redact secrets and private data.

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```
