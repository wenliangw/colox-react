# 样式与设计 token 品味

## 设计语言用 CSS 自定义属性承载，SCSS 只做编译期来源

- SCSS `$colox-*` 是单一来源，编译期吐进 `:root` 的 `--colox-*`。
- 组件样式直接消费 `var(--colox-*)`，实现运行时主题化（覆盖变量即可换肤，无需重新编译）。

## token 可读性优先，拒绝 RGB 通道三元组

- 颜色 token 保持完整色值（如 `#4f46e5`），保证可预览、可读。
- 明确否决「RGB 通道三元组（`79 70 229`）+ `rgb(var(--rgb) / alpha)`」方案——用户认为通道值不可读。

## alpha 语义化 + color-mix

- 透明度定义为语义化**百分比** token：`--colox-alpha-hover`、`--colox-alpha-focus`、`--colox-alpha-disabled` 等（值如 `15%`，不是 `0.15`）。
- 用法：`color-mix(in srgb, var(--colox-color-primary) var(--colox-alpha-hover), transparent)`。
- 好处：颜色 token 完整可读、alpha 语义化且跟随主色运行时覆盖；代价是 color-mix 需要 2023+ 浏览器。

## 变体层用 CVA，className-only

- variant/size 等变体用 `cva()` 定义，只拼 className、零运行时 CSS；类名沿用 `colox-` BEM 前缀。
- 不引入重型 css-in-js。

## 组件尺寸样式内联在组件内，全局 mixin 只放通用工具

- 组件的尺寸（size）样式直接写在组件自己的 `styles/` 里（如 `input/styles/size.scss`），不进全局 `_mixins.scss`。
- 全局 `styles/_mixins.scss` 只保留与具体组件无关的通用工具（如 `respond-to`）。
- 类名拼接用 `clsx`，不复用自研 `cn`。
