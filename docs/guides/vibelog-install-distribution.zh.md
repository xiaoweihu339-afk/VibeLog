# VibeLog 安装与分发指南

这份指南说明 VibeLog 目前安全的分发方式。

VibeLog 还没有发布到 npm。Slice 12 支持的是 clone-local 用法：克隆或复制这个仓库，不额外安装运行时依赖，然后使用本地 npm script 或 Node 入口运行。

## 安全边界

- package 被标记为 `private`。
- 不启用 `npm publish` 路径。
- 不 push 到 GitHub。
- 不上传私有项目数据。
- hook 设置保持项目本地、用户选择启用。
- Claude Code hooks 只有在传入 `--write` 时才会写入。

## 要求

- 推荐 Node.js 20 或更新版本。
- npm 必须在 PATH 中可用。
- 本文 PowerShell 示例使用 Windows 路径。

检查本地工具链：

```powershell
node --version
npm --version
```

## Clone-Local 用法

在本仓库根目录运行：

```powershell
npm run vibelog -- --help
```

等价的直接 Node 入口：

```powershell
node scripts\vibelog-project.mjs --help
```

## 初始化项目

```powershell
npm run vibelog -- init --project "C:\path\to\project" --title "My Vibe Project" --idea "One sentence describing the product idea."
```

预期结果：

- 目标项目中创建 `vibe-log.md`。
- `vibe-log.json` 从 Markdown 源文件导出。
- 如果已有 `vibe-log.md`，默认不覆盖，除非传入 `--force`。

## 预览 Hook 设置

```powershell
npm run vibelog -- enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs"
```

预期结果：

- 输出 settings 供检查。
- 不写入文件。
- `dryRun` 为 `true`。

## 写入项目级 Hooks

```powershell
npm run vibelog -- enable-hooks --project "C:\path\to\project" --adapter "C:\path\to\VibeLog\scripts\claude-code-hook-adapter.mjs" --write
```

预期结果：

- 写入 `<project>/.claude/settings.json`。
- 只改变项目本地 settings。
- 保留已有无关 settings。

## 验证与关闭

```powershell
npm run vibelog -- verify --project "C:\path\to\project"
npm run vibelog -- disable-hooks --project "C:\path\to\project"
```

`verify` 会检查 Markdown 日志存在、JSON 存在、JSON 有效、Markdown 和 JSON 同步、项目级 hooks 已启用。

`disable-hooks` 只移除 VibeLog hook commands。它会保留 VibeLog 文件和无关 Claude Code settings。

## 验证命令

单项检查：

```powershell
node --test test\vibelog-package.test.mjs
```

组合检查：

```powershell
node --test
npm run vibelog -- --help
node scripts\validate-vibelog.mjs vibe-log.json
node scripts\export-vibelog.mjs vibe-log.md --out vibe-log.json --check
git diff --check
```

## 未来分发

后续 slice 可以增加 clean clone 验证脚本、安装说明和真正的包管理器分发路径。这些步骤仍应保持同样的原则：Markdown 是事实源，JSON 是导出格式，项目默认私有，任何发布或推送都需要人类明确确认。
