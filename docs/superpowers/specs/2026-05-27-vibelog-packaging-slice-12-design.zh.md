# VibeLog 包装路径 Slice 12 设计

日期：2026-05-27

## 目标

让用户 clone 仓库后更容易发现和调用本地 VibeLog adoption CLI，但暂时不发布公开 package。

## 为什么需要这一步

Slice 11 已经创建了普通项目采用 CLI，但用户仍然需要记住精确脚本路径。S12 增加最小 package 边界：package metadata、bin entry、npm scripts、help output 和中英双文安装说明。

这能在保持 pre-release 安全状态的同时，降低第一次使用门槛。

## 范围

包含：

- 新增 `package.json`，包含 `type`、`bin` 和 scripts。
- 给 `scripts/vibelog-project.mjs` 增加 shebang 和 help output。
- 验证 package metadata 指向可执行 CLI 文件。
- 验证 `node scripts/vibelog-project.mjs --help` 和 `npm run vibelog -- --help`。
- 增加中英双文安装/分发指南。
- 增加中英双文 Slice 12 报告。
- 更新 README 和根目录 VibeLog。

不包含：

- 发布到 npm。
- 把全局安装作为主路径。
- 编辑全局 Claude Code settings。
- 网站或 marketplace 分发。

## 架构

`package.json` 暴露：

```json
{
  "bin": {
    "vibelog-project": "./scripts/vibelog-project.mjs"
  },
  "scripts": {
    "test": "node --test",
    "vibelog": "node scripts/vibelog-project.mjs"
  }
}
```

bin 指向现有 project adoption CLI。npm script 提供公开 packaging 前的 clone-local 调用路径。

## 安全规则

- package 暂时标记为 private。
- 不添加 publish 步骤。
- help output 必须说明 commands 是 project-local，并且不会 push 或 upload。
- VibeLog 现有底层原则不改变。

## 测试设计

单项检查：

- `package.json` 可解析，并暴露 `vibelog-project`。
- bin 文件存在，并且有 Node shebang。
- `node scripts/vibelog-project.mjs --help` 输出 usage。
- `npm run vibelog -- --help` 输出同一组命令。

组合检查：

- 加入 packaging tests 后，完整 `node --test` 通过。

## 验收标准

- `node --test test\vibelog-package.test.mjs` 通过。
- `npm run vibelog -- --help` exit 0，并输出 `vibelog-project`。
- `node --test` 通过。
- 根目录 VibeLog 已更新，JSON 同步。

## 目标进度快照

- Project Progress: 31 / 100
- Change This Task: +3
- Current Phase: packaging and install distribution
- Next Unlock: clean clone adoption verification
- Main Risk: this is still clone-local packaging, not a public release or global install path
- Confidence: medium-high
