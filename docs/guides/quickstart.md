# VibeLog Quickstart

VibeLog is a Markdown-first process record for vibe-built products.

Its core rule is:

```txt
User says naturally, agent records structurally.
```

Use it when you want a human-readable and agent-readable memory of a vibe project: the idea, changes, human decisions, execution prompts, implementation status, validation design, verification evidence, artifacts, and handoff state.

## Start In A New Project

1. Create or open the project folder.
2. Ask your agent:

```txt
Use the vibelog skill to create a VibeLog for this project.

One-line vibe: <one sentence describing the product>
Current idea: <a short paragraph describing what it should become>
```

3. Confirm that these files exist in the project root:

```txt
vibe-log.md
vibe-log.json
```

4. Read `vibe-log.md` first. It is the human source of truth.
5. Use `vibe-log.json` for structured agent handoff, future upload, or tooling.

## Start In An Existing Project

Ask your agent:

```txt
Use the vibelog skill to reconstruct this project from current files, docs, git history, and conversation context. Mark reconstructed items with source and confidence.
```

The agent should inspect existing evidence before writing. It should not invent exact dates, prompts, test results, or root causes.

## Good First Update

A useful first VibeLog update should include:

- one-line vibe
- current idea
- stage
- visibility defaults
- implementation status
- validation design
- next actions
- handoff state

For active engineering work, it should also record execution prompts that directly ask an agent to build, edit, debug, test, refactor, inspect files, run commands, deploy, or write implementation docs.

## Markdown And JSON

`vibe-log.md` is the source of truth.

`vibe-log.json` is the structured export for agents and future VibeHub upload.

If the two disagree, update Markdown first, then refresh JSON.

## Privacy Defaults

Start private:

```yaml
visibility: private
code_visibility: hidden
prompt_visibility: summary
collaboration_status: closed
```

Engineering execution prompts may be recorded exactly in the local log, but secrets, credentials, tokens, and private personal data must be redacted.

Do not publish or upload anything without explicit user approval.

## Continue A Session

At the start of a new session, ask:

```txt
Read vibe-log.md and continue this project from the handoff state.
```

The agent should use the log to understand the current idea, completed work, pending work, validation plan, verification evidence, and next actions before changing files.
