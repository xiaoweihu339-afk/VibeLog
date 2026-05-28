# VibeHub Product Layer Boundary

## English

### One-Line Decision

VibeHub product engineering must live outside the VibeLog skill repository. The VibeLog repository remains the reusable process-memory standard, skill, schema, recorder, validator, adapter, examples, and product planning source.

### Why This Boundary Exists

VibeLog and VibeHub are related but not the same product layer:

- VibeLog is the bottom-layer process memory standard.
- VibeLog skill/tooling helps agents record the vibe process.
- VibeHub is the future product platform for Vibe Repos, showcase, search, collaboration, branching, remix, and eventually code/artifact storage.

Putting product application code in the VibeLog skill repository would blur the core doctrine, make public skill readiness harder to trust, and risk accidentally mixing reusable skill distribution with unfinished VibeHub product code.

### Repository Ownership

Current repository:

```txt
local checkout: current VibeLog repository clone
remote: https://github.com/xiaoweihu339-afk/VibeLog.git
```

This repository may contain:

- VibeLog skill files
- VibeLog schema and examples
- recorder, exporter, validator, hook adapter, and verifier scripts
- agent templates
- public-safe product documents
- sanitized examples
- release and distribution notes for the reusable skill

This repository must not contain:

- VibeHub application source code
- VibeHub database migrations or production schema files
- VibeHub deployment configuration
- real private VibeHub dogfood logs
- raw hook event streams
- private prompts, secrets, local credentials, or personal machine paths
- experimental product scratch projects

Recommended future product workspace:

```txt
local workspace: a sibling product workspace outside this repository, for example ..\vibehub
future remote: https://github.com/xiaoweihu339-afk/VibeHub
```

The future VibeHub product repository should start private or local-only until the owner explicitly approves publication.

### Product Layer Split

VibeHub should grow in layers:

```txt
VibeLog skill repo
  Owns the reusable process-memory standard and local agent workflow.

VibeHub product repo
  Owns the web/product experience for creating, viewing, importing, exporting,
  showcasing, searching, and collaborating on Vibe Repos.

External code repositories
  Initially own product code artifacts through GitHub/GitLab links.

Future VibeHub Git remote
  Later may store code/artifact snapshots or Git remotes directly, after Vibe Repo
  usage and collaboration are proven.
```

Early VibeHub should not try to clone all of GitHub. It should first prove the Vibe Repo object:

```txt
Vibe Repo = VibeLog + Project Artifacts
```

For the MVP, project artifacts should be references:

- GitHub repository URL
- commit SHA
- demo URL
- screenshot/video path
- release artifact URL
- test output reference
- design/doc link

VibeHub can add first-party code/artifact storage later. That is a product phase, not the starting point.

### S46 Product Boundary Decision

The S46 decision is:

1. Keep VibeLog skill work in the current repository.
2. Keep VibeHub product source outside the current repository.
3. Allow product planning docs in the current repository when they clarify the VibeLog-to-VibeHub path.
4. Start VibeHub implementation only after choosing a separate product workspace.
5. Treat any future VibeHub product push as a separate decision from VibeLog skill pushes.

### Local Dogfood Rule

VibeHub should dogfood VibeLog, but the dogfood memory must respect the repository boundary.

For the current VibeLog skill repository:

```txt
root vibe-log.md       private ignored dogfood memory
root vibe-log.json     private ignored dogfood export
.vibelog-events/       private ignored hook/event stream
```

For the future VibeHub product repository:

```txt
vibe-log.md / vibe-log.json should begin private by default.
Only publish sanitized project memory after explicit human approval.
```

### MVP Engineering Boundary

The first VibeHub product slice should be a local-first VibeLog Studio or VibeHub MVP, not a cloud community.

Minimum product boundary:

- local product workspace outside this repository
- one app shell
- one Vibe Repo data model
- one local repository/storage abstraction
- import/export of `vibe-log.md` and `vibe-log.json`
- no accounts
- no cloud database
- no comments
- no marketplace
- no internal Git remote
- no public feed

