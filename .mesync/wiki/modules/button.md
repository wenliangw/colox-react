# Button 组件

## 职责

纯按钮组件：`variant`（形态）× `intent`（语义意图）× `size` 三轴。**无 loading、无 icon 机制**——IconButton/LoadingButton 等组合形态由组合式组件另行实现（内核纯粹性优先）。

## 功能逻辑

- `ButtonProps` = `ButtonHTMLAttributes<HTMLButtonElement>` + 三轴可选 prop：`variant`（`'solid' | 'outline' | 'ghost'`，默认 `solid`）、`intent`（`'brand' | 'neutral' | 'danger'`，默认 `brand`，映射语义色组 brand/gray/red）、`size`（`'sm' | 'md' | 'lg'`，默认 `md`）。
- `forwardRef` 暴露 `ButtonRef = HTMLButtonElement`；`type` 默认 `'button'`（可用 props 覆盖，不沿原生 submit 默认值）。
- 类名 = `cva('colox-button')` 三轴变体 + `clsx` 拼接透传 `className`。

## 目录结构（Input 模板）

```
button/
├── button.tsx                       # forwardRef + buttonVariants + clsx
├── index.ts                         # 出口：Button + 类型 + buttonVariants
├── types/index.ts                   # ButtonProps / ButtonRef / ButtonSize / ButtonVariant / ButtonIntent
├── variants/
│   ├── size.ts / variant.ts / intent.ts   # 各轴类名常量
│   └── index.ts                     # buttonVariants = cva（三轴 + 默认值）
├── styles/
│   ├── base.scss                    # 结构 + focus-visible + disabled 指针
│   ├── intent.scss                  # intent → 主题色组局部变量映射
│   ├── variant.scss                 # 形态轴规则（只读局部变量）
│   ├── size.scss                    # 尺寸轴（同 Input 阶梯）
│   └── index.scss                   # @use 汇总
└── _tests/                          # state / variant / size
```

stories 已迁 `apps/preview/src/button/`（variant/intent/size/state 四页，消费方视角 `import { Button } from '@colox/react'`）。

## 样式

- **组件零硬编码颜色、零内联派生**：intent 轴把主题色组映射为组件局部变量（`--colox-button-intent-solid/muted/inverse` + 交互态 `solid--/wash--hover/active`），variant 轴只读这些局部变量；换肤只换主题层色组。
- 交互态全部消费 theme derived 双档 token：实底档 `solid--hover/active`（向黑混 85%/75%，dark 向白）与罩层档 `wash--hover/active`（向透明混 8%/15%）；outline/ghost 的 hover/active 用 wash 档浅底。
- focus-visible：`outline:none` + intent solid 边框 + `0 0 0 2px intent-muted` 环（danger 轴自动跟 red 组）。
- disabled：消费语义三件套 `text.disabled` / `bg.disabled`（solid）/ `border.disabled`（outline），弃 opacity 惯例。
- 尺寸阶梯与 Input 对齐：sm = spacing-1/3 + fontSize.xs/lineHeight.xs，md = spacing-2/4 + fontSize.sm，lg = spacing-3/4 + fontSize.md/lineHeight.md。

## 调用关系

- 依赖：`clsx`、`class-variance-authority`、语义 CSS 变量（含 derived 双档）、`./styles/` 汇总。
- 被依赖：从 `src/index.ts` 导出，供 `@colox/react` 消费方、preview、docs 使用。

## 对外接口

- 导出 `Button`、`ButtonProps`、`ButtonRef`、`ButtonSize`、`ButtonVariant`、`ButtonIntent`、`buttonVariants`、`ButtonVariants`。
