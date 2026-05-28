# 交接连续性

当需要检查一个 VibeLog 是否足够让另一个人或 agent 接手项目时，使用这份指南。

交接连续性比 JSON 有效性更严格。合法的 `vibe-log.json` 只能证明结构正确。交接连续性要回答的是：下一个 agent 是否可以安全判断：

- 项目是什么
- 项目现在到哪里了
- 人类做过哪些决定
- 已经有哪些验证证据
- 下一步行动是什么
- 哪些隐私、暂存、推送或 agent 环境边界不能越过

## 命令

运行：

```powershell
node scripts\verify-handoff-continuity.mjs vibe-log.json
```

命令会输出 JSON，包含：

- `passed`
- `score`
- `failures`
- `warnings`
- `checks`
- `continuationBrief`

默认最低分是 `70`。如果要更严格，可以使用 `--min-score`：

```powershell
node scripts\verify-handoff-continuity.mjs vibe-log.json --min-score 90
```

当你要给另一个 agent 准备小型接手包时，使用 `--brief-only`：

```powershell
node scripts\verify-handoff-continuity.mjs vibe-log.json --min-score 90 --brief-only
```

这只输出 continuation brief，不输出完整 JSON。它最适合粘贴给第二个 agent 作为接手上下文。

## 单项检查

verifier 会检查导出的 JSON 是否包含：

- 项目身份：`title`、`one_line_vibe`、`current_idea`
- 交接状态：`current_state`、`completed`、`pending`、`next_actions`
- 进度快照：`Project Progress`、`Next Unlock`、`Main Risk`
- human-in-the-loop / 人类决策证据
- 已通过的 verification evidence / 验证证据
- `context_for_next_agent` 中的 privacy / 隐私边界
- `context_for_next_agent` 中的 push / 推送或暂存边界

这些都是本地确定性检查，不调用外部 agent。

## 流程检查

在正常 VibeLog 工作流后使用 verifier：

```powershell
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\verify-handoff-continuity.mjs vibe-log.json
```

流程通过需要同时满足：

- Markdown 能导出 JSON。
- JSON 能通过 schema subset 校验。
- 交接连续性通过。
- `continuationBrief` 足够让下一个 agent 不读完整聊天记录也能继续。
- `--brief-only` 输出可以作为第二 agent 的接手包。

## 失败含义

交接连续性失败不代表 VibeLog 结构一定错了。它代表这个 VibeLog 还不能可靠地作为 agent 交接来源。

先在 Markdown 中补齐缺失信息，重新生成 JSON，再重新运行 verifier。

不要为了让测试通过而削弱 verifier。如果项目无法说明下一步行动、边界或验证证据，就如实报告失败。
