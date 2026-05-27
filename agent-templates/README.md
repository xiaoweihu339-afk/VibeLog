# Agent Templates

These files are copyable entry points for agent environments that do not load Codex skills directly.

They do not replace the canonical VibeLog skill:

- `skills/vibelog/SKILL.md`
- `skills/vibelog/references/agent-usage-guide.md`
- `skills/vibelog/assets/vibe-log-template.md`
- `skills/vibelog/assets/vibe-log.schema.json`

## Templates

- `AGENTS.md`: broad default for Codex, Cursor, Windsurf, GitHub Copilot CLI, and other agents that read AGENTS instructions.
- `CLAUDE.md`: Claude Code project memory template.
- `GEMINI.md`: Gemini CLI context template.
- `cursor/.cursor/rules/vibelog.mdc`: Cursor project rule template.
- `windsurf/.windsurf/rules/vibelog.md`: Windsurf Cascade rule template.
- `cline/.clinerules/vibelog.md`: Cline rule template.
- `roo-legacy/.roo/rules/vibelog.md`: Roo-compatible rule template for environments that load `.roo/rules/`.
- `github-copilot/.github/copilot-instructions.md`: GitHub Copilot repository instruction template.

## Install Pattern

Copy the template that matches your agent into the target project root. Keep `vibe-log.md` and `vibe-log.json` in the target project, not in this VibeLog skill repository.

After an agent updates Markdown, regenerate and validate JSON:

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```
