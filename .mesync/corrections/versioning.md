# 发版版本纪律

改 react/theme 代码 → 必须检查版本联动：

- react 或 theme 任何代码调整 → 评估 packages/wiki 是否需同步（API / 语义 / 组件行为变化才需要）。
- `@colox/react` 与 `@colox/wiki` 前两位版本号（major.minor）必须一致。
- patch 位专归组件 bugfix：第三位只给组件修 bug，wiki 不动。
- 非 API 变更一般不更新 wiki，也不新增 wiki changeset；react 的 minor/major 需要发 wiki 时补同型 changeset。
- wiki 发版 → mcp 自动以 patch 位随发（`updateInternalDependencies: patch` 刷依赖范围）；属设计行为，勿移除/收紧该配置。

为什么：patch 只表达组件修复；前两位一致让用户一眼对上心法与组件版本。
