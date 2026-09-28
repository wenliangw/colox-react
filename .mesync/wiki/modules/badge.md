# Badge 模块

## 职责

`@colox/react` 的**纯展示徽章家族**——吸收 Tag 职责（独立 pill 由 Badge 根承载，Roadmap 里不再单独做 Tag）。**锚定不内置**：`Anchor`（inline 抱紧 = badge 包壳）+ `Positioner`（九格 placement + **数字 offset 逃生舱**）组合钉到宿主角落——**负数字 offset 悬出**（badge 越过宿主边界、中心对准角落，经典 badge 形态不遮挡宿主；Positioner offset 数字逃生舱见 wiki/positioner.md，负 token 键方案被用户「你要准备扩展 Token 来支持负值吗？」否决）。五件 dot-part 家族（根 + `Object.assign` 挂载）：

- **`Badge`（根）**：独立胶囊，children 承载内容（文字/图标/任意节点）
- **`Badge.Dot`**：纯圆点（状态指示）——固定实色、无 strength 概念
- **`Badge.Count`**：计数胶囊——`count` + `overflowCount`（默认 99 → "99+"）+ `showZero`（默认 false，0 隐藏）；固定实底（计数徽标是填满的 pill）
- **`Badge.Group`**：无缝多段胶囊容器——inline-flex 行，**Compact 式逐成员圆角协调**（首段外角圆、末段外角圆、中间段全直、内角直），**容器不裁剪**（成员自己的边框/ring 完整可见，outline variant 不被吃）；**`rounded` 词**（默认 false）：默认外角 = 方块的轻圆角（radius-sm），`rounded` = 满圆（radius-full）胶囊
- **`Badge.Item`**：组内一段——radius-0 设计（容器裁剪圆角），每段独立 `palette`/`size`/`variant` 自由配色（shields.io 多段形态）

共享轴：`palette` 六族（gray/primary/info/error/warning/success，默认 gray 同 Button）+ `size`（sm/md/lg 紧凑胶囊刻度，比表单控件低一档——指示器非控件）。`variant`（solid/subtle/outline/plain，默认 solid）只作用于有面料强度的形态（根/Item）；Dot 固定实色、Count 固定实底。

## 设计要点

- **纯展示与定位分离**（化层分离品味）：Badge 不关心自己挂在哪——锚定是 `Anchor` + `Positioner` 的职责。设计对齐轮用户拍板「Badge 做纯展示，Positioner + Badge 实现锚定」。
- **形态家族走 dot-part 命名空间**（composition 判据新实例）：形态是**可扩展维度**——Badge/Dot/Count/Group/Item 各自 props 干净（Count 只有 count/overflowCount/showZero，Dot 只有 palette/size），比单组件判别 props（`<Badge kind="count">`）可扩展（用户原话反向应用：属性多影响代码体验，这里形态多同理）。**不同于**「属性少收根 props」的插槽类（Input leading/trailing）。
- **无缝多段 = Compact 式逐成员圆角协调**（用户提示「Badge.Group 的实现是不是可以参考 Compact」，首版「容器 overflow hidden 裁剪」被目视逮住 outline 边框在圆角处缺一截）：Group 容器不裁剪，首段 `border-start-start/end-start-radius`、末段 `border-start-end/end-end-radius`、中间段全直——成员保留自己的边框/背景，outline variant 完整可见；单子件 = first+last = 全圆角（读作独立胶囊）。实底段无边框、背景连续，接缝天然无缝，无需 -1px 拉回。**圆角档由 `rounded` 词驱动（用户拍板「rounded 的时候才设置圆角，默认是方块的轻圆角」）**：默认外角 radius-sm（方块的轻圆角），`rounded` = radius-full 满圆胶囊——多段徽标默认读作轻圆角方块拼段，胶囊形态显式选。
- **Count 无 variant 轴**（固定实底）：计数徽标是填满的 pill，「变体决定颜色不留给语境猜」——计数没有强度可选。Dot 同理（点是实点）。
- **胶囊 size 刻度比控件低一档**：sm=size-5(20px)/md=size-6(24px)/lg=size-7(28px)，font-xs/sm；Dot 足迹 size-2/2-5/3（8/10/12px）。
- **可达性**：胶囊/计数/段文本即内容（宿主作者并入 aria-label 或徽标自持）；Dot 默认装饰（作者 aria-label/aria-hidden）。

