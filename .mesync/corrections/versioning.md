# 发版版本纪律

改 react/theme 代码 → 必须检查版本联动：

- react 或 theme 任何代码调整 → 评估 packages/wiki 是否需同步（API / 语义 / 组件行为变化才需要）。
- `@colox/react` 与 `@colox/wiki` 前两位版本号（major.minor）必须一致。
- patch 位专归组件 bugfix：第三位只给组件修 bug，wiki 不动。
- 非 API 变更一般不更新 wiki，也不新增 wiki changeset；react 的 minor/major 需要发 wiki 时补同型 changeset。
- wiki 发版 → mcp 自动以 patch 位随发（`updateInternalDependencies: patch` 刷依赖范围）；属设计行为，勿移除/收紧该配置。

为什么：patch 只表达组件修复；前两位一致让用户一眼对上心法与组件版本。

## 首发时写 changeset → 必须检查这份清单

现状（2026-09 会话共识）：**首发前 `.changeset/` 不积累零散的 md**——早前积累的几条（machine 命名如 tidy-inputs-fly、内容与真实交付不符，如 Input 是测试组件）已整体删除，`config.json` 保留。首发时按真实交付内容一次性 `pnpm changeset` 补写，逐项对照：

- [ ] 包清单：`@colox/react`、`@colox/theme`、`@colox/theme-builder`、`@colox/wiki`、`@colox/mcp`——五个包都要有各自的 changeset 条目（mcp 与 wiki 同批发布）。
- [ ] 内容按**真实交付**写（勿照抄历史清单）：Button/Stack 已在库且成熟；**Input 是测试组件**——首发说明以它当时的真实定位为准，不确定就问用户。
- [ ] `react-entry-points`（按组件入口树摇）、theme 拆分（`@colox/theme-builder` 新建 + 契约驱动 CLI）、wiki doctrine 数据包、mcp server——这四个是确定要写进首发 CHANGELOG 的主题。
- [ ] 文件命名语义化：**禁止**分支名/CLI 随机词（教训：tidy-inputs-fly.md = 分支 tidy-inputs + CLI 随机词 fly）。
- [ ] `changeset version` 消费后 md 会自动删除；发布后 `.changeset/` 只剩 `config.json`。
