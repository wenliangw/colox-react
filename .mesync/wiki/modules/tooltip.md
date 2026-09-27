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
`colox-tooltip__content` 内容盒（cva 三轴：palette 七族 gray/primary/info/
error/warning/success/white、size sm/md/lg、arrow 布尔——**七族同走半透明
面，无 blur**：gray（默认）= 设计语言 0.9 黑色透明度挡位
`--colox-palette-black-900`（#000000E5），五色族 = family solid 各以
color-mix 90% 同档，white = 白阶梯同档 `--colox-palette-white-900`

- 文字翻深 text-default（其余六族 inverse 白）——**七族同一条无边框
  几何**，底色都穿半透明让页面从面板后透出（backdrop blur 已移除——霜纹
  机制带来的 backdrop-root 约束多过毛玻璃收益，用户拍板先撤）；
  base=md 档 font-sm 14px + padding 2/4 + radius-md 6px，max-width 280px
  字面量、逐轴 `.scss` + `@use` 聚合）。

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
    （它只回音 hover/click 跃迁）。manual 面板**初始即开也照常定位**：
    Popup 给定位 hook 的 open 门带 mounted 翻转（`open && mounted`），
    portal 就位获得 false→true 边——无此边则首帧 effect 早退后定位
    永不重算、面板困在 0,0 + opacity 0（首版被用户报「没有生效」）。
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

- **箭头（本轮定案：旋转菱形，无裁剪）**：旋转 ±45/±135° 的半透明方块
  （边 = 深度 × √2 ≈ 8.49px），**上半埋进气泡盒下**（DOM 序 [arrow,
  content]，content 后绘制盖住埋藏半）——可见形 = 下半个菱形 = 三角，
  **全程零 clip-path**。原因（实测）：裁剪元素自己的 drop-shadow 被
  裁剪本身整体切掉（clip+filter 同元素 = 零投影），mask 版投出整盒
  矩形——菱形以对角线硬停渐变只涂外半（埋藏半透明，背后 90% 玻璃上
  无叠暗楔，条纹页实测与普通玻璃逐像素一致）。**只圆突出的尖角**：
  单角 `border-radius: 0 0 radius-xs 0`（只 BR=尖角 2px，基座两角保持
  直角——用户点名「不是所有角都需要圆角」，旋转携带局部配方，
  四 placement 同一条）。沿边的中心仍钉
  `--colox-floating-arrow-offset`（clamp 防出界、面板被 flip/shift
  搬移后箭头仍瞄准 trigger），translate ±50%/∓50% 把盒心放到泡边、
  旋转绕盒心翻出填充角——同一条局部渐变配方随旋转服务四 placement，
  rotate 词表：top 45 / bottom -135 / left -45 / right 135。
  旋转后包围盒 = 菱形对角线 = 深度×2（md 12×12 / sm 8×8）；
  **sm 档箭头小一号**：深度 spacing-1-5 6px → spacing-1 4px
  （`--colox-tooltip-arrow-depth`，arrow span 挂 `--size-sm` 类）。
  gap 随箭头开关：开 8 / 关 6。
- **backdrop blur 已整体移除（用户拍板）**：霜纹机制换来的
  backdrop-root 约束（任何带 filter 祖先圈死子孙透镜、装饰必须素净
  祖先下自投影）多过毛玻璃收益——半透明本色 + 投影已够提示层的
  出生感。因此历史透镜律（下方条目）不再约束本组件；其教训
  （clip/mask 对自身投影的破坏）独立于 blur，仍然有效并保留于
  corrections。
- **箭头填充跟随气泡**：填充色经由共享自定义属性 `--colox-tooltip-fill`
  （panel 声明、palette 在 panel 级覆写——复合选择器防 cascade 打架）
  传给菱形渐变；文字走 `--colox-tooltip-text`（panel 同源声明、
  white 族翻 deep）——箭头=气泡表面伸出的部分，palette 调整一处换
  两色。
- **阴影（drop-shadow 投影，AntD 式）**：每个面自带一条
  `filter: drop-shadow(0 4px 6px rgba(25,25,25,0.13))`——content 剪影
  气泡、arrow 剪影菱形外半，两段同参投影拼成联体剪影（blur 移除后
  无需再忌滤镜祖先，但「每面自投影」的形态保留——联合剪影不能靠
  祖先级单一滤镜表达）。
  alpha 补偿 0.13：drop-shadow 对剪影 alpha 施影，半透明填充把投影
  稀释（0.13×0.9 ≈ token 0.10 的视觉深度——0.9 档后补偿比旧
  0.82 更贴 token）；token 的 -1px spread 无法表达（drop-shadow 无
  spread 参数），为公开代价。演化线：零阴影终态（light 白底隐身被报）
  → 定向投射层 + 箭头侧 6px 让位带（白边被报「白色背景层」）→ 遮罩
  挖孔（用户否掉 mask/复杂度）→ 一条 token box-shadow 挂本体盒
  （用户拍板简单优先）→ border 三角轮（兼容性优先）→ drop-shadow +
  clip-path 回归（用户看 AntD 点名）→ 菱形化：实测裁剪箭头
  自投影被裁空（union 只余气泡半），菱形把 AntD 联体剪影兑现 +
  palette/0.9 档并入 → blur 移除 + white 族 + 尖角单圆（本轮）。
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
├── variants/                 # cva 三轴：palette.ts（六族名→ content 类名）/ size.ts / arrow.ts + index.ts
├── styles/                   # base/palette/size/arrow/animation + index.scss @use 聚合；阴影=base.scss（内容盒）+arrow.scss（箭头）各一条同参 drop-shadow（无独立投影文件）
└── _tests/                   # 32 例：静态面/编译硬错误/三通道计时器/关闭面/手动通道/回音/串联序/类映射/字号
```

## 边界

- **trigger 必须收 ref**（DOM/forwardRef/React19 ref-as-prop）；无 ref
  承载不注入隐形 span。**disabled 原生控件吞指针事件**——包一层 Anchor
  再解说明（文档记录）。
- **无 `defaultVisible`**：hover/click 是纯展示通道无需首显词；manual 受控。
- **只有进场动画**：退场通道随 Popover 补齐。
- 嵌套 tooltip、组间共延迟：v1 不做（决策记录）。
