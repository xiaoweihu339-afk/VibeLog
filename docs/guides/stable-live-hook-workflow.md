# Stable Live Hook Workflow

This guide is the safe user workflow for running VibeLog with Claude Code live hooks in a local project.

## Boundary

- Use project-local `.claude/settings.json` only.
- Do not edit global Claude Code settings.
- Do not touch Claude Code Desktop or any Desktop / DeepSeek configuration.
- Do not paste API key, token, or other credentials into VibeLog.
- Do not commit `vibe-log.md`, `vibe-log.json`, `.vibelog-events/`, scratch output, or private prompts unless the project owner explicitly chooses to publish them.
- Use `bypassPermissions` only in scratch or fully trusted projects. Prefer normal Claude Code permissions for real work.

## 1. Initialize

Create the project-local VibeLog files:

```powershell
node scripts\vibelog-project.mjs init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
```

Expected result:

- `vibe-log.md` exists.
- `vibe-log.json` exists.
- `node scripts\vibelog-project.mjs verify --project "C:\path\to\project"` can inspect the project.

## 2. Preview Hooks

Preview direct hooks first:

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

Preview stream-first hooks:

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream
```

Expected result:

- `dryRun` is `true`.
- `wrote` is `false`.
- The generated hooks are project-local.
- Existing unrelated Claude Code settings are preserved.

## 3. Enable Hooks

Enable stream-first hooks after reviewing the preview:

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --write
```

Expected hook events:

```txt
UserPromptSubmit -> prompt_submitted
PostToolUse      -> tool_used or test_ran
Stop             -> handoff_updated
```

Stream-first mode appends JSONL events to `.vibelog-events/session.jsonl`. It lets the project inspect or redact events before updating Markdown and JSON.

## 4. Run Claude Code

Run Claude Code CLI in the project normally. For real work, keep the default permission flow.

Use `bypassPermissions` only for scratch verification, for example:

```powershell
node scripts\verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\s30-tool-use-live" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --live --require-tool-use --require-test-run --permission-mode bypassPermissions --prompt "Use tools in this scratch workspace only. Create a tiny node:test file and run node --test." --max-budget-usd 0.75 --timeout-ms 240000
```

`--require-tool-use` proves that a real `PostToolUse` hook fired. `--require-test-run` proves that the event stream contains a `test_ran` Vibe Event.

For a less-scripted dogfood check, require the broader quality gate:

```powershell
node scripts\verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\s33-less-scripted" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --live --require-tool-use --require-test-run --require-less-scripted-dogfood --min-tool-use-count 4 --min-test-run-count 1 --min-tool-used-event-count 3 --min-changed-file-count 2 --permission-mode bypassPermissions --prompt "Build a tiny Node ESM CSV bill summary CLI. Work naturally: create source, tests, sample data, run tests, fix failures, and hand off." --max-budget-usd 1.50 --timeout-ms 360000
```

`--require-less-scripted-dogfood` proves the event stream contains a prompt, tool work, file-changing events, at least one passing test run, and a handoff.

For a human-in-the-loop dogfood check, include an explicit decision block and require decision evidence:

```powershell
$prompt = @'
Build a small Node ESM Markdown idea board CLI in this empty project.
Human-in-the-loop decision for this dogfood:
VIBELOG_DECISION
Decision Type: storage
Human Input: Store MVP data in a single ideas.json file, not per-idea folders.
Agent Proposal: A per-idea directory structure would make future branch/remix workflows easier.
Final Decision: Use one ideas.json file for this slice, and document that a directory layout can come later.
Why It Mattered: This keeps the live dogfood small enough to verify while preserving the future Vibe Repo migration path.
Impact: Implement commands around ideas.json, keep tests focused on the single-file store, and mention the migration path in README.
END_VIBELOG_DECISION
'@
node scripts\verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\s34-human-decision" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --live --require-tool-use --require-test-run --require-less-scripted-dogfood --require-human-decision --min-tool-use-count 5 --min-test-run-count 1 --min-tool-used-event-count 4 --min-changed-file-count 3 --permission-mode bypassPermissions --prompt $prompt --max-budget-usd 1.80 --timeout-ms 420000
```

`--require-human-decision` proves the event stream contains at least one `decision_made` event. Natural decision labels such as `storage` are normalized to schema-safe VibeLog decision types.

## 5. Consume Stream Events

When ready to update the log, consume the stream:

```powershell
node scripts\record-vibelog-event.mjs --events "C:\path\to\project\.vibelog-events\session.jsonl" --log "C:\path\to\project\vibe-log.md" --json "C:\path\to\project\vibe-log.json"
```

Then verify:

```powershell
node scripts\vibelog-project.mjs verify --project "C:\path\to\project"
node scripts\validate-vibelog.mjs "C:\path\to\project\vibe-log.json"
```

Expected evidence:

- `Execution Prompts` contains engineering prompts from `UserPromptSubmit`.
- `Human-in-the-Loop` contains `decision_made` when a decision block was provided.
- `Development Log` contains `tool_used`.
- `Verification Evidence` contains `test_ran`.
- `Handoff State` contains `handoff_updated`.

## 6. Disable Or Rollback

Disable VibeLog hooks:

```powershell
node scripts\vibelog-project.mjs disable-hooks --project "C:\path\to\project"
```

Rollback checklist:

- Confirm VibeLog hook commands were removed from project-local `.claude/settings.json`.
- Keep unrelated Claude Code project settings.
- Delete `.vibelog-events/session.jsonl` only if the owner no longer needs the private event stream.
- Regenerate JSON only after reviewing `vibe-log.md`.

## Pass Criteria

The workflow is healthy when:

- Hook setup is project-local.
- The owner reviewed before `--write`.
- `.vibelog-events/` remains private unless explicitly published.
- `verify` passes.
- A real live check can require `--require-tool-use` and `--require-test-run` without relying on fixture events.
- A less-scripted live check can require `--require-less-scripted-dogfood` and still pass on a small real task.
- A human-in-the-loop live check can require `--require-human-decision` and produce schema-valid `decision_made` evidence.
