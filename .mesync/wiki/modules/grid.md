# Grid

布局族的 CSS Grid 机制件：**二维网格轨道壳**，`packages/components/src/grid/`。与 Stack（单维 flexbox 流）互补——三机制件家族：Container 管宽度壳、Stack 管 flex 流、Grid 管网格轨道。

## 组件

- **`Grid`**：`colox-grid` 根类（`display: grid`），轴 = columns（列数，静态数字或响应配置）+ gap（单键双轴 / `{row, column}` 分轴）+ align + justify；CSS 忠实默认（1 列 / 无 gap / align stretch / justify start）
- **`Grid.Item`**（dot part）：`colox-grid-item`，`span` 跨列（任意整数）。标准网格子项容器——div 替身（原生属性/事件/ref/className 全透传）；组件型子项直接放

## 修饰类 / 值通道

- 列模板不是修饰类表：`columns` 是任意整数，走**内联 CSS 变量通道**——解析结果写入 `--colox-grid-columns`，base.scss 单一规则 `grid-template-columns: repeat(var(--colox-grid-columns, 1), minmax(0, 1fr))`（等宽可收缩轨 + 爆格防护）。响应配置同样在 JS 层解析后写变量，不造 `--columns-{n}` 类表
- `--gap-{键}` / `--row-gap-{键}` / `--column-gap-{键}`：spacing 全刻度 20 键单源（同 Stack/Container 键表单源机制）；gap 单键双轴、对象形式按 CSS row-gap/column-gap 顺序分轴
- `--align-{start|center|end|stretch}`：align-content（块轴轨分布）；`--justify-{start|center|end|between|around|evenly}`：justify-content（行内轴轨分布）——语义词 → CSS 值映射，词族与 Stack 同源（baseline 不进 align：轨基线对齐非布局习语）
- `colox-grid-item`：`grid-column: var(--colox-grid-item-span, auto)`——span 走内联变量 `span N`，任意列数无类表

## API 形状

- **variants 层与 Button 同构**：`variants/` = gap/align/justify 三个 per-axis `as const` 类映射（gap axis 一份文件产 gap/rowGap/columnGap 三映射，皆 Object.fromEntries 吃 theme 发射键表）+ `index.ts` 导出 `gridVariants` cva 与 VariantProps（`columns` 非类轴、与 `span` 同为变量通道，不进 variants）；axis 联合类型从 VariantProps `NonNullable` 派生
- `GridProps`/`GridItemProps` 继承原生 `HTMLAttributes<HTMLDivElement>` + forwardRef；`columns` 类型 = `ResponsiveValue<number>`，`gap` = `GridGap | { row?, column? }`
- dot part 挂载 = `Object.assign(GridRoot, { Item })`，与 Stack/ColoxTheme 同惯例
- **首个消费 theme context 的根组件**：每渲染读 `useColoxTheme().breakpoint` 解析响应列（挂载件式 Stack.Responsive 之外的第一种语境消费形态）；无 Provider 时 warn + 静态默认。响应解析复用 theme 公共出口 `resolveResponsiveValue`（激活起点语义）

## 文件

`variants/{gap,align,justify}.ts` + `variants/index.ts`、`types/index.ts`（类型派生 + props 接口）、`grid.tsx`（根组件 + GridItem + Object.assign 挂载）、`styles/{base,gap,align,justify,item}.scss` + 聚合 `styles/index.scss`、`index.ts` 出口（Grid + variants + 类型）、`_tests/grid.test.tsx` 11 例（默认修饰组、静态列变量、响应换带/续档/回落、gap 单键与分轴对象、对齐词族、透传/style/ref、Item span 变量、无 span 类态；theme hook 在测试内 mock 以控制断点）。外围：`apps/docs/docs/components/grid.mdx`（sidebar 第 6 位）、`apps/preview/src/grid/grid.stories.tsx`、wiki 包 `skills/grid/` bundle（SKILL + references/rules + references/component）+ `components.md` 状态 shipped。构建：vite `grid` entry + exports 子路径 `@colox/react/grid` + 主 barrel `export * from './grid'`。

## 已知边界 / 场景触发的候选

- **gap/columns 之外的响应轴**：align/justify/span 保持静态（换带场景先例不足）；gap 响应可复用 Stack.Responsive 同型挂载件或 props 升格——等场景
- **容器层隔离（container queries）**：Grid 落的是视图层断点栏（运行时 data 属性 + JS 解析），未用 container queries——嵌套容器场景再定
- **显式行轨 / 区域命名**：隐式行（内容高）、无 rows/template-areas API——出现真实消费再动
