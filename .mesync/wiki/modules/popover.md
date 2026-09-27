# Popover 组件

## 职责

**可交互悬浮卡片**——盘在同一条 cdk floating 弹层基建上的 Tooltip 交互孪生：
非模态 dialog 面板承载真控件（按钮/表单/列表），与指针穿透的提示层互补。
核心承诺同骨架：**零容器**——Popover 不渲染任何包裹元素，克隆 trigger
（作者原样 DOM 结构不动），把交互面（按通道的事件）与 dialog 接线
（`aria-haspopup="dialog"` 恒有、`aria-expanded` 实时、`aria-controls`
开时并入面板 id 且作者既有词保留）注入进 trigger，面板走 cdk `Popup`
门户 + **`exitDuration=POPOVER_EXIT`(100) 退出通道**（退场窗内挂
`colox-popup--exiting` 播 fade-out）。

**双通道 API，同给硬错误**（编译期 throw，非优先级）：

- **props 形态**：单一 trigger 子元素 + `title`/`content` props；content
  空值 = **永不打开**（机器层 setVisible(true) 直接 no-op——不翻转、不
  回显，`aria-expanded` 恒 false 不撒谎）；零/多子元素=硬错误（Fragment
  透明）。
- **组合形态**：`Popover.Trigger`（恰一；其唯一子元素——组件或 DOM host
  均可——成为 trigger）+ `Popover.Title`（至多一；children 成面板标题行，
  `className`/`style` 落标题元素）+ `Popover.Content`（至多一；缺席=裸
  trigger 不弹面板）。Content 渲染前读 context（自持面板 DOM）；其
  `className`/`style` 逃生舱落在内容盒上；`title` prop 与 Title part 同给
  亦硬错误。

面板 = `colox-popover__panel`（Popup root：`role="dialog"`、
**恒 `tabIndex=-1`**（WAI 模式：内容无焦点项时面板自身可聚焦收容）、
id=useId、有 title 时 `aria-labelledby` 指标题行 id；**实底卡片、无
pointer-events 豁免**——可交互面必须吃得下指针）+ DOM 序 [arrow,
title?, content]：内容盒 `colox-popover__content`（padding 3/4、
font-sm/line-height-md、`word-break: break-word`）、标题行
`colox-popover__title`（padding 3/4/0、font-sm weight 600）。

## 可见性状态机（use-popover.ts，可见性+焦点单机合一）

- `visibleOn` 三通道：**click**（默认）= 无计时器即时 toggle，**开即
  把键盘焦点移入面板**（首个可聚焦元素/否则面板自身 tabindex=-1）；
  **hover** = pointerenter 走 `delay.in`（300）+ focus 恒即时开，
  pointerleave 走 `delay.out`（**100——out 延迟就是指针桥**：面板可交互，
  指针过缝隙进面板不能掉；面板半区 `bridgeHandlers` 的 pointerenter
  清挂起的关）；**manual** = `visible` prop 直排，零注入面、零自动开合、
  `onVisibleChange` 纯无声（只回音 hover/click 跃迁）。
- **hover 指针桥（对齐定案）**：不做隐藏桥元素（Radix HoverCard 式）——
  面板贴 trigger 街隙 8px、`delay.out=100` 计时器就是桥（antd
  mouseLeaveDelay 同构）；trigger pointerleave 开 100ms 关窗，panel
  pointerenter 取消之。桥关窗口内焦点若已在区内（`focusInside` =
  activeElement === trigger 或 panel 内）指针离开也不关——键盘用户正在
  面板里工作，指针离场不掀桌。
- **blur 进面板 = 内部移动不关**：trigger onBlur 查 `event.relatedTarget`
  （收焦元素——antd 同法；浏览器语义：blur 时 activeElement 已换新，比查
  document.activeElement 更确定、jsdom 也好模拟）；焦点落面板内 = 保留开。
  **element blur 不武装修复性焦点吞咽（与 Tooltip 不同）**：面板内部导航是
  合法 blur，且组件自己的收焦重聚焦不可被吞。失窗（window blur /
  visibilitychange hidden）仍武装一次性吞咽 + 取消一对挂起计时器
  （Tooltip tab 往返纪律的同款）；真实输入（document 捕获 pointerdown/
  keydown）解除武装。
- 关闭渠道统一走 `useDismissible`；`closeOnScroll`（默认 false）=
  显式退出，默认跟随 autoUpdate。

## 焦点机（同一 hook 内，独立效果节）

- **开焦预约 = pending ref + 面板 ref 回调执行**：click 开时 effect 仅写
  预约位；面板门户节点**晚一拍**才挂（Popup presence 是被动 effect
  tick），被动 effect 此刻读 ref 必空——ref 回调 `setPanelRef`
  （经 Popup 的 useImperativeHandle 转发，节点一挂即叫）执行预约：
  `getFocusableElements(node)[0] ?? node`。退出窗口内重开（同一节点不重叫
  回调）由预约 effect 直接补焦。hover/manual 永不抢焦（指针交互不偷键盘）。
