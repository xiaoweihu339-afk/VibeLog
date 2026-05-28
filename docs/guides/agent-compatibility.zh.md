# Agent 兼容性指南

这份文档说明：当某些 agent 不能直接加载 Codex skill 时，如何继续使用 VibeLog 的底层流程。

状态：模板包原型，已在本仓库做静态 smoke test。真实 agent 是否稳定遵守，仍取决于对应 agent 版本和项目设置。

最后检查日期：2026-05-27。

## 为什么需要它

VibeLog 不应该绑定某一个 agent 厂商。稳定核心是：

- `vibe-log.md` 作为人类可读的事实源
- `vibe-log.json` 作为确定性的机器导出
- 严格记录工程执行提示词
- 结构化记录想法演化、human-in-the-loop 决策、测试设计、验证证据、bug 修复、成果索引和交接状态

`agent-templates/` 里的模板，就是把这个核心流程接到不同 agent 的指令系统里。

## 自动记录能力边界

安装 VibeLog 不等于自动记录。VibeLog 定义“记录什么”和“如何导出”，但自动捕获取决于当前 agent 环境是否提供 hooks、生命周期事件、插件、wrapper，或者能否稳定加载项目指令。

可以用这个分层理解：

```txt
VibeLog Standard -> 记录格式和规则
Agent Adapter    -> 环境能捕获 prompt / tool / session events 时负责自动化
Human / Agent    -> 没有可靠自动化时，通过显式调用和阶段结束记录补齐
```

## 常用 Agent 自动化差异

| Agent 环境 | 当前自动记录能力 | 推荐 VibeLog 方式 |
| --- | --- | --- |
| Claude Code CLI | 强，前提是启用项目级 hooks | 使用 `CLAUDE.md` 加 Claude Code hook adapter。推荐 stream-first hooks，先产生可检查的 JSONL events。 |
| Codex / 支持 AGENTS 的 agent | 中到弱，取决于 agent 是否稳定遵守项目指令 | 使用 `AGENTS.md`、显式调用 VibeLog、每个 slice 结束记录。普通想法聊天默认不能假设已自动记录。 |
| Gemini CLI | 中到弱，取决于 `GEMINI.md` 是否加载和 agent 行为 | 使用 `GEMINI.md`，重要会话后验证 Markdown/JSON 是否更新。 |
| Cursor | 中到弱，取决于 rules 是否加载和模型是否遵守 | 使用 `.cursor/rules/vibelog.mdc`，真实项目使用前先确认 rules 生效。 |
| Windsurf | 中到弱，取决于 workspace rules 行为 | 使用 `.windsurf/rules/vibelog.md`，建议先用合成小项目验证。 |
| Cline | 中到弱，取决于 `.clinerules` 加载和任务流程 | 使用 `.clinerules/vibelog.md`，先验证 agent 会更新 `vibe-log.md`。 |
| Roo-compatible 环境 | 中到弱，不同 mode/version 的 rules 目录行为可能不同 | 使用 `.roo/rules/` 前先确认本地环境会加载这些规则。 |
| GitHub Copilot | 弱，更适合仓库指导，不适合连续过程记录 | 使用 `.github/copilot-instructions.md` 表达期望，VibeLog 仍需要显式更新。 |
| 普通 Web chat / generic chatbots | 弱，没有可靠项目 hook 或文件写入生命周期 | 手动把想法和决策总结进 VibeLog，再导出和验证 JSON。 |
| 未来 VibeHub native recorder | 目标是强 | 后续优化应提供一等项目记忆捕获、上传、权限控制和可检查 event stream。 |

除非某个环境已经通过真实 workflow 验证，否则不要向用户承诺普通 brainstorm 会自动记录。

## 支持的模板

