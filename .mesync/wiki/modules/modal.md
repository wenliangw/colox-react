# Modal 组件

## 职责

**模态对话框**——cdk `overlay`（全屏覆盖层）家族的首个消费者，与
cdk `floating`（锚定浮层：Tooltip/Popover/picker 面板）划清边界：
Modal 无 trigger、无 reference、无碰撞数学，**定位 = 纯 CSS flex 居中
零 JS 测量**（overlay 容器 fixed inset:0 flex 居中，面板为 flex 子项），
不消费 floating-ui。全屏覆盖层家族共享基建进 `cdk/overlay`（`Overlay`
载体 + `Backdrop` 遮罩），Drawer 将复用。

**纯组合式 API（无 props 形态）**：`<Modal visible>` + `Modal.Title` /
`Modal.Content` / `Modal.Footer` dot-part——内容型组件三段结构命中「内容
必须在树中」判据，无需浮层族双通道硬错误机制；但**普通子元素（非三部分）
与重复部分仍是编译期硬错误**（`utils/leaves.ts` 走查，Select.Option
模式）。**无 `defaultVisible`**（浮层族纪律：恒受控，`visible` /
`onVisibleChange` 词族）。

## 结构

- **root**（`modal.tsx`）：编译三部分 → `Overlay`（`open={visible}` +
  `exitDuration=MODAL_EXIT(100)`）→ `Backdrop`（`showMask` 默认 true，
  色 = `--colox-palette-black-500` rgba(0,0,0,0.5) 设计语言黑阶梯真实档，
  **无 blur**；`closeOnMaskClick` 默认 true 时 onClick 关）→ 面板 div
  （`role="dialog"`、`tabIndex=-1`、`aria-labelledby` 指标题、`modalVariants
({size})`）。**DOM 序 [title, content, footer, close]**——close 按钮
  绝对定位右上、**DOM 末尾**（初始焦点落正文首项而非 X）。
- **close 通道**：`showClose` 默认 true（右上角 X——**复用 IconButton
  muted 变体**：reset/hit shape/focus ring/hover 反馈/静音图标色调全骑共享
  基座，站点类只留绝对定位 + spacing-2 padding 扩热区；`onVisibleChange
(false)`）+ Escape 默认关（useTrap onEscape）+ 遮罩点击（`closeOnMaskClick`
  默认 true）。
- **size 轴 = 宽**：sm/md/lg → `--colox-size-112`(448px) /
  `--colox-size-160`(640px) / `--colox-size-192`(768px)——**large_size
  WIDTH_HEIGHT scope 真实档，不造数值**（用户拍板）+ `width` 逃生舱 prop
  （数字=px，字符串=任意 CSS 长度）。
- **焦点 = 共享 `cdk/hooks/useTrap` 严格模式**（无 triggerRef）：Tab 圈
  不出面板、杂散焦点拉回；`aria-modal`；`initialFocus`（默认 'first' =
  首可聚焦/否则面板自身，'container' = 面板）；关窗归还打开前
  activeElement（无 trigger 可归还）。**滚动锁默认开**（
  `cdk/hooks/useScrollLock`，body overflow hidden 期间）。
- **z-index**：`--colox-z-overlay: 1100`（popup 1000 之上）。
- **视觉**：面板 = 实底 `--colox-color-bg-default`（dark 自动翻）+ radius-lg
  无边框 + 面板级 union drop-shadow（主层 alpha 0.10 抄进私有变量
  `--colox-modal-shadow-color`，无自造补偿数值；方向中性不随箭头——
  无箭头）；max-height `calc(100vh - 2×spacing-6)` + **面板 flex column、
  仅 Content 滚动**（Title/Footer `flex: none` 固定，Content `flex: 1 +
min-height: 0 + overflow-y: auto`——滚动区域归属内容体，标题与操作栏
  永远在折内，用户拍板修正「整面板滚动」）；**滚动条吃右侧 padding 的
  问题已轻量解决**（`.colox-modal__body` 加 `scrollbar-gutter: stable
both-edges`：滚动条走自己的 gutter 槽位——边框|滚动条|padding|内容，
  both-edges 保证左右对称；只解决占位，滚动条样式与滚动加载/动态加载
  仍收进 ROADMAP M8 ScrollView 统一做）；进场 fade+scale / 退场 fade
  （`MODAL_EXIT`=100 走 overlay 退出通道，遮罩独立 fade）。

## 目录结构

```
src/modal/
├── modal.tsx            # root 单文件：编译三部分 + Overlay/Backdrop + 面板装配 + Object.assign 挂三 part
├── children/
│   ├── title/index.tsx  # 声明槽（渲染 null；children 被 root 抽取成标题行 + aria-labelledby 接线）
│   ├── content/index.tsx# 声明槽（渲染 null；children 成正文——唯一滚动区）
│   └── footer/index.tsx # 声明槽（渲染 null；children 成底栏）
├── utils/leaves.ts      # 编译走查：抽取 title/content/footer + 重复/普通子元素硬错误
├── variants/
│   ├── size.ts          # sm/md/lg → colox-modal__panel--size-{sm,md,lg}
│   └── index.ts         # modalVariants cva（size 单轴）
├── constants/behavior.ts# MODAL_EXIT=100（motion-fast 镜像）+ MODAL_GUTTER=24
├── styles/              # base（面板面/padding/close 绝对定位）/size（width token）/animation + index.scss
├── types/               # component（ModalProps/ModalRef/Resolved）/children（三 part props）/index
└── _tests/              # 27 例：编译硬错误/渲染结构/三档尺寸/width 逃生舱/关闭通道（X/Escape/遮罩/closeOnMaskClick=false/面板内点击不关/退场窗卸载）/焦点（初始/container/无焦点项落面板/Tab 圈不逃逸/关窗归还/aria-modal 置清）
```

## 边界

- **纯组合式、恒受控**：无 props 形态、无 defaultVisible；普通子元素 =
  硬错误（内容型组件三段结构不硬套浮层族双通道）。
- **遮罩点击与面板点击**：Backdrop 是面板兄弟（面板在上），点面板不命中
  遮罩 → 不关。
- **初始焦点永远不落 close 按钮**（DOM 末尾的绝对定位 chrome）。
- **焦点归还**：关闭时若无先前焦点元素则落 body（浏览器 default）。
- **欠账**：嵌套 Modal / 可拖拽 / 可调整大小 / 命令式 confirm 无真实消费
  方不做；Drawer 到来时复用 cdk/overlay（遮罩/滚动锁/载体）+ useTrap
  （软模式带 triggerRef）。
