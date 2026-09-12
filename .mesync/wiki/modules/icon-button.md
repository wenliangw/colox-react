# IconButton

`packages/components/src/icon-button/` —— 图标按钮原语：**方形裸按钮**，供图标专用控件承载。Input 的 clear/toggle、Select 的 clear/tag-remove 四个内置站点已全部换装到它（决策 `IconButton 独立原语`）。

## 定位（为什么独立成组件，不并入 Button）

- **rule of two 满员触发**：仓库里手写图标按钮曾有四站（Input 清除/可见性、Select 清除/chip 移除）+ docs/preview 演示手写 ×——复位块（inline-flex 居中/padding 0/border none/background transparent/cursor/disabled）拷了 5 份，聚焦态与可达名契约每站自己重复实现。
- **与 Button 语义分层**：Button 管内容（intent/variant/shadow/字重），IconButton 管图标（方形、ghost 基底、图标尺寸）——混成 shape 变体只会污染两个 API（MUI/Base UI 同款拆分）。
- **通用契约收进基座**：纯图标按钮的 aria-label 可达名契约（组件文档声明，消费方必传）、`focus-visible` outline 2px brand + offset 2（沿用表单惯例）、disabled 态、token 钉住的方形足迹。hover 装饰**有意不进基座**（字段内清空钮要无底色、工具栏钮可能要 wash——反馈归消费方/站点，站点类天然后于基座规则胜出）。

## 尺寸双通道

`size?: 'xs' | 'sm' | 'md' | 'lg' | SizeKey`：

- 预设档对齐表单家族同档同高：xs 24（size-6）/ sm 32（size-8）/ md 40（size-10，默认）/ lg 48（size-12）——User 定调「默认与其他组件 size 对齐」。
- `SizeKey` 来自 **@colox/theme 的 `sizeKeys` 发射**（46 键全刻度，`emit-runtime.mjs` 从 token 工作区发射 TS + `$colox-size-keys` SCSS 面；`--colox-size-*` 有 4px 网格 2–64 + 页面宽档 80–1440）：variants 层按 `sizeKeys` 动态生成 `colox-icon-button--size-<key>` 键类，尺寸落 `var(--colox-size-<key>)`——主题重定义跟随，类型即白名单（`size="99"` 编译期报错）。
- **内部站点用裸键**（用户拍板「在组件中使用要使用其他 size 值」）：Input/Select 的控件钮一律 `size="4"`（16px，贴合 chip 与 trailing 槽位语境），不走预设档。
- 消费方 CSS 覆盖：自己的类直接写 width/height 即可压过基类（尺寸经变量喂默认，不挡覆盖通道）。

## 站点契约（换装后的分工）

- **IconButton 基座**：复位、方形足迹、focus-visible 环、disabled 语义、type="button" 默认。
- **站点保留**（都经 className 落在按钮上，类名不变，测例零迁移）：
  - Input clear/toggle 的 `onMouseDown preventDefault` 防失焦（这是「控件在输入框上下文」的行为，不是图标按钮本分——工具栏图标钮恰恰要正常获得焦点，故不上提基座）；`slots.scss` 退役删除（复位全在基座）。
  - Select clear 的 absolute inset-0 换位 + opacity/pointer-events swap reveal；tag-remove 的 chip 内 muted 着色 + hover solid。

## 门禁与文件

`_tests/icon-button.test.tsx` 13 例（预设四档/裸键 5 例（0-5/4/7/16/360）/默认 md/children/type 默认/透传），全仓 237 例。文件：`icon-button.tsx`（forwardRef + cva + `{...rest}` 展开在后）、`types/index.ts`（`ButtonHTMLAttributes` 全透传 + size 注释含 token 双通道说明）、`variants/{index,size}.ts`（cva + sizeKeys 键映射）、`styles/{base,size,index}.scss`（基座 + @each 键类）、preview `apps/preview/src/icon-button/`（Overview story：States/预设四档/裸键 5 值/行为 demo）、docs `icon-button.mdx`（sidebar_position 10）。构建入口 `vite.config.ts` + `exports["./icon-button"]` 子路径（`@colox/react/icon-button` 树摇）。

## 边界

- **不搬进基座的**：mousedown 防失焦（上下文行为）、hover 底色（站点设计），理由见上。
- **不带 icon prop**：图标走 `children`（ReactNode 插槽，与 icons 包「插槽收 ReactNode」同构）。
- 尺寸键全刻度开放（含页面宽档 80–1440 键）——类型不设上限，观感责任归消费方；预设档覆盖常规区间。
