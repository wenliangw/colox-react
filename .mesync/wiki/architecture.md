# 架构

## 分层

```
apps/storybook ──┐
                 ├── 依赖 @colox/react（组件库）
apps/docs ───────┘
        │
        └── @colox/react (packages/components/)
              ├── src/<component>/   每个组件一个目录，按关注点拆分子目录（见下）
              ├── src/styles/        全局设计 token 与通用工具 mixin
              └── src/index.ts       统一导出入口（含全局 token 层 import）
```

### 组件目录结构（约定）

```
<component>/
├── <Component>.tsx       # 组件本体：forwardRef + useXxx(预留) + xVariants
├── index.ts              # 对外出口
├── _stories/             # Storybook 用例（按关注点拆分）
├── _tests/               # Vitest 用例（按关注点拆分）
├── types/                # props/ref 类型（显式类型化，禁止 any）
├── styles/               # 组件样式（base / 各轴 / index 汇总）
├── variants/             # CVA 变体定义（按轴拆分 + index 组装）
└── hooks/                # 预留：行为复杂时再加 useXxx.ts
```

## 模块依赖关系

- `@colox/react` 构建期依赖 `@colox/theme`（workspace devDep，build 时吞其 dist 级联；运行时无代码 import，纯 CSS 契约）；`apps/storybook` 与 `apps/docs` 均依赖 `@colox/react`，二者互不依赖；storybook 的 demo 主题通过 `colox` bin（来自 @colox/theme）编译。
- 组件内部依赖 `clsx`（类名拼接）、`class-variance-authority`（变体）、组件自己的 `types/`、`styles/` 与 `variants/`，并依赖 `@colox/theme` 产出的 CSS 变量（token）与通用工具 mixin。
- 组件之间互相独立，无跨组件依赖。

## 关键技术选型及理由

