# 样式与设计 token 品味

## 设计语言用 CSS 自定义属性承载，JSON + Style Dictionary 构建期生成

- 单一来源已落地：W3C DTCG JSON + Style Dictionary v4；链路 = Figma 导出（styles/meta/*.tokens.json）→ figma-to-tokens.mjs 转换 → SD 生成 themes/light.css。
- 三层 token：基元层（palette 色阶）→ 语义层（角色组 text/bg/border + 颜色四档组，组件唯一消费的稳定 API）→ 组件层（按需）。
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

## 强度四档体系：solid / muted / subtle / inverse

- 语义色按**强度档**组织：solid（全强度实底）/ muted（中间调）/ subtle（最浅罩层）/ inverse（深底反色前景）。颜色四档组服务实底组件，角色组（text/bg/border）服务面板/文字/边框语境。
- 档位替混色：焦点环用 muted 档、ghost hover 用 subtle 档，不再走 alpha 混色（alpha 层已完整退役）。
- 仅实底交互态保留 color-mix 派生：hover/active = 基色向黑混 85%/75%，规则集中人工维护在 semantic.derived.tokens.json，组件不内联。
- color-mix 需要 2023+ 浏览器。

## token 归属：Figma 承载视觉值，工程侧承载实现值

- Figma variables 承载：color / semantic-color / fontSize / fontWeight / lineHeight / radii / spacing（导出 → 转换 → SD 生成）。
- 工程侧人工维护（tokens/base.tokens.json + semantic.derived.tokens.json）：fontFamily（sans/mono 系统栈）、shadow（sm/md/lg）、motion（duration fast/normal/slow + easing out/in/in-out）、实底 hover/active 派生混色。
- 原因：Figma variables 对字体族、复合阴影、缓动曲线等实现类值支持不佳，用户拍板归属工程侧。

## 行高用绝对 px，与字号同名配档

- lineHeight 拒绝 unitless 比率：行盒 = 字号×比率，控件总高 = 行盒+padding+border 会产生小数、落出像素网格，高度不可控。
- 采用与 fontSize 同名的绝对 px 档位（lineHeight.md 配 fontSize.md，13 档 1:1），控件高度推导完全确定。

## 间距统一：gap/margin/padding 全部消费 spacing

- 组件里一切空隙（gap、margin、padding）都消费 spacing 档位，不为个别用途另设 grid-gap 类 token。
- 控件高度现在由「行高 + 间距」组合自然落入像素网格（sm 26 / md 36 / lg 48px），不额外引入 control-height token。

## 组件 size prop 属组件私有变体，不进全局 token

- Card/Avatar/Dialog 这类 `size: sm|md|lg` 的具体尺寸是各组件自己的 CVA 变体（内部可组合 spacing/fontSize 等全局 token），彼此无关联、无复用价值，不做全局 size 文件。
- 全局 token 只承载「跨组件共享」的量。

## 断点：工程侧常量 + 编译期注入

- 断点归属 base.tokens.json，Desktop 优先（sm 640 / md 768 / lg 1024 / xl 1280，max-width 向下语义）。
- 媒体查询不能读 CSS 变量，断点以「CSS 变量（供读）+ 生成 SCSS 常量（供 mixin 编译期写死）」双输出。

## 变体层用 CVA，className-only

- variant/size 等变体用 `cva()` 定义，只拼 className、零运行时 CSS；类名沿用 `colox-` BEM 前缀。
- 不引入重型 css-in-js。

## token 命名词汇取向：贴近常识词

- 基元层只按「颜色名词」命名：`palette.indigo / purple / blue / green / orange / red / gray`；用途词（`info / error / warning / success`、`disabled`）只存在于语义层角色组中。
- 色板名沿用 Figma 集合名（集合在 Figma 里同样按颜色名词命名）。
- 浮层背景用平实词 `bg.overlay`；不引入 `canvas` / `surface` / `elevated` / `scrim` 这类设计系统黑话。

## 组件尺寸样式内联在组件内，全局 mixin 只放通用工具

- 组件的尺寸（size）样式直接写在组件自己的 `styles/` 里（如 `input/styles/size.scss`），不进全局 `mixins.scss`。
- 全局 `styles/mixins.scss` 只保留与具体组件无关的通用工具（如 `respond-to`）。
- 类名拼接用 `clsx`，不复用自研 `cn`。
