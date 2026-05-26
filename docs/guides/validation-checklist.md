# VibeLog Validation Checklist

Use this checklist to review any generated or updated VibeLog.

## Human Readability

- [ ] The one-line vibe is understandable in one sentence.
- [ ] The current idea reflects the latest direction.
- [ ] The log is not a raw chat transcript.
- [ ] Each section has enough context for a human reader.
- [ ] Old idea history is preserved when the idea changes.

## Agent Readability

- [ ] A future agent can identify the current state.
- [ ] Completed, in-progress, pending, blocked, and next actions are clear.
- [ ] Important files, artifacts, commands, and constraints are listed.
- [ ] Reconstructed entries include source and confidence.
- [ ] Unknown facts are marked as unknown instead of invented.

## Idea And Decision Quality

- [ ] `Idea Evolution` records meaningful changes.
- [ ] `Decisions` records firm choices.
- [ ] `Human-in-the-Loop` records human direction, scope, taste, tradeoff, risk, approval, rejection, naming, privacy, release, or prioritization decisions.
- [ ] Human decisions explain why they mattered.
- [ ] Open questions are separated from settled decisions.

## Execution Prompt Ledger

- [ ] Engineering execution prompts are recorded in `Execution Prompts`.
- [ ] Prompt type is set.
- [ ] Recording mode is set.
- [ ] Exact prompt text is included locally unless sensitive.
- [ ] Sensitive content is redacted.
- [ ] Ordinary idea chat is distilled into idea changes, decisions, or open questions.

## Development And Bugfix Records

- [ ] Development work is recorded in `Development Log`.
- [ ] Entry type is clear: feature, bugfix, refactor, test, docs, chore, release, deployment, or config.
- [ ] Affected files or artifacts are referenced when known.
- [ ] Bugfix entries include symptom, root cause, fix, verification, and follow-up when evidence exists.
- [ ] Unknown root causes are marked as unknown.

## Validation And Verification

- [ ] `Validation Design` includes success criteria.
- [ ] Core user paths are listed.
- [ ] Manual test steps are listed.
- [ ] Automated test strategy is listed, even if future-only.
- [ ] Edge cases or regression points are listed.
- [ ] `Verification Evidence` only records checks that happened.
- [ ] Residual risk is stated.

## Artifact And Code Links

- [ ] Artifacts are referenced by path, URL, commit, attachment, or release.
- [ ] Large artifact contents are not copied into the log.
- [ ] Code repository references are present when code exists.
- [ ] Code visibility is explicit.
- [ ] Demo or screenshot references are included when available.

## Privacy Defaults

- [ ] `visibility` starts as `private` unless the user chose otherwise.
- [ ] `code_visibility` starts as `hidden` unless the user chose otherwise.
- [ ] `prompt_visibility` starts as `summary` unless the user chose otherwise.
- [ ] `collaboration_status` starts as `closed` unless the user chose otherwise.
- [ ] No secrets, tokens, credentials, or private personal data are exposed.
- [ ] Public projection is separated from private local records.

## JSON Checks

Run:

```powershell
node -e "JSON.parse(require('fs').readFileSync('vibe-log.json','utf8')); console.log('OK vibe-log.json')"
```

Pass:

```txt
OK vibe-log.json
```

Remember: JSON syntax passing does not prove full semantic correctness. It only proves the file can be parsed.

## Handoff Review

Ask a new agent:

```txt
Read vibe-log.md and summarize the current idea, what changed, human decisions, implementation state, validation plan, verification evidence, and next smallest useful action.
```

The handoff passes if the agent can continue without asking the user to repeat known history.
