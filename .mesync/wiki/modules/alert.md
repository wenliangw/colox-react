# Alert 模块

## 职责

`@colox/react` 的**内联状态消息块**——持久、流内、声明式（瞬时浮层 Toast/Notify 的流内兄弟）：住在页面里、父级决定显隐、词是 JSX 不是调用。单根组件，无 dot-part（内容简单走 props 形式——用户追问「是否需要 dot 形式」后裁决：ReactNode props 已等价覆盖自定义能力，dot 只换写法不加能力，且 Colox 走 props 营 antd/MUI/Mantine 路线）。

## API

```tsx
<Alert type="success" message="保存成功" description="已写入本地缓存" />
```

- **`type`**（info/success/warning/error，默认 info）：语义轴（antd 生态标准词——Alert 无 kind 判别词占用 type 词位，消息系统因 toast/notify 占用才用 mode）。驱动图标字形（IconInfo/Success/Warning/Error 语义四枚，Toast 共用）+ 默认 palette 族。
- **`palette`**（六族，默认跟随 type 的族）：颜色面。`palette ?? type` 一步解析（type 值是 palette 值的子集）。
- **`variant`**（plain/subtle/solid/outline，默认 **subtle**）：面料强度——内联状态块读作「染色块」（antd/MUI 观感），区别于瞬时浮层 toast 的 plain 默认；**表面身份决定默认面料**，家族默认统一让位于身份语义。
- **`message`**（ReactNode 必填主行）+ **`description`**（ReactNode 可选副行）：任意富内容直接放（标题嵌图标、内容嵌 JSX 都成立）——**自定义 Title/Content 能力由 ReactNode props 承担，不建 dot 形式**。
- **`showIcon`**（默认 true）：gate 语义图标。
- **`action`**（可选 ReactNode 尾部动作槽）：持久内联块是「状态提示 + CTA」的正当宿主（错误提示+重试），与 round 14「瞬时消息不索求决策」的推理边界不同——action 归属跟持久性走。
- **`closeable` + `onClose`**：右上 ✕（复用 IconButton muted）。**受控关闭 + 淡出**——点 ✕ 先播 fade-out（内部 `exiting` 退场窗态，`--exiting` 类 + `colox-alert-exit` keyframes，motion-normal 200ms），动画结束（`onAnimationEnd`，`exiting && target===currentTarget` 守卫）才触发 onClose，父级在回调里条件渲染卸载。**退场窗态不是隐藏态**——Alert 仍不自己消失，它只把「通知父级卸载」延后到动画结束（onClose 时机从「点 ✕ 即回调」变为「淡出后回调」）。

## 可达性

- `error`/`warning` → `role="alert"`（assertive）；`info`/`success` → `role="status"`（polite）——live region 随 type 映射。
- 图标 `aria-hidden`；✕ 可读名 "Close"。

## 设计要点

- **与消息系统三轴同构**：type/palette/variant 词表与 Toast/Notify 的 mode/palette/variant 同一套（语义轴词位不同：Alert 用 type 无冲突）。
- **范围外（on demand）**：banner 全宽模式、icon 覆盖、rich children 槽、size 轴（非控件）——均无真实消费场景，「软事实不落盘」纪律。
- **流内块视觉**：无 shadow、无 max-width（页面块非浮层），radius-lg，icon 20px（`--colox-alert-icon-size: var(--colox-size-5)`——用户三轮往复（16 太小 → 22 无 token → 自选 20）后的最终裁定，恰是 theme 正式 size token 档）且**光学中心对齐 message 首行行盒**（`margin-top: calc((line-height-md - icon-size) / 2)`，非 notify 的一档固定 margin——14px 字号比 notify 的 16px title 低，固定 4px 会让图标中心偏下）。

## 实现结构

```
packages/components/src/alert/
├── alert.tsx                # 根组件（forwardRef + 类型→图标映射 + 类型→role）
├── index.ts                 # barrel：Alert + 类型 + cva
├── types/                   # AlertProps / AlertType / AlertPalette / AlertVariant / AlertRef
├── variants/                # palette.ts（六族）/ variant.ts（四档）/ index.ts（cva）
├── styles/                  # base（块布局+私有变量+排印）/ variant（面料）/ palette（六族映射）/ animation（淡出）/ index
└── _tests/alert.test.tsx    # 32 例
```

## 样式约定

- palette 类只设私有变量族（`--colox-alert-palette-*`），base 落 brand fallback——Avatar/Badge/Button 家族配方同构。
- variant 面料读私有变量：subtle 洗底+族色图标、solid 实底+inverse 全翻转（icon/message/description/close 都翻）、outline inset 环、plain 中性面。
- 私有变量名与消息系统 box.scss 的 `--colox-message-*` 同构（solid/subtle/muted/inverse 四件套）。
- 动画就近组件层（`styles/animation.scss`）——`colox-alert-exit` 纯淡出，fade-out 的 keyframes 与 modal/tooltip/popover 各自重复但不抽 cdk（见变更②）。

## 测试

32 例：**type**（四族默认 palette 映射/info 默认）；**role**（error/warning→alert、info/success→status）；**variant**（subtle 默认/四档映射）；**palette**（显式覆盖 type 派生族/六族映射）；**content**（message+description/富 ReactNode/无 description 省略）；**showIcon**（默认渲染+aria-hidden/关闭省略）；**close**（默认无 ✕/点 ✕ 加 exiting 不立即 onClose/动画结束 onClose/子元素冒泡的 animationEnd 不触发 onClose）；**action**（渲染槽/省略）；**passthrough**（className 合并+原生透传）。

## 变更

- 2026-11 Alert 首版交付（M5 三件）。设计对齐两轮：① 四项拍板——type（antd 生态词，非 mode）/ subtle 默认 / 要 action 槽 / 受控关闭；② 用户追问「是否需要 dot 形式」→ 裁决不需要（ReactNode props 已覆盖自定义能力 + dot 判据不满足 + props 营路线），词形确认 message/description（antd 生态词，非 title/content）。
- 2026-11 优化轮（用户三点）：① 图标与 message 光学中心对齐（固定 margin 改 calc 半差）；② close 支持淡出过渡（退场窗态 + `onClose` 延后到动画结束）；③ 动画不抽 cdk「单 keyframes」——fade-out 虽在 modal/tooltip/popover/overlay 重复，但它是 2 行 keyframes、抽象成本 > 收益，组件各自带 animation.scss 是既定内聚惯例；待「一批通用进场/退场形态被多组件复用」时才提权 cdk 动画形态库。
- 2026-11 优化轮 2（用户两点）：① 淡出再慢一档——motion-fast(100ms) → motion-normal(200ms)；② icon 尺寸 20px 不是规格档——**icon 尺寸只有 12/14/16/18/24/28/32 这些档**（用户提出），20px 是消息系统当年造的裸值，Alert 用 `var(--colox-size-4)`(16px) 配 14px message。notify/toast 的语义 icon 同样硬编码 20px（配 16px title），规格化未尽——如有需要应改用 18px 档，待用户指示。
- 2026-11 优化轮 3（最终裁定）：用户反馈「18px 太小，换成 22px」→ 澄清 22 无 token/非档表 → 用户自选「还是用 20px 的更好」。Alert icon 最终 = 20px（`var(--colox-size-5)`，theme 正式档）。「20 不是规格」定案被 supersede，notify/toast 的 20px 与 Alert 回到一致、不再当作债务。
