# Live Hook 验证指南

本指南用于验证 Claude Code hook adapter 能否通过本地 Claude Code hook 配置运行，并更新一个 scratch VibeLog。

## 安全边界

- 只使用 scratch workspace。
- 只在 scratch workspace 内写入本地 `.claude/settings.json`。
- 不修改全局 Claude Code settings。
- 不 push 到 GitHub。
- 不上传项目源码。
- live Claude Code 运行使用较小的 `--max-budget-usd` 预算上限。

## 前置条件

```powershell
claude --version
node --version
```

verifier 依赖 Claude Code hooks。把它变成真实项目安装前，需要再次检查官方 hook 文档：

```txt
https://code.claude.com/docs/en/hooks
```

## Fixture 验证

先运行不调用 Claude 的本地命令链路验证：

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\claude-live-hook-test" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

如果要验证 stream-first，添加 `--event-mode stream`：

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\claude-live-hook-test" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream
```

预期结果：

- `fixture.fixturePassed` 为 `true`。
- `commandsRun` 包含 `UserPromptSubmit`、`PostToolUse` 和 `Stop`。
- scratch `vibe-log.md` 和 `vibe-log.json` 被更新。
- stream mode 下，`fixture.eventStreamExists` 为 `true`，`fixture.streamEventCount` 为 `4`，`fixture.markdownUpdatedBeforeConsume` 为 `false`。

## Runtime Preflight

每次 verifier 运行都会先输出 `preflight`，再输出 fixture / live 结果：

- `preflight.installation.installed`：Claude Code CLI 是否可用。
- `preflight.installation.version`：检测到的 Claude Code 版本。
- `preflight.auth.loggedIn`：`claude auth status --json` 是否报告已登录。
- `preflight.auth.provesModelAccess`：永远是 `false`；auth status 不等于模型调用已经跑通。
- `preflight.provesCompletedSession`：永远是 `false`；只有成功穿过 `Stop` 或 `SessionEnd` 的 live run 才能证明核心业务流程。

不要把 preflight 当作 live recording 通过。它只说明环境是否适合尝试核心业务路径。

## Live 验证

只有明确需要 live verification 时，才运行一个很小的 Claude Code session：

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\claude-live-hook-test-live" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --live --prompt "Build a tiny scratch verification note. Do not use tools." --max-budget-usd 0.05 --timeout-ms 120000
```

预期结果：

- `live.attempted` 为 `true`。
- `live.passed` 为 `true`。
- `live.coreBusiness.passed` 为 `true`。
- `hookResponses` 中包含成功的 `Stop` hook。
- scratch `vibe-log.md` 中出现 `Claude Code hook event captured`。
- stream mode 下，`live.eventStreamExists` 为 `true`，`live.streamEventCount` 大于 `0`，`live.markdownUpdatedBeforeConsume` 为 `false`。

verifier 使用 Claude Code `stream-json` 输出和 `--include-hook-events`，所以它可以直接判断 hook 生命周期，而不是从普通文本输出里猜测。

## 失败解释

- `spawn claude ENOENT`：当前进程路径找不到 Claude Code。
- `Exceeded USD budget`：当前模型 session 超过了预算上限。
- `authentication_failed`：Claude Code 已加载 settings，并且可能已经运行早期 hooks，但模型回合无法完成；`live.status` 是 `auth_failed`，`failureCategory` 是 `external_environment`，并且 `live.coreBusiness.passed` 必须保持 `false`。
- 没有 hook responses：settings 未加载、settings 校验失败，或者 hooks 被关闭。
- `UserPromptSubmit` 记录 `0 event(s)`：当 prompt 只是普通聊天、不是工程执行提示词时，这是合理结果。

## 这一点证明了什么

这个 slice 证明 adapter 可以从生成的本地 Claude Code settings 文件中运行，通过 stdin 接收 hook JSON，调用 recorder core，并更新 scratch workspace 中的 VibeLog 文件。

使用 `--event-mode stream` 时，它也证明 stream-first 路径可以先累积 events，再由 recorder 消费。完整 live pass 还需要一个能够到达 `Stop` 或 `SessionEnd` 的已认证 Claude Code session。

它不会默认把 hooks 安装到真实用户项目中。