Recommended technology posture:

- choose a mainstream frontend stack only after a separate product workspace is approved
- use a repository interface from the beginning
- keep the domain model independent from storage and UI
- use local-first storage first
- keep Git/code artifacts as references first

### Testing Rule For Future Product Work

Every S46+ product task must keep the two-part testing rule:

```txt
1. Isolated checks
   Each individual model, parser, repository adapter, exporter, importer, or UI action
   must be directly testable.

2. Workflow checks
   The combined user flow must work end to end.
```

Example first product workflow test:

```txt
Create Vibe Repo
-> edit current idea
-> add human decision
-> add development log
-> export Markdown
-> export JSON
-> validate exported JSON
-> re-import project
-> verify visible state matches source
```

If a test fails, report the real failure. Do not weaken the core product behavior only to make tests pass.

### Push Boundary

Do not push VibeHub product engineering source to the VibeLog skill repository.

Future pushes must be classified:

```txt
VibeLog skill/core/docs/tooling change
  May be push-eligible after readiness checks and explicit human approval.

VibeHub product code
  Must live in a separate product workspace/repository and needs its own approval.

Private dogfood logs or event streams
  Must not be pushed unless explicitly sanitized and approved.
```

### Recommended S47

Recommended S47:

```txt
Create the VibeHub product workspace decision record and implementation plan.
```

S47 should answer:

- exact local path for VibeHub product work
- whether the first product app is named `VibeHub` or `VibeLog Studio`
- whether to scaffold now or write a detailed implementation plan first
- first MVP slice acceptance criteria
- first MVP test design

S47 should not push anything by default.

---

## 中文

### 一句话决策

VibeHub 的产品工程必须放在 VibeLog skill 仓库之外。当前 VibeLog 仓库继续承载可复用的过程记忆标准、skill、schema、recorder、validator、adapter、示例和产品规划文档。

### 为什么需要这个边界

VibeLog 和 VibeHub 相关，但不是同一层：

- VibeLog 是底层过程记忆标准。
- VibeLog skill / tooling 帮助 agent 记录 vibe 过程。
- VibeHub 是未来的产品平台，用来管理 Vibe Repo、展示、搜索、协作、分支、remix，并在后期支持代码 / artifact 存储。

如果把 VibeHub 应用源码放进 VibeLog skill 仓库，会模糊核心原则，让 public skill readiness 变得不可信，也会把可复用 skill 分发和未完成的产品工程混在一起。

### 仓库职责

当前仓库：

```txt
local checkout: 当前 VibeLog 仓库 clone
remote: https://github.com/xiaoweihu339-afk/VibeLog.git
```

这个仓库可以包含：

- VibeLog skill 文件
- VibeLog schema 和示例
- recorder、exporter、validator、hook adapter、verifier 脚本
- agent templates
- public-safe 产品文档
- 已脱敏示例
- 可复用 skill 的 release / distribution notes

这个仓库不能包含：

- VibeHub 应用源码
- VibeHub 数据库 migration 或生产 schema 文件
- VibeHub 部署配置
- 真实私有 VibeHub dogfood 日志
- 原始 hook event stream
- 私有 prompts、secrets、本地凭证、个人机器路径
- 实验性产品 scratch project

推荐的未来产品工作区：

```txt
local workspace: 当前仓库之外的 sibling product workspace，例如 ..\vibehub
未来远端: https://github.com/xiaoweihu339-afk/VibeHub
```

未来 VibeHub 产品仓库在所有者明确批准公开前，应该先保持 private 或 local-only。

### 产品层拆分

VibeHub 应该分层成长：

```txt
VibeLog skill repo
  负责可复用的过程记忆标准和本地 agent 工作流。

VibeHub product repo
  负责创建、查看、导入、导出、展示、搜索、协作 Vibe Repo 的产品体验。

外部代码仓库
  早期通过 GitHub / GitLab 链接承载产品代码 artifacts。

未来 VibeHub Git remote
  在 Vibe Repo 使用和协作被证明之后，再考虑直接存储代码 / artifact snapshot 或 Git remote。
```

