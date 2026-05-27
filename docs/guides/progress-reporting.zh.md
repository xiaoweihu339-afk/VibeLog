# 项目进度汇报机制

这份指南用于向人类汇报 VibeLog 项目的整体进度。

进度数字衡量的是长期愿景，而不是当前仓库的局部任务：

```txt
VibeHub = VibeLog 标准 + agent 工作流 + hook 自动记录 + Vibe Repo 存储 + 产品展示 + 协作/remix 社区
```

因为总目标很宏大，进度必须保守。不能因为本地文档或一个脚本完成了，就把整个平台判断为接近完成。

## 必须包含的进度快照

每次有意义的任务完成后，汇报都应该包含：

```txt
项目总进度：16 / 100
本次变化：+0
当前阶段：VibeLog 底层与验证阶段
本次完成：在 S23 VibeLog 自更新闭环后更新进度汇报基线
下一步解锁：自动或 hook-assisted 的真实工作连续记录
主要风险：手动自更新闭环已验证，但自动连续记录还没有被证明
信心：medium-high
```

## 当前基线

S23 VibeLog 自更新闭环后，当前基线是：

```txt
项目总进度：16 / 100
```

原因：

- VibeLog 的想法、标准、skill 结构、文档、示例、exporter、validator、recorder core 和项目接入 CLI 已经存在。
- Claude Code hook adapter 和项目本地 hook 验证已经存在。
- 公开仓库边界、脱敏示例、agent 模板和 clean-clone 模板接入验证已经存在。
- S22R 已经把 VibeLog 中途接入当前真实项目，并生成了本地私有、已验证的 dogfood log。
- S23 已经验证一个小型真实自更新闭环：读取本地 VibeLog，执行维护任务，更新 VibeLog，导出 JSON，并通过验证。
- VibeHub 的产品层、repository 存储模型、协作/remix 模型和公开社区仍然不存在。
- 跨 agent 环境的自动连续记录还没有被证明。

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
- 如果本地存在 `vibe-log.md`，先读取它，因为最新的私有 dogfood 状态可能比公开文档更新。

## 当前建议

在自动或 hook-assisted 记录证明 VibeLog 能够在真实工作过程中持续更新，而不是依赖 slice 结束时手动编辑之前，项目进度保持在：

```txt
项目总进度：16 / 100
```
