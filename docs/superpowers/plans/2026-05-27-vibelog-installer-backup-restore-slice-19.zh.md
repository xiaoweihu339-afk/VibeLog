# VibeLog Installer Backup/Restore Slice 19 实现计划

> **给 agent worker：** 实现前必须使用 `superpowers:test-driven-development`，汇报完成前必须使用 `superpowers:verification-before-completion`。步骤使用 checkbox (`- [x]`) 跟踪。

**目标：** 新增 scratch-only verifier，证明已有 installer target 可以先备份、在模拟中被覆盖、再被精确恢复。

**架构：** 公开 installer 继续保持 dry-run-only。新增独立 verifier script，创建带有用户已有内容的 scratch target，记录快照，备份 installer operation targets，模拟 install copy operations，恢复备份，并把最终 target 与原始快照对比。

**技术栈：** Node.js ESM、`node:test`、JSON、Markdown。

---

## 文件

- 新增：`scripts/verify-installer-backup-restore.mjs`
- 新增：`test/vibelog-installer-backup-restore.test.mjs`
- 修改：`package.json`
- 修改：`test/vibelog-package.test.mjs`
- 修改：`docs/distribution/vibelog-distribution-plan.json`
- 修改：`test/vibelog-distribution-plan.test.mjs`
- 修改：`docs/guides/vibelog-installer-dry-run.md`
- 修改：`docs/guides/vibelog-installer-dry-run.zh.md`
- 修改：`docs/guides/vibelog-installer-package-manager-plan.md`
- 修改：`docs/guides/vibelog-installer-package-manager-plan.zh.md`
- 新增：`docs/reports/slice-19-installer-backup-restore-report.md`
- 新增：`docs/reports/slice-19-installer-backup-restore-report.zh.md`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] 编写失败的 backup/restore verifier 测试。
- [x] 运行定向测试，并确认失败原因是缺少 `scripts/verify-installer-backup-restore.mjs`。
- [x] 实现 scratch-only backup/restore verifier。
- [x] 运行定向 backup/restore verifier 测试并确认通过。
- [x] 增加 verifier 的 private package entries。
- [x] 更新 distribution plan 和 package metadata 测试。
- [x] 更新中英双文 guide、report、README 和根 VibeLog。
- [x] 运行单项验证。
- [x] 运行流程验证。
- [ ] 本地 commit，不 push。

## 验证命令

```powershell
node --test test\vibelog-installer-backup-restore.test.mjs
node --test test\vibelog-installer-backup-restore.test.mjs test\vibelog-installer-rollback.test.mjs test\vibelog-installer-dry-run.test.mjs test\vibelog-package.test.mjs test\vibelog-distribution-plan.test.mjs
node scripts\verify-installer-backup-restore.mjs --scratch-root "C:\Users\HXW\Documents\vibelog-scratch\slice-19-installer-backup-restore"
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
node --test
git diff --check
```
