# VibeLog Vibe Verification Slice 4 实现计划

> **给 agent worker：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务执行本计划。步骤使用 checkbox（`- [ ]`）语法跟踪。

**目标：** 实现 Slice 4：用 agent-run dogfood verification 替代人工验收表述，并生成、校验一个新的 VibeLog 示例，同时不把 scratch 源码复制进本仓库。

**架构：** Slice 4 增加中英双文 guide、可重复 dogfood 协议、example integrity test，以及生成的 `examples/reading-card-lite/` VibeLog 案例。scratch 项目源码留在仓库外；`examples/` 里只放生成的 VibeLog 记录和 README。

**技术栈：** Markdown 文档、Node.js ESM、内置 `node:test`、已有 `scripts/export-vibelog.mjs`、已有 `scripts/validate-vibelog.mjs`、PowerShell 命令。

---

## 文件结构

- 创建：`docs/guides/vibe-verification-guide.md`
  - 英文指南，解释 agent-run vibe verification、人类 review 范围、单项检查、组合检查和进度汇报。
- 创建：`docs/guides/vibe-verification-guide.zh.md`
  - 中文翻译。
- 创建：`docs/guides/agent-dogfood-protocol.md`
  - 英文协议，说明如何运行 scratch 项目、记录 VibeLog、导出 JSON、校验并报告证据。
- 创建：`docs/guides/agent-dogfood-protocol.zh.md`
  - 中文翻译。
- 创建：`test/vibelog-examples.test.mjs`
  - 用于生成示例和仓库边界的 Node.js 完整性测试。
- 创建：`examples/reading-card-lite/README.md`
  - 中英说明，解释这是生成示例，并明确 scratch source code 被排除。
- 创建：`examples/reading-card-lite/vibe-log.md`
  - agent dogfood 运行生成的 VibeLog。
- 创建：`examples/reading-card-lite/vibe-log.json`
  - 由 `scripts/export-vibelog.mjs` 从 Markdown 生成的 JSON。
- 修改：`README.md`
  - 链接新 guides 和 example。
- 修改：`vibe-log.md`
  - 记录 Slice 4 执行提示词、开发日志、验证证据、handoff、artifact index 和进度快照。
- 修改：`vibe-log.json`
  - 由 `vibe-log.md` 重新生成。

仓库外 scratch-only 文件：

```txt
C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\
```

这个 scratch folder 可以包含小型 Node.js prototype、tests 和 package metadata。不要把这些源码文件复制到本仓库。

---

### Task 1：Example Integrity 红灯测试

**文件：**
- 创建：`test/vibelog-examples.test.mjs`

- [ ] **Step 1：写失败的 example integrity tests**

创建 `test/vibelog-examples.test.mjs`：

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

- [ ] **Step 2：运行测试并确认 RED**

运行：

```powershell
node --test test/vibelog-examples.test.mjs
```

预期：失败，因为 `examples/reading-card-lite/` 和新的 Slice 4 guides 还不存在。

### Task 2：中英双文 Vibe Verification Guides

**文件：**
- 创建：`docs/guides/vibe-verification-guide.md`
- 创建：`docs/guides/vibe-verification-guide.zh.md`
- 创建：`docs/guides/agent-dogfood-protocol.md`
- 创建：`docs/guides/agent-dogfood-protocol.zh.md`
- 修改：`README.md`

- [ ] **Step 1：创建英文 vibe verification guide**

创建 `docs/guides/vibe-verification-guide.md`：

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

- [ ] **Step 2：创建中文 vibe verification guide**

创建 `docs/guides/vibe-verification-guide.zh.md`：

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

- [ ] **Step 3：创建英文 dogfood protocol**

创建 `docs/guides/agent-dogfood-protocol.md`：

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

- [ ] **Step 4：创建中文 dogfood protocol**

创建 `docs/guides/agent-dogfood-protocol.zh.md`：

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

- [ ] **Step 5：从 README 链接 guides**

在 `README.md` 的 `docs/guides/` 列表里加入：

```md
- [Vibe verification guide](docs/guides/vibe-verification-guide.md)
- [Vibe 验证指南](docs/guides/vibe-verification-guide.zh.md)
- [Agent dogfood protocol](docs/guides/agent-dogfood-protocol.md)
- [Agent dogfood 协议](docs/guides/agent-dogfood-protocol.zh.md)
```

### Task 3：Scratch Reading Card Dogfood

