# VibeLog Installer Backup/Restore Slice 19 设计

日期：2026-05-27

## 目标

为已有 installer target 新增 scratch-only backup/restore verifier。它证明一个带有用户已有内容的 target 可以先备份、再被 installer plan 覆盖模拟、最后恢复到安装前的精确快照。

## 为什么需要这一步

S18 证明了新建 scratch target 的 rollback。S19 覆盖更危险的真实场景：target 已经有用户文件。任何 installer write mode 出现前，VibeLog 都需要证据证明已有内容可以被保护并恢复。

## 范围

包含：

- 新增 `scripts/verify-installer-backup-restore.mjs`。
- 新增 `test/vibelog-installer-backup-restore.test.mjs`。
- 暴露 private npm script 用于 backup/restore verification。
- 更新 distribution gates、README、中英双文 guide/report 和 VibeLog。
- 公开 installer 继续保持 dry-run-only。

不包含：

- 不开放公开 installer write mode。
- 不写入 scratch target 之外。
- 不写入全局 Codex skill 目录。
- 不编辑全局 Claude Code settings。
- 不发布 package。
- 不推送 GitHub。

## 行为

verifier 会创建一个 scratch target，并在每个 installer operation target 下放入用户已有内容。它会先记录 target 快照，备份 operation targets，模拟 installer copy operations，从备份恢复，再把恢复后的 target 与原始快照对比。

verifier 还会检查无关用户内容仍然存在，并确认 installer 创建的新文件在恢复后没有残留。

## 验收标准

- Backup/restore verifier 测试通过。
- verifier 只写入 scratch target。
- 已有 target 内容被精确恢复。
- 无关用户文件被保留。
- installer 新增文件在恢复后被移除。
- 公开 installer 仍然拒绝 `--write`。
- 完整 `node --test` 通过。
- VibeLog JSON 通过校验并与 Markdown 同步。

## 进度快照

- Project Progress: 48 / 100
- Change This Task: +3
- Current Phase: safe installer prototyping
- Next Unlock: release-bundle verification 或明确的 installer write-mode design
- Main Risk: S19 只证明 scratch backup/restore；用户可见 write mode 仍然需要批准和更窄的 UX 设计
- Confidence: high
