# Agent Dogfood Protocol

Use this protocol to verify VibeLog through a scratch vibe project when no suitable real project is available.

The goal is not to ship the scratch product. The goal is to prove that VibeLog can record an agent-led vibe coding process, preserve important decisions, export JSON, validate the result, and leave a useful handoff.

## Repository Boundary

Create scratch source outside this repository. Keep real or experimental dogfood source, raw prompts, hook payloads, package files, tests, and temporary artifacts outside this repository.

Only commit a generated VibeLog example after it is synthetic or explicitly sanitized for public reuse. A public example directory may contain only:

- `README.md`
- `vibe-log.md`
- `vibe-log.json`

The default public sample is `examples/public-sample/`. Do not replace it with a private project log.

## Required Scenario Events

The scratch run must include:

- initial product idea
- one idea change
- one human-in-the-loop decision
- one engineering execution prompt record, using `summary_only` or redacted text if the example will be public
- at least one development log entry
- one bugfix or incident entry
- validation design
- verification evidence
- handoff state

## Required Commands

Run these repository checks after the generated example exists:

```powershell
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json
node scripts/validate-vibelog.mjs examples/public-sample/vibe-log.json
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json --check
node --test
```

Run scratch project tests inside the scratch folder and record the command result in the example VibeLog.

## Evidence Report

The final report should state:

- what was generated
- which commands passed
- where the scratch source stayed, if a scratch run was used
- which files entered the repository
- what risk remains
- the conservative project progress snapshot

Do not claim the dogfood run is complete until the scratch tests, example validation, drift check, repository tests, privacy audit, and repository boundary check have all been run.
