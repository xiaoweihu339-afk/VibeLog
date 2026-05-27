# VibeLog Release Bundle Slice 20 设计

日期：2026-05-27

## 目标

新增一个 scratch-only release bundle verifier，用来证明干净解压后的 VibeLog package 可以在当前工作仓库之外被使用。

## 为什么这一步重要

S13 验证了 clone-local adoption。S17-S19 验证了 installer dry-run、rollback、backup/restore 在 scratch target 内的安全性。S20 把这些路径连接到“可下载 package”的形态：如果别人拿到一个干净 archive，skill、CLI 和安全 verifiers 也应该能一起跑通，然后才有资格讨论 GitHub push、release 或 npm publish。

## 范围

包含：

- 新增 `scripts/verify-release-bundle.mjs`。
- 新增 `test/verify-release-bundle.test.mjs`。
- 为 release bundle verification 暴露 private npm script 和 bin entry。
- 在 scratch directory 中验证 `npm pack` 输出，不 publish。
- 解压 `.tgz`，并从解压后的 package 运行 VibeLog CLI adoption 和 installer safety verifiers。
- 更新 distribution gates、README、中英双文计划/报告文档，以及 VibeLog。

不包含：

- 不 GitHub push。
- 不创建 GitHub release。
- 不 npm publish。
- 不做 global installer。
- 不做用户可见 installer write mode。
- 不编辑全局 Claude Code 或 Codex settings。

## 行为

verifier 会运行 `npm pack --json --pack-destination <scratch-root>`，解压生成的 `.tgz`，检查必要 package paths，确认禁止路径不存在，初始化 consumer project，在 scratch 内预览并写入 project-local hooks，验证 ready 状态，disable hooks，然后从解压后的 package 运行 rollback 和 backup/restore verifiers。

## 验收标准

- Release bundle verifier tests 通过。
- Package metadata 暴露 verifier entrypoint。
- bundle 中包含必要的 skill、script、docs 和 package files。
- bundle 中不包含 `.git`、`node_modules` 和 test sources。
- 解压后的 package 可以初始化并验证 consumer project。
- Installer rollback 和 backup/restore verifiers 可以从解压后的 package 通过。
- 完整 `node --test` 通过。
- VibeLog JSON 校验通过，并与 Markdown 一致。
- 不发生 push 或 publish。

## 进度快照

- Project Progress: 51 / 100
- Change This Task: +3
- Current Phase: distribution readiness and release safety
- Next Unlock: push milestone review or user-visible installer write-mode design
- Main Risk: release-bundle verification 仍然是本地 scratch-only；公开 release 还需要 license、最终 release notes 和明确批准
- Confidence: high
