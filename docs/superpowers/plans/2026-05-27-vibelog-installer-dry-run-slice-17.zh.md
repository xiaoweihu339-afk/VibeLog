# VibeLog Installer Dry-Run Slice 17 实现计划

> **给 agent worker：** 必须在实现前使用 `superpowers:test-driven-development`，在汇报完成前使用 `superpowers:verification-before-completion`。

**目标：** 新增只做 dry-run 的 installer planner，预览 VibeLog 安装操作但不写文件。

**架构：** 实现一个无依赖 Node.js 脚本，从当前仓库生成到用户目标目录的安装计划。写入不在 S17 范围内，并明确拒绝 `--write`。

**技术栈：** Node.js ESM、`node:test`、JSON、Markdown。

---

## 文件结构

- 创建：`scripts/vibelog-install.mjs`
- 创建：`test/vibelog-installer-dry-run.test.mjs`
- 创建：`docs/guides/vibelog-installer-dry-run.md`
- 创建：`docs/guides/vibelog-installer-dry-run.zh.md`
- 创建：`docs/reports/slice-17-installer-dry-run-report.md`
- 创建：`docs/reports/slice-17-installer-dry-run-report.zh.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-installer-dry-run-slice-17-design.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-installer-dry-run-slice-17-design.zh.md`
- 修改：`docs/distribution/vibelog-distribution-plan.json`
- 修改：`test/vibelog-distribution-plan.test.mjs`
- 修改：`test/vibelog-package.test.mjs`
- 修改：`package.json`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] **Task 1：写失败的 installer dry-run 测试**

创建 `test/vibelog-installer-dry-run.test.mjs`，检查：

- `createInstallPlan` 返回 dry-run 操作和 rollback steps。
- target root 中不创建任何文件或目录。
- CLI JSON 输出可用。
- `--write` 被拒绝。

运行：

```powershell
node --test test\vibelog-installer-dry-run.test.mjs
```

实现前预期：失败，因为 `scripts/vibelog-install.mjs` 尚不存在。

- [x] **Task 2：实现 dry-run installer planner**

创建 `scripts/vibelog-install.mjs`，包含 `createInstallPlan`、`runInstallDryRun`、参数解析、JSON 输出和 `--write` 拒绝。

- [x] **Task 3：增加 package metadata 和 distribution plan 更新**

增加 private local bin/script entry，并更新 `docs/distribution/vibelog-distribution-plan.json`，让 local installer scripts 变为 `prototype_dry_run`，而不是 active。同步更新 package 和 distribution 测试。

- [x] **Task 4：新增中英双文 installer dry-run guide 和报告**

创建中英双文 guide 和 report，说明 dry-run-only 边界、计划操作、rollback plan，以及 S17 明确不做什么。

- [x] **Task 5：更新 README、根目录 VibeLog 和 JSON 导出**

更新 README，在 `vibe-log.md` 记录 S17，把进度更新到 `42 / 100`，并重新生成 `vibe-log.json`。

- [x] **Task 6：最终验证和本地 commit**

运行：

```powershell
node --test
node scripts\vibelog-install.mjs --target "C:\Users\HXW\Documents\vibelog-scratch\slice-17-installer-dry-run"
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

然后本地提交：

```powershell
git add scripts/vibelog-install.mjs test/vibelog-installer-dry-run.test.mjs docs/guides/vibelog-installer-dry-run.md docs/guides/vibelog-installer-dry-run.zh.md docs/reports/slice-17-installer-dry-run-report.md docs/reports/slice-17-installer-dry-run-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-installer-dry-run-slice-17-design.md docs/superpowers/specs/2026-05-27-vibelog-installer-dry-run-slice-17-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-installer-dry-run-slice-17.md docs/superpowers/plans/2026-05-27-vibelog-installer-dry-run-slice-17.zh.md docs/distribution/vibelog-distribution-plan.json test/vibelog-distribution-plan.test.mjs test/vibelog-package.test.mjs package.json README.md vibe-log.md vibe-log.json
git commit -m "Add VibeLog installer dry-run prototype"
```

不 push。
