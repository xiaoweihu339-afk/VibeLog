# VibeHub Engineering Startup Boundary

## English

### One-Line Decision

VibeHub starts as a separate product engineering project that uses VibeLog, but it does not live inside the VibeLog skill repository.

### What S47 Locks Down

S47 is a transition boundary, not a product scaffold.

It locks down:

- VibeLog remains the reusable vibe coding process memory standard.
- VibeHub becomes a separate product repository when engineering begins.
- The current repository may keep public-safe product planning documents.
- VibeHub source code, database schema, deployment files, and product secrets stay outside this repository.
- GitHub pushes for VibeLog and VibeHub are separate decisions.

S47 does not create:

- a VibeHub app
- a VibeHub database
- a VibeHub deployment target
- a VibeHub GitHub remote
- a public VibeHub community

### Repository Split

Current repository:

```txt
Role: VibeLog skill / standard / tooling / public-safe planning
Remote: https://github.com/xiaoweihu339-afk/VibeLog.git
Push rule: only VibeLog skill/core/docs/tooling changes, after explicit approval
```

Future product repository:

```txt
Role: VibeHub product engineering
Suggested local workspace: sibling workspace outside this repository, for example ..\vibehub
Suggested future remote: https://github.com/xiaoweihu339-afk/VibeHub
Push rule: separate approval, separate readiness checks, separate repository
```

The VibeHub product repository may dogfood VibeLog, but its dogfood memory begins private:

```txt
vibe-log.md
vibe-log.json
.vibelog-events/
```

Those files must be ignored by default unless the owner explicitly decides to publish a sanitized public case study.

### Product Identity

Use `VibeHub` as the product and repository name.

Use `VibeLog` for the underlying process memory standard and skill.

Use `Vibe Repo` for the product object:

```txt
Vibe Repo = VibeLog + project artifact references + collaboration state
```

This keeps the naming clear:

- VibeLog records the process.
- Vibe Repo is the unit of work and sharing.
- VibeHub is the platform where Vibe Repos can be created, viewed, searched, shared, and co-created.

### First Engineering Posture

The first VibeHub implementation should be local-first and boring on purpose.

Recommended default stack for the first product workspace:

- TypeScript for product code
- React-based web app
- local-first storage for the earliest MVP
- a small domain model for Vibe Repo
- Markdown and JSON import/export
- test runner from the selected app scaffold
- Git for code history from the first commit

Do not start with:

- cloud accounts
- billing
- marketplace
- public feed
- comments
- notifications
- internal Git remote
- multi-tenant permissions
- AI agent marketplace
- code artifact hosting

Those are long-term product layers. The first job is to prove that a Vibe Repo can be created, updated, exported, imported, validated, and continued by another agent.

### Git Strategy

Git is still the right foundation for VibeHub product code.

For the product implementation:

- the VibeHub app source should live in its own Git repository
- every meaningful product slice should be committed locally
- no product push should happen without explicit approval
- the MVP should store project code artifacts as external references first
- first-party Git remote storage belongs to a later VibeHub phase

This mirrors the GitHub lesson without copying GitHub too early:

```txt
Early VibeHub proves Vibe Repo workflow.
Later VibeHub may add Git remote storage.
```

### VibeLog Adoption Inside VibeHub

When the VibeHub product workspace is created, it should immediately adopt VibeLog as dogfood.

Minimum setup:

- initialize a private `vibe-log.md`
- export and validate `vibe-log.json`
- keep `.vibelog-events/` ignored
- record engineering execution prompts exactly
- summarize ordinary idea chat into idea evolution
- record human-in-the-loop decisions
- record isolated checks and workflow checks for every slice

The VibeHub product should use VibeLog as a process memory standard, not as a push or publishing mechanism.

### First MVP Slice Shape

The first product slice should prove one narrow workflow:

```txt
Create a local Vibe Repo
-> edit the one-line idea
-> record one idea change
-> record one human decision
-> record one development log entry
-> record one test design
-> export Markdown
-> export JSON
-> validate JSON
-> re-import
-> confirm the visible state matches the source
```

This is more important than a polished visual design at the beginning. The UI can be simple as long as the Vibe Repo workflow is real and testable.

### Testing Rule

Every VibeHub slice must pass two testing layers.

Layer 1: isolated checks

- domain model validation
- Markdown import
- JSON export
- JSON validation
- repository adapter behavior
- UI action state updates
- privacy and publication boundary rules

Layer 2: workflow checks

- create a Vibe Repo
- update its idea and status
- add human decision and development evidence
- export
- validate
- re-import
- compare the re-imported state with the original state

If either layer fails, report the failure directly and do not weaken core behavior just to satisfy tests.

### Human Approval Gates

Ask the owner before:

- creating the separate VibeHub product workspace
- installing a large framework or dependency set
- choosing a hosted database or auth provider
- creating a remote repository
- pushing any branch
- exposing any private dogfood log
- adding secrets or external credentials
- changing the VibeLog core standard to satisfy a VibeHub-only shortcut

Do not ask before:

- reading local docs
- writing public-safe planning documents
- running local verification commands
- recording private VibeLog events for this work

### S48 Recommendation

Recommended S48:

```txt
Create the separate local VibeHub workspace and write the first implementation plan there.
```

S48 should still avoid cloud or push by default. The first useful output should be a private local product repo with VibeLog dogfood enabled and a tested plan for the first MVP workflow.

---

## 中文

### 一句话决策

VibeHub 作为独立产品工程启动；它使用 VibeLog，但不放在 VibeLog skill 仓库里。

### S47 固定什么

S47 是工程启动边界，不是产品脚手架。

它固定：

