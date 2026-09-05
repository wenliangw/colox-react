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
- SCSS 文件**不加下划线前缀**：partial 与普通文件同样命名（如 `base.scss`、`size.scss`），不用 Sass 惯用的 `_partial.scss` 约定。

## 目录分类：能力文件夹 + 层内分组（2025 通用规范）

- **能力文件夹用单数小写名词**：`components` / `context` / `hooks` / `types` / `utils` / `stores` / `constants` / `styles`，命名不进功能名——例如唯一的主题 context 组件就是 `src/components/theme-context/`，直接 `theme-context/index.tsx`。
- **组件是自持单元**：任何**只被该组件使用**的能力都要跟随组件目录（`theme-context/hooks/`、`theme-context/utils/`、`theme-context/stores/`、`theme-context/constants/`），不走全局 `src/hooks`/`src/utils`——「是哪个组件的能力就跟随组件本身的结构」，作用域边界必须清晰。全局能力目录只放真正跨组件共享的东西。
- **子组件独立文件夹管理，统一收在 `children/`**：子组件不定义在父组件同一个文件里，即使代码量很少也要独立子目录；且所有子组件**统一放在父组件文件夹下的 `children/` 目录**，各子组件再各自独立子文件夹（`theme-context/children/storage/index.tsx`、`theme-context/children/breakpoints/index.tsx`）——与 hooks/utils 等能力目录平行分层，不混排。
- **文件夹内不许同级平铺**：按能力分层，组件根目录只保留组件入口 `index.tsx`；能力一律文件夹化（`theme-context/types/index.ts`、`theme-context/context/index.ts`、`theme-context/reducers/theme.ts`）。
- **测试独立目录**：`test/` 与 `src/` 同级，按功能模块分目录（`test/theme-context/`、`test/stores/`、`test/cli/`、`test/config/`）；测试基础设施放 `test/utils/` 与 `test/setup.ts`。
- **src 内引用规范**：跨模块引用走 `@/` 别名（tsconfig paths + vite/vitest alias 三处齐配）；组件文件夹内部用相对路径（`./types`、`../constants/theme`，与 react 包组件一致）。

## store / utils / constants 各司其职，消灭魔法值

- **状态必须走 React 存储模式**（用户明确习惯）：状态归组件或 Provider 持有（useReducer + context 下发），不写模块级 `let` 全局变量 + 手写订阅——那不符合 React 哲学。DOM 写入/传感器/持久化全是 effect 副作用。
- `stores/` 目录只做状态管理（若无独立 store 层则状态进组件自身）；**reducer（状态机 + 状态工厂 + 派生 selector）独立成 `reducers/` 文件夹**，不放 utils/——它是状态模型语义，不是工具函数；纯函数、纯工具放 `utils/`；常量/枚举放 `constants/`。
- 代码里**不写魔法字符串/魔法数字**：attribute 名、localStorage 键、媒体查询、默认值、主题词汇等集中定义在 `constants/`。
- **类型词汇与运行时常量同源**：字面量 union 用 `typeof` 从 `constants/` 派生（如 `ColoxThemeName = typeof LIGHT_THEME_NAME | ... `、`BreakpointKey = keyof typeof defaultBreakpoints`），改一处不会漂移。
- 测试用例名（describe/it 文案）与源码注释同样遵守全英文约定。

## 控制流整洁：if 必带花括号 + guard 优先

- **`if` 必须带 `{}`**：即使一行内容也要完整语句块（`if (x) {\n  return;\n}`），绝不写 `if (x) return;`。
- **优先 guard clause（单 if + return/continue）**，不堆 switch 与 if-else：先处理边界/失效分支并提前返回，主逻辑保持平铺；`else` 能用「先置默认值，再单 if 覆盖」消解的就消解（如属性写入先 removeAttribute 再条件 setAttribute）。
- **switch 与 if-else 不禁止**，是整洁取舍：在合理场景仍用（状态机对可辨识联合的 exhaustive switch、校验器无后续检查时、三路分支各赋一值）；使用处分支统一带花括号。

## 注释克制：代码即注释

- **文件开头不写长篇注释**（模块用途大论文一律删除），文件首部保持干净的 import。
- 只留解释「为什么」的必要注释；能自我说明的代码不注释（自解释代码 > 注释）。
- 工具方法与类型**都要写多行注释**，简洁说明作用即可（`/** … */` 多行形式，可带 `@default`；本条目即「props 注释放多行」的泛化）。
- 无用/无意义注释宁缺毋滥；注释遗产随重构清理——一旦某文件被重构，注释必须同步瘦身。

## 命名用全拼，不用缩写

- 标识符、DOM data 属性等一律全拼单词：`data-colox-breakpoint`（而非 `data-colox-bp`）、`variant`（而非 `vnt`）。
- 用户明确表述过「喜欢全拼，不太喜欢缩写」。

## Storybook stories 按关注点单页对比

- 每个关注点一个 story 页面：`size` 一个页面、`state` 一个页面。
- 同一关注点的不同取值在**同一个 story** 里同屏展示做对比（Size 页面同屏渲染 sm/md/lg；State 页面同屏渲染 default/invalid/disabled），不为每个取值单独建 story。

## props/ref 显式类型化，禁止 any

- 组件所有 props 类型集中定义在 `<Component>/types/` 目录，`forwardRef` 的 ref 也显式定义类型（如 `export type InputRef = HTMLInputElement`）。
- 不使用 `any`。

## 代码注释与提交全英文，mesync 中文

- 开源定位：**代码注释与 commit message 一律英文**（有 husky 钩子兜底禁 CJK）；`.mesync/` 记忆文档维持中文（维护者是中文团队，属内部资料）。
- 贡献约定写在 CONTRIBUTING.md。

## 注释克制：只解释「为什么」

- 推崇自解释代码；注释解释 why 不解释 what。
- 不加无意义、啰嗦的注释；必要说明（构建链路、契约来源等）保留。
- 文件开头不写长篇大论（合并入「注释克制：代码即注释」节）。

## JSDoc 多行书写

- props 注释放多行（`/**` 起、`*` 续行、` * @default 'md'` 一行一个 tag），不用单行挤写 `/** ... */`。

## 干净演进：拒绝补丁式解决

- 不为「解决一个问题」而打补丁，而是以正确的视角做出正确的选择；一旦某个修复开始有补丁的味道，先回头审视设计再提交，而不是硬怼补丁。
- 保持代码库干净、只做正向演进——这也是「死代码及时清理」原则的根源。
