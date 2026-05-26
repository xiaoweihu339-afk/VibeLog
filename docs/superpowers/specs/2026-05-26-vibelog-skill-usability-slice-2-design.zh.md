# VibeLog Skill Usability Slice 2 设计

## 目的

Slice 2 的目标是在继续任何网站或应用源码工作之前，让 VibeLog 更容易使用、测试和复用。

这个仓库已经被修正回 skill-first 形态。这个 slice 建立在这次修正之上，为现有 skill 补上缺失的可用性层：

- 如何在一个项目里开始使用 VibeLog
- 如何手动测试这个 skill 是否有效
- 如何运行一个真实感足够的示例场景
- 如何判断一个 VibeLog 对人类和 agent 是否有用
- agent 在正常 vibe coding 过程中应该如何更新日志

这不是 VibeHub 网站 slice，也不是 VibeLog Studio 应用 slice。

## 背景

VibeLog 的核心押注是：

```txt
User says naturally, agent records structurally.
用户自然表达，agent 结构化记录。
```

当前仓库已经包含：

- `skills/vibelog/SKILL.md`
- `skills/vibelog/assets/vibe-log-template.md`
- `skills/vibelog/assets/vibe-log.schema.json`
- `skills/vibelog/references/vibelog-format.md`
- `skills/vibelog/references/claude-code-hooks-adapter.md`
- `examples/vibelog-studio/`
- 根目录 `vibe-log.md` 和 `vibe-log.json`

目前仍然薄弱的是首次用户路径。用户可以阅读 README，但还没有一个清晰的端到端手动测试，用来证明这个 skill 可以在没有网站的情况下创建、更新、验证和交接一个 VibeLog。

## 目标

1. 让没有真实活跃项目的用户也能测试这个 skill。
2. 让未来需要持续更新 VibeLog 的 agent 能理解这个 skill。
3. 定义一个小型手动测试流程，同时覆盖独立 section 和组合工作流。
4. 保持仓库 skill-first，避免加入应用源码。
5. 为后续自动化 adapter 打基础，尤其是 Claude Code hooks 和未来 Codex 兼容工作流。

## 非目标

- 不在这个仓库里重建 VibeLog Studio 源码。
- 不实现网站、dashboard 或本地 web app。
- 不增加 cloud sync、账号、公开页面或 marketplace 功能。
- 不在这个 slice 里实现确定性的 Markdown-to-JSON exporter。
- 没有用户明确批准，不发布、不 push。

## 考虑过的方案

### 方案 A：只扩展 README Quickstart

在 README 里增加一个更长的说明区，把所有指引都放进去。

取舍：简单，但 README 会变得过大，后续不好维护。

### 方案 B：Skill Usability Pack

在 `docs/guides/` 下增加聚焦的 guide 文档，然后从 README 和 skill reference 里链接过去。

取舍：文件更多，但每个文件都有单一目的，也可以独立测试。

### 方案 C：先做工具

先做 CLI 或 exporter，让用户可以运行命令。

取舍：之后会有用，但现在过早。流程标准和手动路径需要先被证明，再自动化它们。

## 推荐方案

采用方案 B。

Slice 2 应该围绕 skill 增加一小组文档和测试包，而不是代码工具。这样既能保持仓库可复用，也能让人类和 agent 在项目成长为自动化或网站功能之前，有一个具体方法证明这个 skill 有效。

## 交付物

### 1. Quickstart Guide

路径：

```txt
docs/guides/quickstart.md
```

目的：

帮助新用户安装或调用这个 skill，并创建自己的第一个 VibeLog。

必须覆盖：

- VibeLog 是什么
- 什么时候使用它
- 如何在新项目中开始
- 如何在已有项目中开始
- 应该出现哪些文件
- 一次好的首次更新是什么样子
- Markdown 和 JSON 的关系
- 默认隐私设置

### 2. Manual Test Guide

路径：

```txt
docs/guides/manual-test-guide.md
```

目的：

让用户即使没有一个未完成的真实项目，也能测试 VibeLog。

必须覆盖：

- 测试准备
- 一个小型假项目想法
- 预期的 agent 行为
- 独立 section 检查
- 组合工作流检查
- 预期通过/失败标准

这个 guide 必须遵循用户的测试原则：

```txt
每个独立部分必须能单独跑通。
组合起来也必须能端到端跑通。
两者都完成测试后，这个 slice 才能通过。
```

### 3. Example Scenario

路径：

```txt
docs/guides/example-scenario.md
```

目的：

提供一个可复用的假 vibe 项目，用来测试这个 skill。

推荐场景：

```txt
一个 AI 阅读卡片工具，把文章笔记转成可复用的学习卡片。
```

选择这个场景的原因：

- 足够小，适合手动测试
- 有清晰的一句话想法
- 支持想法变化
- 支持 human-in-the-loop 决策
- 可以包含执行提示词
- 可以包含实现状态和验证设计
- 不需要应用源码

### 4. Validation Checklist

路径：

```txt
docs/guides/validation-checklist.md
```

目的：

定义如何判断一个生成或更新后的 VibeLog 是否有用。

必须包含以下检查：

- 一句话 vibe 是否清楚
- 当前想法是否是最新的
- 想法演化历史是否保留
- human-in-the-loop 记录是否存在
- 执行提示词 ledger 是否完整
- 实现状态是否清楚
- 验证设计是否存在
- 验证证据是否记录
- handoff state 是否足够接手
- Markdown 是否适合人读
- JSON 是否能解析
- 隐私和可见性默认值是否安全

