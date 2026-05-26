# Claude Code Live Hook Verification Slice 7 实施计划

> **给 agentic workers：** 按任务执行本计划。推荐使用 `superpowers:subagent-driven-development`，也可以使用 `superpowers:executing-plans`。

**目标：** 在 scratch workspace 中构建并运行安全的 Claude Code hook adapter 本地 verifier。

**架构：** 新增 `scripts/verify-claude-code-live-hook.mjs`，作为聚焦 verifier：创建 scratch VibeLog files，写入本地 `.claude/settings.json`，通过真实 adapter command path 运行 fixture hook payloads，并在 `--live` 显式开启时尝试一次极小 `claude -p` session。

**技术栈：** Node.js ESM、内置 `node:test`、现有 Claude Code adapter、现有 recorder/exporter/validator、可用时使用 Claude Code CLI。

---

## 文件结构

- 新建：`scripts/verify-claude-code-live-hook.mjs`
- 新建：`test/verify-claude-code-live-hook.test.mjs`
- 新建：`docs/guides/live-hook-verification.md`
- 新建：`docs/guides/live-hook-verification.zh.md`
- 修改：`README.md`
- 修改：`skills/vibelog/references/claude-code-hooks-adapter.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`
- 新建：`docs/reports/slice-7-live-hook-verification-report.md`
- 新建：`docs/reports/slice-7-live-hook-verification-report.zh.md`

## Task 1：红灯测试

- [x] 创建 verifier tests。
- [x] 测试本地 settings 生成。
- [x] 测试 fixture verification 更新 Markdown 和 JSON。
- [x] 测试 live mode 必须显式开启。
- [x] 运行 `node --test test/verify-claude-code-live-hook.test.mjs`。
- [x] 预期：失败，因为 verifier script 不存在。

## Task 2：Verifier 实现

- [x] 创建 verifier script。
- [x] 导出 `createScratchVibeLog`、`writeClaudeLocalSettings`、`runFixtureVerification` 和 `runLiveVerification`。
- [x] 实现 CLI args：`--workspace`、`--adapter`、`--live`、`--prompt`、`--max-budget-usd`。
- [x] 确保不会写入任何全局 settings path。
- [x] 运行 verifier tests 直到通过。

## Task 3：运行验证

- [x] 在 `C:\Users\HXW\Documents\vibelog-scratch\claude-live-hook-test` 运行 fixture verification。
- [x] 如果 Claude CLI 可用，用极小 prompt 和预算上限运行 live verification。
- [x] 记录 live verification 通过或被阻塞。

## Task 4：文档和报告

- [x] 添加双语 live hook verification guide。
- [x] 更新 Claude adapter reference 和 README。
- [x] 创建双语 Slice 7 report。
- [x] 更新根 VibeLog 并重新生成 JSON。

## Task 5：最终验证和提交

- [x] 运行 `node --test`。
- [x] 运行 `node scripts/validate-vibelog.mjs vibe-log.json`。
- [x] 运行 `node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check`。
- [x] 运行 `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`。
- [x] 运行 `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check`。
- [x] 运行 `git diff --check`。
- [ ] 本地提交，commit message 为 `Verify Claude Code live hook path`。
- [ ] 不推送。
