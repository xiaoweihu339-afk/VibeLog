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

Local installer scripts 现在处于 dry-run prototype 状态。当前命令只预览复制 VibeLog skill、scripts、docs、README 和 package metadata 到用户选择的目标目录，但不写入文件。

```powershell
node scripts/vibelog-install.mjs --target "C:\path\to\install-root"
npm run vibelog:install -- --target "C:\path\to\install-root"
```

S17 会拒绝 `--write`。只有在 scratch target 中验证 rollback 或 uninstall 行为之后，才可以考虑真实写入模式。

必要 gates：

- dry-run mode；
- uninstall 或 rollback verification；
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
- rollback verification 未完成前，不做 global installer。
- Markdown 继续是事实源。
- JSON 继续是导出格式。
- hook setup 默认保持 project-local 和 opt-in。

## 下一步推荐

最强的下一步是在 scratch target 中验证 rollback 或 uninstall。这样可以在任何真实 write mode 出现前，保持 installer 工作安全。
