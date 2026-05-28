# 公开 Skill Readiness

在把 VibeLog 当作可复用的公开 skill，或准备请求推送这个仓库之前，使用这个闸门。

公开 Skill Readiness 是分发安全闸门，不是 VibeLog 的核心。VibeLog 的核心是过程记忆：人类可以自然 vibe，agent 负责把一句话想法、想法演化、human-in-the-loop 决策、工程执行提示词、实现状态、测试设计、验证证据、bug 修复和 handoff state 记录成可读 Markdown，并导出可机器读取的 JSON。

它不会 stage、commit、push、publish、upload，也不会编辑文件。它只检查仓库内容是否足够安全、足够有用，可以进入人类批准的 push 审查。

## 命令

```powershell
node scripts/verify-public-skill-readiness.mjs --repo "C:\path\to\VibeLog"
npm run vibelog:verify-public-skill-readiness -- --repo "C:\path\to\VibeLog"
```

## 单项检查

验证器会检查单独的仓库规则：

- `package.json` 保持 `private`，用于 clone-local 复用。
- 公开 CLI 入口包含 `vibelog-project`、`vibelog-install` 和 `vibelog-verify-public-skill-readiness`。
- 必需的 skill、schema、文档、脚本和公开示例文件存在。
- `.gitignore` 排除根目录 `vibe-log.md`、根目录 `vibe-log.json`、`.vibelog-events/` 和 `vibelog-scratch/`。
- Git 已跟踪文件不包含私有根目录 VibeLog 记忆或 event stream。
- 已跟踪文本不包含个人本机路径或疑似 token。
- README、AGENTS、skill instructions 和 agent usage guide 都指向 readiness 闸门和隐私边界。

## 流程检查

这个闸门通过还不够。真正 push 前，要把它和更大的流程检查一起运行：

```powershell
node scripts/verify-public-skill-readiness.mjs
node --test test\verify-public-skill-readiness.test.mjs test\vibelog-package.test.mjs
node --test test\verify-clean-clone-adoption.test.mjs test\verify-release-bundle.test.mjs
node --test
```

使用两段式测试原则：

- 单项检查证明每条规则单独能跑通；
- 流程检查证明 package、clean-clone adoption、release bundle 和完整测试套件组合起来仍然能跑通。

如果任何检查失败，直接汇报失败。不要为了让测试变绿而削弱核心业务行为。

## Push 边界

验证器可以说明仓库内容具备 push-eligible 条件，但它不能授权 push。

Push 仍然需要：

- 人类明确同意这次 push；
- 审查 `git diff`；
- 没有私有根目录 `vibe-log.md`、`vibe-log.json`、`.vibelog-events/`、scratch 输出、secret、本机个人路径或实验 dogfood 源码；
- 只包含公开 skill、工具链和文档变化的有意 commit。

VibeHub 工程源码和私有 dogfood 日志仍然不在这个 push 边界内，除非所有者明确改变这个决定。
