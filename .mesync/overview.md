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
- **`@colox/react`**（`packages/components/`）：组件库本体，组件按目录组织，从 `src/index.ts` 统一导出；构建时 `@import '@colox/theme/index.css'` 级联进 `style.css`，保持一行引入。详见 [modules/button.md](wiki/modules/button.md)、[modules/input.md](wiki/modules/input.md)
- **`@colox/storybook`**（`apps/storybook/`）：组件预览环境，读取 `packages/components/src/**/*.stories.tsx`
- **`@colox/docs`**（`apps/docs/`）：Docusaurus 官方文档站点，MDX 内嵌组件示例

## 目录结构

```
colox-react/
├── packages/theme/         # @colox/theme — 设计&主题系统（token 管线 + CLI + Schema）
├── packages/components/    # @colox/react — 组件库
├── apps/storybook/         # Storybook 组件预览
├── apps/docs/              # Docusaurus 文档站点
├── .changeset/             # 版本管理配置
└── 根目录配置              # eslint / prettier / commitlint / tsconfig
```
