# 约束

## 环境约束

- Node `>=20`，pnpm `>=9`（根 `package.json` 的 `engines`；`packageManager` 固定 `pnpm@10.13.0`）。
- React / react-dom `>=18` 作为 peerDependencies；开发态使用 React 19。
- 样式使用 `color-mix()`，要求 2023+ 浏览器（Chrome 111 / Safari 16.2 / Firefox 113）。

## 构建与发布约束

- 组件库构建产物：ESM `dist/es/index.js`、CJS `dist/cjs/index.cjs`、类型 `dist/types/`、CSS `dist/style.css`（`cssCodeSplit: false`，CSS 汇总为一个文件）。
- `rollupOptions.external` 排除 `react`、`react-dom`、`react/jsx-runtime`；`class-variance-authority` 是 runtime dependency（会随包安装）。
- `files` 仅发布 `dist` 与 `src/styles`。
- `sideEffects` 声明 `**/*.css` 和 `**/*.scss`，避免 tree-shaking 误删样式。
- `src/index.ts` 必须 `import './styles/index.scss'`，确保 token 层 `:root` 打进 `dist/style.css`。
- 版本管理用 Changesets；`@colox/storybook` 与 `@colox/docs` 被 `ignore`（不发布）。

## 代码质量约束

- ESLint 9 flat config + Prettier + EditorConfig（Prettier 不配置 import 排序插件，import 顺序由手工维护）。
- Commitlint 强制 Conventional Commits（如 `feat: add Button component`）。
- TypeScript `strict: true`，`noEmit`（类型声明由 vite-plugin-dts 单独产出）。

## 组件约定

- 文件名一律小写、多单词用 `-` 连字符（组件文件 `input.tsx`、样式 `button.scss`、用例 `size.stories.tsx`）；导出符号仍用 PascalCase。
- 组件目录按关注点拆分：`<component>.tsx` + `index.ts` + `_stories/` + `_tests/` + `types/`（props/ref 类型）+ `styles/`（base/各轴/index）+ `variants/`（各轴/index）；`hooks/` 预留，行为复杂时再加（`useXxx` 只做行为/可访问性，不做外观）。
- Storybook 按关注点拆 stories 文件；同一关注点的所有取值合并到**一个** story 页面同屏对比（如 Size 页面同屏渲染 sm/md/lg，State 页面同屏渲染 default/invalid/disabled），不为每个取值单独建 story。
- 组件类名前缀统一为 `colox-`，BEM 风格。
- 组件必须 `forwardRef` 并继承原生 HTML 属性接口；用箭头函数 `const X = forwardRef<XRef, XProps>((props, ref) => ...)` 定义，属性用 `const { ... } = props` 解构取值。
- props/ref 类型集中定义在 `<Component>/types/`，显式类型化、禁止 `any`；`forwardRef` 的 ref 也显式定义类型。
- 类名拼接用 `clsx`，状态类用对象语法 `clsx(base, { 'cls--state': state }, className)`，不用三目运算符控制类名。
- import 排序：`react` 引用第一；其余按 第三方库 → `@/` → 相对路径 依次排列，库/别名/相对路径之间不留空行；仅在 `.css`/`.scss` 样式引用前保留一个空行，样式引用永远最后。
- variant/size 走 CVA（`variants/` 里 `cva()` 组装）；state（disabled/invalid/hover/focus）走 CSS 或布尔 prop，不进 CVA。
- 组件样式消费 CSS 变量 `var(--colox-*)`，尺寸样式内联在组件 `styles/`；断点响应走运行时 data 属性 + 属性选择器（不写媒体查询），断点常量供 JS 层（`tokens/breakpoints.ts` 生成）。
- 测试环境为 jsdom，`globals: false`（测试里需显式从 `vitest` 导入 `describe/it/expect`），`test-setup.ts` 里手动 `cleanup`。
