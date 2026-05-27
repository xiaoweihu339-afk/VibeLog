# Agent Dogfood 协议

当暂时没有合适的真实项目可用时，可以用一个仓库外的 scratch vibe 项目验证 VibeLog。

目标不是发布这个 scratch 产品，而是验证 VibeLog 能否记录 agent 参与的真实开发过程、保留关键人类决策、导出 JSON、通过校验，并留下可交接的状态。

## 仓库边界

scratch 源码必须放在本仓库之外。真实或实验性的 dogfood 源码、原始提示词、hook payload、package 文件、测试输出和临时产物都不要进入本仓库。

只有合成的、或已经明确脱敏并适合公开复用的 VibeLog 示例，才可以提交到 `examples/`。公开示例目录只能包含：

- `README.md`
- `vibe-log.md`
- `vibe-log.json`

默认公开示例是 `examples/public-sample/`。不要用私有项目日志替换它。

## 必须包含的场景事件

scratch 运行应包含：

- 初始产品想法
- 一次想法变化
- 一次 human-in-the-loop 决策
- 一条工程执行提示词记录；如果示例会公开，使用 `summary_only` 或脱敏文本
- 至少一条开发日志
- 一条 bugfix 或 incident 记录
- 验证设计
- 验证证据
- handoff state

## 必须运行的命令

生成公开示例后，运行这些仓库检查：

```powershell
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json
node scripts/validate-vibelog.mjs examples/public-sample/vibe-log.json
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json --check
node --test
```

如果使用 scratch 项目，scratch 项目的测试应在 scratch 文件夹内运行，并把结果记录到对应 VibeLog 中。

## 证据报告

最终报告应说明：

- 生成了什么
- 哪些命令通过
- scratch source 留在了哪里
- 哪些文件进入仓库
- 还剩什么风险
- 保守项目进度快照

在 scratch 测试、示例校验、drift check、仓库测试、隐私审计和仓库边界检查都运行之前，不要声称 dogfood 运行完成。
