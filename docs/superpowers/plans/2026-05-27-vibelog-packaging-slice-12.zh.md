# VibeLog 包装路径 Slice 12 实现计划

> **给 agent worker：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务执行本计划。步骤使用 checkbox（`- [ ]`）语法跟踪。

**目标：** 为 VibeLog project adoption CLI 增加安全的 clone-local package entry 和 help output。

**架构：** 新增 `package.json`，提供 private package 边界、`vibelog-project` bin entry 和 npm scripts。给 `scripts/vibelog-project.mjs` 增加 help output，然后记录 clone-local install path。

**技术栈：** Node.js ESM、npm scripts、`node:test`、PowerShell。

---

## 文件结构

- 创建：`package.json`
- 创建：`test/vibelog-package.test.mjs`
- 创建：`docs/guides/vibelog-install-distribution.md`
- 创建：`docs/guides/vibelog-install-distribution.zh.md`
- 创建：`docs/reports/slice-12-packaging-report.md`
- 创建：`docs/reports/slice-12-packaging-report.zh.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-packaging-slice-12-design.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-packaging-slice-12-design.zh.md`
- 修改：`scripts/vibelog-project.mjs`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] **Task 1：写失败的 packaging tests**

创建 `test/vibelog-package.test.mjs`，检查 `package.json`、bin file、direct help output 和 npm-script help output。

运行：

```powershell
node --test test\vibelog-package.test.mjs
```

实现前预期：失败，因为 `package.json` 还不存在。

- [x] **Task 2：添加 package metadata 和 CLI help**

创建 `package.json`，给 `scripts/vibelog-project.mjs` 添加 shebang，并实现 `--help` / `help`。

- [x] **Task 3：运行 targeted packaging tests**

运行：

```powershell
node --test test\vibelog-package.test.mjs
npm run vibelog -- --help
```

预期：两者都通过。

- [x] **Task 4：添加中英双文安装/分发指南和报告**

创建上面列出的 guide 和 report 文件。

- [x] **Task 5：更新 README 和根目录 VibeLog**

链接 package entry、guide、report，并更新 progress snapshot。

- [x] **Task 6：最终验证和本地提交**

运行：

```powershell
node --test
npm run vibelog -- --help
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

然后本地提交：

```powershell
git add package.json scripts/vibelog-project.mjs test/vibelog-package.test.mjs docs/guides/vibelog-install-distribution.md docs/guides/vibelog-install-distribution.zh.md docs/reports/slice-12-packaging-report.md docs/reports/slice-12-packaging-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-packaging-slice-12-design.md docs/superpowers/specs/2026-05-27-vibelog-packaging-slice-12-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-packaging-slice-12.md docs/superpowers/plans/2026-05-27-vibelog-packaging-slice-12.zh.md README.md vibe-log.md vibe-log.json
git commit -m "Add clone-local VibeLog packaging path"
```

不 push。
