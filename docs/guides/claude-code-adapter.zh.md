# Claude Code Adapter 指南

Claude Code adapter 会把 Claude Code hook JSON input 转换成 Vibe Event JSON，然后通过 VibeLog recorder core 记录这些事件。

## 命令

只打印映射后的 events，不写文件：

```powershell
node scripts/claude-code-hook-adapter.mjs --input hook.json --print-events
```

记录到 VibeLog：

```powershell
node scripts/claude-code-hook-adapter.mjs --input hook.json --log vibe-log.md --json vibe-log.json --event-dir .vibelog-events
```

当 adapter 由 Claude Code hooks 调用时，省略 `--input`；adapter 会从 stdin 读取 hook JSON。

## 支持的 Hook Events

- `UserPromptSubmit`：把工程执行提示词记录为 `prompt_submitted`。
- `PostToolUse`：把测试命令记录为 `test_ran`；把其他 tool use 记录为 `tool_used`。
- `Stop`：记录保守的 `handoff_updated` event。

## 安全默认值

- 不上传。
- 不推送 GitHub。
- 不自动安装 hook。
- 写入 Vibe Events 前会脱敏 secret-like values。
- 第一版 adapter 会忽略普通 idea chat。

## 示例 Settings

见：

```txt
skills/vibelog/assets/claude-code-hooks.settings.example.json
```

只有在你检查并调整本地项目路径之后，才把相关命令复制到 Claude Code settings。

## 验证

运行：

```powershell
node --test test/claude-code-hook-adapter.test.mjs
node --test
```

scratch-local live 验证可以运行：

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\claude-live-hook-test-live" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --live --prompt "Reply with OK. Do not use tools." --max-budget-usd 0.05
```

详见 [Live Hook 验证指南](live-hook-verification.zh.md)。

## 当前限制

- 当前已完成 fixture verification 和 scratch-live verification，但不会默认安装到真实用户项目。
- `Stop` handoff 是保守记录，不会检查整个仓库。
- 更细腻的 idea extraction 应该等确定性的 prompt/tool/test capture 稳定之后再加。
