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

- `apps/storybook` 与 `apps/docs` 均依赖 `@colox/react`，二者互不依赖。
- 组件内部依赖 `clsx`（类名拼接）、`class-variance-authority`（变体）、组件自己的 `types/`、`styles/` 与 `variants/`，并依赖全局 `styles/` 的 token（CSS 变量）与通用工具 mixin。
- 组件之间互相独立，无跨组件依赖。

## 关键技术选型及理由

- **Vite library mode + vite-plugin-dts**：一次构建产出 ESM(`dist/es/index.js`)、CJS(`dist/cjs/index.cjs`)、类型声明(`dist/types/`)和打包 CSS(`dist/style.css`)，`exports` 字段映射到 `@colox/react` 与 `@colox/react/style.css`。
- **设计 token：Figma 导出为源 → SD 产出 CSS 自定义属性**：`styles/meta/*.tokens.json`（Figma）→ `figma-to-tokens.mjs` → `styles/tokens/*.tokens.json` → Style Dictionary v4 → `dist/themes/light.css`（扁平 `:root` 变量，133 个）+ `dist/themes/dark.css`（40 个 delta 覆盖，作用域 `[data-colox-theme='dark']`）；组件样式直接消费 `var(--colox-*)`，运行时主题化（覆盖变量即换肤，无需重新编译）。fontFamily/shadow/motion/breakpoint 人工维护在 `base.tokens.json`；dark 语义层人工维护在 `semantic-color.dark.tokens.json`。
- **双 SD 配置**：light 构建（sd.config.mjs）不加载 dark 文件；dark 构建（sd-dark.config.mjs）把 dark 文件排最后借冲突合并拿「dark 值胜出」，filter 只输出 dark 文件 token——冲突日志即变量名对位证明。light.css 全量、dark.css delta 是刻意分工：palette 不区分主题，只活在 light.css。
- **语义色档位制替代 alpha 混色**：语义层用强度四档（solid/muted/subtle/inverse）+ 角色组（text/bg/border）覆盖焦点环、hover 罩层等场景；仅实底 hover/active 保留派生 color-mix（hand-maintained `semantic.derived.tokens.json`，85%/75% 向黑混）。
- **变体层用 CVA（class-variance-authority）**：`cva()` 只拼 className、零运行时 CSS、类型安全（`VariantProps` 推导变体类型）；类名沿用 `colox-` BEM。
- **组件级样式随组件 import**：`src/index.ts` 顶部 `import './styles/index.scss'`（token 层）+ 每个组件 `import './styles/index.scss'`（组件样式汇总），`sideEffects` 声明 `**/*.css|scss`，保证样式打进 `dist/style.css`。
- **`clsx` 做类名拼接**：用成熟库 `clsx`（对象语法 + falsy 忽略），用于状态类与外部 className，不自研拼接工具。
- **React 19 + forwardRef**：组件用 `forwardRef` 暴露 DOM 节点，Props 继承原生 HTML 属性接口（如 `ButtonHTMLAttributes`）；组件用箭头函数 `const X = forwardRef<XRef, XProps>((props, ref) => ...)` 定义。

## 设计模式

- **变体与状态分离**：`variant`/`size` 是互斥选择轴 → CVA；`disabled`/`invalid`/`hover`/`focus` 是状态 → CSS 伪类/布尔 prop 加修饰类，不塞进 CVA。
- **变体类名约定**：BEM 风格，`colox-<component>` 基类 + `colox-<component>--<variant|size|state>` 修饰类。
- **mixin 只放通用工具**：组件私有尺寸样式内联在组件自己的 `styles/` 里；全局 mixin 按需建立（清理 respond-to 后当前文件已移除），响应式属性选择器 mixin 待 Grid 等布局组件落地时再建。
- **响应式运行时机制**：ColoxThemeContext 支持使用方自定义断点，matchMedia 观察层把「当前段」写入 `<html data-colox-breakpoint="md">`（命名全拼不缩写），组件 CSS 用属性选择器（非媒体查询）驱动响应式；无 Provider 时自动退化到内置契约断点（sm 640/md 768/lg 1024/xl 1280）。SSR 首帧靠包内 head 引导脚本写属性；阈值判断一律 matchMedia（禁用 innerWidth）。视图层对齐 vs 容器层隔离的取舍待具体布局组件（Grid 等）时定。
- **原生属性冲突处理**：当组件自定义 prop 与原生 HTML 属性同名且语义冲突时（如 `size`），用 `Omit<XxxHTMLAttributes, 'prop'>` 覆盖原生属性，保持组件库 API 一致。
