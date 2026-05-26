# VibeLog Exporter Slice 3 设计

## 目的

Slice 3 要加入第一版确定性的 Markdown-to-JSON exporter。

前面的 dogfood 已经证明 VibeLog 可以记录一个真实感足够的 agent-led 小项目，但也暴露了最大短板：`vibe-log.md` 和 `vibe-log.json` 仍然靠手工同步。这对一个可复用 skill、未来 hooks、以及 VibeHub 上传都不够稳。

这个 slice 的目标是让 Markdown 真正成为可执行的 source of truth，并给 agent 一个可重复的 JSON 生成方式。

## 背景

当前规则已经明确：

```txt
Markdown 是 source of truth。
JSON 用于上传和集成。
```

当前仓库里已经有这些证据：

- `skills/vibelog/references/vibelog-format.md` 定义格式。
- `skills/vibelog/assets/vibe-log.schema.json` 定义 JSON 形状。
- `examples/billmate-lite/vibe-log.md` 是第一个强 dogfood 输入。
- `examples/billmate-lite/vibe-log.json` 是预期结构化输出。
- 根目录 `vibe-log.md` 和 `vibe-log.json` 是更大的真实项目记录。

第一版 exporter 应该从一个稳定、可测试的子集开始。不需要一次解析整个标准里的所有可选细节。

## 目标

1. 确定性地把 `vibe-log.md` 导出为 `vibe-log.json`。
2. 支持 `examples/billmate-lite/` 中用到的核心字段。
3. 保留 Unicode 文本，包括中文 prompt。
4. 多次运行时输出稳定、可解析。
5. 增加基础校验，能发现缺失的核心字段。
6. 保持仓库 skill-first，不加入网站或 app 源码。

## 非目标

- 不做 web UI。
- 不做 cloud upload。
- 不在这个 slice 做 hooks。
- 不解析所有可能的 Markdown 写法。
- 不要求第三方 npm 依赖。
- 没有用户明确批准，不 push 到 GitHub。

## 考虑过的方案

### 方案 A：宽松 Regex Exporter

用轻量字符串 helper 解析 sections 和字段。

取舍：快、无依赖，但 Markdown 结构稍微漂移就容易坏。

### 方案 B：严格 VibeLog 子集 Parser

写一个小型确定性 parser，识别当前 examples 中使用的 heading、frontmatter、bold-label 字段和 list 格式。

取舍：比松散 regex 多一点代码，但更安全、更容易测试。不支持的 section 可以先导出为空数组或 raw string，留给后续 slice。

### 方案 C：引入 Markdown Parsing Dependency

使用 `remark` 或 `markdown-it` 这类库。

取舍：AST 解析更稳，但在项目还没真正需要前就引入依赖管理。

## 推荐方案

采用方案 B。

第一版 exporter 要足够严格，保证可预测；也要足够小，保持 skill 便携。它应该解析 `examples/billmate-lite/` 使用的已知 VibeLog 子集，并在缺少必需字段时给出清晰错误。

## 交付物

### 1. Exporter Script

路径：

```txt
scripts/export-vibelog.mjs
```

职责：

- 读取 Markdown 文件
- 解析 YAML-like frontmatter
- 解析 VibeLog 顶级 sections
- 导出结构化 JSON
- 保留 Unicode
- 用两个空格格式化输出 JSON

建议 CLI：

```powershell
node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out tmp/billmate-lite.vibe-log.json
```

默认行为：

- input 默认是 `vibe-log.md`
- output 默认是 `vibe-log.json`
- `--check` 在生成 JSON 和现有输出文件不一致时，以非零状态退出

### 2. Validation Script

路径：

```txt
scripts/validate-vibelog.mjs
```

职责：

- 解析 VibeLog JSON 文件
- 校验必需核心字段存在
- 校验关键数组在存在时形状合理
- 输出可读错误

这还不是完整 JSON Schema validation。它是当前 examples 的实用校验门。

### 3. Export Guide

路径：

```txt
docs/guides/export-json.md
```

职责：

- 解释 Markdown 是 source of truth
- 展示如何导出 JSON
- 展示如何运行 check mode
- 说明 Slice 3 支持范围
- 说明已知限制

### 4. Tests

路径：

```txt
test/export-vibelog.test.mjs
test/validate-vibelog.test.mjs
```

测试 fixture：

```txt
examples/billmate-lite/vibe-log.md
examples/billmate-lite/vibe-log.json
```

预期覆盖：

- frontmatter 导出
- one-line vibe 导出
- current idea 导出
- idea evolution entries
- decisions
- human-in-the-loop entries
- implementation status
- validation design
- verification evidence
- artifact index
- execution prompts
- development log
- bugfix / incident log
- handoff state
- public summary
- Unicode 保留
- 缺失必需字段校验
- check mode 检测 drift

