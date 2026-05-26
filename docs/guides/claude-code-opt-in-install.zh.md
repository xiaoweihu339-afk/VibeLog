# Claude Code Opt-In 安装指南

本指南说明如何为一个真实 Claude Code 项目安全启用 VibeLog 记录。

## 安全模型

- 只写项目级配置：`<project>/.claude/settings.json`。
- 默认 dry-run。
- 只有显式传入 `--write` 才会修改文件。
- 不编辑全局 Claude Code settings。
- 不推送 GitHub。
- 不上传源码。
- 当 `vibe-log.md` 缺失时默认阻止 write mode，除非传入 `--allow-missing-log`。

## 开始前

确认目标项目已有 VibeLog：

```powershell
Test-Path C:\path\to\project\vibe-log.md
```

确认 Claude Code 已安装：

```powershell
claude --version
```

在公开项目或多人共享项目中使用前，先检查当前官方 Claude Code hook 文档：

```txt
https://docs.anthropic.com/en/docs/claude-code/hooks
```

## Dry Run

先预览将要生成的 settings：

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

预期结果：

- `dryRun` 为 `true`。
- `wrote` 为 `false`。
- `settingsPath` 位于目标项目内部。
- `generatedSettings.hooks` 包含 `UserPromptSubmit`、`PostToolUse` 和 `Stop`。

## 写入项目级 Settings

确认 dry-run 输出后：

```powershell
node scripts/configure-claude-code-vibelog-hooks.mjs --project "C:\path\to\project" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --write
```

预期结果：

- `dryRun` 为 `false`。
- `wrote` 为 `true`。
- `<project>/.claude/settings.json` 存在。
- 现有无关 settings 会被保留。

## 安装后验证

检查生成的 settings：

```powershell
Get-Content C:\path\to\project\.claude\settings.json
```

然后在目标项目内运行一个很小的 Claude Code session，并检查 `vibe-log.md`。只有在你确认生成的 settings 符合预期后再做这一步。

## 回滚

只从这个文件中移除 VibeLog hook groups：

```txt
<project>/.claude/settings.json
```

如果这个文件只是为了 VibeLog 创建，且没有其他 settings，删除它即可。

## 这一步不会做什么

- 不全局安装。
- 不自动运行 Claude Code。
- 不发布或上传 VibeLog 数据。
- 不把私有想法变公开。

## Troubleshooting

- `Missing vibe-log.md`：先创建或复制一个 VibeLog，再写入 hooks。
- `Refusing to configure global Claude settings path`：请选择真实项目目录，不要选择 `~/.claude`。
- hook 看起来没有运行：使用 Claude Code `stream-json` 输出和 `--include-hook-events` 检查 hook lifecycle events。
