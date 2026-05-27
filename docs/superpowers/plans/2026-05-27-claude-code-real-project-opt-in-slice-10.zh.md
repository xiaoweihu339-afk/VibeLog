# Claude Code 真实项目 Opt-In Slice 10 实现计划

> **给 agent worker：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务执行本计划。步骤使用 checkbox（`- [ ]`）语法跟踪。

**目标：** 在一个接近真实项目的 scratch project 中验证 VibeLog Claude Code opt-in hook 路径，并且只使用项目级 settings。

**架构：** 新增一个 verifier 脚本：创建 scratch 项目、运行 opt-in generator、读取生成的 settings、通过生成的 command 执行代表性 hook events，并验证生成后的 VibeLog。新增一个聚焦测试文件和中英双文报告。

**技术栈：** Node.js ESM、`node:test`、PowerShell、现有 VibeLog exporter、validator、recorder、adapter 和 opt-in generator。

---

## 文件结构

- 创建：`scripts/verify-claude-code-opt-in-project.mjs`
- 创建：`test/verify-claude-code-opt-in-project.test.mjs`
- 创建：`docs/reports/slice-10-real-project-opt-in-report.md`
- 创建：`docs/reports/slice-10-real-project-opt-in-report.zh.md`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] **Task 1：写失败的 acceptance test**

创建 `test/verify-claude-code-opt-in-project.test.mjs`，测试导入 `runOptInProjectVerification`，在 temp project 中运行，并断言 dry-run、write、settings command 执行、VibeLog JSON validity 和 event file creation。

运行：

```powershell
node --test test\verify-claude-code-opt-in-project.test.mjs
```

实现前预期：失败，因为 `scripts/verify-claude-code-opt-in-project.mjs` 还不存在。

- [x] **Task 2：实现 verifier**

创建 `scripts/verify-claude-code-opt-in-project.mjs`，包含：

- `createRealProjectFixture`
- `runSettingsHookCommand`
- `runOptInProjectVerification`
- CLI args：`--workspace`、`--adapter`

verifier 必须只写入目标 scratch workspace 内部。

- [x] **Task 3：运行 targeted verifier test**

运行：

```powershell
node --test test\verify-claude-code-opt-in-project.test.mjs
```

实现后预期：通过。

- [x] **Task 4：运行 scratch acceptance command**

运行：

```powershell
node scripts\verify-claude-code-opt-in-project.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-10-real-project-opt-in" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

预期：JSON output 中 `passed: true`。

- [x] **Task 5：添加中英双文报告和 README 链接**

在 `docs/reports/` 下创建英文和中文报告。把报告链接加入 README。

- [x] **Task 6：更新根目录 VibeLog**

记录 exact execution prompt、development log、verification evidence、artifact index、handoff state 和 project progress snapshot。

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
git add scripts/verify-claude-code-opt-in-project.mjs test/verify-claude-code-opt-in-project.test.mjs docs/reports/slice-10-real-project-opt-in-report.md docs/reports/slice-10-real-project-opt-in-report.zh.md docs/superpowers/specs/2026-05-27-claude-code-real-project-opt-in-slice-10-design.md docs/superpowers/specs/2026-05-27-claude-code-real-project-opt-in-slice-10-design.zh.md docs/superpowers/plans/2026-05-27-claude-code-real-project-opt-in-slice-10.md docs/superpowers/plans/2026-05-27-claude-code-real-project-opt-in-slice-10.zh.md README.md vibe-log.md vibe-log.json
git commit -m "Verify real project opt-in hooks"
```

不 push。
