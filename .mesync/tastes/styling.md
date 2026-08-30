# 样式与设计 token 品味

## 设计语言用 CSS 自定义属性承载，JSON + Style Dictionary 构建期生成

- 单一来源**已决定**：从 SCSS 变量手写迁移为 W3C DTCG JSON + Style Dictionary v4（待 Figma 设计稿落地实施）。
- 三层 token：基元层（palette 色阶）→ 语义层（bg/text/border/action 等用途语义，组件唯一消费的稳定 API）→ 组件层（按需）。
- 主题 = 语义层的多组映射：换主题 = 换语义层赋值，基元与组件都不动。

## 换肤机制：选择器作用域 + 混合暗色

- 主题块 = 同名语义变量在 `:root` / `@media (prefers-color-scheme: dark)` / `[data-theme]` 作用域下的多组值；组件零感知。
- 暗色混合驱动：无显式选择时跟随系统，`[data-theme='light'|'dark']` 手动覆盖。

## 主题模型：用户自定义主题，官方只给基准

- 语义 token 列表是组件库的**稳定公开契约**；官方只提供 light/dark 两个基准主题文件。
- 用户自定义主题 = 自己的 CSS 文件定义同名语义变量，与官方主题文件**平级**。

## 发布形态：样式由用户自行引入

- 产物拆分：组件结构样式（不含主题值）+ `themes/light.css` + `themes/dark.css`；入口不自动注入主题。
- 未引入的主题文件不进用户打包体积；自定义主题只需定义同名语义变量。

## token 可读性优先，拒绝 RGB 通道三元组

- 颜色 token 保持完整色值（如 `#4f46e5`），保证可预览、可读。
- 明确否决「RGB 通道三元组（`79 70 229`）+ `rgb(var(--rgb) / alpha)`」方案——用户认为通道值不可读。

## alpha 语义化 + color-mix

- 透明度定义为语义化**百分比** token：`--colox-alpha-hover`、`--colox-alpha-focus`、`--colox-alpha-disabled` 等（值如 `15%`，不是 `0.15`）。
- 用法：`color-mix(in srgb, var(--colox-color-primary) var(--colox-alpha-hover), transparent)`。
- 交互态（hover/active/focus）用 alpha 从基色派生，不引用固定色阶（如不用 primary.600 做 hover）；方向要区分：实底交互态向黑混（`primary 85% + #000` 变深），浅底罩层向透明混（`primary 15% + transparent`）。
- 好处：颜色 token 完整可读、alpha 语义化且跟随主色运行时覆盖；代价是 color-mix 需要 2023+ 浏览器。

## 变体层用 CVA，className-only

- variant/size 等变体用 `cva()` 定义，只拼 className、零运行时 CSS；类名沿用 `colox-` BEM 前缀。
- 不引入重型 css-in-js。

## token 命名词汇取向：贴近常识词

- 基元层只按「颜色名词」命名：`palette.indigo / purple / blue / green / orange / red / gray`；用途词（`primary / success / warning / danger / info`）一律不进基元，只存在于语义层，主色是语义化阶段才选择的对基元的引用。
- 色板名沿用 Figma 集合名（集合在 Figma 里同样按颜色名词命名）。
- 背景等语义词优先 `default` / `overlay` 这类平实词，不用 `canvas` / `surface` / `elevated` / `scrim` 这类设计系统黑话（具体词表未最终对齐，随 token 一起定）。

## 组件尺寸样式内联在组件内，全局 mixin 只放通用工具

- 组件的尺寸（size）样式直接写在组件自己的 `styles/` 里（如 `input/styles/size.scss`），不进全局 `_mixins.scss`。
- 全局 `styles/_mixins.scss` 只保留与具体组件无关的通用工具（如 `respond-to`）。
- 类名拼接用 `clsx`，不复用自研 `cn`。