- **Vite library mode + vite-plugin-dts**：一次构建产出 ESM(`dist/es/index.js`)、CJS(`dist/cjs/index.cjs`)、类型声明(`dist/types/`)和打包 CSS(`dist/style.css`)，`exports` 字段映射到 `@colox/react` 与 `@colox/react/style.css`。
- **双包拆分（@colox/theme + @colox/react）**：`@colox/theme`（packages/theme）拥有样式与主题系统全部机器——Figma token 管线（meta/tokens/scripts/sd 三配置）、主题编译 CLI（colox bin）、JSON Schema、`config/theme.default.json` 标准配置模板、dist 主题件、ColoxTheme React 运行时（组合式 API，vite 产 ES/CJS+dts）；将来 ThemeBuilder（`builder` 子路径）也在此。`@colox/react` 只剩组件（代码/scss/stories/tests），构建时 `@import '@colox/theme/index.css'` 把主题级联打进 style.css（自包含单行引入，重声明同值幂等）；build 链「theme 先行」。组件只读 `var(--colox-*)`、不 import theme 代码——依赖是纯运行时 CSS 契约。标准配置模板做 CLI 身份回归测试（编译空配置 == 官方存量 palette 基线，锁死编译器与 SD 管线同步）。
- **设计 token：Figma 导出为源 → SD 产出 CSS 自定义属性（变量链形态）**：`styles/meta/*.tokens.json`（Figma）→ `figma-to-tokens.mjs`（语义 alias `targetVariableName` 转 `{colox.palette.*}` SD 引用）→ `styles/tokens/*.tokens.json` → Style Dictionary v4 → **三文件**：`dist/themes/palette.css`（`:root` 的 104 个 palette 基线变量，主题无关）+ `dist/themes/light.css`（`:root` 完整 light 赋值 139 个：语义色 64 + 排版/尺寸/基础 75 个）+ `dist/themes/dark.css`（同名语义色全量赋值 64 个，作用域 `:root[data-colox-theme='dark']`）。**SD `outputReferences: true`**：语义层是 palette 的 var() 引用链（`--colox-color-text-muted: var(--colox-palette-gray-600)`），palette 因此暴露为运行时变量；换色板轴 = 换 palette 变量 → 双主题全链重派生，无需重编译。palette 独立为基线文件使主题文件各自自包含（只载 dark 不载 light、只要 palette.css 在场即工作）；axis 选择器带 `:root` 前缀（0,2,0）稳压基线（0,1,0），**加载顺序无关**（CSS 变量计算期解析，palette 引用不构成顺序依赖）。fontFamily/shadow/motion/breakpoint 人工维护在 `base.tokens.json`；hover/active 派生规则人工维护在 `semantic.derived.tokens.json`（light）与 `semantic.derived.dark.tokens.json`（dark），其余语义色由 Figma 全量导出（`semantic-colors.light/dark.tokens.json`）。
- **三 SD 配置**：sd-palette.config.mjs（palette 基线文件，只输出 `colox.palette.*`）；sd.config.mjs（light，加 palette 源仅作引用解析、输出排除 palette，含完整 light 赋值）；sd-dark.config.mjs（只吃 dark 语义导出 + brand + derived，palette 源仅供引用解析、输出 filter 只留 `colox.color.*`）。两主题文件为平行全量赋值；dark 构建的 "filtered out token references" 警告是预期（引用指向 palette.css 中的声明）。
- **brand 组（工程侧手维）**：`tokens/palette.brand.tokens.json`（默认 brand 阶 = indigo 阶的实色数值，零视觉漂移）+ `tokens/semantic.brand(.dark).tokens.json`（solid→500/muted→200/subtle→50（dark 900）/inverse→#FFF，引用链到 palette.brand）；brand hover/active 在 derived 文件里 color-mix。组件层消费 `brand.*`（Button 全变体、Input focus 环），indigo 退为普通色相槽。动态换品牌 = `data-colox-palette` 轴替换 brand 阶变量（编译期种子生成器产出定制阶，escape hatch 是运行时直接改 `--colox-palette-brand-*`）。
- **用户侧主题编译 CLI（colox）**：`colox theme build -c colox.theme.json` 把用户配置编译成完整赋值 CSS：色板轴文件（`:root[data-colox-palette='<output.name>']`，全 palette 变量含定制 brand 阶）+ 每个 themes 块一个语义主题文件（`:root[data-colox-theme='<name>']`，全 64 个语义变量，semantic 覆盖合入，extends 继承基线）。编译数据源是 `dist/cli-data.json`（build 时消化 token 产物，`scripts/emit-cli-data.mjs` 生成），CLI 不依赖使用方项目里的源码 token。output 路径相对配置文件解析。JSON Schema 在 `schemas/theme.schema.json`。
- **聚合 CSS 入口 index.css**：`@colox/theme` 的 build 末尾把 palette/light/dark 三主题件串联成自己的 `dist/index.css`（同一份声明零复制，供只用设计语言的人一行引入）；`@colox/react` 构建时 `@import '@colox/theme/index.css'` 级联进 style.css 并复制出 index.css——组件使用方仍一行引入。拼接合法性：palette 与语义命名空间互斥 + 属性轴 `:root[...]` 特异性稳压基线，节序无关；CLI 编译的自定义主题/色板文件在其后加载即按源顺序覆盖同名声明。
- **语义色档位制替代 alpha 混色**：语义层用强度四档（solid/muted/subtle/inverse）+ 角色组（text/bg/border）覆盖焦点环、hover 罩层等场景；仅实底 hover/active 保留派生 color-mix（hand-maintained `semantic.derived.tokens.json`，85%/75% 向黑混）。
- **变体层用 CVA（class-variance-authority）**：`cva()` 只拼 className、零运行时 CSS、类型安全（`VariantProps` 推导变体类型）；类名沿用 `colox-` BEM。
- **组件级样式随组件 import**：`src/index.ts` 顶部 `import './styles/index.scss'`（token 层）+ 每个组件 `import './styles/index.scss'`（组件样式汇总），`sideEffects` 声明 `**/*.css|scss`，保证样式打进 `dist/style.css`。
- **`clsx` 做类名拼接**：用成熟库 `clsx`（对象语法 + falsy 忽略），用于状态类与外部 className，不自研拼接工具。
- **React 19 + forwardRef**：组件用 `forwardRef` 暴露 DOM 节点，Props 继承原生 HTML 属性接口（如 `ButtonHTMLAttributes`）；组件用箭头函数 `const X = forwardRef<XRef, XProps>((props, ref) => ...)` 定义。

