# Example Scenario: AI Reading Card Tool

Use this scenario to manually test VibeLog without needing a real unfinished project.

## One-Line Vibe

An AI reading card tool that turns article notes into reusable study cards.

## Starting Idea

The user wants a small tool that helps them paste notes from articles and convert those notes into study cards. Each card should include a concept, a short explanation, one example, and a review question.

## Initial Constraints

- No account system.
- No cloud sync.
- Keep the first version local or file-based.
- Output should be easy to export as Markdown.
- The user is more interested in learning flow than polished UI.

## Example Idea Change

The user later decides that the tool should not only create flashcards. It should also group cards by theme, because random cards are less useful for reviewing an article.

Expected VibeLog update:

- append `Idea Evolution`
- update `Current Idea`
- record a human-in-the-loop `scope` or `direction` decision

## Example Human-In-The-Loop Decision

Human input:

```txt
I care more about understanding the article than memorizing isolated facts. Make the card groups theme-first.
```

Expected VibeLog record:

- type: `direction`
- final decision: cards are organized around themes
- why it mattered: the product is a reading comprehension tool, not a generic flashcard generator
- impact: validation should test whether grouped cards help review the article

## Example Execution Prompt

```txt
Build a small local prototype that accepts article notes, groups them into themes, and exports Markdown study cards. Keep the implementation simple and include tests for the grouping logic.
```

Expected VibeLog record:

- prompt type: `build`
- recording mode: `exact`
- prompt text: exact text unless sensitive
- result: what the agent did
- reuse notes: future agents should preserve theme-first grouping

## Example Development Log Entry

Summary:

```txt
Added a local note-to-card transformation flow.
```

Details to record:

- input: raw article notes
- output: Markdown study cards
- files changed or artifacts produced
- tests or manual checks performed
- follow-up work

## Example Bugfix Entry

Bug symptom:

```txt
Cards generated from long notes repeat the same example across multiple themes.
```

Root cause:

```txt
unknown until inspected
```

Expected behavior:

- do not invent a root cause before evidence exists
- record the fix after inspection
- record verification evidence after testing

## Example Validation Design

Success criteria:

- a user can paste article notes and get grouped study cards
- each card has a concept, explanation, example, and review question
- cards preserve the article's main themes
- Markdown export is readable

Manual test:

1. Paste notes from a short article.
2. Generate theme groups.
3. Inspect whether each group contains relevant cards.
4. Export Markdown.
5. Read the export as if studying tomorrow.

Automated test idea:

```txt
Given three notes about the same theme, the grouping step keeps them together and does not duplicate the same example across unrelated themes.
```

## Example Handoff Prompt

Use this prompt to test agent handoff:

```txt
Read this VibeLog as a new agent. Summarize the current idea, what changed, what the human decided, what is implemented, how it should be tested, and the next smallest useful action.
```

The handoff passes if the new agent can continue without asking the user to repeat the project history.
