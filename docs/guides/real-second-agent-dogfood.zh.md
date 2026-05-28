# 真实第二 agent 接力

S38 用来验证一个新 agent 能不能在不继承父会话历史的情况下，只靠 VibeLog 交接包继续理解项目。

先生成 brief-only 交接包：

```powershell
node scripts/verify-handoff-continuity.mjs vibe-log.json --min-score 90 --brief-only > handoff-brief.txt
```

只把 `handoff-brief.txt` 和仓库读权限交给新 agent。新 agent 不继承父会话历史，不得修改文件，不得 stage，不得 commit，不得推送。要求它只返回 JSON。

必须返回的报告结构：

```json
{
  "agent_type": "real_second_agent",
  "source": "brief_only",
  "can_continue": true,
  "confidence": "low|medium|high",
  "project": "...",
  "understood_one_line_vibe": "...",
  "understood_current_state": "...",
  "selected_next_action": "...",
  "privacy_boundaries": ["..."],
  "push_boundaries": ["..."],
  "would_modify_files": false,
  "would_push": false,
  "questions_or_blockers": [],
  "handoff_quality_notes": ["..."]
}
```

先验证报告，再相信报告：

```powershell
node scripts/verify-second-agent-continuation-report.mjs --brief handoff-brief.txt --report second-agent-report.json
```

## 测试设计

单项检查：

- `verify-handoff-continuity.mjs --brief-only` 能生成紧凑文本交接包。
- `verify-second-agent-continuation-report.mjs` 能接受一个基于 brief 的安全报告。
- 验证器会拒绝使用完整 JSON、打算写文件、打算推送、缺少隐私边界、缺少 push 边界、或下一步不基于 brief 的报告。

流程检查：

- 从当前 VibeLog 生成 brief-only 交接包。
- 启动一个不继承父会话历史的新 agent。
- 只给它 brief 和仓库读取权限。
- 保存它返回的 JSON 报告。
- 用 brief 验证这个报告。
- 把 dogfood 结果记录到私有 VibeLog，再验证 JSON 和 handoff continuity。

## 安全边界

第二 agent 的输出是证据，不是权威。它的报告必须先经过机器验证，才能成为项目证据。报告通过只说明交接包足够让新 agent 安全理解并继续，不代表允许推送、发布或扩大实现范围。
