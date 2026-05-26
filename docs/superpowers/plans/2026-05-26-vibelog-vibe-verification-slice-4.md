# VibeLog Vibe Verification Slice 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Slice 4 by replacing manual acceptance framing with agent-run dogfood verification, then generate and validate a new VibeLog example without copying scratch source code into this repository.

**Architecture:** Slice 4 adds bilingual guide artifacts, a repeatable dogfood protocol, an example integrity test, and a generated `examples/reading-card-lite/` VibeLog case. Scratch project source stays outside this repository; only generated VibeLog records and README are copied into `examples/`.

**Tech Stack:** Markdown docs, Node.js ESM, built-in `node:test`, existing `scripts/export-vibelog.mjs`, existing `scripts/validate-vibelog.mjs`, PowerShell commands.

---

## File Structure

- Create: `docs/guides/vibe-verification-guide.md`
  - English guide explaining agent-run vibe verification, human review scope, isolated checks, combined checks, and progress reporting.
- Create: `docs/guides/vibe-verification-guide.zh.md`
  - Chinese translation of the vibe verification guide.
- Create: `docs/guides/agent-dogfood-protocol.md`
  - English protocol for running the scratch project, recording VibeLog, exporting JSON, validating, and reporting evidence.
- Create: `docs/guides/agent-dogfood-protocol.zh.md`
  - Chinese translation of the dogfood protocol.
- Create: `test/vibelog-examples.test.mjs`
  - Node.js integrity test for generated examples and repository boundary.
- Create: `examples/reading-card-lite/README.md`
  - Brief English/Chinese note describing the generated example and stating that scratch source code is intentionally excluded.
- Create: `examples/reading-card-lite/vibe-log.md`
  - Generated VibeLog from the agent dogfood run.
- Create: `examples/reading-card-lite/vibe-log.json`
  - JSON generated from the Markdown by `scripts/export-vibelog.mjs`.
- Modify: `README.md`
  - Link the new guides and example.
- Modify: `vibe-log.md`
  - Record the Slice 4 execution prompt, development log, verification evidence, handoff, artifact index, and progress snapshot.
- Modify: `vibe-log.json`
  - Regenerate from `vibe-log.md`.

Scratch-only files outside this repository:

```txt
C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\
```

This scratch folder may contain a small Node.js prototype, tests, and package metadata. Do not copy those source files into this repository.

---

### Task 1: Example Integrity Red Test

**Files:**
- Create: `test/vibelog-examples.test.mjs`

- [ ] **Step 1: Write failing example integrity tests**

Create `test/vibelog-examples.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { validateVibeLog } from "../scripts/validate-vibelog.mjs";

const exampleDir = "examples/reading-card-lite";
const allowedFiles = new Set(["README.md", "vibe-log.md", "vibe-log.json"]);

test("reading-card-lite example contains only generated VibeLog artifacts", async () => {
  const entries = await readdir(exampleDir, { withFileTypes: true });
  const names = entries.map((entry) => entry.name).sort();

  assert.deepEqual(names, ["README.md", "vibe-log.json", "vibe-log.md"].sort());
  for (const entry of entries) {
    assert.equal(entry.isFile(), true, `${entry.name} must be a file`);
    assert.equal(allowedFiles.has(entry.name), true, `${entry.name} is not allowed in examples`);
  }
});

test("reading-card-lite JSON is valid VibeLog data", async () => {
  const data = JSON.parse(await readFile(join(exampleDir, "vibe-log.json"), "utf8"));
  const result = validateVibeLog(data);

  assert.equal(result.valid, true, result.errors.join("\n"));
});

test("reading-card-lite Markdown includes core dogfood evidence sections", async () => {
  const markdown = await readFile(join(exampleDir, "vibe-log.md"), "utf8");
  const requiredSections = [
    "## One-Line Vibe",
    "## Current Idea",
    "## Idea Evolution",
    "## Human-in-the-Loop",
    "## Execution Prompts",
    "## Development Log",
    "## Bugfix / Incident Log",
    "## Validation Design",
    "## Verification Evidence",
    "## Artifact Index",
    "## Handoff State",
    "## Public Summary"
  ];

  for (const section of requiredSections) {
    assert.match(markdown, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("new Slice 4 guides exist in bilingual pairs", async () => {
  const guideFiles = [
    "docs/guides/vibe-verification-guide.md",
    "docs/guides/vibe-verification-guide.zh.md",
    "docs/guides/agent-dogfood-protocol.md",
    "docs/guides/agent-dogfood-protocol.zh.md"
  ];

  for (const file of guideFiles) {
    const content = await readFile(file, "utf8");
    assert.ok(content.trim().length > 200, `${file} should contain real guide content`);
  }
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run:

```powershell
node --test test/vibelog-examples.test.mjs
```

Expected: fail because `examples/reading-card-lite/` and new Slice 4 guides do not exist yet.

### Task 2: Bilingual Vibe Verification Guides

**Files:**
- Create: `docs/guides/vibe-verification-guide.md`
- Create: `docs/guides/vibe-verification-guide.zh.md`
- Create: `docs/guides/agent-dogfood-protocol.md`
- Create: `docs/guides/agent-dogfood-protocol.zh.md`
- Modify: `README.md`

- [ ] **Step 1: Create the English vibe verification guide**

Create `docs/guides/vibe-verification-guide.md` with these sections:

```md
# Vibe Verification Guide