早期 VibeHub 不要试图一次复制完整 GitHub。它应该先证明 Vibe Repo 这个核心对象：

```txt
Vibe Repo = VibeLog + Project Artifacts
```

MVP 阶段，project artifacts 应该优先使用引用：

- GitHub repository URL
- commit SHA
- demo URL
- screenshot / video path
- release artifact URL
- test output reference
- design / doc link

VibeHub 后期可以增加一方代码 / artifact 存储。那是产品阶段，不是起点。

### S46 产品边界决策

S46 决策如下：

1. VibeLog skill 工作继续留在当前仓库。
2. VibeHub 产品源码放在当前仓库之外。
3. 允许当前仓库保留产品规划文档，只要它们用于说明 VibeLog 到 VibeHub 的路径。
4. 只有在选择独立产品工作区之后，才开始 VibeHub implementation。
5. 未来 VibeHub 产品 push 与 VibeLog skill push 是两个不同决策。

### 本地 dogfood 规则

VibeHub 应该 dogfood VibeLog，但 dogfood 记忆必须遵守仓库边界。

当前 VibeLog skill 仓库：

```txt
root vibe-log.md       私有 ignored dogfood memory
root vibe-log.json     私有 ignored dogfood export
.vibelog-events/       私有 ignored hook / event stream
```

未来 VibeHub 产品仓库：

```txt
vibe-log.md / vibe-log.json 默认先保持 private。
只有经过明确脱敏和人类批准之后，才公开项目记忆。
```

### MVP 工程边界

第一个 VibeHub 产品 slice 应该是 local-first 的 VibeLog Studio 或 VibeHub MVP，而不是云端社区。

最小产品边界：

- 当前仓库之外的本地产品 workspace
- 一个 app shell
- 一个 Vibe Repo data model
- 一个本地 repository / storage abstraction
- `vibe-log.md` 和 `vibe-log.json` 的 import / export
- 不做 accounts
- 不做 cloud database
- 不做 comments
- 不做 marketplace
- 不做 internal Git remote
- 不做 public feed

推荐技术姿态：

- 只有在独立产品 workspace 被批准后，才选择主流前端栈
- 从一开始就使用 repository interface
- domain model 与 storage、UI 解耦
- 先做 local-first storage
- 代码 / artifacts 早期只做引用

### 未来产品工作的测试原则

每个 S46 之后的产品任务都必须保留两段式测试原则：

```txt
1. 单项检查
   每个 model、parser、repository adapter、exporter、importer、UI action
   都要可以被单独测试。

2. 流程检查
   组合起来的用户流程必须端到端跑通。
```

第一个产品 workflow test 示例：

```txt
Create Vibe Repo
-> edit current idea
-> add human decision
-> add development log
-> export Markdown
-> export JSON
-> validate exported JSON
-> re-import project
-> verify visible state matches source
```

如果测试失败，就汇报真实失败原因。不要为了让测试通过而削弱核心产品行为。

### Push 边界

不要把 VibeHub 产品工程源码 push 到 VibeLog skill 仓库。

未来 push 必须先分类：

```txt
VibeLog skill / core / docs / tooling change
  readiness checks 通过且人类明确批准后，才可能 push。

VibeHub product code
  必须放在独立 product workspace / repository，并需要单独批准。

Private dogfood logs or event streams
  除非明确脱敏并批准，否则不能 push。
```

### 推荐 S47

推荐 S47：

```txt
创建 VibeHub 产品 workspace decision record 和 implementation plan。
```

S47 应回答：

- VibeHub 产品工作的准确本地路径
- 第一版产品 app 叫 `VibeHub` 还是 `VibeLog Studio`
- 现在是否 scaffold，还是先写详细 implementation plan
- 第一版 MVP slice acceptance criteria
- 第一版 MVP test design

S47 默认不 push 任何内容。
