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

Level 2 - 项目接入测试：

用一个合成小项目，让目标 agent 创建或更新 `vibe-log.md`，再运行导出和验证命令。

Level 3 - 真实流程测试：

让目标 agent 执行一次真实开发任务，并检查想法变化、人类决策、工程执行提示词、测试证据和交接状态是否被记录，同时确认没有泄露私有数据。

## 参考资料

- OpenAI Codex 的 `AGENTS.md` 项目指令文档：https://developers.openai.com/codex/guides/agents-md
- Claude Code 的 `CLAUDE.md` memory 和 hooks 文档：https://code.claude.com/docs/en/memory 与 https://code.claude.com/docs/en/hooks
- Cursor 的 `.cursor/rules` 项目规则文档：https://docs.cursor.com/context/rules
- Gemini CLI 的 `GEMINI.md` 项目上下文文档：https://github.com/google-gemini/gemini-cli/blob/main/docs/index.md
- Windsurf 的 Cascade workspace rules 文档：https://windsurf.com/university/general-education/creating-modifying-rules
- Cline 的 `.clinerules/` 与 AGENTS 兼容文档：https://docs.cline.bot/customization/cline-rules
- Roo Code 的 `.roo/rules-*` 自定义模式指令目录文档：https://roocodeinc.github.io/Roo-Code/features/custom-modes/
- GitHub Copilot 的 repository custom instructions 文档：https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/add-custom-instructions/add-repository-instructions
