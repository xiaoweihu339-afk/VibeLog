# Claude Code Opt-In Hook 安装 Slice 8 实施计划

> **给 agentic workers：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务执行本计划。步骤使用 checkbox (`- [ ]`) 方便跟踪。

**目标：** 构建一个默认 dry-run 的安全 generator，用来生成项目级 Claude Code VibeLog hook settings。

**架构：** 新增一个聚焦的 Node.js ESM CLI，用来生成并可选写入 `<project>/.claude/settings.json`。CLI 会做安全检查、合并现有 settings、保留无关 entries，并且只有显式传入 `--write` 才会写文件。

**技术栈：** Node.js ESM、内置 `node:test`、现有 Claude Code adapter、现有 VibeLog exporter/validator。

---

## 文件结构

- 新建：`scripts/configure-claude-code-vibelog-hooks.mjs`
- 新建：`test/configure-claude-code-vibelog-hooks.test.mjs`
- 新建：`docs/guides/claude-code-opt-in-install.md`
- 新建：`docs/guides/claude-code-opt-in-install.zh.md`
- 新建：`docs/reports/slice-8-opt-in-hook-install-report.md`
- 新建：`docs/reports/slice-8-opt-in-hook-install-report.zh.md`
- 修改：`README.md`
- 修改：`docs/guides/claude-code-adapter.md`
- 修改：`docs/guides/claude-code-adapter.zh.md`
- 修改：`skills/vibelog/references/claude-code-hooks-adapter.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## Task 1：红灯测试

- [x] 创建 generator tests。
- [x] 测试 dry-run 不写 `.claude/settings.json`。
- [x] 测试当 `vibe-log.md` 存在时，write mode 创建项目级 settings。
- [x] 测试现有 settings 被保留，并避免重复 VibeLog hook commands。
- [x] 测试拒绝不安全的全局 `.claude` paths。
- [x] 运行 `node --test test/configure-claude-code-vibelog-hooks.test.mjs`。
- [x] 预期：失败，因为 generator script 不存在。

## Task 2：Generator 实现

- [x] 创建 `scripts/configure-claude-code-vibelog-hooks.mjs`。
- [x] 导出 `buildHookSettings`、`configureClaudeCodeVibeLogHooks` 和 `parseArgs`。
- [x] 实现默认 dry-run。
- [x] 实现 `--write`、`--project`、`--adapter` 和 `--allow-missing-log`。
- [x] 实现项目级安全检查和全局 `.claude` 拒绝。
- [x] 实现现有 settings merge 和重复 command 避免。
- [x] 运行 targeted test 直到变绿。

## Task 3：CLI 验证

- [x] 对 `C:\Users\HXW\Documents\vibelog-scratch\slice-8-install-test` 运行 dry-run CLI。
- [x] 对包含 `vibe-log.md` 的 scratch project 运行 write CLI。
- [x] 确认 settings 只写入 scratch project 内部。
- [x] 确认默认情况下，缺失 `vibe-log.md` 会阻止 write mode。

## Task 4：文档和报告

- [x] 添加双语 opt-in install guide。
- [x] 更新 README 和 Claude adapter references。
- [x] 添加双语 Slice 8 report。
- [x] 更新根 VibeLog 并重新生成 JSON。

## Task 5：最终验证和提交

- [x] 运行 `node --test`。
- [x] 运行 `node scripts/validate-vibelog.mjs vibe-log.json`。
- [x] 运行 `node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check`。
- [x] 运行 `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`。
- [x] 运行 `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check`。
- [x] 运行 `git diff --check`。
- [x] 对 Slice 8 design、plan、guide、report 文件运行 placeholder scan。
- [ ] 本地提交，commit message 为 `Add Claude Code opt-in hook installer`。
- [ ] 不推送。
