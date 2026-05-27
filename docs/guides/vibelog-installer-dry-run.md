# VibeLog Installer Dry-Run And Rollback Verification

S17 added a dry-run-only installer planner. It previews how VibeLog would be copied into a user-selected local install root, but it does not write files.

S18 adds a separate scratch-only rollback verifier. It copies the planned files into a temporary scratch target, confirms the install shape, removes the target, and verifies that rollback removed the created content.

## Command

From this repository:

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
```

Through the private clone-local npm script:

```powershell
npm run vibelog:install -- --target "C:\path\to\install-root"
```

## Rollback Verification Command

Run the scratch-only verifier:

```powershell
node scripts/verify-installer-rollback.mjs --scratch-root "C:\path\to\scratch-root"
```

Through the private clone-local npm script:

```powershell
npm run vibelog:verify-installer-rollback -- --scratch-root "C:\path\to\scratch-root"
```

## What The Plan Shows

The command prints JSON with:

- `dryRun: true`
- `writesPerformed: false`
- source and target roots
- planned copy operations for `skills/vibelog`, `scripts`, guide docs, `README.md`, and `package.json`
- whether each target would be created or updated
- rollback steps for each planned operation
- safety flags showing no push, publish, upload, or global Claude settings edit occurred

## Safety Boundary

The public installer command is intentionally dry-run only.

The command refuses:

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root" --write
```

The rollback verifier may write only inside a scratch target it controls. It refuses direct installer write mode, does not edit global Codex or Claude Code settings, and does not push or publish anything.

## What This Does Not Do

- The public installer does not copy files.
- It does not edit `$HOME\.codex`.
- It does not edit `$HOME\.claude`.
- It does not enable hooks.
- It does not publish a package.
- It does not push to GitHub.

## Next Step

The next installer slice should decide whether to add an explicit uninstall command, add backup/restore checks for existing targets, or verify a release bundle. User-visible installer write mode still needs explicit approval.
