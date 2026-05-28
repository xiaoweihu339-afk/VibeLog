# 第二 agent 接手验证

这份指南用于测试 VibeLog 的接手包是否足够让另一个 agent 继续项目。

S37 故意保守：先增加本地确定性模拟，再使用真实第二 agent。模拟器只读取 `--brief-only` 接手包，不读取完整聊天、`vibe-log.md`、`vibe-log.json` 或 `.vibelog-events/`。

## 第一步：生成 brief-only 接手包

运行：

```powershell
node scripts\verify-handoff-continuity.mjs vibe-log.json --min-score 90 --brief-only
```

如果要重复检查，可以把输出保存到本地 scratch 文件。

## 第二步：模拟第二 agent

运行：

```powershell
node scripts\simulate-second-agent-continuation.mjs --brief handoff-brief.txt
```

模拟器会检查 brief-only 接手包是否包含：

- `Project`
- `One-line vibe`
- `Current state`
- `Next action`
- `Privacy boundary`
- `Push boundary`

它会拒绝完整 JSON 输入。这样可以保证测试诚实：模拟第二 agent 必须依赖真实第二 agent 也会收到的紧凑上下文。

## 通过标准

模拟通过需要满足：

- brief-only 接手包是纯文本，不是 JSON
- 下一步行动清楚
- 私有 VibeLog 文件或 event stream 被明确视为私有或 ignored
- push 必须有用户明确请求
- 模拟 agent 可以说出下一步，不要求用户重复项目历史

## 下一层验证

模拟通过后，再运行真实第二 agent dogfood。未来这个测试应该只给 agent brief-only 接手包和一个很小的 VibeLog skill/core 任务。

这条路径不要使用 Claude Code Desktop / DeepSeek。除非用户明确要求，否则不要 push。
