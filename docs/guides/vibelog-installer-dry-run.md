# VibeLog Installer Dry-Run

S17 adds a dry-run-only installer planner. It previews how VibeLog would be copied into a user-selected local install root, but it does not write files.

## Command

From this repository:

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
```

Through the private clone-local npm script:

```powershell
npm run vibelog:install -- --target "C:\path\to\install-root"
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

S17 is intentionally dry-run only.

The command refuses:

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root" --write
```

This protects the project from accidental global installs before rollback and uninstall behavior is tested.

## What This Does Not Do

- It does not copy files.
- It does not edit `$HOME\.codex`.
- It does not edit `$HOME\.claude`.
- It does not enable hooks.
- It does not publish a package.
- It does not push to GitHub.

## Next Step

The next installer slice should verify rollback and uninstall behavior in a scratch target before any real write mode exists.
