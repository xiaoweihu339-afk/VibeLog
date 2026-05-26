# Claude Code Hook Adapter Slice 6 Design

## Goal

Build the first real lifecycle adapter for VibeLog by converting Claude Code hook JSON input into Vibe Event JSON and applying it through the existing recorder core.

## Product Rationale

Slice 5 created the recorder core, but events were still produced by tests or manual fixtures. Slice 6 connects that core to a real agent lifecycle shape. This proves the VibeLog foundation can move from a local tool to automatic workflow recording.

## Source Alignment

This design follows the current Claude Code hooks model: hook commands receive JSON input through stdin, and hook events include lifecycle names such as `UserPromptSubmit`, `PostToolUse`, and `Stop`. The implementation keeps the mapping conservative because hook payloads can evolve.

## Non-Goals

- Do not install hooks into the user's global Claude Code settings.
- Do not push to GitHub.
- Do not upload VibeLog anywhere.
- Do not run a live Claude Code session from this environment.
- Do not summarize arbitrary chat with an LLM.
- Do not record secrets, tokens, API keys, private keys, or credentials.

## Architecture

```txt
Claude Code hook JSON stdin
  -> scripts/claude-code-hook-adapter.mjs
  -> Vibe Event JSON
  -> scripts/record-vibelog-event.mjs
  -> vibe-log.md
  -> vibe-log.json
```

The adapter has two modes:

- `--print-events`: convert hook JSON to Vibe Event JSON and print it, without changing files.
- default record mode: convert hook JSON, write temporary event files, call the recorder core, and regenerate JSON.

## Event Mapping

### UserPromptSubmit

If the prompt looks like an engineering execution prompt, emit `prompt_submitted`.

Engineering prompts include build, edit, debug, test, refactor, docs, deploy, inspect, run command, implementation plan, or execution approval language.

Ordinary idea chat is ignored in Slice 6. Later slices can add richer idea-change extraction.

### PostToolUse

If the tool resembles Bash or a command runner and the command looks like a test command, emit `test_ran`.

Otherwise emit `tool_used` with tool name, changed file hints, response summary, and verification status.

### Stop

Emit `handoff_updated` with a conservative turn summary based on `last_assistant_message` and existing project state. The first version creates a usable handoff without pretending to know all completed work.

## Privacy And Redaction

Before writing events, redact common secret-like values:

- API keys
- bearer tokens
- private key blocks
- password assignments
- token assignments

If prompt text is redacted, set `recording_mode` to `redacted`; otherwise use `exact`.

## Testing

Tests use fixture hook payloads and temporary VibeLogs. They cover:

- UserPromptSubmit engineering prompt conversion
- non-engineering prompt ignored
- PostToolUse test command conversion
- PostToolUse edit/write conversion
- Stop handoff conversion
- CLI `--print-events`
- CLI record mode updating Markdown and JSON
- redaction behavior

## Acceptance Criteria

- Adapter-specific tests fail before the adapter exists.
- Adapter tests pass after implementation.
- Full repository test suite passes.
- Root VibeLog records Slice 6.
- Bilingual guide and report exist.
- No real hook installation is performed.

## Progress Expectation

If implemented and verified through simulated Claude hook fixtures, long-term progress moves from `15 / 100` to `18 / 100`.