### 5. Agent Usage Reference

路径：

```txt
skills/vibelog/references/agent-usage-guide.md
```

目的：

给 agent 一份简洁的操作指南，用于真实 session 中使用 VibeLog。

必须覆盖：

- 什么时候调用这个 skill
- 如何分类事件
- 哪些内容必须精确记录
- 哪些内容应该总结
- 如何更新 handoff state
- 如何避免把聊天记录整段倒进去
- 如何避免暴露 secrets
- 如何在重构历史时处理不确定性

## 文档链接

更新 `README.md`，让用户能找到这些新 guide。

推荐结构：

```txt
Quick Start -> docs/guides/quickstart.md
Manual Testing -> docs/guides/manual-test-guide.md
Example Scenario -> docs/guides/example-scenario.md
Validation Checklist -> docs/guides/validation-checklist.md
Agent Usage -> skills/vibelog/references/agent-usage-guide.md
```

只有在需要引用新的 agent usage guide 时，才更新 `skills/vibelog/SKILL.md`。避免把整份 guide 重复写进 skill 文件。

## 数据流

手动用户路径：

```txt
用户阅读 quickstart
-> 请求 agent 使用 VibeLog
-> agent 创建或更新 vibe-log.md
-> 用户要求导出或准备上传时，agent 刷新 vibe-log.json
-> 用户运行手动 checklist
-> 另一个 agent 可以读取日志并继续项目
```

基于 guide 的测试路径：

```txt
阅读 example scenario
-> 创建 scratch VibeLog
-> 添加想法变化
-> 添加 human-in-the-loop 决策
-> 添加执行提示词
-> 添加开发日志或 bugfix 日志
-> 添加验证设计
-> 添加验证证据
-> 更新 handoff state
-> 解析 JSON
-> 用 validation checklist 复查
```

## 错误处理与隐私

这些 guide 应明确以下默认规则：

- 项目 visibility 从 `private` 开始
- code visibility 从 `hidden` 开始
- prompt visibility 从 `summary` 开始
- 除非包含敏感内容，执行提示词默认在本地精确记录
- secrets 和私有凭证必须被 redacted
- 不确定的重构历史必须标注 source 和 confidence
- JSON 语法通过不等于完整语义验证通过

## 测试设计

### 独立检查

每份 guide 都应该能独立发挥作用：

- README 链接指向真实存在的文件。
- Quickstart 不依赖产品战略文档也能被跟着执行。
- Manual test guide 有具体步骤和预期结果。
- Example scenario 有足够信息创建一个 VibeLog。
- Validation checklist 可以应用到任意 VibeLog。
- Agent usage guide 给出清晰的事件分类规则。

### 组合工作流检查

Slice 2 的集成测试是：

1. 使用 quickstart，从 example scenario 开始一个 scratch VibeLog。
2. 按 manual test guide 添加结构化更新。
3. 用 validation checklist 检查生成的 Markdown。
4. 用 Node.js 解析生成的 JSON。
5. 像一个新 agent 接手一样阅读 handoff state。

只有当各个 guide 本身连贯，并且组合路径能产出一个人类和未来 agent 都能理解的 VibeLog 时，这个 slice 才算通过。

## 验收标准

- `docs/guides/quickstart.md` 存在，并解释首次使用路径。
- `docs/guides/manual-test-guide.md` 存在，并包含独立测试和组合测试。
- `docs/guides/example-scenario.md` 存在，并提供一个真实感足够的假项目。
- `docs/guides/validation-checklist.md` 存在，并可作为 review checklist 使用。
- `skills/vibelog/references/agent-usage-guide.md` 存在，并给出 agent-facing 规则。
- README 链接到新 guide。
- 根 VibeLog 记录 Slice 2 设计工作和下一步。
- `vibe-log.json` 能解析。
- `skills/vibelog/assets/vibe-log.schema.json` 能解析。
- 不加入应用源码。
- 没有明确用户批准，不 push 到 GitHub。

## 风险

### 风险：文档过多

缓解：

每份 guide 保持短小、面向具体任务。避免重复 `vibelog-format.md` 里已有的长 schema 细节。

### 风险：手动测试感觉太假

缓解：

使用一个仍然包含真实 vibe coding 事件的假项目：想法变化、人类决策、执行提示词、实现状态、验证和 handoff。

### 风险：Agent 指令重复

缓解：

把规范性规则保留在 `skills/vibelog/SKILL.md`，新的 agent usage guide 只作为操作指南。

### 风险：用户把 VibeLog 误解成网站

缓解：

guide 中要反复说明：VibeLog 先在本地工作，VibeHub 是未来的上传/协作层。

## Slice 2 已解决的开放问题

- 这个 slice 要加 app code 吗？不加。
- 这个 slice 要加 CLI tooling 吗？不加。
- 这个 slice 要包含一个假测试项目吗？要，以 scenario 和生成日志流程的形式存在，不包含源码。
- 这个 slice 要本地 commit 吗？用户批准本地工作并完成验证后，可以。
- 这个 slice 要 push 吗？不 push，除非用户单独明确要求。

## 这个 Spec 之后的下一步

如果用户批准这个设计，就为 Slice 2 创建 implementation plan，然后带验证地实现这组 guide pack。