## 实现结构

```
packages/components/src/badge/
├── badge.tsx                # Badge 根（胶囊渲染 + Object.assign 挂四件）
├── index.ts                 # barrel：Badge + 类型 + 四组 cva
├── children/                # dot/count/group/item 每件一文件夹（自渲染件，非声明件）
├── types/                   # 五件 Props 契约
├── variants/                # palette.ts（六族）/ size.ts（胶囊+dot 两刻度）/ variant.ts（四档）/ index.ts（badge/dot/count/item 四组 cva）
├── styles/                  # base（共享排印+私有变量+四形态基座）/ size / variant / palette / group（文档化意图）/ index
└── _tests/badge.test.tsx
```

## 样式约定

- 共享胶囊排印（`.colox-badge`/`.colox-badge-count`/`.colox-badge__item` 同组）：inline-flex + 居中 + font-weight-medium + line-height 1 + nowrap。
- palette 类（`colox-badge--gray` 等）只设私有变量族（`--colox-badge-palette-*`），base 落 brand fallback——与 Avatar/Button 家族配方同构。
- 组内段 radius-0 由 `.colox-badge__item` 定义；首末段外角圆角协调写在 group.scss（`.colox-badge-group > .colox-badge__item:first/last-child`），容器不 overflow 裁剪。

## 测试

19 例：**Badge 根**（默认档/轴类/passthrough+ref）；**Dot**（默认档/轴类/aria+className）；**Count**（计数/99+ 截断/自定义 overflow/等于上限不截/0 隐藏/showZero/轴类）；**Group+Item**（无缝容器结构/逐段独立配色/逐段 size/组 passthrough）；**组合**（五件挂载/Anchor+Positioner 锚定冒烟）。

## 变更

- 2026-11 Badge.Group 补 **`rounded` 词**（用户拍板）：默认外角 = 方块的轻圆角（radius-sm），`rounded` = 满圆胶囊（radius-full）——「rounded 的时候才设置圆角」。测试 +2（默认无 --rounded 类 / rounded 有）。story/docs 展示两种形态。

- 2026-11 修复轮（用户目视两处）：① Group 第三示例 outline 段边框在圆角处缺一截——容器 `overflow: hidden` 裁剪吃掉成员边框，改 Compact 式逐成员圆角协调（用户提示参考 Compact）；② Anchoring 示例 badge 盖住头像——Positioner placement 是盒内锚点语义，加 **Positioner 数字 offset 逃生舱**（负值悬出），示例与 docs 改用负数字 offset。

- 2026-11 Badge 首版交付（M5 二件）。设计对齐两轮：① 初版按 antd/MUI「锚定指示器」提四角 corner 方案，用户拍板**纯展示 + Positioner 锚定**（「我们其实已经有了 Positioner」）、Tag 不做、Badge 多样化；② 形态家族走 **Badge/Badge.Dot/Badge.Count** dot-part（用户点名「可以扩展更多形态」），Label/Value 双段专用形态被用户改判为 **Badge.Group + Badge.Item** 通用多段（「不要分开，做成一个 Badge.Group，Badge.Item 可以进行多个 Badge 的组合，覆盖双端徽标甚至多段徽标，每个 Badge.Item 还可以定制颜色自由组合」）；Group 无缝一体（用户拍板，非并排）。默认 gray 同 Button（用户拍板）、有 size 轴（用户拍板）。
