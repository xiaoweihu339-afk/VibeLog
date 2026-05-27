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

只追加到本地 event stream，暂不更新 VibeLog：

```powershell
node scripts/claude-code-hook-adapter.mjs --input hook.json --event-stream .vibelog-events/session.jsonl
```

然后用 recorder core 消费这个 stream：

```powershell
node scripts/record-vibelog-event.mjs --events .vibelog-events/session.jsonl --log vibe-log.md --json vibe-log.json
```

当 adapter 由 Claude Code hooks 调用时，省略 `--input`；adapter 会从 stdin 读取 hook JSON。

小型本地实验可以使用 direct record mode。多个 hook invocation 需要先 review、批处理或 replay 时，优先使用 event stream mode。

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
- Event stream mode 只写 JSONL；在 recorder 消费 stream 之前，不会修改 `vibe-log.md` 或 `vibe-log.json`。

## 示例 Settings

见：

```txt
skills/vibelog/assets/claude-code-hooks.settings.example.json
```

只有在你检查并调整本地项目路径之后，才把相关命令复制到 Claude Code settings。

更安全的项目级设置方式是先使用默认 dry-run 的 generator：

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

预览 stream-first 项目 hooks：

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream
```

只有在 review 生成的 settings 之后，才添加 `--write`。

## 验证

运行：

```powershell
node --test test/claude-code-hook-adapter.test.mjs
node --test
```

focused adapter test 覆盖：

- 单个 hook 到 event 的映射
- direct record mode
- event stream append mode
- 多个 hook input 累积到同一个 JSONL stream，再由 recorder 消费

scratch-local live 验证可以运行：

```powershell
node scripts/verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\claude-live-hook-test-live" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --live --prompt "Reply with OK. Do not use tools." --max-budget-usd 0.05
```

详见 [Live Hook 验证指南](live-hook-verification.zh.md)。

项目级设置详见 [Claude Code Opt-In 安装指南](claude-code-opt-in-install.zh.md)。

## 当前限制

- 当前已完成 fixture verification 和 scratch-live verification，但不会默认安装到真实用户项目。
- Event stream mode 已完成 fixture verification；live hook verification 仍使用已 review 的项目本地命令路径。如果未来 stream-first hooks 成为默认，还需要单独更新 live verification。
- `Stop` handoff 是保守记录，不会检查整个仓库。
- 更细腻的 idea extraction 应该等确定性的 prompt/tool/test capture 稳定之后再加。
