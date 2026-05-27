# VibeLog Installer Rollback Slice 18 设计

日期：2026-05-27

## 目标

为 VibeLog installer 路径新增 scratch-only rollback verifier。它证明计划中的 installer 写入可以复制到临时 target，并且可以再被移除；在此之前，用户可见的 installer write mode 仍然不存在。

## 为什么需要这一步

S17 证明了安装规划。S18 证明在受控 scratch target 中具备可撤回性。这是从“能描述安装动作”走向“未来可能允许写入仓库外部”之前的安全门槛。

## 范围

包含：

- 新增 `scripts/verify-installer-rollback.mjs`。
- 新增 `test/vibelog-installer-rollback.test.mjs`。
- 暴露 private npm script 用于 rollback verification。
- 保持 `scripts/vibelog-install.mjs --write` 被拒绝。
- 更新 distribution gates、README、中英双文 guide/report 和 VibeLog。

不包含：

- 不开放公开 installer write mode。
- 不写入全局 Codex skill 目录。
- 不编辑全局 Claude Code settings。
- 不发布 package。
- 不推送 GitHub。

## 行为

verifier 会创建或使用 scratch root，在其中创建 `install-root`，复制计划中的 installer 文件，验证关键安装路径存在，删除 scratch install target，并确认 target 已不存在。

verifier 会拒绝已有 target。这样可以保护 scratch 目录里的无关文件，并让第一版 rollback proof 只覆盖 verifier 自己创建的内容。

## 验收标准

- 定向 rollback verifier 测试通过。
- verifier 只写入 scratch target。
- verifier 在验证后删除 scratch install target。
- 已存在的 scratch target 被拒绝且内容保留。
- 公开 installer 仍然拒绝 `--write`。
- 完整 `node --test` 通过。
- VibeLog JSON 通过校验并与 Markdown 同步。

## 进度快照

- Project Progress: 45 / 100
- Change This Task: +3
- Current Phase: safe installer prototyping
- Next Unlock: backup/restore verification 或 release-bundle verification
- Main Risk: S18 只证明新建 scratch 内容的 rollback，不证明覆盖已有用户 target 时的 backup/restore
- Confidence: high
