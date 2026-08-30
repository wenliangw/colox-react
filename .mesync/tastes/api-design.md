# API 设计品味

## size prop 一律表示视觉尺寸

组件库中 `size` prop 的语义固定为「视觉尺寸」，取值 `'sm' | 'md' | 'lg'`：

- `Button` 用 `size` 表示按钮尺寸。
- `Input` 用 `size` 表示输入框尺寸；当与原生 `<input>` 的 `size`（字符宽度 number）冲突时，用 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>` 覆盖原生属性，而不是改名或暴露原生语义。

将来做 `Select`、`Textarea` 等表单组件时保持一致：`size` 表示视觉尺寸；遇到原生同名属性冲突，优先用 `Omit` 覆盖。

来源：Input 组件新增时对 `size` 语义的取舍（见决策「Input size prop 语义」）。
