# Claude Code Opt-In Hook 安装 Slice 8 设计

## 目标

为真实项目启用 VibeLog Claude Code hooks 创建第一条安全采用路径，同时不触碰全局 Claude Code settings。

## 产品理由

Slice 7 已经在 scratch workspace 证明 hook 链路能跑。Slice 8 要把这个证明变成可复用的项目级采用步骤。用户应该能先查看计划写入的 `.claude/settings.json` 变更，再明确选择是否写入。

## 代码原则

实现保持简洁、安全、功能优先：

- 简洁：一个 generator 脚本，一个测试文件，一个指南。
- 安全：默认 dry-run，只写项目级 settings，不改全局 settings，不推送，不上传。
- 功能：生成可用的 VibeLog hook settings，并拒绝不安全写入。

## 非目标

- 不全局安装 hooks。
- 本 slice 不运行 live Claude Code session。
- 不编辑目标项目之外的 Claude settings。
- 不做包发布或 marketplace packaging。
- 不建设 VibeHub 网站。

## 架构

```txt
real project path
  -> safety checks
  -> generated hook command
  -> merged project .claude/settings.json preview
  -> optional --write
  -> existing adapter / recorder chain
```

generator 应保留无关的现有 settings。它应该为 `UserPromptSubmit`、`PostToolUse` 和 `Stop` 添加 VibeLog hooks，并避免重复添加同一条 command。

## Generator 行为

`scripts/configure-claude-code-vibelog-hooks.mjs` 应该：

1. 接收 `--project <path>` 和 `--adapter <path>`。
2. 默认 dry-run。
3. 只有传入 `--write` 才写文件。
4. 当 `vibe-log.md` 缺失时拒绝写入，除非传入 `--allow-missing-log`。
5. 拒绝全局 `.claude` 路径。
6. 创建或合并项目级 `.claude/settings.json`。
7. 保留无关的现有 settings 和 hooks。
8. 报告目标路径、ready 状态、warnings，以及是否实际写入。

## Settings 形状

生成的 hooks 应调用现有 adapter：

```powershell
node <adapter> --log <project-vibe-log> --json <project-vibe-json> --event-dir <project-event-dir>
```

在 Windows 上，生成的 hook entry 应包含 `shell: "powershell"`，并使用 `$env:CLAUDE_PROJECT_DIR` 路径。其他平台使用 `$CLAUDE_PROJECT_DIR` 路径。

## 安全规则

- Dry-run 不能创建 `.claude/settings.json`。
- Write mode 只能写入 `<project>/.claude/settings.json`。
- 现有非 VibeLog settings 必须保留。
- 现有 VibeLog hook entry 不能重复。
- 默认情况下，缺失 `vibe-log.md` 应阻止写入，因为 hook 否则可能更新到不符合预期的空目标。

## 验收标准

- generator 存在前，测试先失败。
- 实现后测试通过。
- Dry-run 返回生成的 settings，并且不写文件。
- 当 `vibe-log.md` 存在时，write mode 创建项目级 `.claude/settings.json`。
- 现有 settings 被保留，重复 VibeLog hooks 被避免。
- 不安全的全局 `.claude` target paths 被拒绝。
- 添加双语安装指南和 Slice 8 报告。
- 根 VibeLog 记录任务、验证和进度快照。

## 进度预期

如果 generator、指南、测试和报告都通过完整验证，项目进度从 `20 / 100` 到 `22 / 100`。
