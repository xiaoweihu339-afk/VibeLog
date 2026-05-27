# VibeLog 强 Schema 校验 Slice 16 实现计划

> **给 agent worker：** 必须在实现前使用 `superpowers:test-driven-development`，在汇报完成前使用 `superpowers:verification-before-completion`。

**目标：** 通过执行现有 schema 文件来加强 VibeLog JSON 校验，同时不新增外部依赖。

**架构：** 保留 `validateVibeLog(data)` 作为公开 API。新增一个递归的 schema 子集校验器，并保留原来的 VibeLog 实用检查。

**技术栈：** Node.js ESM、`node:test`、JSON、Markdown。

---

## 文件结构

- 修改：`scripts/validate-vibelog.mjs`
- 修改：`skills/vibelog/assets/vibe-log.schema.json`
- 修改：`test/validate-vibelog.test.mjs`
- 创建：`docs/reports/slice-16-strong-schema-validation-report.md`
- 创建：`docs/reports/slice-16-strong-schema-validation-report.zh.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-strong-schema-validation-slice-16-design.md`
- 创建：`docs/superpowers/specs/2026-05-27-vibelog-strong-schema-validation-slice-16-design.zh.md`
- 修改：`docs/guides/export-json.md`
- 修改：`README.md`
- 修改：`vibe-log.md`
- 修改：`vibe-log.json`

## 任务

- [x] **Task 1：增加失败的 schema 校验测试**

扩展 `test/validate-vibelog.test.mjs`，覆盖非法枚举、必需字段缺失、意外字段、嵌套枚举失败。

运行：

```powershell
node --test test\validate-vibelog.test.mjs
```

实现前预期：失败，因为旧 validator 不执行 schema 级规则。

- [x] **Task 2：新增无依赖 schema 子集校验**

更新 `scripts/validate-vibelog.mjs`，读取 `skills/vibelog/assets/vibe-log.schema.json`，并校验 `type`、type 数组、`enum`、`required`、`properties`、`items`、`additionalProperties: false`。

- [x] **Task 3：让 schema 对齐当前生成的 VibeLog 数据**

更新 `vibe-log.schema.json`，让强制执行的 schema 能接受当前根目录与示例导出，同时仍然捕捉非法字段和枚举漂移。

- [x] **Task 4：更新文档和 Slice 16 报告**

更新 README 和 export guide，然后新增中英双文 Slice 16 报告，包含验证证据和进度快照。

- [x] **Task 5：更新根目录 VibeLog 和 JSON 导出**

在 `vibe-log.md` 记录 Slice 16，加入新 artifacts，把进度更新到 `39 / 100`，然后重新生成 `vibe-log.json`。

- [x] **Task 6：最终验证和本地 commit**

运行：

```powershell
node --test
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\validate-vibelog.mjs examples\vibelog-studio\vibe-log.json
node scripts\validate-vibelog.mjs examples\reading-card-lite\vibe-log.json
node scripts\validate-vibelog.mjs examples\billmate-lite\vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

然后本地提交：

```powershell
git add scripts/validate-vibelog.mjs skills/vibelog/assets/vibe-log.schema.json test/validate-vibelog.test.mjs docs/reports/slice-16-strong-schema-validation-report.md docs/reports/slice-16-strong-schema-validation-report.zh.md docs/superpowers/specs/2026-05-27-vibelog-strong-schema-validation-slice-16-design.md docs/superpowers/specs/2026-05-27-vibelog-strong-schema-validation-slice-16-design.zh.md docs/superpowers/plans/2026-05-27-vibelog-strong-schema-validation-slice-16.md docs/superpowers/plans/2026-05-27-vibelog-strong-schema-validation-slice-16.zh.md docs/guides/export-json.md README.md vibe-log.md vibe-log.json
git commit -m "Add stronger VibeLog schema validation"
```

不 push。
