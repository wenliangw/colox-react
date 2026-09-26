# Tooltip 组件

## 职责

悬停/聚焦提示层，盘在 cdk floating 弹层基建之上。核心承诺一个：**零容器**——
Tooltip 不渲染任何包裹元素，克隆 trigger（作者原样 DOM 结构不动），把交互面
（按通道的事件）与 `aria-describedby`（指向面板 id，作者既有词保留）注入进
trigger，面板走 cdk `Popup` 门户（`popup/z` 1000、fixed、autoUpdate 跟随、
matchWidth=false）。

**双通道 API，同给硬错误**（编译期 throw，非优先级）：

- **props 形态**：单一 trigger 子元素 + `content` prop；content 为空值
  （`''`/`null`/`false`/未给）= 不弹（条件面板免费）；零/多子元素=硬错误
  （Fragment 透明）。
- **组合形态**：`Tooltip.Trigger`（恰一；其唯一子元素——组件或 DOM host 均可——
  成为 trigger）+ `Tooltip.Content`（至多一；缺席=裸 trigger 不弹面板）。
  Content 渲染前读 context（`content` 部分自持 DOM）；其 `className`/`style`
  逃生舱落在内容盒上；组合形态下 root 直接渲染已抽取的 Content 元素
  （渲染一次、面板判 open 挂载）。

面板 = `colox-tooltip__panel`（Popup root：`role="tooltip"`、id=useId、
**pointer-events:none 恒开**——提示层不交互、指针穿透回 trigger；组合选择器
`.colox-popup.colox-tooltip__panel` 压过 positioned 恢复）+ 单一
`colox-tooltip__content` 内容盒（cva 三轴：variant dark/light、size sm/md/lg、
arrow 布尔——**两变体同走玻璃面**：dark=bg-inverse 以 color-mix 82% + backdrop
`blur(8px)`、light=bg-default 以 78% 白——**两变体同一条无边框几何**，底色都穿
color-mix 半透明让页面从面板后透出；base=md 档 font-sm 14px + padding 2/4 +
radius-md 6px，max-width 280px 字面量、逐轴 `.scss` + `@use` 聚合）。

## 架构扩展（cdk 微增长三处，picker 族零变化）

1. `useFloatingPosition`/`Popup` 加可选 `fallbackPlacements`（undefined 走
   既有 picker 预设 `['top-start','bottom-end','top-end']`，行为不变）；
   Tooltip 传**对侧优先链**（`resolveTooltipFallbackPlacements`：
   对侧 → 对侧-start → 对侧-end）。
2. 解析后把**真实 placement 写成 `data-placement` 数据属性**（computePosition
   结果的 placement 词，flip 后自动正确；additive，picker 族忽略）。
3. 解析后把**参考中心相对面板边界的偏移写成 `--colox-floating-arrow-offset`
   内联变量**（getBoundingClientRect 参考中心 − floating x/y，按 placement
   横/纵轴取值）：消费方把装饰指针（Tooltip 箭头）的中心钉在该值上，
   **flip/shift 如何搬面板，指针都瞄准 trigger**（值随 autoUpdate 每帧刷新，
   滚动跟随同步瞄准）；additive，picker 族忽略。

## 可见性状态机（use-tooltip.ts）

- `visibleOn` 三通道：**hover**（默认）= pointerenter 走 `delay.in`（300）
  - focus 恒即时开；pointerleave 走 `delay.out`（0）+ blur 恒即时关。
    开/关计时器**永远互销**——快速进出永不重开、回焦清掉挂起的延迟关。
    **click** = 无计时器即时 toggle（Escape/外点/失窗关）。**manual** =
    `visible` prop 直排——零注入面、零自动开合、`onVisibleChange` 纯无声
    （它只回音 hover/click 跃迁）。
- 关闭渠道统一走 `useDismissible`（面板+trigger 双包含豁免）；
  `closeOnScroll`（默认 false）= **显式退出**窗口 capture scroll 即关，
  默认跟随 autoUpdate 既有机制零成本。
- `delay { in?, out? }` 部分对象 merge 进默认（`{out:200}` 保 300 开）。

## 注入面（零容器的代价摊平）

`resolveTooltipTriggerSurface` 装配克隆面：trigger 自身词赢过 root
passthrough（root 宽口 props 合并进 trigger）；`className` 拼接、`style`
按 key 作者优先、作者 `onClick` 等事件**链在库面之后**（库先作者后）、
`aria-describedby` 追加面板 id；ref 三向合一（内部 triggerRef + 转发 ref