## 设计模式

- **变体与状态分离**：`variant`/`size` 是互斥选择轴 → CVA；`disabled`/`invalid`/`hover`/`focus` 是状态 → CSS 伪类/布尔 prop 加修饰类，不塞进 CVA。
- **变体类名约定**：BEM 风格，`colox-<component>` 基类 + `colox-<component>--<variant|size|state>` 修饰类。
- **mixin 只放通用工具**：组件私有尺寸样式内联在组件自己的 `styles/` 里；全局 mixin 按需建立（清理 respond-to 后当前文件已移除），响应式属性选择器 mixin 待 Grid 等布局组件落地时再建。
- **响应式运行时机制**：ColoxTheme（`@colox/theme` 的组合式 API）支持使用方自定义断点（`.Breakpoints values=` 只覆盖阈值、键名固定），matchMedia 观察层把「当前段」写入 `<html data-colox-breakpoint="md">`（无命中摘属性＝base），组件 CSS 用属性选择器（非媒体查询）驱动响应式；无 Provider 时 useColoxTheme 自动退化读模块级单例 store（内置契约断点 sm 640/md 768/lg 1024/xl 1280，由 tokens:sync 从 base.tokens.json 生成 `src/styles/tokens/breakpoints.ts`）。阈值判断一律 matchMedia（禁用 innerWidth）。SSR 首帧引导脚本 v1 缓建（useLayoutEffect 在首帧绘制前写属性，CSS 变量主题无可感闪动；按「猜测性接口缓建」纪律暂不做 <head> 脚本）。视图层对齐 vs 容器层隔离的取舍待具体布局组件（Grid 等）时定。
- **ColoxTheme 运行时结构（@colox/theme/src/components/theme-context/）**：组件是自持单元——`index.tsx`（根组件：useReducer 状态 + context Provider + props 承载 theme/defaultTheme/palette）+ `context.ts`（ColoxThemeContext：snapshot + register/unregister，默认值静态快照）+ `children/`（子组件统一目录：`storage/`、`breakpoints/` 各占独立子文件夹，挂载即注册）+ `hooks/`（`use-colox-theme` 公开订阅、`use-theme-attributes`（useInsertionEffect 绘制前写三轴）、`use-theme-sensors`（layout 阶段接线 matchMedia：系统偏好 + 断点，SSR 无副作用）、`use-theme-storage`（layout 恢复 storage > props > default + 写穿）+ `utils/`（`reducer.ts` 纯状态机 + `attributes.ts` 纯 DOM 写入 + `registry.ts` 折叠）+ `constants/theme.ts`（全部魔法值，类型 union 用 typeof 同源派生）+ `types/index.ts`。存储模型 = React 状态流（useReducer + context，无模块级全局）；无 Provider 时 useColoxTheme warn + 静态默认。测试独立在 `test/` 按模块分目录（theme-context 集成+reducer / cli / config + utils/setup），跨模块引用 `@/` 别名、组件内部相对路径。
- **原生属性冲突处理**：当组件自定义 prop 与原生 HTML 属性同名且语义冲突时（如 `size`），用 `Omit<XxxHTMLAttributes, 'prop'>` 覆盖原生属性，保持组件库 API 一致。
