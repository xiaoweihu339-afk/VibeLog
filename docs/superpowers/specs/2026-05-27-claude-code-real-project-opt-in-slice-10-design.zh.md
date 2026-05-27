# Claude Code 真实项目 Opt-In Slice 10 设计

日期：2026-05-27

## 目标

验证 VibeLog Claude Code opt-in hook 路径能在一个接近真实项目的项目级 workspace 中工作，同时不编辑全局 Claude Code settings。

## 为什么需要这一步

Slice 8 证明了 VibeLog 可以生成项目级 hook settings。Slice 7 证明了 hook payload 可以通过 adapter 更新 scratch VibeLog。Slice 10 要把这两条路径接起来：一个类似真实项目的目录选择 opt in，写入本地 settings，然后由生成出来的 settings command 更新 `vibe-log.md` 和 `vibe-log.json`。

在打包或推荐给普通用户之前，这一步是必要的验收。

## 范围

包含：

- 在本仓库外创建 scratch 项目。
- 包含普通项目文件，例如 `package.json`、source 和 tests。
- scratch source 留在本仓库外。
- 运行现有 opt-in settings generator 的 dry-run 模式。
- 显式运行 write 模式。
- 读取生成的项目级 `.claude/settings.json`。
- 用代表性的 Claude hook payload 执行生成出来的 hook command。
- 验证 scratch 项目里的 `vibe-log.md`、`vibe-log.json` 和 `.vibelog-events/` 被更新。
- 记录中英双文证据，并更新根目录 VibeLog。

不包含：

- 安装 hook 到全局 Claude Code settings。
- 默认运行完整付费 Claude Code live session。
- 增加网站功能。
- 为公开分发打包 VibeLog。

## 架构

新增一个聚焦的 verifier 脚本：

```txt
scripts/verify-claude-code-opt-in-project.mjs
```

这个脚本创建或刷新 scratch 项目，调用 `configureClaudeCodeVibeLogHooks`，检查生成的 settings，从 settings 中取出 hook command，在设置 `CLAUDE_PROJECT_DIR` 的情况下执行代表性事件，并校验生成的 VibeLog。

这个 verifier 不是 daemon，也不是后台 installer。它是安全采用路径的验收测试工具。

## 安全规则

- 默认 workspace 位于 `C:\Users\HXW\Documents\vibelog-scratch\slice-10-real-project-opt-in`。
- verifier 复用现有 generator 的 guard，拒绝全局 Claude settings 路径。
- verifier 只能写入所选 scratch 项目内部。
- 本仓库只保存 verifier、测试、报告和 VibeLog 记录。
- 不 push。

## 测试设计

单项检查：

- Dry-run 不创建 `.claude/settings.json`。
- Write mode 只创建 `<project>/.claude/settings.json`。
- 生成的 settings 包含 `UserPromptSubmit`、`PostToolUse` 和 `Stop`。
- 生成的 command 使用 `CLAUDE_PROJECT_DIR`。
- Hook events 会更新 Markdown、JSON 和 event files。

组合检查：

- 一个命令创建 scratch 项目、安装项目级 hooks、通过生成的 settings command 运行代表性的 prompt/tool/test/stop events，并验证导出的 VibeLog 有效。

## 验收标准

- `node --test test\verify-claude-code-opt-in-project.test.mjs` 通过。
- `node scripts\verify-claude-code-opt-in-project.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-10-real-project-opt-in" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs"` 返回通过的 JSON 结果。
- `node --test` 通过。
- 根目录 `vibe-log.md` 和 `vibe-log.json` 已更新且同步。
- 存在中英双文 Slice 10 报告。

## 目标进度快照

- Project Progress: 25 / 100
- Change This Task: +2
- Current Phase: real-project opt-in acceptance
- Next Unlock: package/install path for normal users
- Main Risk: this validates generated hook commands with fixture payloads, not a full live Claude Code paid session by default
- Confidence: medium
