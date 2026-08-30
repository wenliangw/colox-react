# Button 组件

## 职责

提供带变体、尺寸和加载态的可访问按钮。

## 功能逻辑

- `ButtonProps` 继承 `ButtonHTMLAttributes<HTMLButtonElement>`，新增 `variant`（`'primary' | 'secondary' | 'ghost' | 'danger'`，默认 `primary`）、`size`（`'sm' | 'md' | 'lg'`，默认 `md`）、`loading`（默认 `false`）。
- 用 `forwardRef` 暴露 `HTMLButtonElement`。
- 类名：`colox-btn` + `colox-btn--{variant}` + `colox-btn--{size}`，由 `cn` 拼接，额外透传 `className`。
- `disabled={disabled || loading}`；`loading` 时渲染 `colox-btn__spinner` 并设 `aria-busy`。
- 尺寸样式来自 `styles/_mixins.scss` 的 `button-size` mixin。

## 调用关系

- 依赖：`../utils/cn`、`styles/_variables.scss`、`styles/_mixins.scss`。
- 被依赖：从 `src/index.ts` 导出（`export * from './button'`），供 `@colox/react` 消费方、Storybook、Docusaurus 使用。

## 对外接口

- 导出 `Button`、`ButtonVariant`、`ButtonSize`、`ButtonProps`。
