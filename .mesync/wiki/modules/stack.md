# Stack（HStack / VStack）

布局族的旗舰件：**gap 驱动的水平/垂直堆叠**，`packages/components/src/stack/`。

## 组件

- **`HStack`**：`colox-hstack` 根类（`flex-direction: row`），默认 `gap 2`（8px，行内贴排）、`align stretch`（CSS 忠实默认）、`justify start`，专属 `wrap?`（`colox-hstack--wrap` flex-wrap: wrap）
- **`VStack`**：`colox-vstack` 根类（`column`），默认 `gap 4`（16px，块级堆叠），无 wrap 轴

## 修饰类（两组件共享 `colox-stack--*`）

- `--gap-{键}`：spacing 全刻度 20 键（`1..14`、`16`、`0-5..4-5` → `var(--colox-spacing-*)`），SCSS `@each` 生成
- `--align-{start|center|end|stretch|baseline}`、`--justify-{start|center|end|between|around|evenly}`：语义词 → flexbox 值映射
- 修饰类始终全量输出（含默认档，同 Button CVA 惯例），`clsx` 拼接 + 自定义 className 尾部

## API 形状

- 双组件直白语义（用户选型）：`HStackProps`/`VStackProps` 继承原生 `HTMLAttributes<HTMLDivElement>`（属性与事件全透传）+ `forwardRef`
- **variants 层与 Button 同构**：`variants/` = gap/align/justify 三个 per-axis `as const` 类映射 + `index.ts` 导出 `hstackVariants`/`vstackVariants` 双 cva（wrap 仅 hstack 轴）与 VariantProps；默认值（gap 2/4、align stretch、justify start）住 `defaultVariants`；axis 联合类型从 VariantProps `NonNullable` 派生（不手写联合）
- `gap` 只收 spacing 键（token 纯度，不收任意数字/px）；`align justify` 收语义词不收 flexbox 值
- 不依赖 theme context——纯 token 消费，无响应式 prop（留二期与断点感知一起评估）

## 文件

`variants/{gap,align,justify}.ts` + `variants/index.ts`、`types/index.ts`（类型派生 + Props 接口 + @default JSDoc）、`hstack.tsx`/`vstack.tsx`（clsx(cva(…), className)，各自动引用 `styles/index.scss`）、`index.ts` 出口；测试 `_tests/{hstack,vstack}.test.tsx` 8 例（默认修饰组、gap/align/justify/wrap 映射、半档键、className 合并、事件透传）。
