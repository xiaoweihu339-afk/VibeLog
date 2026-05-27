# VibeLog Installer and Package Manager Plan

VibeLog is not published to npm and does not have a global installer yet.

This plan defines the safe distribution roadmap after S13 clean clone adoption verification. It does not publish, push, or install anything globally.

## Current Channel: Clone-local

Clone-local is the only active distribution channel.

Users clone or copy the repository and run:

```powershell
npm run vibelog -- --help
npm run vibelog -- init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
```

This channel is verified by:

- `test/vibelog-package.test.mjs`
- `test/verify-clean-clone-adoption.test.mjs`
- `scripts/verify-clean-clone-adoption.mjs`

## Future Channel: Release Bundle

A release bundle would be a GitHub release archive or downloadable zip/tarball.

Required gates:

- repository license selected;
- remote clone or release archive verification;
- stronger JSON Schema validation;
- explicit human approval for release creation;
- no private project data in examples or artifacts.

## Prototype Channel: Local Installer Scripts

Local installer scripts are now in scratch rollback verified prototype state. The public installer command previews copying the VibeLog skill, scripts, docs, README, and package metadata into a user-selected location, but it writes nothing.

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
npm run vibelog:install -- --target "C:\path\to\install-root"
```

S18 adds a scratch-only rollback verifier:

```powershell
node scripts/verify-installer-rollback.mjs --scratch-root "C:\path\to\scratch-root"
npm run vibelog:verify-installer-rollback -- --scratch-root "C:\path\to\scratch-root"
```

The verifier copies planned files into a temporary scratch target, confirms the install shape, removes the target, and confirms rollback removed the created content. The public installer still refuses `--write`.

Required gates:

- dry-run mode;
- scratch rollback verification;
- backup or restore verification before writing over existing targets;
- project-local hook setup by default;
- no global Claude Code settings edits by default;
- explicit human approval before writing outside the current repository.

## Future Channel: Package-manager Distribution

Package-manager distribution may eventually use npm or another registry.

Required gates:

- license selected;
- stronger JSON Schema validation;
- package name checked;
- package contents audited;
- publish dry-run verified;
- explicit human approval for publish.

The current `package.json` stays private until these gates are satisfied.

## Future Channel: Agent-specific Templates

Agent-specific templates may package VibeLog for Codex, Claude Code, Cursor, AGENTS.md, and other agent environments.

Required gates:

- adapter docs verified;
- template smoke tests passed;
- clear uninstall or disable path;
- explicit release approval.

## Safety Rules

- No push without explicit human approval.
- No publish without explicit human approval.
- No public package before license selection.
- No public package before stronger JSON Schema validation.
- No global installer before rollback verification and explicit approval.
- Markdown remains the source of truth.
- JSON remains an export format.
- Hook setup remains project-local and opt-in by default.

## Next Recommended Slice

The strongest next step is backup/restore verification for existing targets or release-bundle verification. User-visible installer write mode still needs explicit approval.
