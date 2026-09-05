# Button 组件

## 职责

纯按钮组件：`variant`（形态）× `intent`（语义意图）× `size` 三轴。**无 loading、无 icon 机制**——IconButton/LoadingButton 等组合形态由组合式组件另行实现（内核纯粹性优先）。

## 功能逻辑

- `ButtonProps` = `ButtonHTMLAttributes<HTMLButtonElement>` + 三轴可选 prop：`variant`（`'solid' | 'outline' | 'ghost'`，默认 `solid`）、`intent`（`'primary' | 'neutral' | 'danger' | 'warning' | 'success'`，默认 `primary`，映射语义色组 primary→brand / neutral→gray / danger→red / warning→orange / success→green——API 用用途词，theme 变量仍随 Figma 的 brand 色组——brand 是**动态品牌主色**（用户 palette 定制可整体覆盖，见 architecture「brand 组」））、`size`（`'xs' | 'sm' | 'md' | 'lg'`，默认 `md`）、`shadow`（`boolean`，默认 `false`——投影装饰轴：常态 `--colox-shadow-md`、hover 升 `--colox-shadow-lg`、按压紧收 `--colox-shadow-sm`，三形态通吃，值零硬编码）。**微动效**：hover 起浮（shadow 按钮）+ 按压三件套——`scale(0.97)`、`::before` 按压波光（solid 反色高光 16% / outline+ghost 意图罩层 14%，color-mix 半透明）、`::after` 凹陷内阴影（`--colox-shadow-inset`，伪元素承载不抢按钮自身 box-shadow 槽）（快进 100ms/慢出 200ms 双过渡清单，disabled 排除）；门控由 theme motion.css 统一执行，off/reduced-motion 下移除按压缩放与波光扫掠（波光的透明度状态保留，同 wash 档待遇）。
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
│   ├── size.scss                    # 尺寸轴：高度消费 size 变量（24/32/40/48）
│   └── index.scss                   # @use 汇总
└── _tests/                          # state / variant / size
```

stories 已迁 `apps/preview/src/button/`（variant/intent/size/state 四页，消费方视角 `import { Button } from '@colox/react'`）。

## 样式

- **组件零硬编码颜色、零内联派生**：intent 轴把主题色组映射为组件局部变量（`--colox-button-intent-solid/muted/inverse` + 交互态 `solid-/wash-hover/active`），variant 轴只读这些局部变量；换肤只换主题层色组。
- 交互态全部消费 theme derived 双档 token：实底档 `solid-hover/active`（向黑混 85%/75%，dark 向白）与罩层档 `wash-hover/active`（向透明混 8%/15%）；outline/ghost 的 hover/active 用 wash 档浅底。
- focus-visible：`outline:none` + intent solid 边框 + `0 0 0 2px intent-muted` 环（danger 轴自动跟 red 组）。
- disabled：消费语义三件套 `text.disabled` / `bg.disabled`（solid）/ `border.disabled`（outline），弃 opacity 惯例。
- 尺寸四档（8px 格点、4 的倍数基准）：xs/sm/md/lg = 24/32/40/48px，高度消费 `--colox-size-6/8/10/12`，padding-inline 走 spacing-2/3/4/6，字号 lineHeight 同名对位（fontSize.xs/sm/md/lg）；md=40 与 M3 单档基准对齐，sm=32 承接全球主流默认。Input 现阶梯（26/36/48）本轮未动，同格点对齐留待后续。

## 调用关系

- 依赖：`clsx`、`class-variance-authority`、语义 CSS 变量（含 derived 双档）、`./styles/` 汇总。
- 被依赖：从 `src/index.ts` 导出，供 `@colox/react` 消费方、preview、docs 使用。

## 对外接口

- 导出 `Button`、`ButtonProps`、`ButtonRef`、`ButtonSize`、`ButtonVariant`、`ButtonIntent`、`buttonVariants`、`ButtonVariants`。
