# Vibe 验证指南

VibeLog 验证应优先由 agent 执行。人类负责审查方向、真实性和最终证据；agent 负责运行可重复检查，并把结果记录下来。

## 原则

如果 agent 可以 vibe 验证，就不要让人类手动验证。

保持质疑，严格验证。

不要相信没有证据的结论、agent 报告或看起来合理的输出。每个结果都先视为未证明，直到检查已经运行、输出已经读过、残余风险已经说明。

人工审查应聚焦判断，而不是重复劳动。agent 应创建场景、运行命令、导出结构化数据、校验输出，并汇报证据。

## 人类角色

- 批准或拒绝产品方向。
- 拒绝看起来虚假、过度包装、或脱离真实工作的日志。
- 判断 handoff state 是否能让另一个人或 agent 理解。
- 决定 public/private projection 是否可接受。
- 做出品味、范围、风险、命名、隐私和发布相关决策。

## Agent 角色

- 当没有真实项目可用时，在仓库外创建或运行 scratch vibe 场景。
- 用 VibeLog 记录过程，同时保留想法变化和人类决策。
- 当提示词直接指导构建、编辑、调试、测试、重构、写文档、部署、检查文件、执行命令或工程研究时，严格记录工程执行提示词。
- 从 Markdown 导出 JSON。
- 校验 JSON。
- 运行单项检查和组合检查。
- 汇报证据、已知缺口、残余风险和保守项目进度。

## 单项检查

每个生成的 VibeLog 都应包含：

- 一句话想法
- 当前想法
- 想法演化
- human-in-the-loop 决策
- 执行提示词记录
- 开发日志
- bugfix 或 incident 日志
- 验证设计
- 验证证据
- artifact index
- handoff state
- public summary

## 组合检查

把 exporter、validator、drift check 和仓库测试套件放在一起运行。公开示例目录只能包含生成的 VibeLog 记录，不能包含 scratch 项目源码。

推荐命令：

```powershell
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json
node scripts/validate-vibelog.mjs examples/public-sample/vibe-log.json
node scripts/export-vibelog.mjs examples/public-sample/vibe-log.md --out examples/public-sample/vibe-log.json --check
node --test
```

## 进度快照

完成汇报时，需要包含 `docs/guides/progress-reporting.zh.md` 中定义的保守项目进度快照。

进度快照以长期 VibeHub / Vibe Repo 生态为 100%，不是以本地仓库任务列表为 100%。数字要保守，并说明下一个解锁点。