**文件：**
- 仓库外创建：`C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\`
- 仓库内创建：`examples/reading-card-lite/README.md`
- 仓库内创建：`examples/reading-card-lite/vibe-log.md`
- 仓库内创建：`examples/reading-card-lite/vibe-log.json`

- [ ] **Step 1：在仓库外创建 scratch folder**

运行：

```powershell
New-Item -ItemType Directory -Force -Path "C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite"
```

预期：scratch folder 存在，并且位于 `C:\Users\HXW\Documents\vibecoding` 外部。

- [ ] **Step 2：创建 scratch package 文件**

创建 `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\package.json`：

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

- [ ] **Step 3：先写 scratch tests**

创建 `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\test\reading-card-lite.test.mjs`：

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

- [ ] **Step 4：运行 scratch tests 并确认 RED**

在 `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite` 运行：

```powershell
npm test
```

预期：失败，因为 `src/reading-card-lite.mjs` 还不存在。

- [ ] **Step 5：实现 scratch reading-card 逻辑**

创建 `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite\src\reading-card-lite.mjs`：

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

- [ ] **Step 6：运行 scratch tests 并确认 GREEN**

在 `C:\Users\HXW\Documents\vibelog-scratch\reading-card-lite` 运行：

```powershell
npm test
```

预期：scratch tests 全部通过。

- [ ] **Step 7：记录 scratch bugfix/incident 证据**

把 RED/GREEN 行为作为 VibeLog incident：

```txt
Bug symptom: duplicate examples can appear across unrelated themes.
Root cause: example uniqueness was not enforced before the final implementation.
Fix: track used examples and prefix duplicate examples with the card concept.
Verification: scratch `npm test` passes.
```

- [ ] **Step 8：创建生成示例 README**

创建 `examples/reading-card-lite/README.md`，说明这是生成的 VibeLog dogfood 示例，并明确 scratch source code 留在仓库外。

- [ ] **Step 9：创建生成的 VibeLog Markdown**

创建 `examples/reading-card-lite/vibe-log.md`，必须记录：

- 一句话想法
- 当前想法
- 想法演化
- human-in-the-loop 决策
- 精确执行提示词
- development log
- bugfix 或 incident log
- validation design
- scratch tests 的 verification evidence
- artifact index
- handoff state
- public summary

- [ ] **Step 10：导出 example JSON**

运行：

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
```

预期：写出 `examples/reading-card-lite/vibe-log.json`。

### Task 4：Example Validation 和 Integrity 绿灯

**文件：**
- 测试：`test/vibelog-examples.test.mjs`
- 生成示例：`examples/reading-card-lite/`

- [ ] **Step 1：校验生成示例 JSON**

运行：

```powershell
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
```

预期：validation 通过。

- [ ] **Step 2：检查生成示例 drift**

运行：

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
```

预期：drift check 退出码为 0。

- [ ] **Step 3：运行 example integrity test**

运行：

```powershell
node --test test/vibelog-examples.test.mjs
```

预期：example integrity tests 全部通过。

- [ ] **Step 4：运行完整 test suite**

运行：

```powershell
node --test
```

预期：仓库所有测试通过。

### Task 5：VibeLog Records 和 Slice Report

**文件：**
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`
- 创建：`docs/reports/slice-4-vibe-verification-report.md`
- 创建：`docs/reports/slice-4-vibe-verification-report.zh.md`

- [ ] **Step 1：记录执行提示词**

记录精确提示词：

```txt
好执行
```

这次 implementation plan approval 使用 `Prompt Type: docs`。如果后续有单独 dogfood 执行提示词，再为 dogfood execution 记录 `Prompt Type: build`。

- [ ] **Step 2：记录 development log**

添加一条 `Development Log`，总结 Slice 4 实现、修改文件、验证和 follow-up。

- [ ] **Step 3：记录 verification evidence**

记录实际运行过的验证命令：

```powershell
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test test/vibelog-examples.test.mjs
node --test
git diff --check
```

- [ ] **Step 4：更新 handoff 和 progress snapshot**

只有 Slice 4 实现并验证后才更新为：

```txt
Project Progress: 12 / 100
Change This Task: +2
Current Phase: Agent dogfood verification
Next Unlock: Hook / adapter automatic recording
Main Risk: Hook automation has not been implemented yet
Confidence: medium
```

如果实现没有完成，则保持 `10 / 100`。

- [ ] **Step 5：创建中英双文 Slice 4 report**

报告应包含：

- 生成了什么
- 哪些命令通过
- 什么留在仓库外
- 剩余风险
- 项目进度快照

- [ ] **Step 6：重新生成根 JSON**

运行：

```powershell
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
```

预期：根 JSON 被重新生成。

### Task 6：最终验证和本地提交

**文件：**
- 所有 Slice 4 文件

- [ ] **Step 1：运行完整验证**

运行：

```powershell
node --test
node scripts/validate-vibelog.mjs vibe-log.json
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
git diff --check
```

预期：

- 所有测试通过
- 根 JSON 校验通过
- 根 drift check 通过
- example JSON 校验通过
- example drift check 通过
- whitespace check 无输出

- [ ] **Step 2：确认仓库边界**

运行：

```powershell
Get-ChildItem -Recurse examples\reading-card-lite | Select-Object FullName
```

预期：只出现 `README.md`、`vibe-log.md` 和 `vibe-log.json`。

- [ ] **Step 3：本地提交**

运行：

```powershell
git add README.md docs/guides docs/reports examples/reading-card-lite test/vibelog-examples.test.mjs vibe-log.md vibe-log.json
git commit -m "Implement VibeLog vibe verification dogfood"
```

预期：创建本地提交。不要 push。
