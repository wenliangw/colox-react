# Button 组件

## 职责

提供带变体、尺寸和加载态的可访问按钮。

## 功能逻辑

- `ButtonProps` 继承 `ButtonHTMLAttributes<HTMLButtonElement>`，新增 `variant`（`'primary' | 'secondary' | 'ghost' | 'danger'`，默认 `primary`）、`size`（`'sm' | 'md' | 'lg'`，默认 `md`）、`loading`（默认 `false`）。
- 用 `forwardRef` 暴露 `HTMLButtonElement`。
- 类名：`colox-btn` + `colox-btn--{variant}` + `colox-btn--{size}`，由 `clsx` 拼接，额外透传 `className`。
- `disabled={disabled || loading}`；`loading` 时渲染 `colox-btn__spinner` 并设 `aria-busy`。
- 样式自包含于 `button/button.scss`（尺寸/变体/旋转动画都在内），不依赖全局 mixin。

## 样式（v2 契约定稿后：四档 + 角色组）

- 所有颜色引用均为语义层 CSS 变量（`--colox-color-*`），零 SCSS 变量、零基元直接引用。
- 变体映射：primary → `indigo.solid` + 派生 `indigo.hover/-active`；secondary → `gray.solid` + 派生 `gray.hover/-active`；ghost → `indigo.solid` 文字 + `indigo.subtle` 浅底 hover；danger → `red.solid` + 派生 `red.hover/-active`。
- 实底白字统一 `text.inverse`；focus 环用 `indigo.muted` 档（outline 2px 形态）。
- disabled 保留 `opacity: 0.6`（实底禁用无显式语义 token，组件层惯例）。
- 字号：默认 `fontSize.sm`（14px），sm/lg 变体用 xs/md；圆角 `radius.lg`（8px）。

## 调用关系

- 依赖：`clsx`、`./button.scss`、语义 CSS 变量（来自 `themes/light.css`，由应用侧引入）。
- 被依赖：从 `src/index.ts` 导出（`export * from './button'`），供 `@colox/react` 消费方、Storybook、Docusaurus 使用。

## 对外接口

- 导出 `Button`、`ButtonVariant`、`ButtonSize`、`ButtonProps`。
