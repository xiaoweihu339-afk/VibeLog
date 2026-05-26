# VibeLog Studio Slice 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first local-first VibeLog Studio slice: create a Vibe Repo, view it, append one structured update, persist locally, and export Markdown/JSON.

**Architecture:** Keep the MVP small and layered. Domain logic lives in `src/domain`, export logic in `src/exporters`, persistence behind a `VibeRepository` interface in `src/repository`, and UI in the Next.js app router. Markdown remains the human-readable output; JSON remains the structured export.

**Tech Stack:** Next.js, React, TypeScript, Zod, Vitest, Testing Library, Playwright, localStorage.

---

## File Structure

- Create `apps/vibelog-studio/package.json`: app scripts and dependencies.
- Create `apps/vibelog-studio/tsconfig.json`: TypeScript config.
- Create `apps/vibelog-studio/next.config.mjs`: Next config.
- Create `apps/vibelog-studio/vitest.config.ts`: Vitest config.
- Create `apps/vibelog-studio/playwright.config.ts`: browser test config.
- Create `apps/vibelog-studio/app/layout.tsx`: root layout.
- Create `apps/vibelog-studio/app/page.tsx`: app shell for dashboard/detail/export.
- Create `apps/vibelog-studio/app/globals.css`: restrained operational UI styling.
- Create `apps/vibelog-studio/src/domain/vibe-repo.ts`: schemas, defaults, update rules.
- Create `apps/vibelog-studio/src/domain/vibe-repo.test.ts`: domain single tests.
- Create `apps/vibelog-studio/src/exporters/markdown.ts`: Markdown export.
- Create `apps/vibelog-studio/src/exporters/markdown.test.ts`: Markdown exporter single tests.
- Create `apps/vibelog-studio/src/exporters/json.ts`: JSON export.
- Create `apps/vibelog-studio/src/exporters/json.test.ts`: JSON exporter single tests.
- Create `apps/vibelog-studio/src/repository/vibe-repository.ts`: repository interface and localStorage implementation.
- Create `apps/vibelog-studio/src/repository/vibe-repository.test.ts`: repository single tests.
- Create `apps/vibelog-studio/src/integration/vibe-flow.test.ts`: create -> view model -> update -> export integration test.
- Create `apps/vibelog-studio/e2e/vibe-flow.spec.ts`: browser integration test after UI exists.

## Completion Gate

Every task needs two layers:

- Single test: the file or behavior works in isolation.
- Integration test: the behavior works inside the create -> view -> update -> export product flow.

No task is complete until both relevant layers pass or the residual risk is explicitly recorded.

### Task 1: App Scaffold

**Files:**
- Create: `apps/vibelog-studio/package.json`
- Create: `apps/vibelog-studio/tsconfig.json`
- Create: `apps/vibelog-studio/next.config.mjs`
- Create: `apps/vibelog-studio/vitest.config.ts`
- Create: `apps/vibelog-studio/playwright.config.ts`
- Create: `apps/vibelog-studio/app/layout.tsx`
- Create: `apps/vibelog-studio/app/page.tsx`
- Create: `apps/vibelog-studio/app/globals.css`

- [ ] **Step 1: Create minimal project files**

Create package scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`

Expected: dependencies install and `package-lock.json` is created.

- [ ] **Step 3: Verify empty app builds enough to load**

Run: `npm run test`

Expected: no tests or placeholder test state is acceptable only before domain tests are added.

### Task 2: Domain Model

**Files:**
- Create: `apps/vibelog-studio/src/domain/vibe-repo.test.ts`
- Create: `apps/vibelog-studio/src/domain/vibe-repo.ts`
- Modify: `apps/vibelog-studio/src/integration/vibe-flow.test.ts`

- [ ] **Step 1: Write failing single tests**

Test code should assert:

```ts
createVibeRepo({
  title: "Demo",
  oneLineVibe: "A tiny vibe repo",
  currentIdea: "Create and export a VibeLog."
})
```

returns a repo with private visibility, summary prompt visibility, core process level, initial idea evolution, implementation status, validation design, and handoff state.

- [ ] **Step 2: Run domain tests and verify RED**

Run: `npm run test -- src/domain/vibe-repo.test.ts`

Expected: fail because `createVibeRepo` does not exist.

- [ ] **Step 3: Implement minimal domain model**

Implement:

- `VibeRepo` type
- `CreateVibeRepoInput` schema
- `createVibeRepo`
- `appendVibeUpdate`

- [ ] **Step 4: Run single tests and verify GREEN**

Run: `npm run test -- src/domain/vibe-repo.test.ts`

Expected: pass.

- [ ] **Step 5: Add integration test coverage**

Integration test creates repo, appends update, and checks history is preserved.

### Task 3: Exporters

**Files:**
- Create: `apps/vibelog-studio/src/exporters/markdown.test.ts`
- Create: `apps/vibelog-studio/src/exporters/markdown.ts`
- Create: `apps/vibelog-studio/src/exporters/json.test.ts`
- Create: `apps/vibelog-studio/src/exporters/json.ts`
- Modify: `apps/vibelog-studio/src/integration/vibe-flow.test.ts`

- [ ] **Step 1: Write failing Markdown exporter tests**

Expected Markdown includes frontmatter, `# VibeLog`, `## One-Line Vibe`, `## Current Idea`, `## Idea Evolution`, `## Implementation Status`, `## Validation Design`, `## Handoff State`, and `## Public Summary`.

