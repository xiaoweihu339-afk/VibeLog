# Agent Dogfood Protocol

Use this protocol to verify VibeLog through a scratch vibe project when no suitable real project is available.

The goal is not to ship the scratch product. The goal is to prove that VibeLog can record a real agent-led vibe coding process, preserve important decisions, export JSON, validate the result, and leave a useful handoff.

## Repository Boundary

Create scratch source outside this repository. Copy only generated VibeLog records into `examples/<case-name>/`.

For the `reading-card-lite` case, the example directory may contain only:

- `README.md`
- `vibe-log.md`
- `vibe-log.json`

Scratch source code, package files, tests, and temporary artifacts must stay outside this repository.

## Required Scenario Events

The scratch run must include:

- initial product idea
- one idea change
- one human-in-the-loop decision
- one exact engineering execution prompt
- at least one development log entry
- one bugfix or incident entry
- validation design
- verification evidence
- handoff state

## Required Commands

Run these repository checks after the generated example exists:

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test
```

Run scratch project tests inside the scratch folder and record the command result in the example VibeLog.

## Evidence Report

The final report should state:

- what was generated
- which commands passed
- where the scratch source stayed
- which files entered the repository
- what risk remains
- the conservative project progress snapshot

Do not claim the dogfood run is complete until the scratch tests, example validation, drift check, repository tests, and repository boundary check have all been run.