- **Tab 圈（全程显式步进 + preventDefault，不依赖浏览器默认 Tab）**：
  面板持焦时 Tab/Shift+Tab 在 harvest 内 (%) 循环回卷；harvest 空 =
  面板自身收容；焦点在面板内但不在 harvest（奇异）＝拉回首项。**trigger
  上的前向 Tab 溜进面板**（门户挂 document 末尾、自然 Tab 序够不着，
  首项步进；Shift+Tab 从 trigger 属页面自己的事）。harvest 判定 =
  `getComputedStyle` 的 display/visibility（浏览器语义：display:none 元素
  focus() 是 no-op，故选器+计算样式正是「浏览器真实拒绝聚焦」的属性集；
  不用 getBoundingClientRect——jsdom 恒 0×0 会令纯文本面板误吞）。
- **关窗回收**：Escape handler 面板内部焦点先回 trigger（dismissible 随后
  关）；其余关闭（外点/滚动/失窗）在仍持焦且焦点尚在面板内时回焦点给
  trigger——**真实浏览器中外点关时焦点已随 pointerdown 落到被点元素**
  （浏览器 default），回收 effect 判 activeElement 已在面板外自然跳过 =
  外点不偷焦点；jsdom 不模拟 pointerdown 移焦，此承诺探针验证。

## 注入面（零容器的代价摊平）

`resolvePopoverTriggerSurface` 装配克隆面：trigger 自身词赢过 root
passthrough；`className` 拼接、`style` 按 key 作者优先、作者事件链在
库面之后（库先作者后）、aria 接线如上；ref 三向合一（内部 triggerRef +
转发 ref + 作者原 ref）。trigger 无 DOM 承载为 Boundaries 记录的真实限制，
不注入隐形 span。

## 视觉层（按 placement 贴边）

- **表面 = 实底不透明卡片（对齐拍板：半透明不入卡片）**：
  `--colox-popover-fill: var(--colox-color-bg-default)`（dark 主题自动
  翻 gray-900）+ **无边框** + `--colox-radius-lg`（8px）——长文交互面
  需满对比度；边框会带来箭头-边框接缝难题（AntD 无边框先例）。文字随
  text-default。
- **深度 = panel 级 union drop-shadow（Tooltip 标定单轮）**：
  `drop-shadow(0 4px 6px rgba(25,25,25,0.10))`——主色 = 设计语言阴影
  主值 rgba(25,25,25,0.10)（token 发射集无裸色条目，抄主色进组件私有
  变量 `--colox-popover-shadow-color`；Tooltip 同源配方）。卡片+突起
  箭头半一次剪影，偏移随 `data-placement` 前词旋转（top→(0,+) / bottom→
  (0,−) / left→(+,0) / right→(−,0)）——阴影坐在箭头侧缝隙，面板朝
  触发物倾斜（Tooltip 方向纪律延伸）。**校准修正（用户报「箭头与内容
  容器之间有缝」）**：首版 `--colox-shadow-lg` 双层折叠（±10px/14px +
  ±4px/5px）把暗质（近边 alpha ≈0.16）堆在面板边缘整条像素带上，
  白色箭头戳穿暗带、白色卡片被暗带包住底缘 = 一道可见的缝；像素探针
  （箭头中心/离箭头 60px/无箭头面板三通道全宽剖面）实测边缘带 ~11%
  暗度、卡片第一行纯白——改 Tooltip 同标定（4px/6px/单轮 0.10）后
  同一剖面 ~4% 柔晕。Tooltip 的同一暗带藏进自己深色剪影所以无感，
  白卡片世界必须轻铸。
- **箭头 = 旋转菱形零裁剪（Tooltip 配方原样复用）**：旋转 ±45/±135°
  不透明方块（边 = 深度 × √2，深度 spacing-2 8px——卡片比提示层大一号），
  **上半埋进卡片下**（DOM 序 [arrow, content]，panel 的实底背景盖住埋藏
  半——不透明填色下埋藏半完全隐形），对角线硬停渐变只涂外半，**只圆突出
  尖角**（`border-radius: 0 0 radius-xs 0`，基座两角直角）。填充 =
  `--colox-popover-fill`（同面板实底，palette 同源一处换两色)。钉
  `--colox-floating-arrow-offset`（clamp 防出界），四 placement 同一条
  局部渐变配方随旋转服务。
- **宽度 = 内容固有（无 size 轴，对齐拍板）**：作者 JSX 是宽度主人，
  固定档不匹配内容固有原则（DatePicker 先例）；上限归消费方 CSS 逃生舱。
