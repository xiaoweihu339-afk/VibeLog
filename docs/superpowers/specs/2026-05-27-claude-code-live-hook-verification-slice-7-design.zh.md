# Claude Code Live Hook Verification Slice 7 设计

## 目标

在不修改全局 Claude Code settings 的前提下，验证 Claude Code hook adapter 能否通过真实本地 hook 配置路径工作。

## 产品理由

Slice 6 已经用 fixture payloads 验证了 adapter。Slice 7 要检查真正重要的实践边界：本地 Claude Code settings、hook command 执行、stdin JSON、生成 Vibe Events、更新 VibeLog Markdown/JSON。

## 代码原则

实现保持简洁、安全、功能优先：

- 简洁：一个 verifier 脚本，一个生成的本地 settings 文件，不做后台服务。
- 安全：只用 scratch workspace，不改全局 settings，不推送，不上传。
- 功能：证明 hooks 可以通过 adapter/recorder 链路更新 VibeLog。

## 非目标

- 不全局安装 hooks。
- 不修改用户真实 Claude Code user settings。
- 不运行大型 Claude session。
- 不做云同步。
- 不加复杂 AI 总结。
- 不改网站。

## 架构

```txt
scratch workspace
  -> .claude/settings.json
  -> Claude Code hook command
  -> scripts/claude-code-hook-adapter.mjs
  -> Vibe Event JSON
  -> scripts/record-vibelog-event.mjs
  -> scratch vibe-log.md / vibe-log.json
```

仓库保留 verifier 和文档。scratch workspace 保存 live verification log 和本地 hook settings。

## Verifier 行为

`scripts/verify-claude-code-live-hook.mjs` 应该：

1. 创建 scratch workspace。
2. 写入最小 `vibe-log.md`。
3. 写入 `.claude/settings.json`，配置本地 hook commands。
4. 用同一条 command path 运行 fixture hook payloads。
5. 只有传入 `--live` 时才尝试运行一次真实 `claude -p` session。
6. 使用 Claude Code `stream-json` 输出和 `--include-hook-events` 确认 hook lifecycle responses。
7. 验证 `vibe-log.md` 和 `vibe-log.json` 是否更新。
8. 汇报证据，不推送、不上传。

## 真实 Session 策略

live run 必须通过 `--live` 显式开启。它应该使用极小 prompt、小预算上限、生成的 scratch settings 文件，以及 Claude Code 输出中的直接 hook-event 证据。

如果 Claude CLI 缺失、未登录，或 live run 失败，verifier 应汇报 blocker，并保留 fixture verification 证据。

## 验收标准

- verifier 存在前，测试先失败。
- 实现后 verifier 测试通过。
- fixture verification 通过生成的本地 settings 更新 scratch VibeLog。
- 只有显式传入 `--live` 才尝试 live verification。
- 根 VibeLog 记录 live verification 是否通过或被阻塞。
- 不修改全局 settings。

## 进度预期

如果 fixture verification 通过，并且 live verification 有明确尝试和证据，项目进度从 `18 / 100` 到 `20 / 100`。如果 live verification 通过，下一步可以强化真实安装指南。
