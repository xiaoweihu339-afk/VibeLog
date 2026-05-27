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
Project Progress: 20 / 100
Change This Task: +2
Current Phase: Automatic recording foundation
Completed This Task: S25 hook adapter event stream verification
Next Unlock: Stream-first live hook verification in a scratch or opt-in project
Main Risk: Fixture adapter streams are verified, but stream-first live hook behavior still needs separate verification
Confidence: medium-high
```

## Current Baseline

Current baseline after S25 hook adapter event stream verification:

```txt
Project Progress: 20 / 100
```

Reason:

- The VibeLog idea, standard, skill structure, documentation, examples, exporter, validator, recorder core, and project adoption CLI exist.
- Claude Code hook adapter work and project-local hook verification exist.
- Public repository boundaries, sanitized examples, agent templates, and clean-clone template adoption verification exist.
- S22R inserted VibeLog into the current real project mid-stream and produced a private validated dogfood log.
- S23 proved a small real self-update loop: read local VibeLog, execute a maintenance task, update VibeLog, export JSON, and validate.
- S24 proved a local event stream loop: read ordered events, update Markdown, append progress, export JSON, and validate without relying on a manual Markdown edit.
- S25 proved the Claude Code adapter can append multiple hook events to one JSONL stream before the recorder consumes it.
- VibeHub's product layer, repository storage model, collaboration/remix model, and public community still do not exist.
- Stream-first live hook-driven continuous recording across agent environments is not yet proven.

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

Until stream-first live hook adapters prove that VibeLog can update continuously inside real agent environments, keep the project near:

```txt
Project Progress: 20 / 100
```
