# 样式与设计 token 品味

## 样式/主题机器聚到 @colox/theme，组件包只读变量

- 全部样式与主题机器（Figma token 管线、SD 配置、主题 CLI、Schema、标准配置模板、未来的 ColoxTheme 运行时/ThemeBuilder）归属 `@colox/theme` 一只包；`@colox/react` 只留组件代码与组件级样式，不 import 主题代码——依赖是纯运行时 CSS 契约（读 `var(--colox-*)`）。
- 组件包的用后即走体验不降级：build 时 `@import '@colox/theme/index.css'` 级联进 style.css（自包含单行引入）。标准配置模板作为 CLI 身份回归测试输入（编译 == 官方存量），模板是使用方复制的起点也是编译器的对账单。

## 主题 CSS 用显式 import 引入，不做 JS 运行时注入

- 使用方两行引入：`import '@colox/react'`（组件代码）+ `import '@colox/react/index.css'`（样式，已吞 theme 级联——所以 css 仍是**一行**而不是三行）。构建期级联只合并样式内部，不把 JS 与 CSS 绑定。
- 显式引入不是「没做自动注入」的欠账，而是主题库契约的三个支点，哪个都不能让：
  1. **覆盖顺序**：CLI 定制主题文件靠「同名选择器、源顺序后者胜」替换官方块——静态 css 的 link 顺序由使用方控制（定制放最后）；JS 运行时注入的 `<style>` 恒在静态 link 之后，官方主题反而覆盖定制文件，覆盖契约失效。
  2. **文件级颗粒自由**：dark-only 部署、只装 @colox/theme 自建组件等按文件挑选的能力。
  3. **零 FOUC**：css 先于内容到达，首帧即正确主题。
- JS 内联注入（vite-plugin-css-injected-by-js 类）只在「运行时生成主题」的库（MUI/antd v5 型）里划算；colox 卖编译期产物 + 源顺序覆盖，别手痒去「优化」掉这一行。

## 设计语言用 CSS 自定义属性承载，JSON + Style Dictionary 构建期生成