- **进出场动画**：进场 fade + scale(0.92→1)（Panel 根上，覆盖 popup 自带
  translateY 微升——结束帧 scale(1) 与 translateY(0) 同为恒等零跳变）；
  退场 fade（`forward` 持有透明至卸载）随 cdk 退出通道
  `POPOVER_EXIT=100`（= `--colox-motion-duration-fast` 运行时镜像，双数
  同行）。timing 全由 motion token 持有——reduced-motion 由 theme 门控
  零时长，组件零特判。

## cdk 升级（本批三处，picker 族零变化）

1. `Popup` 补 **additive 退出通道 `exitDuration`**（默认 0 = 现状同
   commit 卸载、零多余绘制帧；>0 = 关闭后保留挂载 exitDuration 毫秒 +
   `colox-popup--exiting` 类，计时器 cleanup 清除、期内重开复用同节点；
   SSR 安全 presence 初始 false）。Tooltip 同批顺接（`TOOLTIP_EXIT`=100

- 退出动画）——兑现「退场与 Popover 一起补」。

2. Popup 定位门 = `show`（presence && (exitDuration>0 || open)）：退场窗
   内定位流照常供水、面板原地淡出不落 0,0。
3. 其余（`fallbackPlacements`/`data-placement`/arrow-offset）皆为
   Tooltip 轮已有基建，零改动复用。**欠账**：trigger 面的
   `aria-haspopup/expanded/controls` 接线仍住组件层（rule of two 第三
   消费者提权 cdk）。

## 目录结构

```
popover/
├── popover.tsx               # 编排层：编译走查 + usePopover + context 值（含 setPanelRef/bridgeHandlers）+ 克隆注入 + Panel/Content 挂载
├── index.ts                  # 出口（Popover + usePopoverContext + 9 类型）
├── context/index.ts          # PopoverContext + defaultPopoverContextValue（no-op 默认，isDefault 标记）
├── hooks/
│   ├── use-popover.ts        # 表面机单源（可见性+焦点合一：三通道/指针桥/relatedTarget blur/失窗吞咽/dismiss/scroll 关/开焦预约/Tab 圈/关窗回收）
│   └── use-popover-context.ts # 受保护出口（Tooltip 副本文案形态）
├── children/
│   ├── trigger/index.tsx     # 声明槽（渲染 null；host 由 root 编译捕获再克隆）
│   ├── title/index.tsx       # 声明槽（渲染 null；children 被 root 抽取成面板标题行）
│   └── content/index.tsx     # 内容载具（读 context 自持面板 DOM，className/style 逃生舱落内容盒）
├── controls/panel.tsx        # 双形态共享面板单元（Popup role=dialog/tabIndex=-1 + exitDuration + [arrow, title?, content]）
├── types/                    # 按层分桶：component/children/context/controls/hooks/utils + index 桶
├── constants/
│   ├── position.ts           # 浮动 gap 字面量对（8/6 = spacing-2/1-5 的运行时镜像，cdk 读 px）
│   └── behavior.ts           # POPOVER_DELAY {in:300,out:100}（out=指针桥）+ POPOVER_EXIT 100（motion-fast 镜像）
├── utils/
│   ├── leaves.ts             # 编译走查：双通道裁决/硬错误/宿主抽取（trigger/title/content 三部分）
│   ├── focusables.ts         # 键盘聚焦 harvest（FOCUSABLE_SELECTOR + getComputedStyle display/visibility 过滤）
│   ├── resolve-fallback-placements.ts # placement → 对侧优先翻转链
│   ├── resolve-gap.ts        # 箭头开关 → gap 裁决
│   ├── resolve-has-content.ts # 双通道内容在场裁决（机器 hasContent 门 + ARIA 面）
│   ├── resolve-trigger-surface.ts     # 零容器注入面装配（合并/串联/haspopup/expanded/controls/ref）
│   └── refs.ts               # assignPopoverRef（函数/对象 ref 分配）
├── variants/                 # cva 单轴：arrow.ts（真→ colox-popover__panel--arrow）+ index.ts
├── styles/                   # base/arrow/animation + index.scss @use 聚合；阴影=panel 级 union drop-shadow（base.scss，方向随 data-placement，Tooltip 标定单轮）
└── _tests/                   # 47 例：静态面/编译硬错误/三通道/指针桥/失窗吞咽（element blur 不武装）/焦点机（预约/Tab 圈/Escape/回收/窗口期重开）/退场窗/串联序/类映射
```

## 边界

- **trigger 必须收 ref**；无 ref 承载不注入隐形 span（Tooltip 同款）。
  disabled 原生控件吞指针事件（click 通道路)。
- **无 `defaultVisible`**：click/hover 纯展示通道无需首显词；manual 受控。
- **宽度内容固有**：无 size 轴，上限归消费方 CSS。
- **欠账记录**：rule of two 第三消费者（Modal 候选）到来时把 trigger 面
  aria 接线提权进 cdk；退场与 Popover 同批已补齐（Popup 退出通道 +
  Tooltip 顺接）。
