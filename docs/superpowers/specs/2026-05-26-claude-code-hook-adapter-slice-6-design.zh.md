# Claude Code Hook Adapter Slice 6 设计

## 目标

构建 VibeLog 的第一个真实生命周期 adapter：把 Claude Code hook JSON input 转换成 Vibe Event JSON，并通过已有 recorder core 应用到 VibeLog。

## 产品理由

Slice 5 已经创建了 recorder core，但 event 仍然来自测试或手动 fixture。Slice 6 把这个 core 接到真实 agent 生命周期形态上，证明 VibeLog 可以从本地工具走向自动工作流记录。

## 来源对齐

本设计遵循当前 Claude Code hooks 模型：hook command 通过 stdin 接收 JSON input，hook event 包含 `UserPromptSubmit`、`PostToolUse`、`Stop` 等生命周期名称。由于 hook payload 可能演化，第一版映射保持保守。

## 非目标

- 不安装 hook 到用户全局 Claude Code settings。
- 不推送 GitHub。
- 不上传 VibeLog。
- 不在当前环境运行真实 Claude Code session。
- 不用 LLM 总结任意聊天。
- 不记录 secrets、tokens、API keys、private keys 或 credentials。

## 架构

```txt
Claude Code hook JSON stdin
  -> scripts/claude-code-hook-adapter.mjs
  -> Vibe Event JSON
  -> scripts/record-vibelog-event.mjs
  -> vibe-log.md
  -> vibe-log.json
```

adapter 有两种模式：

- `--print-events`：把 hook JSON 转换成 Vibe Event JSON 并打印，不修改文件。
- 默认记录模式：转换 hook JSON，写临时 event 文件，调用 recorder core，并重新生成 JSON。

## Event 映射

### UserPromptSubmit

如果 prompt 看起来是工程执行提示词，发出 `prompt_submitted`。

工程提示词包括 build、edit、debug、test、refactor、docs、deploy、inspect、run command、implementation plan 或执行批准类语言。

普通 idea chat 在 Slice 6 中先忽略。后续 slice 可以加入更丰富的 idea-change extraction。

### PostToolUse

如果 tool 类似 Bash 或命令执行器，并且 command 看起来像测试命令，发出 `test_ran`。

其他情况发出 `tool_used`，记录 tool name、文件变更线索、response summary 和 verification status。

### Stop

发出 `handoff_updated`，基于 `last_assistant_message` 和现有 project state 生成保守 turn summary。第一版目标是可用 handoff，不假装知道所有 completed work。

## 隐私和脱敏

写入 event 前，脱敏常见 secret-like values：

- API keys
- bearer tokens
- private key blocks
- password assignments
- token assignments

如果 prompt text 被脱敏，`recording_mode` 设为 `redacted`；否则使用 `exact`。

## 测试

测试使用 fixture hook payloads 和临时 VibeLogs，覆盖：

- UserPromptSubmit 工程提示词转换
- 非工程提示词忽略
- PostToolUse test command 转换
- PostToolUse edit/write 转换
- Stop handoff 转换
- CLI `--print-events`
- CLI record mode 更新 Markdown 和 JSON
- 脱敏行为

## 验收标准

- adapter 存在前，adapter-specific tests 先失败。
- 实现后 adapter tests 通过。
- 仓库全量测试通过。
- 根 VibeLog 记录 Slice 6。
- 双语 guide 和 report 存在。
- 不执行真实 hook 安装。

## 进度预期

如果通过 Claude hook fixture 模拟完成并验证，长期项目进度从 `15 / 100` 推进到 `18 / 100`。