- [ ] **Step 2: Verify Markdown test RED**

Run: `npm run test -- src/exporters/markdown.test.ts`

Expected: fail because exporter does not exist.

- [ ] **Step 3: Implement Markdown exporter**

Implement `exportVibeLogMarkdown(repo: VibeRepo): string`.

- [ ] **Step 4: Write JSON exporter tests**

Expected JSON parses and includes the same `id`, `title`, `one_line_vibe`, `current_idea`, and `implementation_status`.

- [ ] **Step 5: Implement JSON exporter**

Implement `exportVibeLogJson(repo: VibeRepo): string`.

- [ ] **Step 6: Run single and integration tests**

Run: `npm run test -- src/exporters src/integration`

Expected: pass.

### Task 4: Local Repository

**Files:**
- Create: `apps/vibelog-studio/src/repository/vibe-repository.test.ts`
- Create: `apps/vibelog-studio/src/repository/vibe-repository.ts`
- Modify: `apps/vibelog-studio/src/integration/vibe-flow.test.ts`

- [ ] **Step 1: Write failing repository tests**

Test `MemoryVibeRepository` and `LocalStorageVibeRepository` support `list`, `get`, `save`, and `delete`.

- [ ] **Step 2: Verify repository test RED**

Run: `npm run test -- src/repository/vibe-repository.test.ts`

Expected: fail because repository does not exist.

- [ ] **Step 3: Implement repository interface**

Implement:

- `VibeRepository`
- `MemoryVibeRepository`
- `LocalStorageVibeRepository`

- [ ] **Step 4: Run repository and integration tests**

Run: `npm run test -- src/repository src/integration`

Expected: pass.

### Task 5: UI Slice

**Files:**
- Modify: `apps/vibelog-studio/app/page.tsx`
- Modify: `apps/vibelog-studio/app/globals.css`
- Create: `apps/vibelog-studio/e2e/vibe-flow.spec.ts`

- [ ] **Step 1: Write browser integration test**

Test:

- open app
- create repo
- see dashboard item
- open detail
- append update
- export Markdown preview
- export JSON preview
- reload and see repo persists

- [ ] **Step 2: Run browser test and verify RED**

Run: `npm run e2e`

Expected: fail because UI is not implemented.

- [ ] **Step 3: Implement UI**

Implement a compact app shell with:

- create form
- dashboard list
- detail view
- update form
- export previews

- [ ] **Step 4: Run single and browser integration tests**

Run: `npm run test`

Run: `npm run build`

Run: `npm run e2e`

Expected: all pass.

### Task 6: VibeLog Update And Handoff

**Files:**
- Modify: `apps/vibelog-studio/vibe-log.md`
- Modify: `apps/vibelog-studio/vibe-log.json`

- [ ] **Step 1: Record execution prompts and development progress**

Update execution prompts, development log, validation evidence, and handoff state.

- [ ] **Step 2: Verify JSON parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('apps/vibelog-studio/vibe-log.json','utf8')); console.log('ok')"`

Expected: `ok`.

---

## Self-Review

Spec coverage:

- Create Vibe Repo: Task 2 and Task 5.
- View Vibe Repo: Task 5.
- Append update: Task 2 and Task 5.
- Export Markdown/JSON: Task 3 and Task 5.
- Local persistence: Task 4 and Task 5.
- Two-layer testing: every task includes single and integration coverage.
- VibeLog dogfood: Task 6.

Placeholder scan:

- No task is left without concrete expected files, commands, and behavior.

Type consistency:

- Domain exports `VibeRepo`, `createVibeRepo`, and `appendVibeUpdate`.
- Exporters consume `VibeRepo`.
- Repository stores `VibeRepo`.
