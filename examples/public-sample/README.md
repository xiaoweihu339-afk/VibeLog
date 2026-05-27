# Public Sample

This is a synthetic, public-safe VibeLog example for a fictional product called **Pocket Recipe Planner**.

It demonstrates the VibeLog format without publishing private chat, local machine paths, raw prompts from real work, scratch project source code, or experimental dogfood data.

Files:

- `vibe-log.md`: human-readable source of truth.
- `vibe-log.json`: generated structured export.

Regenerate and validate:

```powershell
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json
node scripts/validate-vibelog.mjs examples/public-sample/vibe-log.json
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json --check
```
