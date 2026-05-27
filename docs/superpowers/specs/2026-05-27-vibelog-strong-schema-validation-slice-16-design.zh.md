# VibeLog 强 Schema 校验 Slice 16 设计

日期：2026-05-27

## 目标

让 `scripts/validate-vibelog.mjs` 直接执行 VibeLog JSON schema，同时保持无依赖，并继续坚持 Markdown 是事实源。

## 为什么需要这一步

之前的 validator 只检查少量实用错误：核心身份字段缺失、stage 枚举、核心 section 是否为数组，以及 execution prompt 的 recording mode。这对早期 exporter 足够，但对未来 installer、package 分发、上传流程和 agent 交接还不够稳。

Slice 16 要把 schema 文件变成真正生效的数据契约。VibeLog 在被分享、打包或上传前，应该能拒绝非法枚举、缺失必需对象、意外字段和错误的嵌套值。

## 范围

包含：

- 在 validator 中读取 `skills/vibelog/assets/vibe-log.schema.json`。
- 新增一个无依赖的 JSON Schema 子集校验器。
- 支持 VibeLog 当前使用的 schema 能力：`type`、type 数组、`enum`、`required`、`properties`、`items`、`additionalProperties: false`。
- 保留现有可读错误信息。
- 调整 schema，使它匹配当前 Markdown exporter 和已生成示例。
- 增加回归测试，覆盖 schema 枚举错误、必需字段缺失、意外字段、嵌套枚举错误。
- 更新 README、export guide、报告、根目录 VibeLog 和 JSON 导出。

不包含：

- 引入 Ajv 或其他 npm 依赖。
- 支持完整 JSON Schema 规范。
- 改变 Markdown-first 的事实源原则。
- 发布 package、推送 GitHub，或改变 package visibility。

## 架构

`validate-vibelog.mjs` 保留一个公开函数：

```js
validateVibeLog(data)
```

这个函数现在执行两层检查：

1. 基于 `skills/vibelog/assets/vibe-log.schema.json` 的 schema 校验。
2. 原有的实用检查：核心身份字符串非空、execution prompt 记录可读。

schema 子集校验器刻意保持很小。它递归遍历对象和数组，检查 required 字段、enum 值、基础类型，并在 schema 声明 `additionalProperties: false` 时拒绝未知属性。

## 验收标准

- 新增 schema 校验测试在实现前失败，实现后通过。
- `node --test test\validate-vibelog.test.mjs` 通过。
- `node --test test\vibelog-examples.test.mjs` 通过，并且所有示例都经过更强 validator。
- `node --test` 通过。
- 根目录和示例 `vibe-log.json` 都能通过校验。
- `vibe-log.json` 与 `vibe-log.md` 保持同步。
- 不新增外部依赖。
- 不 push，不 publish。

## 目标进度快照

- Project Progress: 39 / 100
- Change This Task: +3
- Current Phase: data contract hardening
- Next Unlock: installer dry-run prototype 或 remote clone/release-bundle verification
- Main Risk: 这仍然是聚焦的 JSON Schema 子集，不是完整 JSON Schema 支持
- Confidence: high
