# VibeLog Installer and Package Manager 计划

VibeLog 尚未发布到 npm，也还没有全局 installer。

这份计划定义安全分发路线。它不 publish、不 push，也不做全局安装。

## 当前渠道：Clone-local

Clone-local 仍然是唯一 active distribution channel。

用户 clone 或复制仓库后运行：

```powershell
npm run vibelog -- --help
npm run vibelog -- init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
```

这个渠道由以下内容验证：

- `test/vibelog-package.test.mjs`
- `test/verify-clean-clone-adoption.test.mjs`
- `scripts/verify-clean-clone-adoption.mjs`

## 未来渠道：Release Bundle

Release bundle 可以是 GitHub release archive 或可下载的 zip/tarball。

必要 gates：

- repository license 已选择；
- remote clone 或 release archive 已验证；
- stronger JSON Schema validation 已完成；
- 创建 release 前有人类明确确认；
- examples 或 artifacts 中没有私有项目数据。

## 原型渠道：Local Installer Scripts

Local installer scripts 现在处于 scratch backup/restore verified prototype 状态。公开 installer 命令会预览把 VibeLog skill、scripts、docs、README 和 package metadata 复制到用户选择的位置，但不会写入文件。

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
npm run vibelog:install -- --target "C:\path\to\install-root"
```

S18 新增 scratch-only rollback verifier：

```powershell
node scripts/verify-installer-rollback.mjs --scratch-root "C:\path\to\scratch-root"
npm run vibelog:verify-installer-rollback -- --scratch-root "C:\path\to\scratch-root"
```

S19 新增 scratch-only backup/restore verifier：

```powershell
node scripts/verify-installer-backup-restore.mjs --scratch-root "C:\path\to\scratch-root"
npm run vibelog:verify-installer-backup-restore -- --scratch-root "C:\path\to\scratch-root"
```

backup/restore verifier 会创建一个带有用户已有内容的 scratch target，备份 installer operation targets，模拟安装覆盖行为，从备份恢复，并确认恢复后的 target 与安装前快照完全一致。

必要 gates：

- dry-run mode；
- scratch rollback verification；
- 写入已有 target 前需要 scratch backup/restore verification；
- 默认使用 project-local hook setup；
- 默认不编辑全局 Claude Code settings；
- 写入当前仓库外部前有人类明确确认。

## 未来渠道：Package-manager Distribution

Package-manager distribution 未来可以使用 npm 或其他 registry。

必要 gates：

- license 已选择；
- stronger JSON Schema validation 已完成；
- package name 已检查；
- package contents 已审计；
- publish dry-run 已验证；
- publish 前有人类明确确认。

当前 `package.json` 会保持 private，直到这些 gates 满足。

## 未来渠道：Agent-specific Templates

Agent-specific templates 未来可以把 VibeLog 打包给 Codex、Claude Code、Cursor、AGENTS.md 和其他 agent environments。

必要 gates：

- adapter docs 已验证；
- template smoke tests 已通过；
- 有清晰 uninstall 或 disable path；
- release 前有人类明确确认。

## 安全规则

- 没有人类明确确认，不 push。
- 没有人类明确确认，不 publish。
- license 未选择前，不发布 public package。
- stronger JSON Schema validation 未完成前，不发布 public package。
- 没有 rollback 加 backup/restore verification 和明确批准前，不做 global installer。
- Markdown 继续是事实源。
- JSON 继续是导出格式。
- hook setup 默认保持 project-local 和 opt-in。

## 下一步推荐

最强的下一步是 release-bundle verification，或明确设计用户可见的 installer write mode。用户可见的 installer write mode 仍然需要明确批准。
