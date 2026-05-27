# VibeLog Release Bundle Slice 20 实施计划

> **给 agentic worker：** 必须在实现前使用 superpowers:test-driven-development，在报告完成前使用 superpowers:verification-before-completion。步骤用 checkbox (`- [x]`) 追踪。

**目标：** 新增一个 scratch-only verifier，证明干净解压后的 VibeLog release bundle 可以运行 adoption CLI 和 installer safety verifiers。

**架构：** 使用 `npm pack` 作为本地 bundle 来源，把生成的 `.tgz` 解压到 scratch，只从解压后的 package 运行命令，并明确报告 no push、no publish、no global settings edits 的安全 flags。

**技术栈：** Node.js ESM、`node:test`、npm pack、系统 `tar`、JSON、Markdown。

---

## 文件

- 新增：`scripts/verify-release-bundle.mjs`
- 新增：`test/verify-release-bundle.test.mjs`
- 修改：`package.json`
- 修改：`test/vibelog-package.test.mjs`
- 修改：`docs/distribution/vibelog-distribution-plan.json`
- 修改：`test/vibelog-distribution-plan.test.mjs`
- 修改：`docs/guides/vibelog-installer-package-manager-plan.md`
- 修改：`docs/guides/vibelog-installer-package-manager-plan.zh.md`
- 修改：`README.md`
- 新增：`docs/reports/slice-20-release-bundle-report.md`
- 新增：`docs/reports/slice-20-release-bundle-report.zh.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] 先写失败的 release bundle verifier 和 package metadata tests。
- [x] 运行定向测试，并确认因为缺少 `scripts/verify-release-bundle.mjs` 和 package entries 而失败。
- [x] 实现 scratch-only release bundle verifier。
- [x] 为 verifier 增加 private package entries。
- [x] 更新 distribution plan 和 distribution tests。
- [x] 更新中英双文 guides、reports、README 和 root VibeLog。
- [x] 运行单项验证。
- [x] 运行流程验证。
- [ ] 只做本地 commit，不 push。

## 验证命令

```powershell
node --test test\verify-release-bundle.test.mjs
node --test test\vibelog-package.test.mjs
node --test test\vibelog-distribution-plan.test.mjs
node scripts\verify-release-bundle.mjs --repo "C:\Users\HXW\Documents\vibecoding" --scratch-root "C:\Users\HXW\Documents\vibelog-scratch\slice-20-release-bundle"
node --test test\verify-release-bundle.test.mjs test\verify-clean-clone-adoption.test.mjs test\vibelog-installer-backup-restore.test.mjs test\vibelog-installer-rollback.test.mjs test\vibelog-installer-dry-run.test.mjs test\vibelog-package.test.mjs test\vibelog-distribution-plan.test.mjs
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
node --test
git diff --check
```
