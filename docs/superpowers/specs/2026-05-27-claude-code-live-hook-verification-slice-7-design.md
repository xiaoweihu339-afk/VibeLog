# Claude Code Live Hook Verification Slice 7 Design

## Goal

Verify the Claude Code hook adapter in a real local hook configuration path without mutating global Claude Code settings.

## Product Rationale

Slice 6 proved the adapter with fixture payloads. Slice 7 checks whether the adapter can survive the practical boundary that matters: local Claude Code settings, hook command execution, stdin JSON, generated Vibe Events, and VibeLog Markdown/JSON updates.

## Code Principle

Keep the implementation simple, safe, and functional:

- simple: one verifier script, one generated local settings file, no background service
- safe: scratch workspace only, no global settings, no push, no upload
- functional: prove hooks can update VibeLog through the adapter/recorder chain

## Non-Goals

- Do not install hooks globally.
- Do not modify the user's real Claude Code user settings.
- Do not run a large Claude session.
- Do not add cloud sync.
- Do not add complex AI summarization.
- Do not make website changes.

## Architecture

```txt
scratch workspace
  -> .claude/settings.json
  -> Claude Code hook command
  -> scripts/claude-code-hook-adapter.mjs
  -> Vibe Event JSON
  -> scripts/record-vibelog-event.mjs
  -> scratch vibe-log.md / vibe-log.json
```

The repository keeps the verifier and docs. The scratch workspace holds the live verification log and local hook settings.

## Verifier Behavior

`scripts/verify-claude-code-live-hook.mjs` should:

1. create a scratch workspace
2. write a minimal `vibe-log.md`
3. write `.claude/settings.json` with local hook commands
4. run fixture hook payloads through the same command path
5. optionally run one real `claude -p` session when `--live` is provided
6. use Claude Code `stream-json` output with `--include-hook-events` to confirm hook lifecycle responses
7. validate that `vibe-log.md` and `vibe-log.json` changed
8. report evidence without pushing or uploading

## Real Session Policy

The live run should be opt-in through `--live`. It should use a tiny prompt, a small budget cap, the generated scratch settings file, and direct hook-event evidence from Claude Code output.

If Claude CLI is missing, not authenticated, or the live run fails, the verifier should report the blocker and keep fixture verification evidence.

## Acceptance Criteria

- Verifier tests fail before the verifier exists.
- Verifier tests pass after implementation.
- Fixture verification updates scratch VibeLog through generated local settings.
- Live verification is attempted only through explicit `--live`.
- Root VibeLog records whether live verification passed or was blocked.
- No global settings are modified.

## Progress Expectation

If fixture verification passes and live verification is attempted with clear evidence, progress moves from `18 / 100` to `20 / 100`. If live verification passes, the next slice can harden real installation guidance.
