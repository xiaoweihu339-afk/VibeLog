# Public Skill Readiness

Use this gate before treating VibeLog as a reusable public skill or before asking to push this repository.

Public skill readiness is a distribution safety gate. It is not the VibeLog core. The core is process memory: a human can vibe naturally while an agent records the one-line idea, idea evolution, human-in-the-loop decisions, engineering execution prompts, implementation status, validation design, verification evidence, bug fixes, and handoff state into readable Markdown and exportable JSON.

It does not stage, commit, push, publish, upload, or edit files. It only checks whether the repository content is safe and useful enough to review for a human-approved push.

## Command

```powershell
node scripts/verify-public-skill-readiness.mjs --repo "C:\path\to\VibeLog"
npm run vibelog:verify-public-skill-readiness -- --repo "C:\path\to\VibeLog"
```

## Isolated Checks

The verifier checks individual repository rules:

- `package.json` remains `private` for clone-local reuse.
- public CLI entrypoints include `vibelog-project`, `vibelog-install`, and `vibelog-verify-public-skill-readiness`.
- required skill, schema, docs, scripts, and public sample files exist.
- `.gitignore` excludes root `vibe-log.md`, root `vibe-log.json`, `.vibelog-events/`, and `vibelog-scratch/`.
- Git-tracked files do not include private root VibeLog memory or event streams.
- tracked text does not contain personal local machine paths or token-like secrets.
- README, AGENTS, skill instructions, and agent usage guide all point to the readiness gate and privacy boundary.

## Workflow Checks

Passing this gate is not enough by itself. Before a real push, run it with the broader workflow checks:

```powershell
node scripts/verify-public-skill-readiness.mjs
node --test test\verify-public-skill-readiness.test.mjs test\vibelog-package.test.mjs
node --test test\verify-clean-clone-adoption.test.mjs test\verify-release-bundle.test.mjs
node --test
```

Use the two-part testing rule:

- isolated checks prove each rule can work on its own;
- workflow checks prove the package, clean-clone adoption path, release bundle path, and full test suite still work together.

If any check fails, report the failure directly. Do not weaken core behavior just to satisfy a test.

## Push Boundary

The verifier can say the repository content is push-eligible, but it cannot authorize a push.

Push still requires:

- explicit human approval for this push;
- review of `git diff`;
- no private root `vibe-log.md`, `vibe-log.json`, `.vibelog-events/`, scratch output, secrets, local personal paths, or experimental dogfood source;
- an intentional commit containing only public skill/tooling/docs changes.

VibeHub engineering source and private dogfood logs remain outside this push boundary unless the owner explicitly changes that decision.
