# Container

布局族的语义宽度壳：**唯一不做布局机制的组件**——帽内容至设计语言宽度刻度、居中、内联留白；flexbox/grid/absolute 一律不沾（机制分家：Stack 管 flexbox 轴线语义，Container 只管页面宽度语义）。`packages/components/src/container/`。

## 组件

- **`Container`**：`colox-container` 根类，纯静态块级 div——**零 theme context**（不碰 `useColoxTheme`、不读运行时：无 Provider 照常渲染，测试无需 mock theme）；原生属性/事件/ref/className 全透传；无 dot-part 子件（无 context/hooks/children 目录）。

## 设计要点

- **size = 设计语言大尺寸 token**（sm/md/lg/xl → `--colox-size-160/192/256/320` = 640/768/1024/1280px）：值源是 Figma 导出的 `large_size` 组（80px–1440px 大刻度，经转换器映射进 size 命名空间编译为 CSS 变量；160=640 档由用户复查后补进 Figma）。**断点回归响应式独占，绝不参与宽度**——Container 不引用 `--colox-breakpoint-*`（教训：初稿借用断点变量，用户点破「breakpoint 不是给 width 用的」后改源）。
- **不传 `size` = 无帽**（CSS 忠实默认、不产生任何 size 修饰类）；无 `fluid` 词汇值——缺省 prop 本身就是默认态（与 Stack gap/wrap 缺省同哲学）。
- **align center 默认**（壳语义：margin-inline auto）；`start` 显式逃逸（块默认 margin）。
- **gutter** = spacing 键（`--colox-spacing-*` 全 20 键），未设无 padding（CSS 默认）。
- 逻辑属性全家桶：`max-inline-size` / `margin-inline` / `padding-inline`。

## API 形状

- variants 层与 Stack/Button 同构：size/gutter/align 三轴 `as const` 类映射 + `containerVariants` cva + `VariantProps`；axis 联合类型 `NonNullable` 派生、不手写。
- `ContainerProps` 继承 `HTMLAttributes<HTMLDivElement>` + `forwardRef`；cva 默认变体 `{ align: 'center' }`，size/gutter 未设无类。

## 文件

`variants/{size,gutter,align}.ts` + `variants/index.ts`、`types/index.ts`、`container.tsx`（forwardRef + `clsx(cva({...}), className)`）、`styles/index.scss`、`index.ts`（出口 Container + variants + 类型）。测试 `_tests/container.test.tsx` 5 例（默认修饰组、轴映射、半步键、透传/className、ref 转发）。外围：`apps/docs/docs/components/container.mdx`（sidebar 第 5 位）、`apps/preview/src/container/container.stories.tsx`。构建：vite `container` entry + exports 子路径 `@colox/react/container` + 主 barrel `export * from './container'`。

## 已知边界 / 场景触发

- **响应宽度推 V2**：size/gutter 收 `ResponsiveValue` 要求主题 context（破零 context 卖点），机制选项待场景（挂载件 vs 受控解析，先例 = Stack.Responsive 权衡）；换带时走运行时断点（ColoxTheme context + defaultBreakpoints，JS 面已齐备）。当前静态 size 换带用双 Container 显隐或样式逃生舱。
- **宽度刻度只到 1440px**：Figma `large_size` 组最大 360 → 1440px；若将来页面需要更宽帽（如 1920 级），从 Figma 补变量即可，组件不动（scss 只引用 `--colox-size-*`）。
- **布局边界的重议点**（「视图层对齐 vs 容器层隔离」的一半）：Container 已落视图层用法；容器层隔离（container queries）留待 Grid/嵌套容器场景再定。
