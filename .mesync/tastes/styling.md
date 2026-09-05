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

- 单一来源已落地：W3C DTCG JSON + Style Dictionary v4；链路 = Figma 导出（styles/meta/*.tokens.json）→ figma-to-tokens.mjs 转换 → SD 生成 themes/light.css。
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
- **微动效只消费 motion token，门控集中一处**：组件声明 transition 一律用 `--colox-motion-duration-*`（fast 100ms/normal 200ms/slow 300ms）+ `--colox-motion-easing-*`（out/in/in-out），禁止自造时长缓动；全局开/关由 theme 的 motion.css 门控层统一执行（`data-colox-motion` 轴 + `prefers-reduced-motion`），组件零分支、风格天然一致。装饰投影（shadow）走独立 boolean 轴，常态 shadow-md、hover 升 shadow-lg（首个微动效实例）；shadow 是主题相关语义：light 灰淡投影、dark 加深纯黑投影（工程侧双档手维），自定义主题经 CLI `extends` 明暗链继承对应档值。

## token 归属：Figma 承载视觉值，工程侧承载实现值

- Figma variables 承载：color / semantic-colors.light / semantic-colors.dark / fontSize / fontWeight / lineHeight / radii / spacing（导出 → 转换 → SD 生成）。
- 工程侧人工维护（tokens/base.tokens.json + semantic.derived.tokens.json）：fontFamily（sans/mono 系统栈）、shadow（sm/md/lg）、motion（duration fast/normal/slow + easing out/in/in-out）、交互态双档（solid--/wash--）派生混色。
- 原因：Figma variables 对字体族、复合阴影、缓动曲线等实现类值支持不佳，用户拍板归属工程侧。

## 行高用绝对 px，与字号同名配档

- lineHeight 拒绝 unitless 比率：行盒 = 字号×比率，控件总高 = 行盒+padding+border 会产生小数、落出像素网格，高度不可控。
- 采用与 fontSize 同名的绝对 px 档位（lineHeight.md 配 fontSize.md，13 档 1:1），控件高度推导完全确定。

## 间距统一：gap/margin/padding 全部消费 spacing

- 组件里一切空隙（gap、margin、padding）都消费 spacing 档位，不为个别用途另设 grid-gap 类 token。
- 控件高度现在由「行高 + 间距」组合自然落入像素网格（sm 26 / md 36 / lg 48px），不额外引入 control-height token。

## 尺寸基准：界面尺寸走 4 的倍数

- 用户偏好以 **4 的倍数** 进行设计（控件高度等尺寸落到 8px 格点：24/32/40/48……）；8 格点是 4 倍数的子集，两者兼容。
- 按钮宽度 = 内容 + padding（不设固定宽，全行业共识）。
- **spacing 只做间距，不承载尺寸**：gap/margin/padding 消费 spacing，控件的高度等尺寸消费独立的 **size 设计语言**（用户纠正：拿 spacing 当高度是职责越界；参照 Chakra `sizes` 与 `space` 分家）。
- **size 设计语言 = 纯数值变量，Figma 承载**：sizes 集合已从 Figma 导出接入（`--colox-size-*`：整数格 4px×N（档 1 至 14 及 16）+ 半格档 0-5..4-5）；全局**不定义** sm/md/lg 语义档位（组件 size 维度各异：Button 是高、Modal 是宽，全局语义命名必生二义性）——组件 size prop 是组件自己解析语义，内部引用数值 size 变量。
- **80px 以上的大尺寸档不进 size 语言**：已在 Figma 侧拆出独立集合 `large_size`（80px 至 1440px 域，暂不发布）；converter 对未映射组整体跳过并告警，`hiddenFromPublishing` 过滤保留做守门。将来容器/大元素域要发布时，再为 `large_size` 立独立命名空间。
- **半格档（0_5..4_5 = 2/6/10/14/18px）是半格微距值**：命名沿用图内 `N_5` → CSS `N-5`（读「N 点五」）；控件尺寸只消费整数格（4 的倍数），半格留给微距（2px 分隔线、6px 内距等）。否决「CSS 名带小数点（--size-1.5）」——点号在 CSS 变量/SCSS 链上要转义，得不偿失。
- Button 高度四档已落地：xs/sm/md/lg = 24/32/40/48 = `var(--colox-size-6/8/10/12)`，padding-inline 走 spacing-2/3/4/6；Input 现阶梯（26/36/48）本轮不动。

## 组件 size prop 属组件私有变体，不进全局 token

- Card/Avatar/Dialog 这类 `size: sm|md|lg` 的具体尺寸是各组件自己的 CVA 变体（内部可组合 spacing/fontSize 等全局 token），彼此无关联、无复用价值，不做全局 size 文件。
- 全局 token 只承载「跨组件共享」的量。

## 断点：工程侧常量 + 运行时 JS 消费

- 断点归属 base.tokens.json，Desktop 优先（sm 640 / md 768 / lg 1024 / xl 1280，max-width 向下语义）。
- 媒体查询不能读 CSS 变量、响应式走运行时 `data-colox-breakpoint` 属性机制，断点值注入 JS 层：tokens:sync 从 base.tokens.json 生成 `tokens/breakpoints.ts` 的 `defaultBreakpoints`（供 ColoxThemeContext 默认值与 head 引导脚本）；light.css 的 CSS 变量副本仅保留供读。

## 变体层用 CVA，className-only

- variant/size 等变体用 `cva()` 定义，只拼 className、零运行时 CSS；类名沿用 `colox-` BEM 前缀。
- 不引入重型 css-in-js。

## token 命名词汇取向：贴近常识词

- 基元层只按「颜色名词」命名：`palette.indigo / purple / blue / green / orange / red / gray`；用途词（`info / error / warning / success`、`disabled`）只存在于语义层角色组中。
- 色板名沿用 Figma 集合名（集合在 Figma 里同样按颜色名词命名）。
- 浮层背景用平实词 `bg.overlay`；不引入 `canvas` / `surface` / `elevated` / `scrim` 这类设计系统黑话。

## 组件尺寸样式内联在组件内，全局 mixin 只放通用工具

- 组件的尺寸（size）样式直接写在组件自己的 `styles/` 里（如 `input/styles/size.scss`）。全局 mixin 文件按需再建（respond-to 已随媒体查询路线移除，响应式属性选择器 mixin 待布局组件时建）。
- 类名拼接用 `clsx`，不复用自研 `cn`。
