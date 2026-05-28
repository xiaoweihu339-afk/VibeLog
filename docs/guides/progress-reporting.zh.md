# 项目进度汇报

当需要向人类汇报 VibeLog 项目进度时，使用这份指南。

进度数字以长期愿景为分母：

```txt
VibeHub = VibeLog 标准 + agent 工作流 + hook 自动化 + Vibe Repo 存储 + 产品展示 + 协作 / remix 社区
```

因为总目标很大，进度必须保守。不要把本地文档或一个脚本的完成误判成整个平台已经接近完成。

## 必须包含的快照

每个有意义任务完成后的报告都应该包含：

```txt
项目总进度：36 / 100
本次变化：+0
当前阶段：VibeHub 产品层之前的公开 skill 稳定化
本次完成：S41 核心 doctrine 校准
下一步解锁：人类审查后 commit / push VibeLog skill 变化，或开始第一个面向产品的 VibeHub / VibeLog Studio MVP slice
主要风险：VibeLog 核心更清晰且已有测试护栏，但 VibeHub repository storage、协作 / remix、Git-backed code / artifact storage 仍未构建
信心：high
```

## 当前基线

S41 核心 doctrine 校准后，当前基线是：

```txt
项目总进度：36 / 100
```

原因：

- VibeLog 的想法、标准、skill 结构、文档、示例、exporter、validator、recorder core 和项目采用 CLI 已经存在。
- Claude Code hook adapter 和项目本地 hook 验证已经存在。
- 公共仓库边界、脱敏示例、agent templates、clean-clone template adoption verification 已经存在。
- S22R 已经把 VibeLog 中途插入当前真实项目，并生成了私有、可验证的 dogfood 日志。
- S23 已经验证小型真实自更新循环：读取本地 VibeLog、执行维护任务、更新 VibeLog、导出 JSON 并验证。
- S24 已经验证本地 event stream 循环：读取有序 events、更新 Markdown、追加进度、导出 JSON，并且不依赖手写 Markdown。
- S25 已经验证 Claude Code adapter 可以把多次 hook event 追加到同一个 JSONL stream，再由 recorder 消费。
- S26 已经验证项目级 opt-in hook settings 可以使用 stream-first 命令，累积 hook events，再通过 recorder 更新 VibeLog。
- S27 已经验证本机安装的 Claude Code runtime 可以加载 stream-first scratch settings，触发 `UserPromptSubmit`，并向 `.vibelog-events/session.jsonl` 追加真实 runtime event。
- S28 增加了 preflight / status 层，可以区分 Claude 安装状态、报告的 auth 状态、外部 runtime auth failure、partial hook evidence，以及核心业务是否真正通过。
- S29 已经证明已认证、付费的 Claude Code CLI session 可以跑到 `Stop`，追加 live hook events，并验证生成的 VibeLog 输出。
- S30 已经证明 live Claude Code CLI tool-use session 可以写入 scratch 测试文件、运行 `node --test`、捕获 `tool_used` 和 `test_ran` events，并验证生成的 VibeLog 输出。
- S31 已经把已证明的 live hook 路径包装成稳定用户工作流，覆盖 project-local setup、stream 消费、验证、disable、rollback、隐私，以及 Desktop / DeepSeek 边界。
- S32 已经证明更长的多轮 live dogfood 流程：失败测试被记录，随后实现把它恢复为绿色，后续测试扩展继续保持绿色，生成的 VibeLog JSON 通过校验。
- S32 还修复了 dogfood 中发现的两个记录质量问题：`Stop` 中的失败测试摘要可以保留为低置信度推断测试证据，空的 `files_changed` 数组在 Markdown -> JSON 导出后仍保持数组。
- S33 已经证明更少脚本约束的 live dogfood 流程：agent 在小型 CSV 账单汇总 CLI 中自然选择文件和测试，VibeLog 捕获了提示词、工具工作、文件变更、测试和 handoff，并且 scratch VibeLog JSON 通过校验。
- S33 增加了可复用的 less-scripted dogfood 质量门，并修复了 `node summary.test.mjs` 这类自然 Node 测试命令的识别，使其记录为 `test_ran` event。
- S34 已经证明 human-in-the-loop live dogfood 流程：提示词携带显式人工决策块，live event stream 捕获 `decision_made`，scratch 项目测试通过，生成的 VibeLog JSON 通过校验。
- S34 还修复了 dogfood 中发现的 schema 质量问题：`storage` 这类自然决策标签会归一化为 `architecture` 这类 VibeLog schema 支持的决策类型。
- S35 增加了确定性的交接连续性 verifier，用来检查导出的 VibeLog JSON 是否包含足够的项目身份、handoff state、进度快照、人类决策证据、验证证据、隐私边界和推送边界，让下一个 agent 可以继续。
- S36 增加了 `--brief-only` 接手包输出，让 verifier 可以生成紧凑的 continuation brief，给第二 agent 使用，而不暴露完整 JSON 结果或完整聊天记录。
- S37 增加了确定性的第二 agent continuation 模拟器，它只消费 brief-only 接手包，拒绝完整 JSON 输入，检查隐私和 push 边界，并选择下一步行动。
- S38 运行了不继承父会话历史的真实第二 agent dogfood，并增加了 JSON 报告验证器，证明真实 agent 可以理解 brief、遵守隐私和 push 边界，并选择基于 brief 的下一步，且不修改文件。
- S39 让真实第二 agent 只靠 brief-only 接手包完成了一个极小实现任务：加固真实第二 agent 报告验证器，禁止报告一边声明 `can_continue=true` 一边仍列出 `questions_or_blockers`。
- S40 增加了可重复的 public skill readiness gate，用来在任何人类批准 push 前检查隐私边界、package entrypoints、公开文档、tracked text 和 release-bundle inclusion。
- S41 把文档重新校准到 VibeLog 的核心 doctrine：VibeLog 是 vibe coding 过程记忆标准，不是 GitHub push 工具；public readiness 只是分发安全闸门。
- VibeHub 的产品层、repository storage model、协作 / remix model、公开社区仍然不存在。
- Live hook 自动过程记录已经在小型单轮、多轮、less-scripted 和受控人工决策 scratch session 中被证明，交接质量已经可以本地测量，紧凑的第二 agent 接手包已经存在，本地第二 agent 模拟和真实第二 agent 理解都能运行，真实第二 agent 也已完成一个极小、已验证的实现任务，public skill readiness 也可以本地测量。但更大的第二 agent 实现接力、长时间生产使用、Vibe Repo 存储、协作 / remix 和 Git-backed code / artifact storage 仍未证明。

