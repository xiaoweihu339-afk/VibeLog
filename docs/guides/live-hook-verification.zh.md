# Live Hook 验证指南

本指南用于验证 Claude Code hook adapter 能否通过本地 Claude Code hook 配置运行，并更新一个 scratch VibeLog。

## 安全边界

- 只使用 scratch workspace。
- 只在 scratch workspace 内写入本地 `.claude/settings.json`。
- 不修改全局 Claude Code settings。
- 不推送 GitHub。
- 不上传项目源码。
- live Claude Code 运行使用较小的 `--max-budget-usd` 预算上限。

## 前置条件

```powershell
claude --version
node --version
```

verifier 依赖 Claude Code hooks。把它变成真实项目安装前，需要再次检查官方 hook 文档：

```txt
https://docs.anthropic.com/en/docs/claude-code/hooks
```

## Fixture 验证

先运行不调用 Claude 的本地命令链路验证：

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\claude-live-hook-test" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

预期结果：

- `fixture.fixturePassed` 为 `true`。
- `commandsRun` 包含 `UserPromptSubmit`、`PostToolUse` 和 `Stop`。
- scratch `vibe-log.md` 和 `vibe-log.json` 被更新。

## Live 验证

只有明确需要 live verification 时，才运行一个很小的 Claude Code session：

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\claude-live-hook-test-live" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --live --prompt "Reply with OK. Do not use tools." --max-budget-usd 0.05
```

预期结果：

- `live.attempted` 为 `true`。
- `live.passed` 为 `true`。
- `hookResponses` 中包含成功的 `Stop` hook。
- scratch `vibe-log.md` 中出现 `Claude Code hook event captured`。

verifier 使用 Claude Code `stream-json` 输出和 `--include-hook-events`，所以它可以直接判断 hook 生命周期，而不是从普通文本输出里猜测。

## 失败解释

- `spawn claude ENOENT`：当前进程路径找不到 Claude Code。
- `Exceeded USD budget`：当前模型/session 超过了预算上限。
- 没有 hook responses：settings 未加载、settings 校验失败，或者 hooks 被关闭。
- `UserPromptSubmit` 记录 `0 event(s)`：当 prompt 只是普通聊天、不是工程执行提示词时，这是合理结果。

## 这一步证明了什么

这个 slice 证明 adapter 可以从生成的本地 Claude Code settings 文件中运行，通过 stdin 接收 hook JSON，调用 recorder core，并更新 scratch workspace 中的 VibeLog 文件。

它还不会默认把 hooks 安装到真实用户项目中。
