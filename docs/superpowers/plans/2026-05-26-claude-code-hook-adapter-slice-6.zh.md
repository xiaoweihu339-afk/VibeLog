# Claude Code Hook Adapter Slice 6 实施计划

> **给 agentic workers：** 必须按任务执行本计划。推荐使用 `superpowers:subagent-driven-development`，也可以使用 `superpowers:executing-plans`。步骤使用 checkbox (`- [ ]`) 方便跟踪。

**目标：** 构建本地 Claude Code hook adapter，把 hook JSON input 映射成 Vibe Event JSON，并通过 recorder core 记录这些事件。

**架构：** 新增 `scripts/claude-code-hook-adapter.mjs`，作为小型 ESM CLI/library。它从 stdin 或 `--input` 读取 hook JSON，把 `UserPromptSubmit`、`PostToolUse`、`Stop` 映射到 Vibe Events，脱敏 secret-like 文本，并选择打印 events 或通过 `scripts/record-vibelog-event.mjs` 记录。

**技术栈：** Node.js ESM、内置 `node:test`、现有 `record-vibelog-event.mjs`、Markdown 文档。

---

## 文件结构

- 新建：`scripts/claude-code-hook-adapter.mjs`
- 新建：`test/claude-code-hook-adapter.test.mjs`
- 新建：`docs/guides/claude-code-adapter.md`
- 新建：`docs/guides/claude-code-adapter.zh.md`
- 新建：`skills/vibelog/assets/claude-code-hooks.settings.example.json`
- 修改：`skills/vibelog/references/claude-code-hooks-adapter.md`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`
- 新建：`docs/reports/slice-6-claude-code-adapter-report.md`
- 新建：`docs/reports/slice-6-claude-code-adapter-report.zh.md`

## Task 1：红灯测试

- [ ] 创建 `test/claude-code-hook-adapter.test.mjs`。
- [ ] 添加 UserPromptSubmit、ignored chat prompt、PostToolUse test command、PostToolUse edit/write、Stop、CLI print mode、CLI record mode 和 redaction 测试。
- [ ] 运行 `node --test test/claude-code-hook-adapter.test.mjs`。
- [ ] 预期结果：失败，因为 `scripts/claude-code-hook-adapter.mjs` 不存在。

## Task 2：Adapter 实现

- [ ] 创建 `scripts/claude-code-hook-adapter.mjs`。
- [ ] 导出 `mapClaudeHookToVibeEvents`、`runClaudeCodeHookAdapter` 和 `redactSecrets`。
- [ ] 实现 stdin / `--input` 解析。
- [ ] 实现 `--print-events`、`--log`、`--json` 和 `--event-dir`。
- [ ] 实现 UserPromptSubmit 映射。
- [ ] 实现 PostToolUse 映射。
- [ ] 实现 Stop 映射。
- [ ] 实现 secret redaction。
- [ ] 运行 adapter-specific tests 直到通过。

## Task 3：文档和示例配置

- [ ] 添加双语 Claude Code adapter guide。
- [ ] 添加 Claude Code settings JSON 示例。
- [ ] 更新 Claude adapter reference。
- [ ] 更新 README 链接和结构。

## Task 4：记录和报告

- [ ] 在根 VibeLog 中记录 Slice 6。
- [ ] 重新生成根 JSON。
- [ ] 创建双语 Slice 6 reports。
- [ ] 验证通过后，进度快照移动到 `18 / 100`。

## Task 5：最终验证和提交

- [ ] 运行 `node --test`。
- [ ] 运行 `node scripts/validate-vibelog.mjs vibe-log.json`。
- [ ] 运行 `node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check`。
- [ ] 运行 `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`。
- [ ] 运行 `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check`。
- [ ] 运行 `git diff --check`。
- [ ] 本地提交，commit message 为 `Implement Claude Code hook adapter`。
- [ ] 不推送。
