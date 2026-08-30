# Input 组件

## 职责

提供带尺寸与非法态（invalid）的单行文本输入框。是组件库新目录结构 + 新样式架构（CVA + CSS 变量 + color-mix）的**首个模板组件**。

## 目录结构

```
input/
├── input.tsx            # 组件本体（文件名小写）：forwardRef + inputVariants + clsx
├── index.ts             # 出口：Input + inputVariants 类型
├── _stories/            # Storybook（下划线前缀，非源码）；每个关注点一个页面，同屏对比
│   ├── size.stories.tsx   # Size 页面：sm/md/lg 同屏展示
│   └── state.stories.tsx  # State 页面：default/invalid/disabled 同屏展示
├── _tests/              # Vitest（下划线前缀，非源码）
│   ├── size.test.tsx
│   └── state.test.tsx
├── types/               # props/ref 类型（InputProps/InputSize/InputRef）
│   └── index.ts
├── styles/
│   ├── base.scss        # 结构样式 + 状态（focus/disabled/invalid）
│   ├── size.scss        # 尺寸类 colox-input--sm/md/lg
│   └── index.scss       # @use 汇总 base + size
└── variants/
    ├── size.ts          # size 轴样式映射（类名字符串）
    └── index.ts         # cva() 组装 + 导出类型
```

## 功能逻辑

- `InputProps` 定义在 `types/index.ts`，继承 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>`，新增 `size`（默认由 CVA 的 `defaultVariants` 提供 `'md'`）、`invalid`（默认 `false`）；`InputRef = HTMLInputElement` 显式定义。
- 变体层：`inputVariants = cva('colox-input', { variants: { size }, defaultVariants: { size: 'md' } })`，`InputSize` 由 `VariantProps` 推导。
- 类名：`clsx(inputVariants({ size }), { 'colox-input--invalid': invalid }, className)`——`invalid` 是状态（非变体），用 clsx 对象语法拼接。
- `invalid` 时设 `aria-invalid={true}`，其余属性透传。
- 样式全部消费语义层 CSS 变量（`--colox-color-*`）：border-default / bg-default / text-placeholder / focus-ring（30% 派生已是语义变量）/ action.primary / bg-muted / text-disabled / border-subtle / status.danger.fill；invalid 的 focus 环因契约未含 danger-ring，在组件层按统一规则内联 `color-mix(danger-fill, alpha-focus, transparent)` 派生。
- disabled 态用显式语义 token（无 opacity 透灰）；占位符直接消费预派生 `text.placeholder`。

## 调用关系

- 依赖：`clsx`、`./types`、`./variants`（CVA）、`./styles/index.scss`、全局 token 层 `styles/index.scss`。
- 被依赖：从 `src/index.ts` 导出（`export * from './input'`），供 `@colox/react` 消费方、Storybook、Docusaurus 使用。

## 对外接口

- 导出 `Input`、`InputSize`、`InputRef`、`InputProps`、`inputVariants`、`InputVariants`。
