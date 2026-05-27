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
项目总进度：24 / 100
本次变化：+1
当前阶段：Hook / adapter 与自动过程记录
本次完成：S28 Claude runtime readiness preflight
下一步解锁：已认证环境下的 Stop / session-end live hook 验证
主要风险：preflight 可以区分安装、认证状态和 runtime auth failure，但完整 Stop / session 完成仍需要健康的已认证 Claude runtime
信心：medium-high
```

## 当前基线

S28 Claude runtime readiness preflight 后，当前基线是：

```txt
项目总进度：24 / 100
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
- VibeHub 的产品层、repository storage model、协作 / remix model、公开社区仍然不存在。
- 由于本地 Claude runtime 在模型回合完成前返回 `authentication_failed`，通过 `Stop` 或 `SessionEnd` 完整连续记录仍未被证明。

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
- 说清楚下一步解锁，而不是只说下一任务。
- 至少说明一个真实风险或缺失能力。
- 如果进度没变，要直接说明。
- 当工作只是文档或规划时，保持数字保守。
- 如果本地存在 `vibe-log.md`，先读取它，因为最新私有 dogfood 状态可能比公开文档更新。

## 当前建议

在已认证 live hook adapter 证明 VibeLog 能穿过一个完整 Claude Code session 更新之前，项目保持在：

```txt
项目总进度：24 / 100
```