VibeLog verification should be agent-run first. The human reviews direction, realism, and final evidence; the agent runs the repeatable checks.

## Principle

If an agent can vibe-verify it, do not make the human manually verify it.

## Human Role

- approve direction
- reject logs that feel fake
- judge whether handoff is understandable
- decide whether public/private projection is acceptable

## Agent Role

- create or run a scratch vibe scenario outside the repository
- record the process in VibeLog
- export Markdown to JSON
- validate JSON
- run isolated and combined checks
- report evidence and residual risk

## Isolated Checks

The generated VibeLog should include one-line idea, current idea, idea evolution, human-in-the-loop, execution prompts, development log, bugfix or incident log, validation design, verification evidence, artifact index, handoff state, and public summary.

## Combined Checks

Run exporter, validator, drift check, and test suite. The example folder must contain generated VibeLog records only.

## Progress Snapshot

When reporting completion, include the conservative project progress snapshot from `docs/guides/progress-reporting.md`.
```

- [ ] **Step 2: Create the Chinese vibe verification guide**

Create `docs/guides/vibe-verification-guide.zh.md` with this content:

```md
# Vibe 验证指南

VibeLog 验证应该优先由 agent 执行。人类负责 review 方向、真实性和最终证据；agent 负责运行可重复检查。

## 原则

如果 agent 可以 vibe 验证，就不要让人类手动验证。

## 人类角色

- 批准方向
- 拒绝看起来很假的日志
- 判断 handoff 是否可理解
- 决定 public/private projection 是否可接受

## Agent 角色

- 在仓库外创建或运行 scratch vibe 场景
- 用 VibeLog 记录过程
- 从 Markdown 导出 JSON
- 校验 JSON
- 运行单项检查和组合检查
- 报告证据和剩余风险

## 单项检查

生成的 VibeLog 应包含一句话想法、当前想法、想法演化、human-in-the-loop、执行提示词、开发日志、bugfix 或 incident 日志、验证设计、验证证据、artifact index、handoff state 和 public summary。

## 组合检查

运行 exporter、validator、drift check 和 test suite。example folder 必须只包含生成的 VibeLog 记录。

## 进度快照

完成汇报时，使用 `docs/guides/progress-reporting.zh.md` 中的保守项目进度快照。
```

- [ ] **Step 3: Create the English dogfood protocol**

Create `docs/guides/agent-dogfood-protocol.md` with these sections:

```md
# Agent Dogfood Protocol

Use this protocol to verify VibeLog through a scratch vibe project.

## Repository Boundary

Create scratch source outside this repository. Copy only `README.md`, `vibe-log.md`, and `vibe-log.json` into `examples/<case-name>/`.

## Required Scenario Events

- initial product idea
- one idea change
- one human-in-the-loop decision
- one exact engineering execution prompt
- at least one development log entry
- one bugfix or incident entry
- validation design
- verification evidence
- handoff state

## Required Commands

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test
```

## Evidence Report

Report what was generated, what commands passed, what risk remains, and whether scratch source stayed outside the repository.
```

- [ ] **Step 4: Create the Chinese dogfood protocol**

Create `docs/guides/agent-dogfood-protocol.zh.md` with this content:

```md
# Agent Dogfood 协议

使用这个协议，通过 scratch vibe 项目验证 VibeLog。

## 仓库边界

scratch 源码必须放在仓库外。只把 `README.md`、`vibe-log.md` 和 `vibe-log.json` 复制到 `examples/<case-name>/`。

## 必须包含的场景事件

- 初始产品想法
- 一次想法变化
- 一次 human-in-the-loop 决策
- 一条精确工程执行提示词
- 至少一条开发日志
- 一条 bugfix 或 incident 记录
- 验证设计
- 验证证据
- handoff state

## 必须运行的命令

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test
```

## 证据报告

