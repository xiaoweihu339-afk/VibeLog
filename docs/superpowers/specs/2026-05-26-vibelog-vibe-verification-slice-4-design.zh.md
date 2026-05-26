# VibeLog Slice 4 设计：Vibe 驱动的 Skill 验证

## 目的

Slice 4 要证明：VibeLog 可以通过 vibe 风格的 agent 执行来验证，而不是依赖人类做清单式手动验收。

核心原则：

```txt
如果 agent 可以 vibe 验证，就不要让人类手动验证。
```

人类应该审阅方向、重要决策和最终报告。agent 负责创建场景、运行 dogfood 流程、更新 VibeLog、导出 JSON、校验 JSON，并产出证据。

## 背景

前面的 slice 已经建立了基础：

- Slice 1.5 把仓库恢复为 skill-first 结构。
- Slice 2 增加了人类和 agent 使用指南。
- BillMate Lite 证明 VibeLog 可以记录 agent 模拟的小项目。
- Slice 3 增加了确定性的 Markdown-to-JSON 导出和轻量校验。

剩下的问题是：当前验证语言仍然偏向人工 review。Slice 4 要把它转换为 agent 运行的验证协议。

## 目标

1. 把“先手动测试”的表述替换成“先 agent dogfood 验证”。
2. 定义一个可重复的协议，让 agent 在没有真实用户项目时验证 VibeLog。
3. 让人类角色聚焦在方向和最终 review，而不是填表。
4. 从 scratch vibe 项目生成一个新的 VibeLog 示例。
5. 同时验证单项 VibeLog 能力和完整端到端流程。
6. 保持 skill-first 仓库边界：`examples/` 只包含生成出来的 VibeLog 记录，不包含 scratch 项目源码。

## 非目标

- 不做 VibeHub 网站。
- 不在这个 slice 做 Claude Code hook adapter。
- 没有单独明确批准，不推送到 GitHub。
- 不把 scratch app 源码放进这个仓库。
- 不要求用户手动填写 checklist。
- 不替代未来完整 JSON Schema validation。

## 核心原则

Slice 4 应该把验证当成一个 vibe 流程：

```txt
agent 接收自然任务
-> agent 创建或模拟一个小型 vibe 项目
-> agent 用 VibeLog 记录过程
-> agent 导出 JSON
-> agent 校验 JSON
-> agent 检查单项能力和组合流程
-> agent 向人类报告证据
```

如果日志看起来很假、不完整或没用，人类仍然可以拒绝结果。但第一轮生成和检查应该由 agent 完成。

## Review 语言规则

任何需要用户 review 的产物都必须同时提供中文和英文版本。

包括：

- 设计文档
- 实现计划
- slice 报告
- 验证报告
- 产品需求文档

agent 内部 scratch notes、生成的 JSON 和命令输出不需要双语版本，除非它们被明确拿给用户 review。

## 备选方案

### 方案 A：保留手动 checklist 验证

继续使用 `docs/guides/manual-test-guide.md`，要求人类或 agent 手动检查每个字段。

取舍：简单，但不符合 vibe 原则。它会让人类做 agent 可以做的工作。

### 方案 B：Agent Dogfood 协议

写一份协议，告诉 agent 如何运行 scratch vibe 场景、更新 VibeLog、导出 JSON、校验 JSON，并产出证据报告。

取舍：比随意测试更结构化，但仍然轻量，并且符合 VibeLog 的核心思想。

### 方案 C：完整自动化 Harness

构建一个脚本，生成完整 fake project flow，并断言每个预期 VibeLog 字段。

取舍：后续有价值，但现在太僵硬。VibeLog 应先证明它能处理自然 agent 工作，而不只是 scripted fixtures。

## 推荐方案

采用方案 B。

Slice 4 第一份有价值的输出应该是 agent 可读的 dogfood 协议，以及一个生成示例。这符合长期方向：用户自然 vibe，agent 结构化记录。

## 交付物

### 1. Vibe Verification Guide

路径：

```txt
docs/guides/vibe-verification-guide.md
```

职责：

- 用 agent-run verification 替代 manual-verification 表述。
- 解释人类角色和 agent 角色。
- 定义单项检查和组合检查。
- 展示 export、validation、drift check 的具体命令。

### 2. Dogfood Protocol

路径：

```txt
docs/guides/agent-dogfood-protocol.md
```

职责：

