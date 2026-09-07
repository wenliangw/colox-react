# Container

布局族的语义宽度壳：**唯一不做布局机制的组件**——帽内容至断点宽度基准、居中、内联留白；flexbox/grid/absolute 一律不沾（机制分家：Stack 管 flexbox 轴线语义，Container 只管页面宽度语义）。`packages/components/src/container/`。

## 组件

- **`Container`**：`colox-container` 根类，纯静态块级 div——**零 theme context**（不碰 `useColoxTheme`、不读运行时：无 Provider 照常渲染，测试无需 mock theme）；原生属性/事件/ref/className 全透传；无 dot-part 子件（无 context/hooks/children 目录）。

## 设计要点

- **size 键 = 断点词**（sm/md/lg/xl/fluid），每个帽**引用**同名断点基准变量 `--colox-breakpoint-*`（light.css 基线已发 640/768/1024/1280）：`size-sm` 容器不超过 sm 视口带下限——值与断点基准同源同值（base.tokens.json 一组），组件 scss 零硬编码。`fluid`（默认）= 显式渲染 CSS 默认（无帽）。
- **align center 默认**（壳语义：margin-inline auto）；`start` 显式逃逸（块默认 margin）。
- **gutter** = spacing 键（`--colox-spacing-*` 全 20 键），未设无 padding（CSS 默认）。
- 逻辑属性全家桶：`max-inline-size` / `margin-inline` / `padding-inline`。

## API 形状

- variants 层与 Stack/Button 同构：size/gutter/align 三轴 `as const` 类映射（全键显式类、含 fluid/start 默认态，无 null 值）+ `containerVariants` cva + `VariantProps`；axis 联合类型 `NonNullable` 派生、不手写。
- `ContainerProps` 继承 `HTMLAttributes<HTMLDivElement>` + `forwardRef`；cva 默认变体 `{ size: 'fluid', align: 'center' }`，gutter 未设无类。

## 文件

`variants/{size,gutter,align}.ts` + `variants/index.ts`、`types/index.ts`、`container.tsx`（forwardRef + `clsx(cva({...}), className)`）、`styles/index.scss`、`index.ts`（出口 Container + variants + 类型）。测试 `_tests/container.test.tsx` 5 例（默认修饰组、轴映射、半步键、透传/className、ref 转发）。外围：`apps/docs/docs/components/container.mdx`（sidebar 第 5 位）、`apps/preview/src/container/container.stories.tsx`。构建：vite `container` entry + exports 子路径 `@colox/react/container` + 主 barrel `export * from './container'`。

## 已知边界 / 场景触发

- **响应宽度推 V2**：size/gutter 收 `ResponsiveValue` 要求主题 context（破零 context 卖点），机制选项待场景（挂载件 vs 受控解析，先例 = Stack.Responsive 权衡）；当前静态 size 换带用双 Container 显隐或样式逃生舱。
- **宽度值 = 断点基准本身**：若设计语言将来新增独立容器宽变量（Figma 长出真材），scss 引用改指新 `var()` 即可，组件代码不动。
- **布局边界的重议点**（「视图层对齐 vs 容器层隔离」的一半）：Container 已定视图层路径；容器层隔离（container queries）留待 Grid/嵌套容器场景再定。
