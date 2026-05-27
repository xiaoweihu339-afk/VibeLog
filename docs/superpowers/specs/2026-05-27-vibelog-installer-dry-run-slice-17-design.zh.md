# VibeLog Installer Dry-Run Slice 17 设计

日期：2026-05-27

## 目标

新增一个只做 dry-run 的 installer 原型，展示 VibeLog 会如何安装到用户选择的本地目标目录，但不写入任何文件。

## 为什么需要这一步

Slice 16 已经加强了 VibeLog 数据契约。下一个采用风险是安装安全：普通用户需要先知道 installer 会复制什么、可能覆盖什么、如何回滚，之后才允许 installer 写入仓库外部目录。

S17 不真正安装 VibeLog。它只生成机器可读的安装计划、回滚计划和安全摘要，让未来 installer 在触碰全局目录或用户目录前先可测试。

## 范围

包含：

- 新增 `scripts/vibelog-install.mjs`，作为只 dry-run 的 installer planner。
- 在 private package metadata 中增加本地 `vibelog-install` bin 和 npm script。
- 增加测试，证明 dry-run 会生成计划且不写文件。
- 增加测试，证明 S17 会拒绝 `--write`。
- 更新 distribution plan，把 local installer scripts 标记为 dry-run prototype，而不是 active。
- 新增中英双文 S17 文档、计划和报告。
- 更新 README 和根目录 VibeLog。

不包含：

- 不做真实安装。
- 不写入全局 Codex skill 目录。
- 不编辑全局 Claude Code settings。
- 不执行 uninstall。
- 不发布 package。
- 不推送 GitHub。

## 架构

新增 `scripts/vibelog-install.mjs`，包含两个接口：

```js
createInstallPlan({ sourceRoot, targetRoot })
runInstallDryRun({ sourceRoot, targetRoot })
```

CLI 用法：

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
npm run vibelog:install -- --target "C:\path\to\install-root"
```

计划内容包括：

- `dryRun: true`
- `writesPerformed: false`
- source 和 target 路径
- skill files、script helpers、essential docs 的计划操作
- 已有目标检测
- rollback instructions
- safety gates 和 warnings

脚本会明确拒绝 `--write`，因为 S17 刻意不实现写入。

## 验收标准

- Installer dry-run 测试在实现前失败，实现后通过。
- Dry-run 不创建任何目标文件或目录。
- `--write` 非零退出，并说明 S17 只支持 dry-run。
- package metadata 仍然 private。
- clone-local 仍然是唯一 active channel。
- `node --test` 通过。
- 根目录 VibeLog 校验通过，JSON 保持同步。
- 不 push，不 publish。

## 目标进度快照

- Project Progress: 42 / 100
- Change This Task: +3
- Current Phase: safe installer prototyping
- Next Unlock: rollback/uninstall verification
- Main Risk: S17 只证明安装规划，不执行真实安装，也不验证真实卸载
- Confidence: high
