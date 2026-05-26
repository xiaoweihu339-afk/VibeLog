# VibeLog Manual Test Guide

Use this guide to test VibeLog without relying on a real active project.

Testing principle:

```txt
Each independent part must be able to work on its own.
The combined workflow must also work end to end.
Only then is the slice accepted.
```

## Setup

1. Create a scratch folder outside this repository.
2. Use the scenario in `docs/guides/example-scenario.md`.
3. Ask an agent to use the VibeLog skill to create a VibeLog for that scenario.
4. Confirm the scratch folder contains:

```txt
vibe-log.md
vibe-log.json
```

## Isolated Checks

### 1. One-Line Vibe

Check:

- one sentence
- describes the product clearly
- does not include implementation noise

Pass example:

```txt
An AI reading card tool that turns article notes into reusable study cards.
```

### 2. Current Idea

Check:

- reflects the latest idea
- includes the theme-first change after the user changes direction
- is not a transcript

### 3. Idea Evolution

Check:

- includes the initial idea
- includes the theme-first refinement
- preserves old context instead of overwriting history
- marks reconstructed entries with source and confidence when needed

### 4. Human-In-The-Loop

Check:

- records where the human chose direction, scope, taste, risk, privacy, or priority
- explains why the decision mattered
- states the impact on product, validation, or implementation

### 5. Execution Prompts

Check:

- engineering prompts are recorded in `Execution Prompts`
- prompt type is set, such as `build`, `debug`, `test`, or `docs`
- recording mode is set
- exact prompt text is included locally unless sensitive
- ordinary idea chat is summarized into idea evolution or decisions, not dumped

### 6. Development Log

Check:

- normal project work is recorded
- affected files or artifacts are referenced when known
- verification status is explicit
- unknown root causes are marked as unknown

### 7. Validation Design

Check:

- success criteria exist
- core user paths exist
- manual test steps exist
- automated test strategy exists, even if future-only
- edge cases or regression points are listed

### 8. Verification Evidence

Check:

- only records checks that actually happened
- includes command output, manual QA, screenshot, demo, or known failure references
- includes residual risk
- does not claim success without evidence

### 9. Handoff State

Check:

- a new agent can answer what the product is
- completed, in-progress, pending, blocked, and next actions are clear
- important files, prompts, decisions, and validation notes are summarized

## Combined Workflow Test

Run the full flow:

1. Create a scratch VibeLog from the example scenario.
2. Add the theme-first idea change.
3. Add the human-in-the-loop direction decision.
4. Add the exact execution prompt from the scenario.
5. Add one development log entry.
6. Add the repeated-example bug as a bugfix or incident entry.
7. Add validation design.
8. Add at least one verification evidence entry. If no command was run, mark it as `not_run` or manual review, not passed.
9. Update handoff state.
10. Parse `vibe-log.json` with Node.js:

```powershell
node -e "JSON.parse(require('fs').readFileSync('vibe-log.json','utf8')); console.log('OK vibe-log.json')"
```

Expected:

```txt
OK vibe-log.json
```

## Pass Criteria

The manual test passes if:

- every isolated section can be checked independently
- the combined workflow produces a coherent `vibe-log.md`
- `vibe-log.json` parses
- a new agent can read handoff state and name the next action
- privacy defaults are still private
- no app source code is required

## Failure Signals

The test fails if:

- idea changes overwrite old history
- human decisions are mixed into generic notes only
- engineering execution prompts are missing
- verification is claimed without evidence
- handoff state is vague
- JSON does not parse
- secrets or credentials appear in prompt text