- 给未来 agent 一个可重复流程。
- 告诉 agent 如何在仓库外创建 scratch folder。
- 告诉 agent 只把生成出来的 VibeLog 记录复制到 `examples/`。
- 要求严格记录 engineering execution prompts。
- 要求最终证据报告。

### 3. 生成示例

推荐路径：

```txt
examples/reading-card-lite/
```

内容：

```txt
README.md
vibe-log.md
vibe-log.json
```

示例应该来自一个 scratch vibe 项目，例如 AI reading card tool。它应该包含真实的 idea change、human-in-the-loop 决策、execution prompt、development logs、bugfix 或 incident handling、validation design、verification evidence 和 handoff state。

不要把 scratch 项目的源码复制进仓库。

### 4. 可选完整性测试

路径：

```txt
test/vibelog-examples.test.mjs
```

职责：

- 校验 example `vibe-log.json` 可以解析。
- 用 `validateVibeLog` 校验生成示例。
- 检查 example folders 不包含 `src`、`package.json` 或 app test folders 等源码项目文件，除非用户明确批准。

如果 guide 和 example 已经足以证明流程，这项在 Slice 4 中可以是可选项。等 examples 增多后，它会更有价值。

### 5. VibeLog 更新

更新根 `vibe-log.md` 并重新生成 `vibe-log.json`，记录：

- Slice 4 设计决策。
- 精确执行提示词：`好开始slice4`。
- vibe verification 应在可行时替代 manual verification 的原则。
- review 语言规则：面向用户 review 的产物必须中英双文。
- 待写的实现计划。

## 验证模型

Slice 4 继续沿用用户的两段式测试原则，但应用到 agent dogfooding：

```txt
1. 单项检查：每个 VibeLog 能力都能独立验证。
2. 组合检查：完整 vibe 流程可以端到端跑通。
```

### 单项检查

agent 应确认生成示例包含：

- `One-Line Vibe`
- `Current Idea`
- `Idea Evolution`
- `Human-in-the-Loop`
- `Execution Prompts`
- `Development Log`
- `Bugfix / Incident Log`
- `Validation Design`
- `Verification Evidence`
- `Artifact Index`
- `Handoff State`
- `Public Summary`

### 组合检查

agent 应运行：

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test
```

预期结果：

- export 成功。
- validation 成功。
- drift check 成功。
- test suite 通过。
- example folder 只包含生成的 VibeLog 记录和 README。

## 人类 Review

人类不应该把手动检查每个字段作为第一验证方式。

人类 review 只需要回答：

- 生成的 VibeLog 是否像一个真实 vibe 过程？
- 日志是否保留了有意义的人类判断？
- 未来 agent 能否从 handoff 继续？
- prompts 是否记录得足够严格？
- agent 是否避免把 scratch source code 放进 skill repo？

## 错误处理

如果 export 失败：

- 先找出具体不支持的 Markdown pattern，再修 Markdown 结构或 exporter。
- 改 exporter 行为之前先加 regression test。

如果 validation 失败：

- 优先修生成的 VibeLog 记录。
- 只有当 validation rule 对标准过于严格时，才改 validator。

如果示例显得很假：

- 用更好的 scratch task 重新运行 dogfood 场景。
- 增加更明确的 human-in-the-loop 和 bugfix evidence。

如果源码漏进 `examples/`：

- commit 前移除。
- 只保留生成的 VibeLog 文件和 README。

## 验收标准

Slice 4 满足以下条件时可接受：

- vibe verification guide 存在。
- agent dogfood protocol 存在。
- 需要用户 review 的产物都有中文和英文版本。
- `examples/` 下存在新的生成示例。
- 示例来自 scratch vibe flow，而不是手写 static fixture。
- 示例 JSON 由 exporter 从 Markdown 生成。
- 示例通过轻量 validator。
- 完整 test suite 通过。
- 根 VibeLog 记录了 Slice 4 工作。
- 仓库保持 skill-first，不包含 scratch app source。

## 风险

- dogfood 场景可能过于 polished 和 fake。
- agent 可能为了满足字段而 overfit，而不是真实记录过程证据。
- 协议可能太长，导致未来 agent 不愿使用。
- validator 仍然太轻，无法捕捉语义缺口。

缓解方式：

- 保持场景小。
- 至少要求一次 idea change 和一次 bugfix 或 incident。
- 保持 protocol 流程化和简短。
- 后续 slice 再做完整 schema validation。

## 下一步

设计通过后，编写 Slice 4 implementation plan。实现计划应该先创建两份 guide，再运行 dogfood 场景，然后 export、validate、更新 VibeLog、验证并本地提交。
