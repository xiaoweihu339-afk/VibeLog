# VibeLog Installer Dry-Run 指南

S17 新增了一个只做 dry-run 的 installer planner。它会预览 VibeLog 如何复制到用户选择的本地安装根目录，但不会写入任何文件。

## 命令

在当前仓库中运行：

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
```

通过 private clone-local npm script 运行：

```powershell
npm run vibelog:install -- --target "C:\path\to\install-root"
```

## 计划内容

命令会输出 JSON，包含：

- `dryRun: true`
- `writesPerformed: false`
- source 和 target 根目录
- 对 `skills/vibelog`、`scripts`、guide docs、`README.md`、`package.json` 的计划复制操作
- 每个目标会被创建还是更新
- 每个计划操作对应的 rollback steps
- 安全标记：没有 push、publish、upload，也没有编辑全局 Claude settings

## 安全边界

S17 刻意只支持 dry-run。

下面的命令会被拒绝：

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root" --write
```

这样可以避免在 rollback 和 uninstall 行为被测试前发生意外全局安装。

## 这一步不做什么

- 不复制文件。
- 不编辑 `$HOME\.codex`。
- 不编辑 `$HOME\.claude`。
- 不启用 hooks。
- 不发布 package。
- 不推送 GitHub。

## 下一步

下一个 installer slice 应该先在 scratch target 中验证 rollback 和 uninstall 行为，然后才考虑真实 write mode。
