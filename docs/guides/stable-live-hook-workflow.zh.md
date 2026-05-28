# 稳定 live hook 工作流

这份指南说明如何在本地项目中安全使用 VibeLog 和 Claude Code live hooks。

## 边界

- 只使用项目本地 `.claude/settings.json`。
- 不修改 global Claude Code settings。
- 不触碰 Claude Code Desktop，也不触碰任何 Desktop / DeepSeek 配置。
- 不把 API key、token、密钥或其他凭证写进 VibeLog。
- 不要提交 `vibe-log.md`、`vibe-log.json`、`.vibelog-events/`、scratch 输出或私有 prompts，除非项目所有者明确决定公开。
- `bypassPermissions` 只用于 scratch 或完全可信项目。真实项目默认使用 Claude Code 正常权限流程。

## 1. 初始化

创建项目本地 VibeLog 文件：

```powershell
node scripts\vibelog-project.mjs init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
```

预期结果：

- `vibe-log.md` 存在。
- `vibe-log.json` 存在。
- `node scripts\vibelog-project.mjs verify --project "C:\path\to\project"` 可以检查项目。

## 2. 预览 hooks

先预览 direct hooks：

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

预览 stream-first hooks：

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream
```

预期结果：

- `dryRun` 是 `true`。
- `wrote` 是 `false`。
- 生成的 hooks 是 project-local。
- 无关 Claude Code settings 会被保留。

## 3. 启用 hooks

确认预览后，启用 stream-first hooks：

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --write
```

预期 hook events：

```txt
UserPromptSubmit -> prompt_submitted
PostToolUse      -> tool_used 或 test_ran
Stop             -> handoff_updated
```

Stream-first 模式会把 JSONL events 追加到 `.vibelog-events/session.jsonl`。这样项目可以在写入 Markdown 和 JSON 前先检查或脱敏。

## 4. 运行 Claude Code

在项目中正常运行 Claude Code CLI。真实项目默认保留正常权限流程。

`bypassPermissions` 只用于 scratch 验证，例如：

```powershell
node scripts\verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\s30-tool-use-live" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --live --require-tool-use --require-test-run --permission-mode bypassPermissions --prompt "Use tools in this scratch workspace only. Create a tiny node:test file and run node --test." --max-budget-usd 0.75 --timeout-ms 240000
```

`--require-tool-use` 证明真实 `PostToolUse` hook 被触发。`--require-test-run` 证明 event stream 中包含 `test_ran` Vibe Event。

如果要做 less-scripted dogfood 验证，可以启用更完整的质量门：

```powershell
node scripts\verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\s33-less-scripted" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --live --require-tool-use --require-test-run --require-less-scripted-dogfood --min-tool-use-count 4 --min-test-run-count 1 --min-tool-used-event-count 3 --min-changed-file-count 2 --permission-mode bypassPermissions --prompt "Build a tiny Node ESM CSV bill summary CLI. Work naturally: create source, tests, sample data, run tests, fix failures, and hand off." --max-budget-usd 1.50 --timeout-ms 360000
```

`--require-less-scripted-dogfood` 会要求事件流同时包含提示词、工具工作、文件变更、至少一次通过的测试、以及 handoff。

如果要验证 human-in-the-loop 决策记录，加入显式决策块并要求决策证据：

```powershell
$prompt = @'
Build a small Node ESM Markdown idea board CLI in this empty project.
Human-in-the-loop decision for this dogfood:
VIBELOG_DECISION
Decision Type: storage
Human Input: Store MVP data in a single ideas.json file, not per-idea folders.
Agent Proposal: A per-idea directory structure would make future branch/remix workflows easier.
Final Decision: Use one ideas.json file for this slice, and document that a directory layout can come later.
Why It Mattered: This keeps the live dogfood small enough to verify while preserving the future Vibe Repo migration path.
Impact: Implement commands around ideas.json, keep tests focused on the single-file store, and mention the migration path in README.
END_VIBELOG_DECISION
'@
node scripts\verify-claude-code-live-hook.mjs --workspace "C:\path\to\scratch-root\s34-human-decision" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --event-mode stream --live --require-tool-use --require-test-run --require-less-scripted-dogfood --require-human-decision --min-tool-use-count 5 --min-test-run-count 1 --min-tool-used-event-count 4 --min-changed-file-count 3 --permission-mode bypassPermissions --prompt $prompt --max-budget-usd 1.80 --timeout-ms 420000
```

`--require-human-decision` 证明事件流中至少包含一个 `decision_made` event。`storage` 这类自然决策标签会被归一化为 VibeLog schema 支持的决策类型。

## 5. 消费 stream events

准备更新日志时，消费 event stream：

```powershell
node scripts\record-vibelog-event.mjs --events "C:\path\to\project\.vibelog-events\session.jsonl" --log "C:\path\to\project\vibe-log.md" --json "C:\path\to\project\vibe-log.json"
```

然后 verify：

```powershell
node scripts\vibelog-project.mjs verify --project "C:\path\to\project"
node scripts\validate-vibelog.mjs "C:\path\to\project\vibe-log.json"
```

预期证据：

- `Execution Prompts` 包含来自 `UserPromptSubmit` 的工程提示词。
- `Human-in-the-Loop` 在提供决策块时包含 `decision_made`。
- `Development Log` 包含 `tool_used`。
- `Verification Evidence` 包含 `test_ran`。
- `Handoff State` 包含 `handoff_updated`。

## 6. 关闭或回滚

关闭 VibeLog hooks：

```powershell
node scripts\vibelog-project.mjs disable-hooks --project "C:\path\to\project"
```

rollback 检查表：

- 确认 VibeLog hook commands 已从 project-local `.claude/settings.json` 移除。
- 保留无关 Claude Code project settings。
- 只有当所有者不再需要私有 event stream 时，才删除 `.vibelog-events/session.jsonl`。
- 先检查 `vibe-log.md`，再重新生成 JSON。

## 通过标准

工作流健康时应该满足：

- hook setup 是 project-local。
- 所有者在 `--write` 前已审阅。
- `.vibelog-events/` 保持 private / 私有，除非明确公开。
- `verify` 通过。
- 真实 live check 可以要求 `--require-tool-use` 和 `--require-test-run`，并且不依赖 fixture events。
- less-scripted live check 可以要求 `--require-less-scripted-dogfood`，并在小型真实任务上通过。
- human-in-the-loop live check 可以要求 `--require-human-decision`，并产出 schema-valid 的 `decision_made` 证据。