## 进度区间

用这些区间保持汇报克制：

```txt
0-10: 概念、VibeLog 标准、可复用 skill 基础、早期示例
11-20: agent dogfood 验证与可重复的 vibe 验证协议
21-35: Hook / adapter 与跨 agent 环境的自动过程记录
36-55: VibeHub 或 VibeLog Studio MVP，具备 local-first Vibe Repo 管理
56-75: Git-backed code / artifact storage、协作、branch / remix 工作流
76-90: 公开发布、开源包装、社区复用、贡献流程
91-100: 成熟生态，具备可靠标准、集成和活跃社区
```

## 变化规则

- `+0`：文档、措辞或规则澄清，提升清晰度但不解锁新能力。
- `+1`：一个小的、已验证能力或指南，让下一步更容易。
- `+2`：完整 slice 已实现、验证并提交。
- `+3` 或更多：只用于重大里程碑，例如可工作的 hook adapter、端到端 VibeHub MVP slice、公开 release。

不要因为改了很多文件就提高进度。只有长期系统能力真的变强时才提高。

## 汇报规则

- 一定写分母：`/ 100`。
- 用普通语言说明当前阶段。
- 说清楚下一步解锁，而不是只说下一件任务。
- 至少说明一个真实风险或缺失能力。
- 如果进度没有变化，要直接说明。
- 当工作只是文档或规划时，保持数字保守。
- 如果本地存在 `vibe-log.md`，先读取它，因为最新私有 dogfood 状态可能比公开文档更新。

## 当前建议

在 S41 核心 doctrine 校准后，项目保持在：

```txt
项目总进度：36 / 100
```