报告生成了什么、哪些命令通过、剩余风险是什么，以及 scratch source 是否留在仓库外。
```

- [ ] **Step 5: Link guides from README**

Add guide links under `docs/guides/` in `README.md`:

```md
- [Vibe verification guide](../../guides/vibe-verification-guide.md)
- [Vibe 验证指南](../../guides/vibe-verification-guide.zh.md)
- [Agent dogfood protocol](../../guides/agent-dogfood-protocol.md)
- [Agent dogfood 协议](../../guides/agent-dogfood-protocol.zh.md)
```

### Task 3: Scratch Reading Card Dogfood

**Files:**
- Scratch create: `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\`
- Repository create: `examples/reading-card-lite/README.md`
- Repository create: `examples/reading-card-lite/vibe-log.md`
- Repository create: `examples/reading-card-lite/vibe-log.json`

- [ ] **Step 1: Create scratch folder outside the repo**

Run:

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite"
```

Expected: scratch folder exists outside `C:\Users\HXW\Documents\vibecoding`.

- [ ] **Step 2: Create the scratch package file**

Create `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\package.json`:

```json
{
  "name": "reading-card-lite",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 3: Write scratch tests first**

Create `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\test\reading-card-lite.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";

import {
  createStudyCards,
  exportStudyCardsMarkdown,
  groupNotesByTheme
} from "../src/reading-card-lite.mjs";

const notes = [
  {
    theme: "Memory",
    concept: "Active recall",
    explanation: "Retrieving an answer strengthens memory more than rereading.",
    example: "Close the article and answer from memory."
  },
  {
    theme: "Memory",
    concept: "Spaced review",
    explanation: "Reviewing later helps prevent forgetting.",
    example: "Review the card tomorrow and next week."
  },
  {
    theme: "Comprehension",
    concept: "Theme grouping",
    explanation: "Cards are easier to review when related ideas stay together.",
    example: "Close the article and answer from memory."
  }
];

test("groups notes by normalized theme", () => {
  const groups = groupNotesByTheme(notes);

  assert.deepEqual(Object.keys(groups), ["Comprehension", "Memory"]);
  assert.equal(groups.Memory.length, 2);
  assert.equal(groups.Comprehension.length, 1);
});

test("creates study cards and avoids duplicate examples across themes", () => {
  const cards = createStudyCards(notes);
  const examples = cards.map((card) => card.example);

  assert.equal(cards.length, 3);
  assert.equal(new Set(examples).size, examples.length);
  assert.match(cards[2].example, /Theme grouping/);
});

