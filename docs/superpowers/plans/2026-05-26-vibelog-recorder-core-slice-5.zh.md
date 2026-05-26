# VibeLog Recorder Core Slice 5 实施计划

> **给 agentic workers：** 必须按任务执行本计划。推荐使用 `superpowers:subagent-driven-development`，也可以使用 `superpowers:executing-plans`。步骤使用 checkbox (`- [ ]`) 方便跟踪。

**目标：** 构建本地 recorder core，把结构化 Vibe Event JSON 应用到 VibeLog Markdown，并可选地重新生成 JSON。

**架构：** 新增 `scripts/record-vibelog-event.mjs`，作为小型 ESM CLI/library。它把七类 event 映射到现有 VibeLog Markdown sections，需要 JSON 输出时复用 `export-vibelog.mjs`，并保持 Markdown 为 source of truth。

**技术栈：** Node.js ESM、内置 `node:test`、现有 VibeLog exporter 和 validator、Markdown 文档。

---

## 文件结构

- 新建：`scripts/record-vibelog-event.mjs`
- 新建：`test/record-vibelog-event.test.mjs`
- 新建：`docs/guides/recorder-core.md`
- 新建：`docs/guides/recorder-core.zh.md`
- 新建：`skills/vibelog/references/vibe-event-format.md`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`
- 新建：`docs/reports/slice-5-recorder-core-report.md`
- 新建：`docs/reports/slice-5-recorder-core-report.zh.md`

## Task 1：红灯测试

- [ ] 创建 `test/record-vibelog-event.test.mjs`。
- [ ] 添加 `prompt_submitted`、`test_ran`、`bug_fixed`、`handoff_updated`、CLI JSON export 和组合 session flow 测试。
- [ ] 运行 `node --test test/record-vibelog-event.test.mjs`。
- [ ] 预期结果：失败，因为 `scripts/record-vibelog-event.mjs` 尚不存在。

## Task 2：Recorder 实现

- [ ] 创建 `scripts/record-vibelog-event.mjs`。
- [ ] 导出 `applyVibeLogEvent`、`recordVibeLogEventFile` 和 `SUPPORTED_EVENT_TYPES`。
- [ ] 为每类 event 实现 required-field validation。
- [ ] 为 entry sections 实现 append 行为。
- [ ] 为 `handoff_updated` 实现 replace 行为。
- [ ] 实现 CLI 参数：`--event`、`--log` 和可选 `--json`。
- [ ] 运行 `node --test test/record-vibelog-event.test.mjs`。
- [ ] 预期结果：通过。

## Task 3：文档

- [ ] 添加英文和中文 recorder 指南。
- [ ] 添加 `skills/vibelog/references/vibe-event-format.md`。
- [ ] 从 `README.md` 链接新文档。

## Task 4：记录和报告

- [ ] 使用新 recorder 或直接更新 VibeLog 记录 Slice 5 执行。
- [ ] 重新生成根 `vibe-log.json`。
- [ ] 创建双语 Slice 5 reports。
- [ ] 只有在实现验证通过后，进度快照才移动到 `15 / 100`。

## Task 5：最终验证和本地提交

- [ ] 运行 `node --test`。
- [ ] 运行 `node scripts/validate-vibelog.mjs vibe-log.json`。
- [ ] 运行 `node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check`。
- [ ] 运行 `node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json`。
- [ ] 运行 `node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check`。
- [ ] 运行 `git diff --check`。
- [ ] 本地提交，commit message 为 `Implement VibeLog recorder core`。
- [ ] 不推送。
