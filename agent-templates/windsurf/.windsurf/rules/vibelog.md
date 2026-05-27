---
trigger: model_decision
description: Use when Cascade is asked to record, update, validate, hand off, or publish a VibeLog for a vibe-built product.
---

# VibeLog Rule

Use VibeLog for durable process memory in vibe-built products.

- Read `vibe-log.md` before meaningful project work if it exists.
- If missing, create it from `<path-to-VibeLog>/skills/vibelog/assets/vibe-log-template.md`.
- Keep Markdown first; regenerate `vibe-log.json` after updates.
- Record engineering execution prompts that guide building, editing, debugging, testing, refactoring, docs, deployment, inspection, command execution, or engineering research.
- Distill idea chat into idea evolution, human-in-the-loop decisions, open questions, or current idea.
- Redact secrets and private data.
- Update handoff state before ending meaningful work.

Commands:

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```
