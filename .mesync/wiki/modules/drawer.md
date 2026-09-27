# Drawer 组件

## 职责

**边缘锚定滑动面板**——cdk `overlay`（全屏覆盖层）家族的第二个消费者
（Modal 的兄弟）。与 Modal 同族同机制（同一载体/遮罩/严格 trap/滚动锁），
差异只在**锚定边缘**：Modal 居中、Drawer 贴边滑出——**定位 = 纯 CSS
absolute 贴边**（面板 absolute 对 fixed overlay，无 floating 数学，无
trigger/reference）。

**纯组合式 API（无 props 形态）**：`<Drawer visible>` + `Drawer.Title` /
`Drawer.Content` / `Drawer.Footer` dot-part——同 Modal 三段结构命中「内容
必须在树中」判据；**普通子元素与重复部分 = 编译期硬错误**（`utils/leaves.ts`
走查）；**无 `defaultVisible`**（恒受控，`visible` / `onVisibleChange` 词族）。

## 结构

- **root**（`drawer.tsx`）：编译三部分 → `Overlay`（`open={visible}` +
  `exitDuration=DRAWER_EXIT(200)`）→ `Backdrop`（`showMask` 默认 true，
  `closeOnMaskClick` 默认 true）→ 面板 div（`role="dialog"`、
  `tabIndex=-1`、`aria-labelledby` 指标题、`drawerVariants({ direction,
size })`）。**DOM 序 [title, content, footer, close]**——close 按钮
  绝对定位右上、**DOM 末尾**（初始焦点落正文首项而非 X）。
- **direction 轴（词 = direction 非 placement）**：`'left' | 'right' |
'top' | 'bottom'` 默认 `right`——用户拍板把 placement 改 direction：
  placement 是浮层相对定位术语（相对 trigger 放置），Drawer 无 trigger，
  direction 表达「从哪个边缘滑出」（行为词按机制语义命名，usePresence
  先例同向）；物理词 left/right/top/bottom 是方向词不是对齐词（生态
  antd/MUI/Chakra 全用）。
- **size 轴 = 内容的空间（主轴尺寸）**：`left/right` 时 size 控宽、
  `top/bottom` 时 size 控高——**同一档位值双向对称生效**（用户拍板
  「size 指的应该是内容的空间」）；sm/md/lg → `--colox-size-80`(320px) /
  `--colox-size-96`(384px) / `--colox-size-112`(448px)——large_size
  WIDTH_HEIGHT scope 真实档（同一 token 集宽高双适用，无独立高度档），
  不造数值；逃生舱按方向分 `width`（left/right）/ `height`（top/bottom），
  数字=px，覆盖档位——「档位管语义、逃生舱管精确」。
- **close 通道**：`showClose` 默认 true（右上角 X——**复用 IconButton
  muted**，站点类只留绝对定位 + spacing-2 padding 扩热区）+ Escape 默认关
  （useTrap onEscape）+ 遮罩点击（`closeOnMaskClick` 默认 true）。
- **焦点 = 共享 `cdk/hooks/useTrap` 严格模式**（无 triggerRef）：Tab 圈
  不出面板、杂散焦点拉回；`aria-modal`；`initialFocus`；关窗归还打开前
  activeElement。**滚动锁默认开**（`useScrollLock`）。
- **视觉**：面板 = 实底 `--colox-color-bg-default` + **贴边侧直角、对侧
  圆角**（radius-lg——面板读作「从屏幕边缘滑出」而非「浮在屏前」）+ 面板级
  union drop-shadow（主层 alpha 0.10 抄私有变量 `--colox-drawer-shadow-color`）；
  面板 flex column 全高/全宽、仅 Content 滚动（Title/Footer `flex: none`，
  Content `flex: 1 + min-height: 0 + overflow-y: auto` + `scrollbar-gutter:
stable both-edges`——滚动条占位同 Modal 轻量解）。
- **进出场 = 方向性滑动**：left→-100%、right→+100%、top→-100%、
  bottom→+100% translate 滑入（enter）+ 同向滑出（exit），走 cdk overlay
  退出通道（`DRAWER_EXIT`=200 镜像 motion-normal——大幅平移比 Modal 的
  100ms fade 长）；遮罩独立 fade。
- **z-index**：`--colox-z-overlay: 1100`（overlay 载体自带）。

## 目录结构

```
src/drawer/
├── drawer.tsx            # root 单文件：编译三部分 + Overlay/Backdrop + 面板装配 + Object.assign 挂三 part
├── children/
│   ├── title/index.tsx   # 声明槽（渲染 null；children 被 root 抽取成标题行 + aria-labelledby 接线）
│   ├── content/index.tsx # 声明槽（渲染 null；children 成正文——唯一滚动区）
│   └── footer/index.tsx  # 声明槽（渲染 null；children 成底栏）
├── utils/leaves.ts       # 编译走查：抽取 title/content/footer + 重复/普通子元素硬错误
├── variants/
│   ├── direction.ts      # left/right/top/bottom → colox-drawer__panel--direction-{...}
│   ├── size.ts           # sm/md/lg → colox-drawer__panel--size-{sm,md,lg}
│   └── index.ts          # drawerVariants cva（direction + size 双轴）
├── constants/behavior.ts # DRAWER_EXIT=200（motion-normal 镜像）
├── styles/               # base（面板面/三区/close）/size（宽高 token 同档）/direction（贴边锚定+交叉轴 auto+圆角）/animation（方向性滑动）+ index.scss
├── types/                # component（DrawerProps/Ref/Direction/Size/Resolved）/children（三 part props）/utils（CompiledLeaves）/index
└── _tests/               # 29 例：编译硬错误/渲染结构/direction 锚定/size 内容空间（宽高双向）/width+height 逃生舱/关闭通道/焦点全案/退场窗
```

## 边界

- **纯组合式、恒受控**：无 props 形态、无 defaultVisible；普通子元素 =
  硬错误（同 Modal）。
- **size 双向对称**：size 轴与 direction 轴正交——left/right 是宽、
  top/bottom 是高，同一档位值，无「某方向 size 失效」的隐藏例外。
- **级联顺序**：styles/index.scss 按 base → size → direction → animation
  加载——direction 的交叉轴 `width: auto` / `height: auto` 必须在 size
  之后（否则档位的交叉轴值会赢过贴边锚定）。
- **欠账**：嵌套 Drawer / 可拖拽 / 可调整大小 / 多实例聚合 / closeIcon
  定制无真实消费方不做（对齐轮范围外）。
