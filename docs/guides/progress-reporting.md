# Project Progress Reporting

Use this guide when reporting VibeLog project progress to a human.

The progress number is measured against the long-term vision:

```txt
VibeHub = VibeLog standard + agent workflow + hook automation + Vibe Repo storage + product showcase + collaboration/remix community
```

Because the total goal is broad, progress must be conservative. Do not score local documentation or one script as if the whole platform is close to done.

## Required Snapshot

Every completed meaningful task report should include:

```txt
Project Progress: 16 / 100
Change This Task: +0
Current Phase: VibeLog foundation and verification
Completed This Task: Updated the progress reporting baseline after S23 VibeLog self-update loop
Next Unlock: Automatic or hook-assisted continuous VibeLog recording during real work
Main Risk: Manual self-update loop is verified, but automatic continuous recording is not yet proven
Confidence: medium-high
```

## Current Baseline

Current baseline after S23 VibeLog self-update loop:

```txt
Project Progress: 16 / 100
```

Reason:

- The VibeLog idea, standard, skill structure, documentation, examples, exporter, validator, recorder core, and project adoption CLI exist.
- Claude Code hook adapter work and project-local hook verification exist.
- Public repository boundaries, sanitized examples, agent templates, and clean-clone template adoption verification exist.
- S22R inserted VibeLog into the current real project mid-stream and produced a private validated dogfood log.
- S23 proved a small real self-update loop: read local VibeLog, execute a maintenance task, update VibeLog, export JSON, and validate.
- VibeHub's product layer, repository storage model, collaboration/remix model, and public community still do not exist.
- Automatic continuous recording across agent environments is not yet proven.

## Progress Bands

Use these bands to keep reporting grounded:

```txt
0-10: Concept, VibeLog standard, reusable skill foundation, early examples
11-20: Agent dogfood verification and repeatable vibe verification protocol
21-35: Hook/adapters and automatic process recording across agent environments
36-55: VibeHub or VibeLog Studio MVP with local-first Vibe Repo management
56-75: Git-backed code/artifact storage, collaboration, branch/remix workflows
76-90: Public launch, open-source packaging, community reuse, contribution flow
91-100: Mature ecosystem with reliable standards, integrations, and active community
```

## Change Rules

- `+0`: documentation, wording, or rule clarification that improves clarity but does not unlock a new capability.
- `+1`: a small verified capability or guide that makes the next step easier.
- `+2`: a complete slice that is implemented, verified, and committed.
- `+3` or more: only for major milestones such as a working hook adapter, an end-to-end VibeHub MVP slice, or public release.

Never increase progress just because many files changed. Increase it only when the long-term system capability improves.

## Reporting Rules

- Always mention the denominator: `/ 100`.
- Mention the current phase in plain language.
- Name the next unlock, not just the next task.
- State at least one real risk or missing capability.
- If progress did not change, say so directly.
- Keep the number conservative when the work only improves documentation or planning.
- Read the local `vibe-log.md` first when it exists, because the latest private dogfood state may be newer than public docs.

## Current Recommendation

Until automatic or hook-assisted recording proves that VibeLog can update during real work without relying on a manual end-of-slice edit, keep the project near:

```txt
Project Progress: 16 / 100
```
