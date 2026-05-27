# VibeLog Installer Dry-Run, Rollback, And Backup/Restore Verification

S17 added a dry-run-only installer planner. It previews how VibeLog would be copied into a user-selected local install root, but it does not write files.

S18 adds a separate scratch-only rollback verifier. It copies the planned files into a temporary scratch target, confirms the install shape, removes the target, and verifies that rollback removed the created content.

S19 adds a scratch-only backup/restore verifier. It creates an existing target with user-owned content, backs up every installer operation target, simulates install overwrite behavior, restores from backup, and verifies the target matches its pre-install snapshot.

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

## Backup/Restore Verification Command

Run the scratch-only verifier:

```powershell
node scripts/verify-installer-backup-restore.mjs --scratch-root "C:\path\to\scratch-root"
```

Through the private clone-local npm script:

```powershell
npm run vibelog:verify-installer-backup-restore -- --scratch-root "C:\path\to\scratch-root"
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

The backup/restore verifier prints JSON with:

- `passed: true`
- `backupPerformed: true`
- `installPerformed: true`
- `restorePerformed: true`
- `existingContentRestored: true`
- `unrelatedContentPreserved: true`
- `newInstallerFilesRemoved: true`

## Safety Boundary

The public installer command is intentionally dry-run only.

The command refuses:

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root" --write
```

The rollback and backup/restore verifiers may write only inside scratch targets they control. They refuse direct installer write mode, do not edit global Codex or Claude Code settings, and do not push or publish anything.

## What This Does Not Do

- The public installer does not copy files.
- It does not edit `$HOME\.codex`.
- It does not edit `$HOME\.claude`.
- It does not enable hooks.
- It does not publish a package.
- It does not push to GitHub.

## Next Step

The next installer slice should decide whether to design an explicit user-visible installer write mode, add a release-bundle verification path, or add a signed/manual approval checklist. User-visible installer write mode still needs explicit approval.
