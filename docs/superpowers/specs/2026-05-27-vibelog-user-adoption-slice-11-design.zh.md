# VibeLog 普通用户采用路径 Slice 11 设计

日期：2026-05-27

## 目标

创建第一条普通用户可以使用的 VibeLog 项目路径：初始化日志、预览或启用 Claude Code hooks、验证就绪状态，并安全关闭这些 hooks。

## 为什么需要这一步

Slice 10 已经证明项目级 hook 路径可以在接近真实项目的 scratch project 中跑通。但这仍然不是普通用户入口：正常用户不应该先理解 exporter、hook generator 和 verifier 的底层细节，才能开始尝试 VibeLog。

S11 把现有能力收束成一个小的采用命令面，同时保持实现保守。

## 范围

包含：

- 新增一个用户入口 CLI：`scripts/vibelog-project.mjs`。
- 支持 `init`、`enable-hooks`、`verify` 和 `disable-hooks`。
- `enable-hooks` 默认 dry-run，只有传入 `--write` 才修改 settings。
- init 时创建有效的 `vibe-log.md` 和 `vibe-log.json`。
- verify 时检查日志有效性、JSON 同步、项目级 settings 和 VibeLog hook 是否存在。
- disable 时只移除 VibeLog hook commands，保留无关 Claude settings。
- 添加中英双文用户指南、计划、报告、README 链接和 VibeLog 记录。

不包含：

- 公开 package 发布。
- 编辑全局 Claude Code settings。
- 自动运行付费 Claude Code live session。
- 网站或 UI 工作。

## 架构

`scripts/vibelog-project.mjs` 封装底层工具：

```txt
init          -> 渲染最小 VibeLog Markdown -> 导出 JSON
enable-hooks  -> configureClaudeCodeVibeLogHooks(...)
verify        -> validate JSON、检查 drift、检查项目级 settings
disable-hooks -> 从项目 settings 中移除 claude-code-hook-adapter.mjs commands
```

每个 command 都输出 JSON，方便 agent 和未来 UI 读取结果。

## 安全规则

- 除读取 adapter path 外，任何 command 都不写入目标项目之外。
- `enable-hooks` 默认 dry-run，除非传入 `--write`。
- `init` 默认拒绝覆盖已有 `vibe-log.md`，除非传入 `--force`。
- `disable-hooks` 只移除包含 `claude-code-hook-adapter.mjs` 的 commands。
- CLI 不编辑全局 Claude Code settings。
- CLI 不 push，也不上传数据。

## 测试设计

单项检查：

- `init` 创建 `vibe-log.md` 和 `vibe-log.json`，并且 JSON 校验通过。
- `init` 默认拒绝覆盖已有日志。
- `enable-hooks` dry-run 不写 settings。
- `enable-hooks --write` 创建项目级 settings。
- `verify` 在 init 和 hook enable 后报告 ready。
- `disable-hooks` 移除 VibeLog hook commands，同时保留无关 settings。

组合检查：

- 一个 temp project 可以运行 `init -> enable-hooks --write -> verify -> disable-hooks -> verify`，且不触碰全局 settings。

## 验收标准

- `node --test test\vibelog-project.test.mjs` 通过。
- `node scripts\vibelog-project.mjs init --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption" --title "Slice 11 Adoption Test" --idea "Verify ordinary users can initialize and manage VibeLog safely."` 返回 JSON，且 `created: true`。
- `node scripts\vibelog-project.mjs enable-hooks --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption" --adapter "C:\Users\HXW\Documents\vibecoding\scripts\claude-code-hook-adapter.mjs" --write` 返回 JSON，且 `wrote: true`。
- `node scripts\vibelog-project.mjs verify --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption"` 返回 JSON，且 `ready: true`。
- `node scripts\vibelog-project.mjs disable-hooks --project "C:\Users\HXW\Documents\vibelog-scratch\slice-11-user-adoption"` 返回 JSON，且 removed hook count 大于 0。
- `node --test` 通过。
- 根目录 VibeLog 已更新，JSON 同步。

## 目标进度快照

- Project Progress: 28 / 100
- Change This Task: +3
- Current Phase: ordinary-user adoption path
- Next Unlock: packaging and install distribution
- Main Risk: the CLI is still local-repository based, not yet a packaged command installed globally or through a package manager
- Confidence: medium-high
