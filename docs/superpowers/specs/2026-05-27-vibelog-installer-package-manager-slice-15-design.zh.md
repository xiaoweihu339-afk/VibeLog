# VibeLog Installer and Package Manager Slice 15 设计

日期：2026-05-27

## 目标

为 VibeLog 定义安全的 installer 和 package-manager 分发路线，但暂时不发布 package，也不新增全局 installer。

## 为什么需要这一步

Slice 13 已经证明 clean local clone 可以运行 clone-local package entry。接下来的采用问题是：VibeLog 未来应该如何分发，是 clone-local、release bundle、installer script、package manager，还是 agent-specific template。

过早发布有风险，因为 license 选择、更强 schema validation 和 release verification 仍未完成。因此 S15 先把分发策略明确下来，并让它可以被测试，而不是直接做公开 release 动作。

## 范围

包含：

- 新增机器可读的 distribution plan。
- 新增中英双文 installer/package-manager roadmap docs。
- 新增测试，约束 distribution safety gates。
- 保持 `package.json` 为 private。
- 更新 README 和根目录 VibeLog。

不包含：

- 运行 `npm publish`。
- 推送到 GitHub。
- 新增全局 installer script。
- 修改 package visibility。
- 安装文件到全局用户目录。
- 替代 clean clone verifier。

## 架构

新增 `docs/distribution/vibelog-distribution-plan.json`，作为 distribution channels 和 release gates 的机器可读来源。

新增中英双文 guide docs：

- `docs/guides/vibelog-installer-package-manager-plan.md`
- `docs/guides/vibelog-installer-package-manager-plan.zh.md`

新增 `test/vibelog-distribution-plan.test.mjs`，断言：

- plan 是可解析 JSON；
- clone-local 是唯一 active channel；
- npm package distribution 仍处于 deferred；
- public package distribution 必须依赖 license、schema validation、明确 human approval 和 publish dry-run evidence；
- 当前 `package.json` 保持 private；
- docs 不声称 VibeLog 已经发布。

## 分发渠道

推荐顺序：

1. Clone-local：当前 active channel，已由 S13 验证。
2. Release bundle：未来 GitHub release zip 或 tarball，需要 remote clone verification 和 license selection。
3. Local installer scripts：未来 PowerShell 和 shell install helpers，需要 uninstall/rollback tests。
4. Package-manager distribution：未来 npm package，需要 schema validation、license selection、package dry-run 和明确 human approval。
5. Agent-specific templates：未来 Codex、Claude Code、Cursor 和 AGENTS.md helper packs。

## 安全规则

- 没有人类明确确认，不 publish。
- 没有人类明确确认，不 push。
- license 未选择前，不发布 public package。
- 更强 schema validation 未完成前，不发布 public package。
- 没有 uninstall 或 rollback verification 前，不做 global installer。
- 项目级 hook setup 继续保持 opt-in。
- Markdown 继续是事实源，JSON 继续是导出格式。

## 验收标准

- `node --test test\vibelog-distribution-plan.test.mjs` 通过。
- `node --test` 通过。
- 中英双文 distribution docs 存在。
- `package.json` 仍然有 `"private": true`。
- 根目录 VibeLog 已更新，JSON 同步。
- 不 push，不 publish。

## 目标进度快照

- Project Progress: 36 / 100
- Change This Task: +2
- Current Phase: installer/package-manager distribution design
- Next Unlock: stronger JSON Schema validation or installer dry-run prototype
- Main Risk: this is a distribution design and guardrail slice, not an actual installer or package release
- Confidence: medium-high
