# VibeLog Clean Clone Adoption Slice 13 设计

日期：2026-05-27

## 目标

验证一个全新的本地 VibeLog 仓库副本，能否通过 clone-local package entry 跑完整个普通项目采用流程。

## 为什么需要这一步

Slice 12 证明了 `npm run vibelog` 在当前工作区可以运行。这有价值，但还不能证明另一个用户或 agent 从干净仓库副本开始也能顺利使用。

Slice 13 把 package 路径变成采用证据：把仓库 clone 到 scratch 目录，从这个 clean clone 里运行 package entry，初始化另一个目标项目，预览 hooks，写入 hooks，验证 ready，关闭 hooks，并确认全局 Claude Code settings 没有变化。

## 范围

包含：

- 新增 clean clone adoption verifier 脚本。
- 为 verifier 和 CLI 输出新增自动化测试。
- 使用仓库外部的 scratch 目录。
- 从源仓库运行 `git clone --local --no-hardlinks`。
- 在 clean clone 中通过 `npm run vibelog` 运行 VibeLog package entry。
- 验证 `init`、`enable-hooks` dry-run、`enable-hooks --write`、`verify` 和 `disable-hooks`。
- 检查 dry-run 不创建 settings。
- 检查全局 Claude Code settings 没有变化。
- 新增中英双文 Slice 13 报告。
- 更新 README 和根目录 VibeLog。

不包含：

- 推送到 GitHub。
- 发布到 npm。
- 安装全局命令。
- 运行 live Claude Code。
- 覆盖所有可能的用户项目形态。

## 架构

新增 `scripts/verify-clean-clone-adoption.mjs`。

verifier 会在指定 workspace 下创建唯一运行目录：

```txt
<workspace>/
`-- run-<unique>/
    |-- vibelog-clean-clone/
    `-- target-project/
```

它会从 `vibelog-clean-clone` 中运行 package commands，并把 `--project` 指向 `target-project`。hook adapter path 也来自 clean clone，而不是原始工作区。

## 安全规则

- verifier 只写入指定 scratch workspace。
- target project 与 clean clone 分离。
- dry-run 不得创建 `.claude/settings.json`。
- write mode 只能创建 `<target-project>/.claude/settings.json`。
- 验证前后对全局 Claude Code settings 做 fingerprint。
- verifier 不 push、不 publish、不 upload。

## 测试设计

单项检查：

- verifier function 创建 clean clone 和 target project。
- package help command 输出 `vibelog-project`。
- `init` 创建有效的 `vibe-log.md` 和 `vibe-log.json`。
- dry-run 不写入 target settings。
- write mode 写入 target settings。
- `verify` 在 disable 前报告 `ready: true`。
- `disable-hooks` 移除 3 个 VibeLog hook commands。
- 全局 Claude Code settings 保持不变。

组合检查：

- 脚本 CLI 在 clean clone workflow 通过时输出 JSON 并以 0 退出。
- 新增 verifier tests 后，完整 `node --test` 通过。

## 验收标准

- `node --test test\verify-clean-clone-adoption.test.mjs` 通过。
- `node scripts\verify-clean-clone-adoption.mjs --workspace "C:\Users\HXW\Documents\vibelog-scratch\slice-13-clean-clone-adoption"` 以 0 退出，并返回 `"passed": true`。
- `node --test` 通过。
- 根目录 VibeLog 已更新，JSON 同步。
- 不发生 GitHub push 或 npm publish。

## 目标进度快照

- Project Progress: 34 / 100
- Change This Task: +3
- Current Phase: clean clone adoption verification
- Next Unlock: installer/package-manager design or stronger schema validation
- Main Risk: the verification uses a local clone path, not a remote clone or public package registry
- Confidence: medium-high
