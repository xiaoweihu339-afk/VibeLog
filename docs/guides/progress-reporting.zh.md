# 项目进度汇报机制

这份指南用于向人类汇报 VibeLog 项目的整体进度。

进度数字衡量的是长期愿景，而不是当前仓库局部任务：

```txt
VibeHub = VibeLog 标准 + agent 工作流 + hook 自动记录 + Vibe Repo 存储 + 产品展示 + 协作/remix 社区
```

因为总目标很宏大，进度必须保守。不能因为本地文档或一个脚本完成了，就把整个平台判断为接近完成。

## 必须包含的进度快照

每次任务完成后的汇报都应该包含：

```txt
项目总进度：10 / 100
本次变化：+0
当前阶段：VibeLog 底层与验证阶段
本次完成：加入保守项目进度汇报机制
下一步解锁：Slice 4 implementation plan
主要风险：agent dogfood verification 还没有端到端跑通
信心：medium
```

## 当前基线

当前基线：

```txt
项目总进度：10 / 100
```

原因：

- VibeLog 的想法、标准、skill 结构、文档、示例、exporter 和轻量 validator 已经存在。
- 项目还没有完成 agent dogfood verification。
- hook adapters 还没有实现。
- VibeHub 的产品层、repository 存储模型、协作/remix 模型和公开社区还不存在。

## 进度区间

使用这些区间让进度汇报保持踏实：

```txt
0-10：概念、VibeLog 标准、可复用 skill 基础、早期 examples
11-20：agent dogfood verification 和可重复 vibe verification protocol
21-35：hook/adapters，以及跨 agent 环境的自动过程记录
36-55：VibeHub 或 VibeLog Studio MVP，本地优先的 Vibe Repo 管理
56-75：Git-backed 代码/产物存储、协作、branch/remix 工作流
76-90：公开发布、开源包装、社区复用、贡献流程
91-100：成熟生态，拥有稳定标准、集成和活跃社区
```

## 变化规则

- `+0`：文档、措辞或规则澄清，让项目更清楚，但没有解锁新能力。
- `+1`：一个小的、已验证的能力或指南，让下一步更容易。
- `+2`：一个完整 slice 已实现、验证并提交。
- `+3` 或更多：只用于重大里程碑，例如可工作的 hook adapter、端到端 VibeHub MVP slice 或公开发布。

不要因为改动文件很多就提高进度。只有长期系统能力真的增强时才提高。

## 汇报规则

- 必须写出分母：`/ 100`。
- 用自然语言说明当前阶段。
- 说明“下一步解锁”，而不只是下一个任务。
- 至少说明一个真实风险或缺失能力。
- 如果进度没有变化，要直接说明。
- 如果工作只是改进文档或计划，进度要保持保守。

## 当前建议

在 Slice 4 被实现，并且新的 agent-generated example 通过 export、validation、drift check 和 tests 之前，项目进度保持：

```txt
项目总进度：10 / 100
```
