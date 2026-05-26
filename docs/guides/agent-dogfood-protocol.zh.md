# Agent Dogfood 协议

当没有合适的真实项目可用时，使用这个协议通过 scratch vibe 项目验证 VibeLog。

目标不是发布这个 scratch 产品。目标是证明 VibeLog 能记录真实的 agent-led vibe coding 过程，保留重要决策，导出 JSON，校验结果，并留下可交接的状态。

## 仓库边界

scratch 源码必须创建在本仓库之外。只能把生成的 VibeLog 记录复制到 `examples/<case-name>/`。

对于 `reading-card-lite` 案例，示例目录只能包含：

- `README.md`
- `vibe-log.md`
- `vibe-log.json`

scratch 源码、package 文件、测试和临时产物必须留在本仓库之外。

## 必须包含的场景事件

scratch 运行必须包含：

- 初始产品想法
- 一次想法变化
- 一次 human-in-the-loop 决策
- 一条精确工程执行提示词
- 至少一条开发日志
- 一条 bugfix 或 incident 记录
- 验证设计
- 验证证据
- handoff state

## 必须运行的命令

生成示例存在后，运行这些仓库检查：

```powershell
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json
node scripts/validate-vibelog.mjs examples/reading-card-lite/vibe-log.json
node scripts/export-vibelog.mjs examples/reading-card-lite/vibe-log.md --out examples/reading-card-lite/vibe-log.json --check
node --test
```

scratch 项目的测试需要在 scratch 文件夹内运行，并把命令结果记录到示例 VibeLog 中。

## 证据报告

最终报告应该说明：

- 生成了什么
- 哪些命令通过了
- scratch source 留在哪里
- 哪些文件进入了仓库
- 还有什么风险
- 保守项目进度快照

在 scratch 测试、示例校验、drift check、仓库测试和仓库边界检查全部运行之前，不要声称 dogfood 运行完成。
