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

- **`@colox/theme`**（`packages/theme/`）：设计 & 主题系统——Figma token 管线（meta→tokens→Style Dictionary→`dist/themes/*.css`）、主题编译 CLI（`colox theme build`，bin `colox`）、JSON Schema、标准主题配置文件模板（`config/theme.default.json`）、ColoxTheme 组合式 React 运行时（`<ColoxTheme>` + `.Theme/.Palette/.Breakpoints/.Storage` + `useColoxTheme`）。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/react`**（`packages/components/`）：组件库本体，组件按目录组织，从 `src/index.ts` 统一导出；构建时 `@import '@colox/theme/index.css'` 级联进 `style.css`，保持一行引入。详见 [modules/button.md](wiki/modules/button.md)、[modules/input.md](wiki/modules/input.md)、[modules/stack.md](wiki/modules/stack.md)
- **`@colox/wiki`**（`packages/wiki/`）：AI 使用心法数据包——`AGENTS.md`（各家 harness 自动读的用法总纲）+ `components.md`（组件地图：职责+状态）+ `skills/<name>/` 主题 bundle（`SKILL.md` 配方本体 + `references/` 按需读：`rules.md` 条件规则、`component.md` API 参考；doctrine bundle 载全局规则、style bundle 讲样式接线；SKILL.md 为 Claude/Codex/dsh 三方自动发现格式）；纯 markdown、无构建，changesets 与 `@colox/react` linked 同版本发布。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/mcp`**（`packages/mcp/`）：官方 MCP server（本地 stdio、官方 `@modelcontextprotocol/sdk`，tsc 构建产 `dist`，bin 即包名——各家一行 `npx -y @colox/mcp` 注册）；读 `@colox/wiki` 依赖（workspace symlink 开发态 / npm 安装态）提供四工具：`search_doctrine`（全文搜索+评分+摘要+读指引，覆盖 bundle 与 references）/ `get_rule`（`global` 别名）/ `get_skill`（`reference` 参数读参考件）/ `get_component`（无参读组件地图）；离线、零网络、版本=wiki 依赖版本。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/preview`**（`apps/preview/`）：组件预览环境（Storybook），组件示例按组件分类存于 `apps/preview/src/<Component>/`（示例归应用、不混入组件包源码；过渡期兼容组件目录内旧 stories）
- **`@colox/docs`**（`apps/docs/`）：Docusaurus 官方文档站点，MDX 内嵌组件示例

## 目录结构

```
colox-react/
├── packages/theme/         # @colox/theme — 设计&主题系统（token 管线 + CLI + Schema）
├── packages/components/    # @colox/react — 组件库
├── packages/wiki/          # @colox/wiki — AI 使用心法数据包（AGENTS.md + skills/rules/components）
├── packages/mcp/           # @colox/mcp — 本地 stdio MCP server（四工具读 wiki 数据）
├── apps/preview/           # 组件预览环境（Storybook）
├── apps/docs/              # Docusaurus 文档站点
├── .changeset/             # 版本管理配置（react/wiki linked 同版本）
└── 根目录配置              # eslint / prettier / commitlint / tsconfig
```
