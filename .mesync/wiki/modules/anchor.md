# Anchor 模块

## 职责

`@colox/react` 的**参照框**——定位机制的两个名字之一（另一件是被定位盒 [Positioner](positioner.md)）。布局中立的 `position: relative` 盒：**它里面的盒以它的盒为参照**（任何绝对定位子件都行：`Positioner`、或消费方手写的 absolute 盒）；`inline` 抱紧内容（badge 包壳）。非布局容器（flexbox/grid 归 Stack/Grid），零 JS 测量。

## 设计要点

- **独立成组件**（用户指正「`Anchor` 是否可以独立出来，而不是放在 Positioner 的 children 中」）：本仓 `children/` 是 **dot-part 单元的住处**（`Select.Option`、`Radio.Group` 都以 `Parent.Child` 挂载），而 `Anchor` 不是 dot part（模块 barrel 平级具名导出）且**可独立使用**——故给它自己的组件槽位（`src/anchor/` 目录 + `@colox/react/anchor` 入口 + 独立 story/docs/组件地图行），同 `Container` 这种「很小但完整」的组件先例。
- **角色不重叠**：`Anchor` 永远 `relative`；被定位盒永远 `absolute|fixed`。所以框不需要 position 轴，被定位盒也不需要 `inline`——两件的词表天然分层，非法组合是编译期错误（不需要 union 判别）。
- **抱紧必须跨父布局成立**：`inline` = `display: inline-block` **+ `width: fit-content`**——flex/grid 子项会把 inline 盒 blockify，单靠 inline-block 在列向 flex 里被 stretch 拉满（Positioner 探针实测 84px 按钮的壳被拉到 736px），fit-content 兜住。
- **边界**：不做测量/portal/sticky（跟随锚点/翻转归 cdk/floating；吸顶归滚动件，见 delivery 欠账）；不做 flex/grid 容器。

## 实现结构

```
packages/components/src/anchor/
├── anchor.tsx            # 根：接 props → clsx(anchorVariants) 组装（渲染体只编排）
├── index.ts              # 公共 barrel（组件 + cva + 类型，选择性具名导出）
├── types/index.ts        # AnchorProps / AnchorRef
├── variants/             # inline.ts（布尔轴类映射）+ index.ts（cva）
├── styles/               # base.scss（relative + display:block）+ inline.scss（inline-block + fit-content）+ index.scss（@use 聚合）
└── _tests/anchor.test.tsx
```

## 测试

4 例（`anchor.test.tsx`）：默认档 / `inline` 档 / className + rest 透传 + ref / **不带定位词表**（框上不该出现 placement/offset/fill/position 类）。组合行为（框 + 定位盒 + 嵌套帧）在 `positioner/_tests` 里覆盖。

## 变更

- 2026-10 Anchor 首版交付：从 positioner 模块的 `children/anchor/` 提升为**独立组件**（`src/anchor/` + `@colox/react/anchor` 入口 + 独立 story/docs/组件地图行）——`children/` 只装 dot part 是既有结构规范，平级的搭档件走自己的组件槽位。类名与行为不变（`colox-anchor` / `colox-anchor--inline`），Positioner 的探针（20/20）与页面不变。
