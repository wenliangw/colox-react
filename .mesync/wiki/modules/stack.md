# Stack

布局族的 flexbox 机制件：**单组件承载全部 flexbox 语义**，`packages/components/src/stack/`。取代已删除的 HStack/VStack 成对组件（三机制件收紧定案，见决策链）。

## 组件

- **`Stack`**：`colox-stack` 根类（`display: flex`），轴 = direction（row/column/row-reverse/column-reverse，默认 row）+ gap + align + justify + wrap；CSS 忠实默认（row/stretch/start/无 gap/不 wrap）
- **`Stack.Item`**（dot part）：`colox-stack-item`，`grow` 吸收主轴剩余空间（Spacer 语义）。兼任标准子项容器——div 替身（原生属性/事件/ref/className 全透传、DOM 层级相同），示例统一以它代裸 div，用户可基于它封装自定义块；组件型子项（Button 等）直接放、不再裹 Item
- **`Stack.Responsive`**（dot part）：挂载式响应 gap——读 theme context 断点名解析 `{ base?, sm?, md?, lg?, xl? }` 配置（max-width 帽语义：当前带向外第一个已配置值，兜底 base；解析器 = @colox/theme 公共出口 `resolveResponsiveValue`），注册结果给父 Stack；卸载还原静态 gap；渲染 null。**只有挂载件碰 theme context，静态 Stack 零 context**

## 修饰类

- `--row/-column/-row-reverse/-column-reverse`：flex-direction；`--wrap`：flex-wrap
- `--gap-{键}`：spacing 全刻度 20 键（`1..14`、`16`、`0-5..4-5` → `var(--colox-spacing-*)`），未设 gap 无类（CSS 默认 gap 0）
- `--align-{start|center|end|stretch|baseline}`、`--justify-{start|center|end|between|around|evenly}`：语义词 → flexbox 值映射
- `colox-stack-item--grow`：flex-grow 1

## API 形状

- **variants 层与 Button 同构**：`variants/` = direction/gap/align/justify 四个 per-axis `as const` 类映射 + `index.ts` 导出 `stackVariants`/`stackItemVariants` 双 cva 与 VariantProps；默认值住 `defaultVariants`；axis 联合类型从 VariantProps `NonNullable` 派生（不手写联合）
- `StackProps`/`StackItemProps` 继承原生 `HTMLAttributes<HTMLDivElement>`（属性与事件全透传）+ `forwardRef`
- `gap` 只收 spacing 键（token 纯度，不收任意数字/px）；`align justify` 收语义词不收 flexbox 值
- dot part 挂载 = `Object.assign(StackRoot, { Item, Responsive })`，与 ColoxTheme 的 Storage/Breakpoints 同惯例；Stack 通过内部 `StackContext`（不进公共 barrel）与挂载件通信，注册 LWW、卸载还原

## 文件

`variants/{direction,gap,align,justify}.ts` + `variants/index.ts`、`types/index.ts`（类型派生 + Props 接口 + `StackResponsiveGap`=ResponsiveValue<StackGap> + `StackContextValue`）、`children/{item,responsive}/index.tsx`（dot-part 子件）、`context/index.ts`（仅 createContext + 默认 no-op 值）、`hooks/use-stack-context.ts`（受保护出口：无根挂载 warn + no-op 降级）、`stack.tsx`（根组件 + Object.assign 挂载）、`styles/index.scss`、`index.ts` 出口（useStackContext 进 barrel、StackContext 不进）；无组件私有 utils（响应式解析已上提 theme）。测试：`_tests/stack.test.tsx` 11 例（默认修饰组、轴映射、反向轴、透传/className、Item grow、Responsive 挂载/换带/卸载还原、无根 warn 降级；theme hook 在测试内 mock 以控制断点），解析器测试随 `resolveResponsiveValue` 上提至 theme 包 8 例。
