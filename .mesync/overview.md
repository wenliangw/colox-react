# Colox React 项目速览

## 项目简介

Colox React 是一个模块化、可访问的 React 组件库 monorepo。目标是提供一套可主题化、可 tree-shaking 的 React UI 组件，配套 Storybook 预览和 Docusaurus 官方文档。

## 技术栈

| 领域              | 选型                                                               |
| ----------------- | ------------------------------------------------------------------ |
| 包管理 / monorepo | pnpm workspaces                                                    |
| 构建              | Vite（library mode）+ vite-plugin-dts（ESM/CJS + 类型 + CSS 打包） |
| 框架              | React 19 + TypeScript 5                                            |
| 样式              | SCSS + CSS（设计 token、组件级 `.scss`）                           |
| 组件预览          | Storybook 8（`@storybook/react-vite`）                             |
| 文档              | Docusaurus 3（MDX 内嵌组件示例）                                   |
| 测试              | Vitest + Testing Library                                           |
| 代码质量          | ESLint 9（flat config）+ Prettier + EditorConfig                   |
| 提交规范          | Commitlint + Husky + lint-staged                                   |
| 版本管理          | Changesets                                                         |

## 模块索引

- **`@colox/theme`**（`packages/theme/`）：主题运行时 + 自带打包 css——ColoxTheme 组合式 React 运行时（`<ColoxTheme>` + `.Theme/.Palette/.Breakpoints/.Storage` + `useColoxTheme`）、默认断点常量（`defaultBreakpoints`，由 builder 按 build 契约的 `runtime` 字段从 token 工作区发射到 output 目录 `src/styles/tokens/`，文件名 builder 定）、vite 产 ES/CJS+dts；`dist/index.css` 聚合样式与 `dist/themes/*.css` 由构建期调 theme-builder 的内置设计语言管线产出。**不再持有** token 管线/CLI/Schema。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/theme-builder`**（`packages/theme-builder/`）：编译期工具包（bin `colox`）——Figma token 管线（token 源→tokens→Style Dictionary→css 套件 + `cli-data.json` 编译数据）、token 发射（`scripts/emit-runtime.mjs`：断点/键表 → TS 常量 + SCSS 面产物）、主题编译 CLI（`colox theme build`，由项目内 `colox.theme.build.json` 驱动：`tokens` = token 源目录 / `theme` = 主题覆盖配置 / `runtime` = 产物发射；无该文件时 `-c colox.theme.json` 走旧行为）、JSON Schema、`config/theme.default.json`。内置设计语言源随包发布（`src/styles/meta`）。零 JS 运行时依赖（style-dictionary 是构建期 dependency）。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/react`**（`packages/components/`）：组件库本体，组件按目录组织；构建按组件切入口（`index`/`button`/`container`/`grid`/`input`/`stack` 多 entry + `exports` 子路径 `@colox/react/button` 等）做 JS 级树摇；`@import '@colox/theme/index.css'` 级联进单一 `style.css`（`cssCodeSplit: false`），保持一行引入。详见 [modules/button.md](wiki/modules/button.md)、[modules/input.md](wiki/modules/input.md)、[modules/stack.md](wiki/modules/stack.md)、[modules/container.md](wiki/modules/container.md)、[modules/grid.md](wiki/modules/grid.md)
- **`@colox/icons`**（`packages/icons/`）：第一方基础图标包——stroke 风格（24 viewBox / 1.5 round stroke / currentColor / 1em 默认、`size` 数字 px 覆盖），`IconXxx` 前缀命名的 React 组件（前缀防碰撞，per-icon 命名导出保树摇），`IconBase` 为内部契约基座（不进公共面）；图标设计规范八条由 spec lint（test/icon-spec.test.tsx）机器门禁：几何锁（渲染必须等于设计的 d）、整数网格、[2,22] 光学内容框、成对同源（chevron 四向单几何旋转、eye-off 由 eye 派生）。零运行时依赖。批次一：chevron×4、x、check、plus、eye、eye-off、search 十枚样板。详见 [modules/icons.md](wiki/modules/icons.md)
- **`@colox/wiki`**（`packages/wiki/`）：AI 使用心法数据包——`AGENTS.md`（各家 harness 自动读的用法总纲）+ `components.md`（组件地图：职责+状态）+ `skills/<name>/` 主题 bundle（`SKILL.md` 配方本体 + `references/` 按需读：`rules.md` 条件规则、`component.md` API 参考；doctrine bundle 载全局规则、style bundle 讲样式接线；SKILL.md 为 Claude/Codex/dsh 三方自动发现格式）；纯 markdown、无构建，版本纪律：前两位（major.minor）与 `@colox/react` 一致、patch 位留给组件 bugfix、API 变更才随版本更新。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/mcp`**（`packages/mcp/`）：官方 MCP server（本地 stdio、官方 `@modelcontextprotocol/sdk`，tsc 构建产 `dist`，bin 即包名——各家一行 `npx -y @colox/mcp` 注册）；读 `@colox/wiki` 依赖（workspace symlink 开发态 / npm 安装态）提供四工具：`search_doctrine`（全文搜索+评分+摘要+读指引，覆盖 bundle 与 references）/ `get_rule`（`global` 别名）/ `get_skill`（`reference` 参数读参考件）/ `get_component`（无参读组件地图）；离线、零网络、版本=wiki 依赖版本。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/preview`**（`apps/preview/`）：组件预览环境（Storybook），组件示例按组件分类存于 `apps/preview/src/<Component>/`（示例归应用、不混入组件包源码；过渡期兼容组件目录内旧 stories）
- **`@colox/docs`**（`apps/docs/`）：Docusaurus 官方文档站点，MDX 内嵌组件示例

## 目录结构

```
colox-react/
├── packages/theme/         # @colox/theme — 主题运行时 + 打包 css
├── packages/theme-builder/ # @colox/theme-builder — token 管线 + 主题编译 CLI（bin colox）
├── packages/components/    # @colox/react — 组件库
├── packages/icons/         # @colox/icons — 第一方基础图标（stroke 风格，spec lint 门禁）
├── packages/wiki/          # @colox/wiki — AI 使用心法数据包（AGENTS.md + skills/rules/components）
├── packages/mcp/           # @colox/mcp — 本地 stdio MCP server（四工具读 wiki 数据）
├── apps/preview/           # 组件预览环境（Storybook）
├── apps/docs/              # Docusaurus 文档站点
├── .changeset/             # 版本管理配置（react/wiki linked 同版本）
└── 根目录配置              # eslint / prettier / commitlint / tsconfig
```
