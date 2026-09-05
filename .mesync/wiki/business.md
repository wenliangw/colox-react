# 业务

Colox React 是一个**通用组件库**，不面向特定业务领域。它没有独立的业务模块或业务规则，核心「业务」是组件本身的设计约定：

- 组件 API 设计以可访问性（正确 ARIA 属性、focus 态）为前提；设计语言以可主题化为硬需求。
- 产品需求：支持**用户自定义主题**——官方提供 light/dark 两个基准主题；用户写 `colox.theme.json`（色板定制：brand 种子或全阶、任意色相整阶替换；theme 块：语义覆盖、extends 继承、enabled 开关），用 `colox theme build` 编译成完整赋值 CSS（色板轴 `[data-colox-palette='…']` + 主题轴 `[data-colox-theme='…']`）。运行时双轴正交：明暗（theme 轴）× 品牌/色板（palette 轴）；组件消费 `brand.*` 语义组，palette 轴一切换双主题全链重派生。媒体查询 scope v1 明确不做（等真实无 JS 场景）。**暗色模式**（混合驱动：跟随系统 + 手动覆盖，属后续 ColoxTheme 运行时）。
- 组件级微动效：ColoxTheme `motion` 轴（默认跟随系统减弱动态效果偏好，无障碍友好），组件全开/全关保持一致。
- 设计语言单一来源已落地：Figma variables 导出（color / semantic-colors.light / semantic-colors.dark / typography / size）→ `figma-to-tokens.mjs` 转换（语义 alias 保留为 palette 引用）→ Style Dictionary v4（`outputReferences: true`）→ `themes/palette.css`（104 个 palette 基线变量）+ `themes/light.css`（139 个变量）+ `themes/dark.css`（64 个语义色变量全量赋值）。语义契约定版：强度四档（solid/muted/subtle/inverse）+ 角色组（text/bg/border）；brand 独立组为工程侧引用链（详见 tastes/styling）。fontFamily/motion/breakpoint 与 hover/active 派生、shadow 主题分档为工程侧人工维护（`base.tokens.json`、`semantic.derived[.dark].tokens.json`、`semantic.shadow[.dark].tokens.json`）。**dark 已由 Figma 导出接管**（两个 mode 分别导出全量语义文件，工程侧手维护的 dark 覆盖文件退役）。
- 组件通过 Storybook 预览、通过 Docusaurus 文档向使用者展示用法。

无其他业务规则。
