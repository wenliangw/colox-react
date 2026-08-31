# 代码风格品味

## 组件用箭头函数定义

- React 组件用 `const X = forwardRef<XRef, XProps>((props, ref) => ...)` 的箭头函数形式，不用 `function X()` 声明。

## 组件属性用 const {...} = props 取值

- 组件体内用 `const { size, ...rest } = props;` 解构取值，而不是在 `({ ... }) => {}` 参数里直接解构。

## import 排序约定

- `react` 引用永远第一；其余按 第三方库 → `@/` 别名 → 相对路径 依次排列。
- 库/别名/相对路径引用之间**不留空行**；仅在 `.css`/`.scss` 样式引用前保留一个空行，样式引用永远最后。
- 顺序由手工维护（prettier 已移除 import 排序插件，不会重排）。

## 不用三目运算符控制类名/组件

- 类名条件用 `clsx` 的对象语法：`clsx(base, { 'cls--state': state }, className)`，不用三目或 `&&` 控制类名。
- 保持组件代码干净、可读。

## 文件名小写 + 连字符

- 文件名一律小写，多单词用 `-` 连字符：组件文件 `input.tsx`/`button.tsx`、样式 `button.scss`、用例 `size.stories.tsx`。
- 导出的组件/类型符号仍用 PascalCase（`Input`、`InputProps`），仅文件名小写。
- SCSS 文件**不加下划线前缀**：partial 与普通文件同样命名（`mixins.scss`、`tokens/breakpoints.scss`），不用 Sass 惯用的 `_partial.scss` 约定。

## Storybook stories 按关注点单页对比

- 每个关注点一个 story 页面：`size` 一个页面、`state` 一个页面。
- 同一关注点的不同取值在**同一个 story** 里同屏展示做对比（Size 页面同屏渲染 sm/md/lg；State 页面同屏渲染 default/invalid/disabled），不为每个取值单独建 story。

## props/ref 显式类型化，禁止 any

- 组件所有 props 类型集中定义在 `<Component>/types/` 目录，`forwardRef` 的 ref 也显式定义类型（如 `export type InputRef = HTMLInputElement`）。
- 不使用 `any`。