- 作者原 ref，`assignTooltipRef` 分配）。trigger 无 DOM 承载（无 ref 组件、
  disabled 原生控件吞指针事件）为文档 Boundaries 记录的真实限制，
  不注入隐形 span。

## 视觉层（按 placement 贴边）

- **箭头**：8px 方块 `rotate: 45deg`（独立 rotate 属性；旋转后四角正对四轴，
  一个旋转态通吃四向；**clip-path 沿对角线裁掉藏进面板的半边**——玻璃填充是
  半透明的，被面板盖住的那半边会叠出更深的双重 alpha 斑块，裁剪后可见形
  恰好=菱形凸出半边正三角形）。挂边按 `data-placement` 前缀（top→bottom:-4px），
  **沿面板边的中心钉在 `--colox-floating-arrow-offset`**（cdk 每帧刷新，
  `clamp(spacing-3, var, 100% - spacing-3)` 防出界）——面板被 flip/shift
  搬移时箭头仍瞄准 trigger；translate -50% 居中。gap 随箭头开关：开 8 / 关 6。
- **箭头颜色/模糊跟随气泡**：`background: inherit` 直取内容盒的 color-mix
  填充、backdrop blur 读同一个 CSS 变量 `--colox-tooltip-blur`（8px，
  内容盒声明）——箭头=气泡表面伸出的部分，任何 variant 调整自动同源。
  **两变体同一条 8px 无边框、无阴影几何**（light 用 border 会内缩填充致
  两变体观感不一致——用户否掉；磨砂填充 + blur 自身即边缘定义）。
- **零阴影（磨砂铁律）**：面板不带 `--colox-shadow-md`、不带定向落影，
  箭头不带 drop-shadow——**任何阴影都会穿过半透明填充泛上来**：箭头凸出
  面板边缘恰在阴影散布区，light 的白色半透明叠在下方的灰阴影上就读成
  灰箭头（用户实测报「应该白色、被 box-shadow 影响成灰色」）；全摘除后
  玻璃=纯填充+blur，两变体观感完全一致。定向阴影（设计轮「箭头向阴影」
  语义）随玻璃面落地一并退场——半透明浮层与投影互斥，取舍以玻璃为准。
- **进场动画**：mount 时 fade + scale(0.92→1)，timing 全由 motion token
  （fast/easing-out）持有——reduced-motion 由 theme 门控零时长自动急停，
  组件零特判；退场无（Popup 无退出通道），与 Popover 一起补。

## 目录结构

```
tooltip/
├── tooltip.tsx               # 编排层：编译走查 + useTooltip + context 值 + 克隆注入 + Panel/Content 挂载
├── index.ts                  # 出口（Tooltip + useTooltipContext + 8 类型 + tooltipVariants）
├── context/index.ts          # TooltipContext + defaultTooltipContextValue（no-op 默认，isDefault 标记）
├── hooks/
│   ├── use-tooltip.ts        # 可见性状态机单源（三通道/延迟计时器互销/dismiss/scroll 关）
│   └── use-tooltip-context.ts # 受保护出口（useColoxTheme 副本文案形态，无根挂载 warn 一次）
├── children/
│   ├── trigger/index.tsx     # 声明槽（渲染 null；host 由 root 编译捕获再克隆）
│   └── content/index.tsx     # 内容载具（读 context 自持面板 DOM，className/style 逃生舱落内容盒）
├── controls/panel.tsx        # 双形态共享面板单元（Popup 面板根 + cva 内容盒）
├── utils/
│   ├── leaves.ts             # 编译走查：双通道裁决/硬错误/宿主抽取（Fragment+透传 wrapper 透明）
│   ├── resolve-fallback-placements.ts # placement → 对侧优先翻转链
│   ├── resolve-trigger-surface.ts     # 零容器注入面装配（合并/串联/describedby/ref）
│   └── refs.ts               # assignTooltipRef（函数/对象 ref 分配）
├── variants/                 # cva 三轴：variant.ts / size.ts / arrow.ts + index.ts
├── styles/                   # base/variant/size/arrow/animation + index.scss @use 聚合（shadow.scss 随零阴影终态移除）
└── _tests/                   # 30 例：静态面/编译硬错误/三通道计时器/关闭面/手动通道/回音/串联序
```

## 边界

- **trigger 必须收 ref**（DOM/forwardRef/React19 ref-as-prop）；无 ref
  承载不注入隐形 span。**disabled 原生控件吞指针事件**——包一层 Anchor
  再解说明（文档记录）。
- **无 `defaultVisible`**：hover/click 是纯展示通道无需首显词；manual 受控。
- **只有进场动画**：退场通道随 Popover 补齐。
- 嵌套 tooltip、组间共延迟：v1 不做（决策记录）。
