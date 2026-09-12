# IconButton

`packages/components/src/icon-button/` —— 图标按钮原语：**方形裸按钮**，供图标专用控件承载。Input 的 clear/toggle、Select 的 clear/tag-remove 四个内置站点已全部换装到它（决策 `IconButton 独立原语`）。

## 定位（为什么独立成组件，不并入 Button）

- **rule of two 满员触发**：仓库里手写图标按钮曾有四站（Input 清除/可见性、Select 清除/chip 移除）+ docs/preview 演示手写 ×——复位块（inline-flex 居中/padding 0/border none/background transparent/cursor/disabled）拷了 5 份，聚焦态与可达名契约每站自己重复实现。
- **与 Button 语义分层**：Button 管内容（intent/variant/shadow/字重），IconButton 管图标（方形、ghost 基底、图标尺寸）——混成 shape 变体只会污染两个 API（MUI/Base UI 同款拆分）。
- **通用契约收进基座**：纯图标按钮的 aria-label 可达名契约（组件文档声明，消费方必传）、`focus-visible` outline 2px intent-solid + offset 2（沿用表单惯例，焦点环随 intent 换色）、disabled 态、token 钉住的方形足迹。hover/active 反馈也在基座——**最初「有意不进基座」是过度保守**：用户指摘「IconButton 好像没有 hover 效果」后反转——座位式反馈（wash + 按压）是基座默认契约，站点有理由再用类覆盖（决策 05b83bed）。

## 尺寸双通道

`size?: 'xs' | 'sm' | 'md' | 'lg' | SizeKey`：

- 预设档对齐表单家族同档同高：xs 24（size-6）/ sm 32（size-8）/ md 40（size-10，默认）/ lg 48（size-12）——User 定调「默认与其他组件 size 对齐」。
- `SizeKey` 来自 **@colox/theme 的 `sizeKeys` 发射**（46 键全刻度，`emit-runtime.mjs` 从 token 工作区发射 TS + `$colox-size-keys` SCSS 面；`--colox-size-*` 有 4px 网格 2–64 + 页面宽档 80–1440）：variants 层按 `sizeKeys` 动态生成 `colox-icon-button--size-<key>` 键类，尺寸落 `var(--colox-size-<key>)`——主题重定义跟随，类型即白名单（`size="99"` 编译期报错）。
- **内部站点用裸键**（用户拍板「在组件中使用要使用其他 size 值」）：Input/Select 的控件钮一律 `size="4"`（16px，贴合 chip 与 trailing 槽位语境），不走预设档。
- 消费方 CSS 覆盖：自己的类直接写 width/height 即可压过基类（尺寸经变量喂默认，不挡覆盖通道）。

## 视觉轴（决策 05b83bed）

`variant?: 'ghost' | 'outline' | 'solid'`（默认 ghost）× `intent?: 'primary' | 'neutral' | 'danger' | 'warning' | 'success'`（默认 primary——Button 同款五色轴，含 success，不缩水）× `rounded?: boolean`（默认 false）：

- **ghost**：无铬、`color: inherit`（显式不涂 intent 色——字段内清空钮/chip × 依赖上下文 muted/disabled 继承，基座推色会污染已验收视觉；Button ghost 涂色、IconButton ghost 不涂）；hover/active = intent wash 方形浅底（radius-xs——**圆形不做默认**，用户定调「圆底应该使用 rounded prop 来设置，默认应该是方形（圆角）」）；disabled = text-disabled。
- **solid**：intent 实底三态（solid → solid-hover/active）+ intent-inverse 图标；disabled = bg-disabled。
- **outline**：1px intent border + intent 图标 + 透明底，hover/active = wash，disabled = border-disabled。
- **rounded**：`border-radius: var(--colox-radius-full)`（9999px）——wash/fill 跟随圆形足迹。
- **实现形状同 Button**：intent.scss 注解私有变量族 `--colox-icon-button-intent-*`（base 落 brand fallback 保焦点环存活），variant.scss 只画涂装——将来站点扩展配色只需重挂变量、不碰涂装规则。
- **动效与 Button 同步**：base 双段 transition（normal 全轴 + active 快速段）、`scale(0.97)` 按压。
- **内部四站零代码变更**：默认即 ghost+primary，wash 与站点 hover 色规则叠加成「浅底 + 色加深」双反馈（Playwright 实证：hover bg = brand wash 8% alpha、离开回透明、radius 2px）。

## 站点契约（换装后的分工）

- **IconButton 基座**：复位、方形足迹、hover/active wash + 按压、focus-visible 环、disabled 语义、type="button" 默认。
- **站点保留**（都经 className 落在按钮上，类名不变，测例零迁移）：
  - Input clear/toggle 的 `onMouseDown preventDefault` 防失焦（这是「控件在输入框上下文」的行为，不是图标按钮本分——工具栏图标钮恰恰要正常获得焦点，故不上提基座）；`slots.scss` 退役删除（复位全在基座）。
  - Select clear 的 absolute inset-0 换位 + opacity/pointer-events swap reveal；tag-remove 的 chip 内 muted 着色 + hover solid（与基座 ghost wash 叠加）。

## 门禁与文件

`_tests/icon-button.test.tsx` 25 例（预设四档/裸键 5 例（0-5/4/7/16/360）/默认 md/children/type 默认/透传/variant 3 例 + ghost 默认/intent 5 例 + primary 默认/rounded 2 例），全仓 249 例。文件：`icon-button.tsx`（forwardRef + cva + `{...rest}` 展开在后）、`types/index.ts`（`ButtonHTMLAttributes` 全透传 + size 注释含 token 双通道说明）、`variants/{index,size,variant,intent}.ts`（cva + sizeKeys 键映射 + 视觉轴类表）、`styles/{base,size,variant,intent,index}.scss`（基座 + @each 键类 + 涂装 + 意图变量族）、preview `apps/preview/src/icon-button/`（Overview story：States/Variants/Intents/Rounded/预设四档/裸键 5 值/行为 demo）、docs `icon-button.mdx`（sidebar_position 10，含 Variant & intent / Rounded 两节）。构建入口 `vite.config.ts` + `exports["./icon-button"]` 子路径（`@colox/react/icon-button` 树摇）。

## 边界

- **不搬进基座的**：mousedown 防失焦（上下文行为——工具栏钮要正常获焦），理由见上；hover 底色已反转进基座（05b83bed），站点有理由仍可覆盖。
- **不带 icon prop**：图标走 `children`（ReactNode 插槽，与 icons 包「插槽收 ReactNode」同构）。
- 尺寸键全刻度开放（含页面宽档 80–1440 键）——类型不设上限，观感责任归消费方；预设档覆盖常规区间。
