# VibeLog 项目采用指南

这份指南给出在普通本地项目中使用 VibeLog 的最短安全路径。

## 安全模型

- 只操作项目本地文件。
- 不编辑全局 Claude Code settings。
- 不 push 到 GitHub。
- 不上传数据。
- hook 启用默认 dry-run，只有传入 `--write` 才写入。
- disable 只移除 VibeLog hook commands，并保留无关 settings。

## 初始化 VibeLog

```powershell
node scripts\vibelog-project.mjs init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
```

预期结果：

- `vibe-log.md` 存在。
- `vibe-log.json` 存在。
- JSON 由 Markdown 生成。

## 预览 Hooks

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"
```

预期结果：

- `dryRun` 为 `true`。
- `wrote` 为 `false`。
- 输出将要生成的 settings，供用户检查。

## 启用 Hooks

```powershell
node scripts\vibelog-project.mjs enable-hooks --project "C:\path\to\project" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --write
```

预期结果：

- `<project>/.claude/settings.json` 存在。
- `UserPromptSubmit`、`PostToolUse` 和 `Stop` 都有 VibeLog hooks。
- 已有无关 settings 被保留。

## 验证就绪状态

```powershell
node scripts\vibelog-project.mjs verify --project "C:\path\to\project"
```

预期结果：

- `ready` 为 `true`。
- VibeLog JSON 有效。
- Markdown 和 JSON 同步。
- 项目级 hooks 已启用。

## 关闭 Hooks

```powershell
node scripts\vibelog-project.mjs disable-hooks --project "C:\path\to\project"
```

预期结果：

- VibeLog hook commands 被移除。
- 非 VibeLog settings 被保留。
- `vibe-log.md` 和 `vibe-log.json` 仍留在项目中。

## 这不会做什么

- 不会自动运行 Claude Code。
- 不会安装全局命令。
- 不会发布项目。
- 不会把私有想法变公开。
