# VibeLog Installer Dry-Run、回滚与备份恢复验证指南

S17 新增了只做 dry-run 的 installer planner。它会预览 VibeLog 如何复制到用户选择的本地安装根目录，但不会写入任何文件。

S18 新增了独立的 scratch-only rollback verifier。它会把计划中的文件复制到临时 scratch target，确认安装形态，然后删除 target，并验证回滚确实移除了本次创建的内容。

S19 新增了 scratch-only backup/restore verifier。它会创建一个带有用户已有内容的 target，备份每个 installer operation target，模拟安装覆盖行为，然后从备份恢复，并验证恢复后的 target 与安装前快照完全一致。

## Dry-Run 命令

在当前仓库中运行：

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
```

通过 private clone-local npm script 运行：

```powershell
npm run vibelog:install -- --target "C:\path\to\install-root"
```

## 回滚验证命令

运行 scratch-only verifier：

```powershell
node scripts/verify-installer-rollback.mjs --scratch-root "C:\path\to\scratch-root"
```

通过 private clone-local npm script 运行：

```powershell
npm run vibelog:verify-installer-rollback -- --scratch-root "C:\path\to\scratch-root"
```

## 备份恢复验证命令

运行 scratch-only verifier：

```powershell
node scripts/verify-installer-backup-restore.mjs --scratch-root "C:\path\to\scratch-root"
```

通过 private clone-local npm script 运行：

```powershell
npm run vibelog:verify-installer-backup-restore -- --scratch-root "C:\path\to\scratch-root"
```

## 计划内容

dry-run 命令会输出 JSON，包含：

- `dryRun: true`
- `writesPerformed: false`
- source 和 target 根目录
- 对 `skills/vibelog`、`scripts`、guide docs、`README.md`、`package.json` 的计划复制操作
- 每个 target 会被创建还是更新
- 每个计划操作对应的 rollback steps
- 安全标记：没有 push、publish、upload，也没有编辑全局 Claude settings

backup/restore verifier 会输出 JSON，包含：

- `passed: true`
- `backupPerformed: true`
- `installPerformed: true`
- `restorePerformed: true`
- `existingContentRestored: true`
- `unrelatedContentPreserved: true`
- `newInstallerFilesRemoved: true`

## 安全边界

公开 installer 命令仍然只支持 dry-run。

下面的命令会被拒绝：

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root" --write
```

rollback verifier 和 backup/restore verifier 只允许写入它们控制的 scratch target。它们不会编辑全局 Codex 或 Claude Code 设置，不会 push，也不会 publish。

## 这一步不做什么

- 公开 installer 不复制文件。
- 不编辑 `$HOME\.codex`。
- 不编辑 `$HOME\.claude`。
- 不启用 hooks。
- 不发布 package。
- 不推送 GitHub。

## 下一步

下一个 installer slice 可以考虑设计用户可见的 installer write mode、release bundle verification，或签名/人工批准清单。用户可见的 installer write mode 仍然需要明确批准。