### 5. README 更新

增加一个短小 section：

```txt
Export JSON
```

它应该链接到 `docs/guides/export-json.md`，并展示一个命令。

### 6. VibeLog 更新

根 `vibe-log.md` 和 `vibe-log.json` 应记录：

- Slice 3 设计决策
- 实现范围
- 验证计划
- 后续验证证据

## 支持的 Markdown 子集

Slice 3 应支持 VibeLog 当前已经产出的 Markdown 风格。

### Frontmatter

```yaml
---
schema: vibelog@0.2-draft
title: "BillMate Lite"
tools: ["Codex", "Node.js"]
---
```

解析规则：

- string 可以带引号，也可以不带
- 支持简单 inline array
- 未来出现 boolean 时可以解析
- unknown frontmatter key 在安全时保留为 string

### 顶级 Sections

顶级 section 是 `##` heading。

exporter 把已知 section name 映射到 JSON 字段。未知 section 在 Slice 3 可以忽略，除非需要报错。

### Entry Sections

重复 entry 用已知 section 下的 `###` heading。

示例：

```md
## Idea Evolution

### 2026-05-26

**Type:** initial
**Before:** none
**After:** ...
```

解析规则：

- `###` heading 看起来像日期时，作为 `timestamp`
- bold label 变成 object field
- 字段名规范化成 snake_case
- 多段文本保留为 joined text

### Lists

已知字段下的简单 bullet list 解析成 array。

示例：

```md
### Completed

- Tests written first.
- Tests passed after implementation.
```

### Text Blocks

`Current Idea` 和 `Public Summary` 这类 section 导出为 trim 后的 string。

## 数据流

```txt
vibe-log.md
-> parse frontmatter
-> split top-level sections
-> parse known sections
-> normalize field names
-> assemble VibeLog JSON object
-> validate core fields
-> write vibe-log.json
```

## 错误处理

Exporter 错误应该适合人读：

- input file 缺失
- frontmatter 缺失
- `One-Line Vibe` 缺失
- `Current Idea` 缺失
- entry field 格式错误
- output path 无法写入

Validation 错误应该包含字段名：

```txt
Missing required field: one_line_vibe
Invalid execution_prompts[0].recording_mode: expected exact, redacted, reconstructed, or summary_only
```

## 测试设计

使用 Node 内置 test runner。

TDD 顺序：

1. 先写 frontmatter parsing 的失败测试。
2. 实现 frontmatter parsing。
3. 先写 section splitting 的失败测试。
4. 实现 section splitting。
5. 先写 BillMate core fields export 的失败测试。
6. 实现 known-section parsing。
7. 先写 validation failure 的失败测试。
8. 实现 validation script。
9. 先写 check mode drift 的失败测试。
10. 实现 check mode。

## 验收标准

- `node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out tmp/billmate-lite.vibe-log.json` 能写出 JSON。
- 生成的 JSON 能被 Node.js 解析。
- 生成 JSON 至少包含：
  - `title`
  - `one_line_vibe`
  - `stage`
  - `current_idea`
  - `idea_evolution`
  - `human_in_the_loop`
  - `execution_prompts`
  - `development_log`
  - `verification_evidence`
  - `handoff_state`
- 中文 prompt text 被保留。
- `node scripts/validate-vibelog.mjs tmp/billmate-lite.vibe-log.json` 通过。
- `node scripts/export-vibelog.mjs examples/billmate-lite/vibe-log.md --out examples/billmate-lite/vibe-log.json --check` 能检测文件是否 drift。
- `node --test` 通过。
- README 和 export guide 说明用法。
- 不加入网站、app 源码、cloud upload 或 GitHub push。

## Slice 3 已知限制

- exporter 面向当前 VibeLog Markdown 风格，不支持任意 Markdown。
- 不需要完美解析深层嵌套 schema。
- 不做完整 JSON Schema validation。
- 如果根 `vibe-log.md` 有旧格式，第一版不一定完美 round-trip。
- 第一版优先把 `examples/billmate-lite/` 作为 canonical fixture。

## 风险

### 风险：Parser 范围过大

缓解：

先支持已知风格。新增 case 必须带 fixture 和测试。

### 风险：生成 JSON 和手写 JSON 不一致

缓解：

只有 review 后才把 generated output 作为新的 canonical output。这个 slice 先专注稳定字段和 check-mode detection。

### 风险：Unicode 损坏

缓解：

使用 UTF-8 读写。增加一个显式测试，检查中文 prompt text 是否保留。

### 风险：Hooks 过早依赖 exporter

缓解：

Slice 3 不做 hooks。Exporter 被证明后，后续 slice 再让 hooks 调用它。

## 这个 Spec 之后的下一步

如果用户批准这个设计，就为 Slice 3 创建 implementation plan，然后用 test-first 方式实现 exporter。
