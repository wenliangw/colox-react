# docs 站点（docusaurus）集成陷阱清单

条目主干 = 「改这里 → 必须检查哪里」；每条都是本次官网改造实测踩实。

## 全局引入包 css → 必须走 js 模块图谱（clientModules），customCss 是死路

- **改这里**：想给 docusaurus 全局加载 node_modules 包里的 css（`@colox/react/style.css`）。
- **必须检查那里**：preset classic 的 `theme.customCss` 条目 = `path.resolve(context.siteDir, p)` **纯文件系统解析**（theme-classic/src/index.ts），包名 specifier 会变成 `siteDir/@colox/react/style.css` 报 Module not found；sass 里 `@import` 包 css 也会被 dart-sass 错解析成绝对文件路径。**正解** = 在 clientModules（或任何页面 js/ts）里 `import '@colox/react/style.css'`——走 webpack 模块图谱 + exports map。
- 为什么：customCss 是 fs 路径契约，模块图谱才是包解析通道。

## @theme/Layout 外层不准调 useColorMode / 主题 context

- **改这里**：在页面顶层组件体（`<Layout>` 的**父级**）调用 `useColorMode()`。
- **必须检查那里**：ColorModeProvider 挂在 `<Layout>` **内部**——Home 组件本身在 Layout 之上，顶层调用必抛 ReactContextError（SSG 先炸）。**正解** = 把消费 context 的子树抽成子组件放进 `<Layout>{children}`。
- 为什么：provider 边界 = Layout；模板页面默认不调也是这个原因。

## clientModules 会被 SSG 求值 → document/window 全部要 mounted 守卫

- **改这里**：clientModules 里写任何顶层副作用。
- **必须检查那里**：模块服务端 bundle 也会执行（Server bundle 抽到 syncColoxTheme 直奔 `document` → `ReferenceError: document is not defined` 让整个 build 崩）。**正解** = `if (typeof document !== 'undefined')` 守卫 + 老套路 MutationObserver。CSS 的 `import` 语句不受影响（webpack 处理）。
- 为什么：clientModules = 入口图的一部分，SSG 复用同一图谱。

## Grid/Stack 响应带 → 页面必须有 ColoxTheme Provider，否则冻结在静态默认档

- **改这里**：任何页面用 `columns={{ sm, md, lg }}` / 响应 gap，却没包 Provider。
- **必须检查那里**：无 Provider 时 `useColoxTheme().breakpoint` = 静态默认（md），响应配置**全部冻结**在 375 也有 md 档效果（实测：手机渲染成桌面 3 列 + 溢出）。**正解** = `<ColoxTheme theme={跟随 docusaurus colorMode}>` 包住页面内容（同时官方化地接管 data-colox-theme 属性）；下文顺带注意 ColoxTheme 要在 Layout 之内（同第 2 条）。
- 为什么：断点状态来自 Provider 的 matchMedia 层，裸 useColoxTheme 不发感知。

## 断点带语义：max-width 分桶（不是 min-width）

- **改这里**：书写或修改 `resolveResponsiveValue` / 断点文档 / 组件 wiki 时。
- **必须检查那里**：传感器 = 首个命中的 `max-width` 查询：**sm 桶 <640**、md 640-768、lg 768-1024、xl 1024-1280、>1280 = base（延续最后配置档）；解析器从当前桶向下取最近已配置值（带配置自其桶向上继承）。别按 min-width 心智写文档/配置——`{sm:1, md:2, lg:3}` 才是「手机 1 列 ≥640 两列 ≥768 三列」的正确写法。
- 为什么：实测 375 = sm 桶（曾按 min-width 预期 375 = base 档拿全桌面列数，对不上）。

## 改了 docusaurus.config 后 build 报「旧路径」→ 先清 .docusaurus / webpack 缓存

- **改这里**：动 customCss/clientModules 后构建报出来自 `.docusaurus` 里的旧字符串。
- **必须检查那里**：`pnpm clear`（或手删 `.docusaurus` + node_modules/.cache）；docusaurus 持久缓存会吃旧配置解析结果，报错行和当前配置对不上。
- 为什么：webpack persistent cache 记的是解析产物，配置变更不触发失效。

## 交付视觉稿前 → 必须自己看过（或明确声明未验收）

- **改这里**：任何影响观感的站点改动（首页版图、组件页排版、配色/密度）准备交付时。
- **必须检查那里**：① 主模型带视觉时（deepseek-v4-flash-vision-exp 可用 read_image；pro / flash-0731 均报 `does not declare image input`）——**先重拍截图**（旧图不代表当前构建）、再看参照站同类页、对照后交付；② 无视觉时不得交付视觉稿，用计算样式探针验结构并明确告知「视觉未验收，请目视」；③ 子代理可用 read_image（实测 HAS_VISION，可承担评审），但需确认其模型是否带视觉。
- 为什么：上一版 homepage 只做了结构探针就交付，用户目视后判定「效果并不好」——密度/留白/icon ladder 换行/卡片高度不齐等问题探针全都测不出来。

## 侧栏活动样式 → 分类标题会和文档项一起拿 --active

- **改这里**：给 docusaurus 侧栏做活动项 accent（色条/浅底/主色文字）。
- **必须检查那里**：当前文档归属的分类标题也会被标 `.menu__link--active`（「mirror」行为），且 `.menu__list-item-collapsible` 类挂在分类标题的**内层 div** 上、不在 li 上——用 li 级 `:not()` 排除会落空。**正解** = 先给 `.menu__link--active` 全量 accent，再对 `.menu__list-item-collapsible > .menu__link--active` 显式复位回 muted 平实样式（复位块必须放 accent 块之后，其特异性 (0,3,1) 压过 accent）。
- 为什么：docusaurus 把父分类标 active 是为了导航可发现性；accent 若不加区分，分组标题会抢走活动项的主色视觉（实测 General 拿到主色+左条）。

## MDX 里并列的裸 HTML 元素 → 每个都成独立块，行内元素要包一层容器

- **改这里**：想在 mdx 里排一行行内的裸 HTML（如 `<a>·<a>` 之类的元信息行）。
- **必须检查那里**：每个顶层 JSX/HTML 元素各自成块（浏览器实测三项各占一行）；**正解** = 包一个 `<div class="...row">` 容器 + flex 排布（prettier 会把属性拆多行，不影响块性）。
- 为什么：MDX 把顶层元素当块级节点编译，与 markdown 行内上下文无关。

## `@site/...` 别名 → webpack 认、tsc 不认

- **改这里**：页面/组件里 import 站点自身的组件（如 `@site/src/components/reveal`）。
- **必须检查那里**：docusaurus 的 webpack 图谱解析 `@site/*`（构建能过），但独立的 `tsc -p tsconfig.json --noEmit` 报 TS2307 Cannot find module。**正解** = 站内组件用相对路径 import（或往 tsconfig paths 补 `@site/*`）。
- 为什么：别名属于构建期配置，TS 独立检查不共享；MDX 里能用是因为 MDX 走 webpack。
