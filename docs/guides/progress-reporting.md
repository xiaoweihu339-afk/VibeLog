# Project Progress Reporting

Use this guide when reporting VibeLog project progress to a human.

The progress number is measured against the long-term vision:

```txt
VibeHub = VibeLog standard + agent workflow + hook automation + Vibe Repo storage + product showcase + collaboration/remix community
```

Because the total goal is broad, progress must be conservative. Do not score local documentation or one script as if the whole platform is close to done.

## Required Snapshot

Every completed task report should include:

```txt
Project Progress: 10 / 100
Change This Task: +0
Current Phase: VibeLog foundation and verification
Completed This Task: Added conservative project progress reporting mechanism
Next Unlock: Slice 4 implementation plan
Main Risk: Agent dogfood verification has not run end to end yet
Confidence: medium
```

## Current Baseline

Current baseline:

```txt
Project Progress: 10 / 100
```

Reason:

- The VibeLog idea, standard, skill structure, documentation, examples, exporter, and lightweight validator exist.
- The project has not yet completed agent dogfood verification.
- Hook adapters are not implemented.
- VibeHub's product layer, repository storage model, collaboration/remix model, and public community do not exist yet.

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

## Current Recommendation

Until Slice 4 is implemented and a new agent-generated example passes export, validation, drift check, and tests, keep the project at:

```txt
Project Progress: 10 / 100
```
