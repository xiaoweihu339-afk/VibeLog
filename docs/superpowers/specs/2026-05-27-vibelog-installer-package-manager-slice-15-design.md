# VibeLog Installer and Package Manager Slice 15 Design

Date: 2026-05-27

## Goal

Define a safe installer and package-manager distribution roadmap for VibeLog without publishing a package or adding a global installer yet.

## Why This Slice Exists

Slice 13 proved that a clean local clone can run the clone-local package entry. The next adoption question is how VibeLog should eventually be distributed: clone-local, release bundle, installer script, package manager, or agent-specific template.

Publishing too early would be risky because license selection, stronger schema validation, and release verification are still pending. S15 therefore makes the distribution strategy explicit and testable before any public release action.

## Scope

In scope:

- Add a machine-readable distribution plan.
- Add bilingual installer/package-manager roadmap docs.
- Add tests that enforce the distribution safety gates.
- Keep `package.json` private.
- Update README and root VibeLog.

Out of scope:

- Running `npm publish`.
- Pushing to GitHub.
- Adding a global installer script.
- Changing package visibility.
- Installing files into global user directories.
- Replacing the clean clone verifier.

## Architecture

Add `docs/distribution/vibelog-distribution-plan.json` as the machine-readable source for distribution channels and release gates.

Add bilingual guide docs:

- `docs/guides/vibelog-installer-package-manager-plan.md`
- `docs/guides/vibelog-installer-package-manager-plan.zh.md`

Add `test/vibelog-distribution-plan.test.mjs` to assert:

- the plan is parseable JSON;
- clone-local is the only active channel;
- npm package distribution is deferred;
- public package distribution requires license, schema validation, explicit human approval, and publish dry-run evidence;
- current `package.json` remains private;
- docs do not claim VibeLog is published.

## Distribution Channels

Recommended order:

1. Clone-local: current active channel, already verified by S13.
2. Release bundle: future GitHub release zip or tarball after remote clone verification and license selection.
3. Local installer scripts: future PowerShell and shell install helpers after uninstall/rollback tests exist.
4. Package-manager distribution: future npm package after schema validation, license selection, package dry-run, and explicit human approval.
5. Agent-specific templates: future Codex, Claude Code, Cursor, and AGENTS.md helper packs.

## Safety Rules

- No publish without explicit human approval.
- No push without explicit human approval.
- No public package before license selection.
- No public package before stronger schema validation.
- No global installer before uninstall or rollback verification.
- Project-local hook setup remains opt-in.
- Markdown remains the source of truth and JSON remains an export.

## Acceptance Criteria

- `node --test test\vibelog-distribution-plan.test.mjs` passes.
- `node --test` passes.
- Distribution docs exist in English and Chinese.
- `package.json` still has `"private": true`.
- Root VibeLog is updated and JSON is in sync.
- No push or publish occurs.

## Progress Snapshot Target

- Project Progress: 36 / 100
- Change This Task: +2
- Current Phase: installer/package-manager distribution design
- Next Unlock: stronger JSON Schema validation or installer dry-run prototype
- Main Risk: this is a distribution design and guardrail slice, not an actual installer or package release
- Confidence: medium-high