test("exports grouped Markdown study cards", () => {
  const cards = createStudyCards(notes);
  const markdown = exportStudyCardsMarkdown(cards);

  assert.match(markdown, /## Memory/);
  assert.match(markdown, /### Active recall/);
  assert.match(markdown, /\*\*Review question:\*\*/);
  assert.match(markdown, /## Comprehension/);
});
```

- [ ] **Step 4: Run scratch tests and confirm RED**

Run from `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`:

```powershell
npm test
```

Expected: fail because `src/reading-card-lite.mjs` does not exist.

- [ ] **Step 5: Implement scratch reading-card logic**

Create `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\src\reading-card-lite.mjs`:

```js
export function groupNotesByTheme(notes) {
  return notes
    .map(normalizeNote)
    .sort((left, right) => left.theme.localeCompare(right.theme) || left.concept.localeCompare(right.concept))
    .reduce((groups, note) => {
      groups[note.theme] ??= [];
      groups[note.theme].push(note);
      return groups;
    }, {});
}

export function createStudyCards(notes) {
  const usedExamples = new Set();
  const groups = groupNotesByTheme(notes);
  const cards = [];

  for (const [theme, groupNotes] of Object.entries(groups)) {
    for (const note of groupNotes) {
      const example = makeUniqueExample(note, usedExamples);
      usedExamples.add(example);
      cards.push({
        theme,
        concept: note.concept,
        explanation: note.explanation,
        example,
        review_question: `How does ${note.concept} help explain ${theme}?`
      });
    }
  }

  return cards;
}

export function exportStudyCardsMarkdown(cards) {
  const groups = cards.reduce((result, card) => {
    result[card.theme] ??= [];
    result[card.theme].push(card);
    return result;
  }, {});

  return Object.entries(groups)
    .map(([theme, groupCards]) => [
      `## ${theme}`,
      "",
      ...groupCards.flatMap((card) => [
        `### ${card.concept}`,
        "",
        `**Explanation:** ${card.explanation}`,
        "",
        `**Example:** ${card.example}`,
        "",
        `**Review question:** ${card.review_question}`,
        ""
      ])
    ].join("\n"))
    .join("\n")
    .trim();
}

function normalizeNote(note) {
  return {
    theme: normalizeText(note.theme),
    concept: normalizeText(note.concept),
    explanation: normalizeText(note.explanation),
    example: normalizeText(note.example)
  };
}

function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function makeUniqueExample(note, usedExamples) {
  if (!usedExamples.has(note.example)) return note.example;
  return `${note.concept}: ${note.example}`;
}
```

- [ ] **Step 6: Run scratch tests and confirm GREEN**

Run from `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite`:

```powershell
npm test
```

Expected: all scratch tests pass.

- [ ] **Step 7: Record the scratch bugfix/incident evidence**

Use the RED/GREEN behavior as the VibeLog incident:

```txt
Bug symptom: duplicate examples can appear across unrelated themes.
Root cause: example uniqueness was not enforced before the final implementation.
Fix: track used examples and prefix duplicate examples with the card concept.
Verification: scratch `npm test` passes.
```

- [ ] **Step 8: Create generated example README**

Create `examples/reading-card-lite/README.md`:

```md
# Reading Card Lite

Reading Card Lite is a generated VibeLog dogfood example from a scratch agent-run project.

中文：Reading Card Lite 是一次 scratch agent-run 项目生成的 VibeLog dogfood 示例。

This folder intentionally contains only generated VibeLog records:

- `vibe-log.md`
- `vibe-log.json`

Scratch source code remains outside this repository at:

```txt
C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite
```
```

- [ ] **Step 9: Create generated VibeLog Markdown**

Create `examples/reading-card-lite/vibe-log.md` with all required sections from the Slice 4 design. It must record:

- one-line idea
- current idea
- idea evolution
- human-in-the-loop decision
- exact execution prompt
- development log
- bugfix or incident log
- validation design
- verification evidence from scratch tests
- artifact index
- handoff state
- public summary

- [ ] **Step 10: Export example JSON**

Run:

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
```

Expected: `examples/reading-card-lite/vibe-log.json` is written.

### Task 4: Example Validation And Integrity Green

**Files:**
- Test: `test/vibelog-examples.test.mjs`
- Generated example: `examples/reading-card-lite/`

- [ ] **Step 1: Validate generated example JSON**

Run:

```powershell
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
```

Expected: validation passes.

- [ ] **Step 2: Check generated example drift**

Run:

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
```

Expected: drift check exits 0.

- [ ] **Step 3: Run example integrity test**

Run:

```powershell
node --test test/vibelog-examples.test.mjs
```

Expected: all example integrity tests pass.

- [ ] **Step 4: Run full test suite**

Run:

```powershell
node --test
```

Expected: all repository tests pass.

### Task 5: VibeLog Records And Slice Report

**Files:**
- Modify: `vibe-log.md`
- Modify: `vibe-log.json`
- Create: `docs/reports/slice-4-vibe-verification-report.md`
- Create: `docs/reports/slice-4-vibe-verification-report.zh.md`

- [ ] **Step 1: Record execution prompt**

Record exact prompt:

```txt
好执行
```

Use `Execution Prompts` with `Prompt Type: docs` for the implementation plan approval and `Prompt Type: build` for the later dogfood execution if a separate execution prompt is given.

- [ ] **Step 2: Record development log**

Add a `Development Log` entry summarizing Slice 4 implementation, files changed, verification, and follow-up.

- [ ] **Step 3: Record verification evidence**

Record all verification commands that actually ran:

```powershell
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test test/vibelog-examples.test.mjs
node --test
git diff --check
```

- [ ] **Step 4: Update handoff and progress snapshot**

Update `Handoff State`:

```txt
Project Progress: 12 / 100
Change This Task: +2
Current Phase: Agent dogfood verification
Next Unlock: Hook / adapter automatic recording
Main Risk: Hook automation has not been implemented yet
Confidence: medium
```

Use `12 / 100` only after Slice 4 implementation is verified. Keep `10 / 100` if implementation is not complete.

- [ ] **Step 5: Create bilingual Slice 4 report**

Create English and Chinese reports with:

- what was generated
- what commands passed
- what remained outside the repository
- what risks remain
- project progress snapshot

- [ ] **Step 6: Regenerate root JSON**

Run:

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
```

Expected: root JSON is regenerated.

### Task 6: Final Verification And Commit

**Files:**
- All Slice 4 files

- [ ] **Step 1: Run full verification**

Run:

```powershell
node --test
node scripts/validate-vibelog.mjs vibe-log.json
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
git diff --check
```

Expected:

- all tests pass
- root JSON validates
- root drift check passes
- example JSON validates
- example drift check passes
- whitespace check has no output

- [ ] **Step 2: Confirm repository boundary**

Run:

```powershell
Get-ChildItem -Recurse examples\reading-card-lite | Select-Object FullName
```

Expected: only `README.md`, `vibe-log.md`, and `vibe-log.json` appear.

- [ ] **Step 3: Commit locally**

Run:

```powershell
git add README.md docs/guides docs/reports examples/reading-card-lite test/vibelog-examples.test.mjs vibe-log.md vibe-log.json
git commit -m "Implement VibeLog vibe verification dogfood"
```

Expected: local commit is created. Do not push.
