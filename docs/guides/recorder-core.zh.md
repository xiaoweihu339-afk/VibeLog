# Recorder Core 指南

VibeLog recorder core 会把结构化 Vibe Event JSON 转成 Markdown-first 的 VibeLog 更新。

## 原则

adapter 不应该直接重写 VibeLog。它应该发出小型 Vibe Event JSON payload，然后由 recorder 更新 `vibe-log.md`。

```txt
agent / hook / adapter -> Vibe Event JSON -> recorder core -> vibe-log.md -> vibe-log.json
```

Markdown 仍然是 source of truth。需要结构化数据时，再从 Markdown 重新生成 JSON。

## CLI

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
```

参数：

- `--event`：必填，一个 Vibe Event JSON 文件路径。
- `--log`：VibeLog Markdown 路径，默认是 `vibe-log.md`。
- `--json`：可选 JSON 输出路径。提供后，recorder 会在更新 Markdown 后重新生成 JSON。

## 支持的 Event 类型

- `prompt_submitted`
- `idea_changed`
- `decision_made`
- `tool_used`
- `test_ran`
- `bug_fixed`
- `handoff_updated`

字段细节见 `skills/vibelog/references/vibe-event-format.md`。

## 示例

```json
{
  "type": "test_ran",
  "timestamp": "2026-05-26",
  "summary": "Recorder tests passed.",
  "evidence_ref": "node --test test/record-vibelog-event.test.mjs",
  "result": "passed",
  "residual_risk": "No hook integration yet.",
  "source": "command output",
  "confidence": "high"
}
```

运行：

```powershell
node scripts/record-vibelog-event.mjs --event event.json --log vibe-log.md --json vibe-log.json
```

## 当前限制

- 一次 CLI 调用只应用一个 event。
- `handoff_updated` 会替换整个 `Handoff State` section。
- recorder 不会自己检查 git diff 或命令输出。
- recorder 不会上传任何内容。
- hook adapters 仍然需要基于这个 core 继续构建。

## 验证

运行：

```powershell
node --test test/record-vibelog-event.test.mjs
node --test
node scripts/validate-vibelog.mjs vibe-log.json
node scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```
