# VibeLog Clean Clone Adoption Slice 13 实现计划

> **给 agent worker：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 按任务执行本计划。步骤使用 checkbox（`- [ ]`）语法跟踪。

**目标：** 验证一个全新的本地 VibeLog clone 可以完成 clone-local package adoption workflow。

**架构：** 新增一个 Node.js verifier，创建 scratch run 目录，本地 clone 仓库，从 clean clone 中运行 `npm run vibelog`，并验证一个单独的 target project。verifier 输出 JSON，方便 tests、reports 和未来 agent 读取。

**技术栈：** Node.js ESM、`node:test`、npm scripts、Git CLI、PowerShell。

---

## 文件结构

- 创建：`scripts/verify-clean-clone-adoption.mjs`
- 创建：`test/verify-clean-clone-adoption.test.mjs`
- 创建：`docs/reports/slice-13-clean-clone-adoption-report.md`
- 创建：`docs/reports/slice-13-clean-clone-adoption-report.zh.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-clean-clone-adoption-slice-13-design.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-clean-clone-adoption-slice-13-design.zh.md`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] **Task 1：写失败的 clean clone verifier tests**

创建 `test/verify-clean-clone-adoption.test.mjs`，测试 import `runCleanCloneAdoptionVerification` 并执行 CLI 脚本。

运行：

```powershell
node --test test\verify-clean-clone-adoption.test.mjs
```

实现前预期：失败，因为 `scripts/verify-clean-clone-adoption.mjs` 不存在。

- [x] **Task 2：实现 clean clone verifier**

创建 `scripts/verify-clean-clone-adoption.mjs`，包含：

- `runCleanCloneAdoptionVerification`
- 本地 `git clone --local --no-hardlinks`
- Windows 下通过 `cmd.exe` 安全执行 npm command
- 解析 npm script 输出中的 JSON
- 全局 Claude Code settings fingerprint 检查
- 支持 `--repo` 和 `--workspace` 的 CLI 参数解析

- [x] **Task 3：运行 targeted verifier tests**

运行：

```powershell
node --test test\verify-clean-clone-adoption.test.mjs
```

预期：通过。

- [x] **Task 4：运行 scratch clean clone 验收命令**

运行：

```powershell
node scripts\verify-clean-clone-adoption.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-13-clean-clone-adoption"
```

预期：JSON 输出包含 `"passed": true`，`verify.ready` 为 `true`，`disable.removedHookCount` 为 `3`，`globalClaudeSettingsUnchanged` 为 `true`。

- [x] **Task 5：添加中英双文 Slice 13 报告**

创建：

- `docs/reports/slice-13-clean-clone-adoption-report.md`
- `docs/reports/slice-13-clean-clone-adoption-report.zh.md`

包含验证证据和项目进度快照。

- [x] **Task 6：更新 README 和根目录 VibeLog**

链接 verifier script、report 和下一步。更新 `vibe-log.md`，然后重新生成 `vibe-log.json`。

- [x] **Task 7：最终验证和本地提交**

运行：

```powershell
node --test
node scripts\verify-clean-clone-adoption.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-13-clean-clone-adoption"
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

然后本地提交：

```powershell
git add scripts/verify-clean-clone-adoption.mjs test/verify-clean-clone-adoption.test.mjs docs/reports/slice-13-clean-clone-adoption-report.md docs/reports/slice-13-clean-clone-adoption-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-clean-clone-adoption-slice-13-design.md docs/superpowers/specs/2026-05-27-vibelog-clean-clone-adoption-slice-13-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-clean-clone-adoption-slice-13.md docs/superpowers/plans/2026-05-27-vibelog-clean-clone-adoption-slice-13.zh.md README.md vibe-log.md vibe-log.json
git commit -m "Add clean clone VibeLog adoption verification"
```

不 push。
