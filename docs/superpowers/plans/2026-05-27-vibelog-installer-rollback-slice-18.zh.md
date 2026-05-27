# VibeLog Installer Rollback Slice 18 实现计划

> **给 agent worker：** 实现前必须使用 `superpowers:test-driven-development`，汇报完成前必须使用 `superpowers:verification-before-completion`。步骤使用 checkbox (`- [x]`) 跟踪。

**目标：** 新增 scratch-only verifier，证明 VibeLog installer 文件可以复制到临时 target，并且可以回滚删除。

**架构：** 公开 installer 继续保持 dry-run-only。新增独立 verifier script，导入 install plan，把计划文件复制到 scratch target，删除 target，并输出机器可读的验证证据。

**技术栈：** Node.js ESM、`node:test`、JSON、Markdown。

---

## 文件

- 新增：`scripts/verify-installer-rollback.mjs`
- 新增：`test/vibelog-installer-rollback.test.mjs`
- 修改：`package.json`
- 修改：`test/vibelog-package.test.mjs`
- 修改：`docs/distribution/vibelog-distribution-plan.json`
- 修改：`test/vibelog-distribution-plan.test.mjs`
- 修改：`docs/guides/vibelog-installer-dry-run.md`
- 修改：`docs/guides/vibelog-installer-dry-run.zh.md`
- 修改：`docs/guides/vibelog-installer-package-manager-plan.md`
- 修改：`docs/guides/vibelog-installer-package-manager-plan.zh.md`
- 新增：`docs/reports/slice-18-installer-rollback-report.md`
- 新增：`docs/reports/slice-18-installer-rollback-report.zh.md`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] 编写失败的 rollback verifier 测试。
- [x] 运行定向测试，并确认失败原因是缺少 `scripts/verify-installer-rollback.mjs`。
- [x] 实现 scratch-only rollback verifier。
- [x] 运行定向 rollback verifier 测试并确认通过。
- [x] 增加 verifier 的 private package entries。
- [x] 更新 distribution plan 和 package metadata 测试。
- [x] 更新中英双文 guide、report、README 和根 VibeLog。
- [x] 运行单项验证。
- [x] 运行组合验证。
- [ ] 本地 commit，不 push。

## 验证命令

```powershell
node --test test\vibelog-installer-rollback.test.mjs
node --test test\vibelog-installer-rollback.test.mjs test\vibelog-installer-dry-run.test.mjs test\vibelog-package.test.mjs test\vibelog-distribution-plan.test.mjs
node scripts\verify-installer-rollback.mjs --scratch-root "C:\Users\HXW\Documents\vibelog-scratch\slice-18-installer-rollback"
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
node --test
git diff --check
```
