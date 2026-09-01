# 业务

Colox React 是一个**通用组件库**，不面向特定业务领域。它没有独立的业务模块或业务规则，核心「业务」是组件本身的设计约定：

- 组件 API 设计以可访问性（正确 ARIA 属性、focus 态）为前提；设计语言以可主题化为硬需求。
- 产品需求：支持**用户自定义主题**（官方仅提供 light/dark 两个基准主题，用户以自定义 CSS 定义同名语义变量换肤）与**暗色模式**（混合驱动：跟随系统 + 手动覆盖）。
- 设计语言单一来源已落地：Figma variables 导出四文件（color / semantic-color / typography / size）→ `figma-to-tokens.mjs` 转换 → Style Dictionary v4 → `themes/light.css`（133 变量）+ `themes/dark.css`（58 个语义色变量全量赋值）。语义契约定版：强度四档（solid/muted/subtle/inverse）+ 角色组（text/bg/border），详见 tastes/styling。fontFamily/shadow/motion/breakpoint 为工程侧人工维护（`base.tokens.json`）。**dark 首版已落地**：与主题无关的 palette 不动，仅语义层在 `semantic-color.dark.tokens.json` 重映射（工程侧手维护，Figma 后续出 dark modes 时由导出接管）——推导约定见 tastes/styling。
- 组件通过 Storybook 预览、通过 Docusaurus 文档向使用者展示用法。

无其他业务规则。