| Agent 环境 | 模板路径 | 使用方式 |
| --- | --- | --- |
| Codex / 支持 AGENTS 的 agent | `agent-templates/AGENTS.md` | 复制到项目根目录，命名为 `AGENTS.md`。 |
| Claude Code | `agent-templates/CLAUDE.md` | 复制到项目根目录，命名为 `CLAUDE.md`；hook 另外按需配置。 |
| Gemini CLI | `agent-templates/GEMINI.md` | 复制到项目根目录，命名为 `GEMINI.md`。 |
| Cursor | `agent-templates/cursor/.cursor/rules/vibelog.mdc` | 复制到项目的 `.cursor/rules/`。 |
| Windsurf | `agent-templates/windsurf/.windsurf/rules/vibelog.md` | 复制到项目的 `.windsurf/rules/`。 |
| Cline | `agent-templates/cline/.clinerules/vibelog.md` | 复制到项目的 `.clinerules/`。 |
| Roo-compatible 环境 | `agent-templates/roo-legacy/.roo/rules/vibelog.md` | 复制到项目的 `.roo/rules/`，并验证本地版本会加载它。 |
| GitHub Copilot | `agent-templates/github-copilot/.github/copilot-instructions.md` | 复制到项目的 `.github/copilot-instructions.md`。 |

## 安装方式

1. 把匹配的模板复制到目标项目。
2. 把模板里的 `<path-to-VibeLog>` 替换成本仓库的本地路径。
3. 项目日志保存在目标项目中：

```txt
vibe-log.md
vibe-log.json
```

4. Markdown 更新后，导出并验证 JSON：

```powershell
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json
node <path-to-VibeLog>/scripts/validate-vibelog.mjs vibe-log.json
node <path-to-VibeLog>/scripts/export-vibelog.mjs vibe-log.md --out vibe-log.json --check
```

## 安全边界

公开的 VibeLog 仓库只放可复用模板和脱敏示例。

不要提交：

- 真实项目的根目录 `vibe-log.md` 或 `vibe-log.json`
- `.vibelog-events/` hook 事件载荷
- 原始私有提示词或私有聊天记录
- 个人机器的本地绝对路径
- secrets、credentials、tokens 或敏感业务数据
- dogfood 实验项目源码

## 验证等级

Level 1 - 静态模板 smoke test：

```powershell
node --test test/agent-compatibility.test.mjs
```

它验证模板路径、关键 VibeLog 命令、公开仓库隐私边界和分发计划状态。

Level 2 - clean-clone 模板接入测试：

```powershell
node scripts/verify-github-agent-template-adoption.mjs --remote-url https://github.com/xiaoweihu339-afk/VibeLog.git --workspace <scratch-root>
```

它会从干净来源 clone 仓库，把每个模板安装到合成消费项目中，初始化 VibeLog，导出 JSON，验证 JSON，并检查没有私有项目产物。

Level 3 - 项目接入测试：

用一个合成小项目，让目标 agent 创建或更新 `vibe-log.md`，再运行导出和验证命令。

Level 4 - 真实流程测试：

让目标 agent 执行一次真实开发任务，并检查想法变化、人类决策、工程执行提示词、测试证据和交接状态是否被记录，同时确认没有泄露私有数据。

## 后续优化

后续优化会继续扩大 adapter 覆盖，但不改变 VibeLog 标准本身：

- 当 Codex wrapper 或 app lifecycle hook 可用时，增强 Codex 自动化
- 为 Cursor、Windsurf、Cline、Roo、Gemini CLI、GitHub Copilot 增加更强模板验证
- 为非程序员提供更清晰的 VibeHub native recorder 流程
- 在写入正式 Markdown 前，先产生可检查的 event stream
- 增加 agent-specific capability detection，让用户知道当前是自动、半自动还是手动记录

## 参考资料

- OpenAI Codex 的 `AGENTS.md` 项目指令文档：https://developers.openai.com/codex/guides/agents-md
- Claude Code 的 `CLAUDE.md` memory 和 hooks 文档：https://code.claude.com/docs/en/memory 与 https://code.claude.com/docs/en/hooks
- Cursor 的 `.cursor/rules` 项目规则文档：https://docs.cursor.com/context/rules
- Gemini CLI 的 `GEMINI.md` 项目上下文文档：https://github.com/google-gemini/gemini-cli/blob/main/docs/index.md
- Windsurf 的 Cascade workspace rules 文档：https://windsurf.com/university/general-education/creating-modifying-rules
- Cline 的 `.clinerules/` 与 AGENTS 兼容文档：https://docs.cline.bot/customization/cline-rules
- Roo Code 的 `.roo/rules-*` 自定义模式指令目录文档：https://roocodeinc.github.io/Roo-Code/features/custom-modes/
- GitHub Copilot 的 repository custom instructions 文档：https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