- VibeLog 继续作为可复用的 vibe coding 过程记忆标准。
- VibeHub 一旦进入工程实现，就使用独立产品仓库。
- 当前仓库只保留公开安全的产品规划文档。
- VibeHub 源码、数据库 schema、部署文件、产品 secrets 都不放进当前仓库。
- VibeLog 的 GitHub push 和 VibeHub 的 GitHub push 是两个独立决策。

S47 不创建：

- VibeHub 应用
- VibeHub 数据库
- VibeHub 部署目标
- VibeHub GitHub 远端
- 公开 VibeHub 社区

### 仓库拆分

当前仓库：

```txt
职责: VibeLog skill / 标准 / 工具 / 公开安全规划
远端: https://github.com/xiaoweihu339-afk/VibeLog.git
push 规则: 只有 VibeLog skill/core/docs/tooling 改动，且需要明确批准
```

未来产品仓库：

```txt
职责: VibeHub 产品工程
建议本地工作区: 当前仓库之外的 sibling workspace，例如 ..\vibehub
建议未来远端: https://github.com/xiaoweihu339-afk/VibeHub
push 规则: 独立批准、独立 readiness、独立仓库
```

VibeHub 产品仓库可以 dogfood VibeLog，但它的过程记忆默认私有：

```txt
vibe-log.md
vibe-log.json
.vibelog-events/
```

这些文件默认必须被 ignore，除非所有者明确决定发布脱敏后的公开案例。

### 产品命名

产品和仓库名使用 `VibeHub`。

底层过程记忆标准和 skill 使用 `VibeLog`。

产品对象使用 `Vibe Repo`：

```txt
Vibe Repo = VibeLog + 项目 artifact 引用 + 协作状态
```

这样命名边界清楚：

- VibeLog 记录过程。
- Vibe Repo 是创作、展示、接力、共创的工作单元。
- VibeHub 是创建、查看、搜索、分享和共创 Vibe Repo 的平台。

### 第一版工程姿态

第一版 VibeHub 应该 local-first，并且刻意保持朴素。

建议第一版产品工作区默认技术姿态：

- TypeScript 写产品代码
- React 系 web app
- 最早 MVP 使用 local-first 存储
- 建立小而清晰的 Vibe Repo domain model
- 支持 Markdown 和 JSON import/export
- 使用脚手架自带或主流测试 runner
- 从第一个 commit 开始使用 Git 管理代码历史

不要一开始就做：

- cloud accounts
- billing
- marketplace
- public feed
- comments
- notifications
- internal Git remote
- multi-tenant permissions
- AI agent marketplace
- code artifact hosting

这些属于长期产品层。第一步是证明：一个 Vibe Repo 可以被创建、更新、导出、导入、验证，并被另一个 agent 接力。

### Git 策略

Git 仍然适合作为 VibeHub 产品代码的基础。

对产品实现来说：

- VibeHub app 源码放在自己的 Git 仓库
- 每个有意义的产品 slice 都本地 commit
- 没有明确批准不 push 产品代码
- MVP 先把项目代码 artifacts 作为外部引用保存
- 一方 Git remote 存储属于 VibeHub 后续阶段

这是在学习 GitHub 的历史经验，但不提前复制完整 GitHub：

```txt
早期 VibeHub 先证明 Vibe Repo workflow。
后期 VibeHub 再考虑 Git remote storage。
```

### VibeHub 内部如何使用 VibeLog

创建 VibeHub 产品工作区时，应该立刻用 VibeLog dogfood。

最低设置：

- 初始化私有 `vibe-log.md`
- 导出并验证 `vibe-log.json`
- 保持 `.vibelog-events/` ignored
- 严格记录工程执行 prompts
- 普通想法聊天只抽取 idea evolution
- 记录 human-in-the-loop 决策
- 每个 slice 记录单项检查和流程检查

VibeHub 使用 VibeLog 是为了过程记忆，不是为了 push 或发布。

### 第一片 MVP 形状

第一片产品 slice 应该证明一个很窄的工作流：

```txt
创建本地 Vibe Repo
-> 修改一句话 idea
-> 记录一次 idea change
-> 记录一次 human decision
-> 记录一次 development log
-> 记录一次 test design
-> 导出 Markdown
-> 导出 JSON
-> 验证 JSON
-> 重新导入
-> 确认可见状态与原始状态一致
```

这比一开始 UI 很漂亮更重要。UI 可以先简单，只要 Vibe Repo workflow 真实、可测、可接力。

### 测试规则

每个 VibeHub slice 必须通过两层测试。

第一层：单项检查

- domain model validation
- Markdown import
- JSON export
- JSON validation
- repository adapter behavior
- UI action state updates
- privacy and publication boundary rules

第二层：流程检查

- 创建 Vibe Repo
- 更新 idea 和状态
- 添加 human decision 和 development evidence
- 导出
- 验证
- 重新导入
- 对比重新导入后的状态和原始状态

任何一层失败，就直接汇报失败原因，不要削弱核心业务行为来满足测试。

### 人类批准闸门

以下事项先问所有者：

- 创建独立 VibeHub 产品工作区
- 安装大型框架或依赖集合
- 选择托管数据库或 auth provider
- 创建远端仓库
- push 任何分支
- 暴露任何私有 dogfood log
- 添加 secrets 或外部 credentials
- 为了 VibeHub 的短期方便而改变 VibeLog 核心标准

以下事项不用先问：

- 读取本地文档
- 写公开安全的规划文档
- 运行本地 verification 命令
- 为本次工作记录私有 VibeLog events

### S48 建议

建议 S48：

```txt
创建独立的本地 VibeHub 工作区，并在其中写第一份实现计划。
```

S48 默认仍不 cloud、不 push。第一份有价值的产出应该是一个私有本地产品 repo，启用 VibeLog dogfood，并拥有第一条 MVP workflow 的可测试实现计划。
