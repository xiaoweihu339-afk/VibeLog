# Agent Instructions

This repository contains the reusable VibeLog skill, schema, scripts, docs, and public-safe examples.

## VibeLog Repository Boundary

- Do not commit private project `vibe-log.md` or `vibe-log.json` files at the repository root.
- Do not commit `.vibelog-events/`, scratch workspaces, raw private prompts, local machine paths, secrets, or experimental project source.
- Public examples under `examples/` must be synthetic or explicitly sanitized.
- Keep Markdown as the source of truth and JSON as the generated export.

## When Updating This Repo

- Preserve the VibeLog principles in `skills/vibelog/SKILL.md`.
- Keep agent-facing instructions concise and reusable.
- Add tests when changing templates, scripts, schema, examples, or distribution behavior.
- Run `node --test` before claiming the repository passes.
- For generated VibeLog examples, run:

```powershell
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json
node scripts/validate-vibelog.mjs examples/public-sample/vibe-log.json
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json --check
```

## Using VibeLog In Another Project

If a user asks to use VibeLog for another project, read `skills/vibelog/SKILL.md` and `skills/vibelog/references/agent-usage-guide.md`. Create or update that project's `vibe-log.md` first, then export `vibe-log.json`.