- 单一来源已落地：W3C DTCG JSON + Style Dictionary v4；链路 = Figma 导出（theme-builder 的 styles/meta/*.tokens.json）→ figma-to-tokens.mjs 转换 → SD 生成 themes/light.css。管线整体属于 `@colox/theme-builder`（编译期包），`@colox/theme` 只持有运行时 + 打包好的内置 css。
- 三层 token：基元层（palette 色阶）→ 语义层（角色组 text/bg/border + 颜色四档组，组件唯一消费的稳定 API）→ 组件层（按需）。
- 主题 = 语义层的多组映射：换主题 = 换语义层赋值，基元与组件都不动。

## 换肤机制：选择器作用域 + 混合暗色

- 主题块 = 同名语义变量在 `:root` / `[data-colox-theme='light'|'dark']` 作用域下的多组值；组件零感知。
- 暗色混合驱动：无显式选择时跟随系统，`[data-colox-theme='light'|'dark']` 手动覆盖（将来由 ColoxTheme 属性开关点亮）。
- light.css 为全量赋值（133 变量，:root）；dark.css 同为**全量赋值**（58 个语义色变量，作用域 `[data-colox-theme='dark']`），不依赖与 light.css 配对加载。这是用户拍板：主题 = 同名变量的多组**完整**赋值，delta 优化被否决。
- 主题文件按需显式引入（`themes/light.css` + `themes/dark.css`），入口不自动注入。

## 主题模型：用户自定义主题，官方只给基准

- 语义 token 列表是组件库的**稳定公开契约**；官方只提供 light/dark 两个基准主题文件。
- 用户自定义主题 = 自己的 CSS 文件定义同名语义变量，与官方主题文件**平级**。

## 发布形态：样式由用户自行引入

- 产物拆分：组件结构样式（不含主题值）+ `themes/light.css` + `themes/dark.css`；入口不自动注入主题。
- 未引入的主题文件不进用户打包体积；自定义主题只需定义同名语义变量。

## dark 主题推导约定（工程侧首版，Figma dark 变量落地后可替换）

- 前提：**palette 与主题无关**，dark 只重映射语义层。首版为工程侧手维护的 delta 覆盖（semantic-color.dark.tokens.json）；**Figma 出 dark modes 后已由导出接管**：`semantic-colors.light.tokens.json` 与 `semantic-colors.dark.tokens.json` 两个全量导出（各 52 个语义 token，值随 mode 解析），工程侧手工 dark 文件退役。
- 中性色阶梯：画布 bg.solid = gray/900（#191919），raise 序列 subtle #1F1F1F → muted #262626；文本 solid 近白 #E8E8E8、muted #A3A3A3、subtle #707070；边框阶梯 solid #3D3D3D > muted #333333 > subtle #2A2A2A。
- 状态色三通道各自反演：text 档 600/700/800 → 300（亮阶文字在暗底可读）、border 档 300 → 500（比文字暗一档的可见色边）、bg 档 50 → 900（暗色洗底）。
- 色槽 tier：solid / muted / inverse 跨主题不变（实底主色与前景反色本就主题无关；muted 粉彩阶做焦点环在暗底反而更清晰）；subtle 档 50 → 900（ghost hover 洗底从亮洗变暗洗）。
- inverse 语义互换：bg.inverse 暗色下翻为白、text.inverse 翻为近黑；border.inverse（#747474）与色槽 inverse（#FFF）跨主题保持（数值对称性论证后保留原值）。
- dark.css 输出全部 colox.color.* 语义变量（完整赋值，与 light 色变量 58=58 名称对位；对位校验在生成后人工核对），light/dark 两个导出由转换器分别落成 colox.color.*。
- **white/black alpha 阶的用途已由用户纠偏**：它们是**遮罩（scrim）与 box-shadow 的原语**（palette 层 `white/0..900`、`black/0..900`，8 位 hex 已透传），**不是**给语义表面/文本做合成用的。dark 语义坚持**实色**。
- **已定案（方案 B，12 步 gray 单尺双用）**：新增 `gray/750 #5E5E5E`（dark text.disabled）、`gray/850 #262626`（dark 表面/次级边框）；微调 `gray/600 #9A→#9E9E9E`（双主题 text.muted 共用）、`gray/700 #74→#707070`（light border.inverse 与 dark text.subtle 共用）、`gray/800 #38→#3D3D3D`（dark border.solid）；light 语义把 bg.solid/bg.overlay/text.inverse/tier inverse 重 alias 到 white/0。代价取舍：dark 表面 subtle/muted 合并、border.subtle/muted 合并（v1 中本就只差 0.01-0.03），换「不新增过多中间色阶」。待用户在 Figma 落地并重导出后，dark 文件改为 palette 引用。
- **已解决**：dark `bg.solid` 曾短暂 alias 到 black/900（半透明黑）——用户确认是引用错误，已改回 **gray/900 #191919**（语义层画布保持实色，与「语义层永远实色」约定一致）。

## token 可读性优先，拒绝 RGB 通道三元组

- 颜色 token 保持完整色值（如 `#4f46e5`），保证可预览、可读。
- 明确否决「RGB 通道三元组（`79 70 229`）+ `rgb(var(--rgb) / alpha)`」方案——用户认为通道值不可读。

## 强度四档体系：solid / muted / subtle / inverse

- 语义色按**强度档**组织：solid（全强度实底）/ muted（中间调）/ subtle（最浅罩层）/ inverse（深底反色前景）。颜色四档组服务实底组件，角色组（text/bg/border）服务面板/文字/边框语境。
- 档位替混色：焦点环用 muted 档；罩层态（outline/ghost 的 hover/active）用 wash 档 token——subtle/muted/solid 静态档位只承载静止态，交互态一律走派生。
- 交互态双档派生：实底档 `solid-hover/solid-active` = 基色向黑混 85%/75%（light）/ 向白混（dark，实底控件暗色下 hover 变亮）；罩层档 `wash-hover/wash-active` = 基色向透明混 8%/15%。档位与状态名按标准 kebab 单连字符拼接（`color.brand.solid-hover` 形态，不引入双连字符）；规则集中人工维护在 semantic.derived.tokens.json（light）与 semantic.derived.dark.tokens.json（dark），组件不内联。命名沿用 SD 内置 name/kebab（行业公认规范）。
- 派生混色的 authored 形态用 `var(--colox-color-*-solid)` 字面串（SD 原样透传、浏览器运行时解析）而非 `{token}` 引用——保证运行时重映射 solid（如未来 brand 换色）时 hover/active 自动跟随。
- color-mix 需要 2023+ 浏览器。
- **微动效只消费 motion token，门控集中一处**：组件声明 transition 一律用 `--colox-motion-duration-*`（fast 100ms/normal 200ms/slow 300ms）+ `--colox-motion-easing-*`（out/in/in-out），**禁止自造时长缓动（硬约束）**——门控靠归零 duration token 生效，写死字面量时长会漏过开关；门控由 theme 的 motion.css 统一执行（`data-colox-motion` 轴 + `prefers-reduced-motion` 归零三 token），**只作用库内动效，不碰用户私有 transition/animation/scroll-behavior**（token 级门控定案，摈弃通配+!important 全站通杀），组件零分支、风格天然一致。装饰投影（shadow）走独立 boolean 轴，常态 shadow-md、hover 升 shadow-lg（首个微动效实例）；shadow 是主题相关语义：light 灰淡投影、dark 加深纯黑投影（工程侧双档手维），自定义主题经 CLI `extends` 明暗链继承对应档值。**按压微动效**：`:active` 缩放 0.97 全变体通用、shadow 同时收紧到 sm；节奏快进慢出（`:active` 第二份 fast 清单、base 清单 normal 回弹），门控关闭时移除按压缩放而非瞬跳。**按压修饰只走状态切换层**：颜色档（solid-active/wash-active）+ 阴影档 + 缩放——不做伪元素绘制扫掠；波光（均匀色块→径向渐晕两轮均劣）与凹陷内阴影两轮尝试在 xs 尺寸预算内不成立，最终双双移除——纯 CSS 的中心生发光效在按钮场景没有成立形态，别再做。

## token 归属：Figma 承载视觉值，工程侧承载实现值

- Figma variables 承载：color / semantic-colors.light / semantic-colors.dark / fontSize / fontWeight / lineHeight / radii / spacing（导出 → 转换 → SD 生成）。
- 工程侧人工维护（tokens/base.tokens.json + semantic.derived.tokens.json）：fontFamily（sans/mono 系统栈）、shadow（sm/md/lg）、motion（duration fast/normal/slow + easing out/in/in-out）、交互态双档（solid--/wash--）派生混色。
- 原因：Figma variables 对字体族、复合阴影、缓动曲线等实现类值支持不佳，用户拍板归属工程侧。

## 行高用绝对 px，与字号同名配档

- lineHeight 拒绝 unitless 比率：行盒 = 字号×比率，控件总高 = 行盒+padding+border 会产生小数、落出像素网格，高度不可控。
- 采用与 fontSize 同名的绝对 px 档位（lineHeight.md 配 fontSize.md，13 档 1:1），控件高度推导完全确定。

## 间距统一：gap/margin/padding 全部消费 spacing

- 组件里一切空隙（gap、margin、padding）都消费 spacing 档位，不为个别用途另设 grid-gap 类 token。
- 控件高度由固定 height 消费 `--colox-size-*` 数值档（Button/Input 同机制同值四档）——「行高+间距」推算形态已随 Input 对齐退役（旧 26/36/48 出局）。

## 尺寸基准：界面尺寸走 4 的倍数

- 用户偏好以 **4 的倍数** 进行设计（控件高度等尺寸落到 8px 格点：24/32/40/48……）；8 格点是 4 倍数的子集，两者兼容。
- 按钮宽度 = 内容 + padding（不设固定宽，全行业共识）。
- **spacing 只做间距，不承载尺寸**：gap/margin/padding 消费 spacing，控件的高度等尺寸消费独立的 **size 设计语言**（用户纠正：拿 spacing 当高度是职责越界；参照 Chakra `sizes` 与 `space` 分家）。
- **size 设计语言 = 纯数值变量，Figma 承载**：sizes 集合已从 Figma 导出接入（`--colox-size-*`：整数格 4px×N（档 1 至 14 及 16）+ 半格档 0-5..4-5）；全局**不定义** sm/md/lg 语义档位（组件 size 维度各异：Button 是高、Modal 是宽，全局语义命名必生二义性）——组件 size prop 是组件自己解析语义，内部引用数值 size 变量。
- **80px 以上的大尺寸档 = `large_size` 集合，已发布进 size 语言**：Figma 侧独立集合 `large_size`（80px 至 1440px，keys 20–360，26 条）经 converter 映射进 `colox.size.*`，编译为 `--colox-size-20..360`；容器/大元素域直接消费（Container 帽引用 160/192/256/320 = 640/768/1024/1280px）。教训：converter 对未映射组只告警不失败，`large_size` 曾整组静默消失——见 corrections/token-pipeline.md；`hiddenFromPublishing` 过滤保留做守门。
- **断点变量（`--colox-breakpoint-*`）只归响应式判定，绝不参与宽度语义**（用户拍板：breakpoint 是给响应式用的，本身不该以宽度语义使用；Container 曾借断点变量凑宽度被纠回）。响应式逻辑读运行时 ColoxTheme context 断点 + `defaultBreakpoints`，宽度读 `--colox-size-*`——两个平面各走各的。
- **半格档（0_5..4_5 = 2/6/10/14/18px）是半格微距值**：命名沿用图内 `N_5` → CSS `N-5`（读「N 点五」）；控件尺寸只消费整数格（4 的倍数），半格留给微距（2px 分隔线、6px 内距等）。否决「CSS 名带小数点（--size-1.5）」——点号在 CSS 变量/SCSS 链上要转义，得不偿失。
- Button 高度四档已落地：xs/sm/md/lg = 24/32/40/48 = `var(--colox-size-6/8/10/12)`，padding-inline 走 spacing-2/3/4/6；Input 已对齐同一四档（同值同 token，同档并排严丝合缝——见 tastes/api-design 的 size 语义节）。

## 组件 size prop 属组件私有变体，不进全局 token

- Card/Avatar/Dialog 这类 `size: sm|md|lg` 的具体尺寸是各组件自己的 CVA 变体（内部可组合 spacing/fontSize 等全局 token），彼此无关联、无复用价值，不做全局 size 文件。
- 全局 token 只承载「跨组件共享」的量。

## 断点：工程侧常量 + 运行时 JS 消费

- 断点归属 base.tokens.json，Desktop 优先（sm 640 / md 768 / lg 1024 / xl 1280，max-width 向下语义）。
- 媒体查询不能读 CSS 变量、响应式走运行时 `data-colox-breakpoint` 属性机制，断点值注入 JS 层：token 延伸出运行时变量的发射能力归 theme-builder（`scripts/emit-runtime.mjs`），theme 的 build 契约用 `runtime: {type: "ts", output}` 声明落点，从 token 工作区的 base.tokens.json 生成 `tokens/index.ts`（聚合 `defaultBreakpoints` 与 spacing 键表常量；供 ColoxThemeContext 默认值与 head 引导脚本）；light.css 的 CSS 变量副本仅保留供读。改动断点只需改 base.tokens.json + 重跑 theme build；消费方改断点不走重编译，用运行时 breakpoints 覆盖。

## 变体层用 CVA，className-only

- variant/size 等变体用 `cva()` 定义，只拼 className、零运行时 CSS；类名沿用 `colox-` BEM 前缀。
- 不引入重型 css-in-js。

## 类名块前缀 = 组件自身名字空间，同族未来组件不抢注

- 组件块类名就是组件自己的名字空间：`colox-input`（元素 `colox-input__leading/control/trailing`、修饰 `colox-input--invalid/--xs/sm/md/lg`）。修饰类与 cva base、scss 选择器**三处同字符串**。
- **不得占用同族未来组件的名字空间**：Input v2 外壳一度用 `colox-input-group` 做块名，被用户指正——「Input 组件的前缀应该是 colox-input，不应该是 colox-input-group，**InputGroup 未来是另外的一个组件**」。
- **元素类名锚定渲染产物语义，不随承载槽位组件名漂移**：`colox-select__hidden` 描述「渲染出的隐藏 input 值通道」这个产物，承载它的槽位组件改名（SelectHiddenInputs → FormSelectValues）时类名保留——用户拍板「这个类名不用调整」；cdk 迁移同理：`colox-input-control` 是渲染出的裸控件，而非 InputOrgan/InputControl 组件名。
- 判断法：`colox-<name>` 的 name 段只允许 = 该组件名或该组件的公开 dot-part 名（`colox-grid-item`）；`xxx-group/shell/wrapper` 这类包装结构词不是块名料——DOM 外壳是组件自己，不是新组件。
- 来源：用户对 Input 块名的指正。

## 文本前景色由组件自持，宿主主色不代劳

- 组件的默认文字色显式声明语义 token（Input 外壳 `color: var(--colox-color-text-solid)`），不用 `color: inherit` 依赖宿主环境——裸继承默认落 #000，且暗色主题下不翻转。
- 全局 base/reset 只做结构归一（box-sizing，零变量），不设 `body { color }`——宿主文档主色是宿主的决定（global-css 作用域收敛纪律）；future Select/Textarea 等文本组件各自声明前景色。
- 组件内文字角色同组收敛：placeholder `text-subtle`、disabled `text-disabled`、图标 currentColor、峥 Button 的 variant 声明前景（intent-inverse / intent-solid）。
- 来源：用户指出「文字默认是 #000，应该用设计语言中的 text」后定案。

## 状态表达：单信号通道，动作图标悬停让位

- **选中指示不搞双通道**：行尾 IconCheck 已是完整选中信号，选中行不再叠 brand 背景 + brand 文字（Select 首版前科，用户指正「背景颜色没有必要，有后面的 IconCheck 就够了」）；`aria-selected` 照旧背书 DOM。
- **尾部动作图标不并排**：clear X 与下拉箭头二选一——默认只显 chevron；有值且可清时（`--clearable` 状态类挂根壳）`:hover`/`:focus-within` 让 X 替换箭头（focus-within 保证键盘用户也能到达 X）；空值/disabled 时 chevron 常驻（X 无活可干）。来源：用户指正「并排视觉不好，hover 时箭头变 X，移开默认箭头」。
- **让位用 opacity + pointer-events，不用 display/visibility**：X 绝对定位叠在 chevron 槽位（零布局抖动），静止 opacity:0——`display:none`/`visibility:hidden` 会把元素从 a11y 可达树摘掉（Testing Library `getByRole` 即找不到、键盘不可达）；与 popup 首帧守卫同一条通道纪律。

## 键表是设计语言事实：由 pipeline 发射，组件不复制

- spacing 键表（哪些刻度存在）由 theme build 发射成两份产物：`tokens/index.ts`（聚合 `defaultBreakpoints` + `spacingKeys`/`SpacingKey`，theme barrel 再导出，引用路径 = 目录 `@/styles/tokens`）供组件 variants 层生成类映射；`dist/variables.scss`（经 exports `./variables` sass 条件）供组件 scss `@use` 后 `@each`。组件里不再出现手写的 `$xxx-keys` 枚举或 `as const` 键表（前科：Container gutter 与 Stack gap 各复制 20 键，用户指出「硬编码设计语言数值不合规范」后收编）。
- 发射面随语言成长的扩展路径：新键表片段在 emit-runtime 的 artifacts 列表 + `variables.scss` 内追加块——文件名与内容归 builder，消费面只认入口。

## token 命名词汇取向：贴近常识词

- 基元层只按「颜色名词」命名：`palette.indigo / purple / blue / green / orange / red / gray`；用途词（`info / error / warning / success`、`disabled`）只存在于语义层角色组中。
- 色板名沿用 Figma 集合名（集合在 Figma 里同样按颜色名词命名）。
- 浮层背景用平实词 `bg.overlay`；不引入 `canvas` / `surface` / `elevated` / `scrim` 这类设计系统黑话。

## 组件尺寸样式内联在组件内，全局 mixin 只放通用工具

- 组件的尺寸（size）样式直接写在组件自己的 `styles/` 里（如 `input/styles/size.scss`）。全局 mixin 文件按需再建（respond-to 已随媒体查询路线移除，响应式属性选择器 mixin 待布局组件时建）。
- 类名拼接用 `clsx`，不复用自研 `cn`。

## styles/ 按变体轴拆 partial，index.scss 只聚合（Button 范式）

- 组件 `styles/` 按变体轴一刀一文件（base/尺寸/对齐/…），partial 直写平铺类名，`index.scss` 仅按序 `@use` 汇总，组件入口只引 index。全体组件一致（定义见 constraints：`styles/（base/各轴/index）`）。
- 轴文件容得下一组修饰（如 Stack direction.scss：4 个方向值 + wrap——flex-flow 对，一行规则不单立文件）；**空 base 不立文件**（Container base 无规则，裸基注释收进 index.scss 顶部）。
- 前科：Container/Stack 曾把各轴挤进单个 index.scss，用户指出「与 Button 保持一致」后拆回范式。

## 任意整数轴走内联 CSS 变量通道，不造 1..n 类表

- 值域是任意整数的轴（Grid columns、Grid.Item span）不生成修饰类表——类表在整数开放集上无界（键表单源纪律管不到任意整数）。形态 = 组件把解析值写进内联自定义属性（`--colox-grid-columns` / `--colox-grid-item-span: span N`），唯一的模板/定位规则在 scss 里读变量 + 默认回落（`repeat(var(--colox-grid-columns, 1), …)` / `grid-column: var(--colox-grid-item-span, auto)`）。规则留在 styles/，只有「值」注进 DOM。
- 消费方的 style 透传保留优先权（内联合并，消费方后写覆盖组件变量）。

## 实心态组件的 mark：反色前景 + 按盒子调描边权重（图标契约不动）

- 勾选/不确定等**实心态**的 mark 用品牌实心底 + 反色前景（checked/indeterminate → `brand-solid` bg + `brand-inverse` mark，Button solid-intent 同模型）。
- **图标嵌入填充盒时按消费语境局部调描边**：图标系统默认 1.5 单位描边 = 1px 边框等价物（16px 渲染），在实心底上是发丝；checkbox 在组件 styles 层 `stroke-width: 3` 翻倍（md ≈2px 实线，随排版阶梯等比）。**改的是消费语境，图标包的描边契約（spec lint 机器门禁 + stroke 风格）不动**——Input 插槽等其他消费方不受牵连。将来 Radio 等嵌入小盒的 mark 同源。
- **错误信号退让于实心态**：invalid 红边框只画未选中态；选中后实心态夺回边框（同特异性 + 源顺序），红环只在焦点交互瞬间标记。
- 来源：用户对 checkbox 的视觉反馈（「图标线条太细了，导致不是特别明显」+「invalid 选中后的 border 不应该是红色的了吧」）。

## 单选走环+点模型，与多选实心模型区分

- **Radio 选中态 = 品牌描边环 + 内部品牌点**（`:checked` 只染 border-color，内圆保持 bg-solid；mark `::before` 圆点以 brand-solid 上色）——不整圆填实，是单选平台的经典辨识惯例，也与 Checkbox 的实心方块形态语言区分：方块实心勾 vs 圆环点，双控件辨识由形态承载。
- **点径 40%**：环是 1px 发丝框架，点压到 40%（不是 50% 实心盘）才与环的视觉权重平衡、与 checkbox 勾形 ~45% 占宽协调；跨档比例恒定、零字面量。环保持 1px 不动——与表单家族（Input/Checkbox 1px 边框）同源，加粗环会破坏家族一致性。
- **简单图形不引图标**：单选点 CSS 化（`::before` 40% + currentColor，随 tier 零字面量缩放），不给它新增图标——按需追加纪律；disabled 时点转 text-disabled。
- 来源：Radio 交付时的形态裁决（对照 antd/MUI 同为环+点模型；反方选择「与 Checkbox 同实心模型」被否）；用户反馈「border 和实心圆比例差异过大」后点径 50%→40% 定案。

## 弹层面板行型沿 size 继承：叶子继承、本人优先

- **选项行型不再与触发器割裂**：Select 面板的选项行型（字级/行高）默认继承父级 `size` 档——`<Select size="sm">` 全组面板 sm 排版；`Select.Option` 持 `size` 可单独覆盖（本人优先、四档同源），逐选项异档是显式 opt-in。这与 Radio/Checkbox 组成员直接继承 size 的家族契合同构。原「面板字号不跟随 size + `optionSize` 专 prop」解耦案已被用户改判废除（叶子化重设计时翻案）：弹层仍是独立定位平面（portal/overflow 逃逸、z 独立不变），但排版档位归入家族 size 继承轴。
- 面板视觉零新增 token：`bg-overlay` 底 + `border-muted` 1px + `shadow-md` + radius-md；选项交互态走 `wash-hover`/`wash-active`，选中标记 `brand-wash-active` + IconCheck 尾标。z-index 无 token——面板 z 用组件内变量起步（设计语言补 `--colox-z-*` 后再收编）。
