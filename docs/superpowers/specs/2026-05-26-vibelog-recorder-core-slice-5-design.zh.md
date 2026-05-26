# VibeLog Recorder Core Slice 5 设计

## 目标

构建第一版平台无关的 VibeLog 记录内核：一个小型本地 CLI，接收结构化 Vibe Event JSON 文件，更新 `vibe-log.md`，并可选地重新生成 `vibe-log.json`。

## 产品理由

Slice 4 证明了 agent 可以 dogfood VibeLog 并产出验证证据。Slice 5 要把这个证明变成可复用的记录链路。长期 VibeHub 愿景需要一个稳定底层，然后再去做具体 hook adapter 或网站功能。

## 非目标

- 不做后台 daemon。
- 不做 Claude Code hook 实现。
- 不做 Codex hook 实现。
- 不做网页上传。
- 不做数据库。
- 不做完整 JSON Schema validation。
- 不做自动聊天全文转录。

## 架构

Slice 5 新增确定性的 event-to-Markdown recorder：

```txt
Vibe Event JSON -> record-vibelog-event.mjs -> vibe-log.md -> export-vibelog.mjs -> vibe-log.json
```

Markdown 仍然是 source of truth。recorder 只按现有 exporter 已经能理解的 Markdown 格式，追加或替换已知 VibeLog section。

## Vibe Event 类型

第一版支持七种事件：

- `prompt_submitted`：追加到 `Execution Prompts`
- `idea_changed`：追加到 `Idea Evolution`
- `decision_made`：追加到 `Human-in-the-Loop`
- `tool_used`：追加到 `Development Log`
- `test_ran`：追加到 `Verification Evidence`
- `bug_fixed`：追加到 `Bugfix / Incident Log`
- `handoff_updated`：替换 `Handoff State`

## 文件职责

- `scripts/record-vibelog-event.mjs`：把一个 event 应用到一个 VibeLog 文件的 CLI 和库函数。
- `test/record-vibelog-event.test.mjs`：覆盖事件映射、CLI 行为、JSON 导出和组合 session flow。
- `docs/guides/recorder-core.md`：面向用户的 recorder CLI 指南。
- `docs/guides/recorder-core.zh.md`：中文指南。
- `skills/vibelog/references/vibe-event-format.md`：给未来 adapter 使用的稳定事件契约参考。

## 错误处理

recorder 会拒绝：

- 缺少 event type
- 不支持的 event type
- JSON 格式错误
- 支持的 event 缺少必需字段
- 缺少输入 event path

错误信息需要足够明确，让 adapter 或 agent 能修正 event payload。

## 测试

测试遵守本项目原则：

- 单项检查：每类 event 更新到目标 section
- 组合检查：模拟一次 session，应用多个 event，导出 JSON，校验结果，并保持 Markdown/JSON 同步

## 验收标准

- recorder 存在前测试先失败。
- 实现后 recorder 测试通过。
- CLI 可以从 event JSON 文件更新临时 VibeLog。
- CLI 在提供 `--json` 时可以重新生成 JSON。
- 现有 exporter、validator、example integrity tests 和全量测试仍然通过。
- 根 VibeLog 记录 Slice 5 执行和进度。

## 进度预期

如果 Slice 5 完成并通过验证，长期项目进度从 `12 / 100` 保守推进到 `15 / 100`。
