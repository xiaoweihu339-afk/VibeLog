# VibeLog 普通用户采用路径 Slice 11 实现计划

> **给 agent worker：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务执行本计划。步骤使用 checkbox（`- [ ]`）语法跟踪。

**目标：** 构建一个最小普通用户 CLI 路径，让用户可以在项目中初始化、启用、验证和关闭 VibeLog。

**架构：** 新增 `scripts/vibelog-project.mjs`，封装现有 exporter、validator 和 Claude Code hook generator。命令保持 JSON-first，并且只操作项目本地。新增聚焦测试、中英双文指南、中英双文报告、README 链接和 VibeLog 更新。

**技术栈：** Node.js ESM、`node:test`、PowerShell、现有 VibeLog exporter、validator 和 hook generator。

---

## 文件结构

- 创建：`scripts/vibelog-project.mjs`
- 创建：`test/vibelog-project.test.mjs`
- 创建：`docs/guides/vibelog-project-adoption.md`
- 创建：`docs/guides/vibelog-project-adoption.zh.md`
- 创建：`docs/reports/slice-11-user-adoption-report.md`
- 创建：`docs/reports/slice-11-user-adoption-report.zh.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-user-adoption-slice-11-design.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-user-adoption-slice-11-design.zh.md`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] **Task 1：写失败的 CLI workflow tests**

创建 `test/vibelog-project.test.mjs`，覆盖 init、拒绝覆盖、dry-run enable、write enable、verify、disable，以及保留无关 settings。

运行：

```powershell
node --test test\vibelog-project.test.mjs
```

实现前预期：失败，因为 `scripts/vibelog-project.mjs` 还不存在。

- [x] **Task 2：实现 `scripts/vibelog-project.mjs`**

实现导出函数：

- `initVibeLogProject`
- `enableVibeLogHooks`
- `verifyVibeLogProject`
- `disableVibeLogHooks`

实现 CLI subcommands：

- `init`
- `enable-hooks`
- `verify`
- `disable-hooks`

- [x] **Task 3：运行 targeted tests**

运行：

```powershell
node --test test\vibelog-project.test.mjs
```

实现后预期：通过。

- [x] **Task 4：运行 scratch CLI acceptance commands**

运行：

```powershell
node scripts\vibelog-project.mjs init --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption" --title "Slice 11 Adoption Test" --idea "Verify ordinary users can initialize and manage VibeLog safely."
node scripts\vibelog-project.mjs enable-hooks --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --write
node scripts\vibelog-project.mjs verify --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption"
node scripts\vibelog-project.mjs disable-hooks --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption"
```

预期：init 创建有效文件，enable 写入项目级 settings，verify 报告 ready，disable 移除 VibeLog hook commands。

- [x] **Task 5：添加中英双文指南和报告**

创建 `docs/guides/vibelog-project-adoption.md`、`docs/guides/vibelog-project-adoption.zh.md`、`docs/reports/slice-11-user-adoption-report.md` 和 `docs/reports/slice-11-user-adoption-report.zh.md`。

- [x] **Task 6：更新 README 和根目录 VibeLog**

链接新 guide、script、report，并将进度更新到 `28 / 100`。

- [x] **Task 7：最终验证和本地提交**

运行：

```powershell
node --test
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

然后本地提交：

```powershell
git add scripts/vibelog-project.mjs test/vibelog-project.test.mjs docs/guides/vibelog-project-adoption.md docs/guides/vibelog-project-adoption.zh.md docs/reports/slice-11-user-adoption-report.md docs/reports/slice-11-user-adoption-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-user-adoption-slice-11-design.md docs/superpowers/specs/2026-05-27-vibelog-user-adoption-slice-11-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-user-adoption-slice-11.md docs/superpowers/plans/2026-05-27-vibelog-user-adoption-slice-11.zh.md README.md vibe-log.md vibe-log.json
git commit -m "Add VibeLog user adoption CLI"
```

不 push。
