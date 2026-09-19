# Positioner 模块

## 职责

`@colox/react` 的**定位机制**（布局三机制件第三件：flexbox=`Stack`、grid=`Grid`、定位=本模块；`Container` 保留唯一语义壳）。**两个名字、一角色各一**（同一模块具名导出，仿 Radio/RadioGroup 先例）：

- **`Anchor`（参照框）**：`position: relative` + `display: block` 的布局中立盒——它里面的盒以它的盒为参照；`inline` 抱紧内容（badge 包壳）。
- **`Positioner`（被定位盒）**：脱流、shrink-wrap 子件、钉到参照盒的锚点——`absolute`（默认，对最近定位祖先）/`fixed`（对视口）。**被定位盒本身也是 containing block**，所以嵌套帧不需要第二个 Anchor。

纯 CSS、零 JS 测量、无 portal、无 dot 件。

## 设计要点

- **命名描述职责**：`Anchor` = 参照（与 CSS Anchor Positioning 的用词一致：参照元素就叫 anchor）；`Positioner` = 定位动作本身。两件**角色不重叠**：框永远 relative，被定位盒永远 absolute|fixed，词表各自独立——**不用读写 `position` 去猜谁是参照**。
- **组合模型 = 嵌套**（两次改判的收敛）**：先去掉 `Positioner.Item`（被定位件与嵌套 Positioner 同构，dot 件与克隆契约都是纯增负担），再把框与被定位盒**分成两个名字**（用户指正「同名嵌套几层，语义结构很差」）——层数不变（真实用法 2 层），但 JSX 读得出角色。
- **类型天然分层**（分名字的副产品）：`inline` 只在 `AnchorProps`、锚点词表只在 `PositionerProps`，非法组合是**编译期错误**；先前把两角色塞进一个组件时需要的 union + 类型谓词判别（`is-positioned-box`）**随之删除**——不再需要运行时判别。
- **placement 九格锚点**：`top-start | top | top-end | start | center | end | bottom-start | bottom | bottom-end`。**块轴物理词 top/bottom（不镜像），行内轴逻辑词 start/end（RTL 安全）**；边中与居中用**独立 `translate` 属性**（尺寸无关、不碰消费方 transform）。`fill` 独立 boolean（`inset: 0` 覆盖预设）。
- **offset 语义**：只收 spacing token 键（spacingKeys 单源）；**裸键 = 离「placement 所钉边」的距离**（无 placement 时四边全给；`center` 无钉边 → 裸键无效果）；**对象 = 逐边声明**且**命名即钉**（未钉方向的边也参与——双端锚定/拉伸是 CSS 忠实逃生舱，需该轴尺寸 auto）。
- **层叠序**：`position` 轴 → `placement` → `offset`（显式 offset 总压过锚点调整）；`fill` 与 placement 同用时 fill 覆盖四边（CSS 源序）。
- **框的盒型**：`Anchor` 默认 `display: block`（CSS 忠实）；`inline` = `display: inline-block` **+ `width: fit-content`**——flex/grid 子项会把 inline 盒 blockify，单靠 inline-block 在列向 flex 里被 stretch 拉满（探针实测 84px 按钮的壳被拉到 736px），fit-content 让抱紧跨父布局成立。
- **页面级固定**（`position="fixed"`）：视口参照、不需要 Anchor；四个坑写进文档——① 祖先有 `transform`/`filter`/`contain`/`will-change` 会成为 fixed 的 containing block（视口参照静默失效，库自身浮层同吃）；② fixed 不被滚动容器裁剪（页面级层正需要，「钉在滚动容器内部」归 sticky）；③ 定位盒创建层叠上下文、z 轴归消费方；④ DOM 顺序不变。
- **边界（文档写明）**：不做「跟随锚点/翻转/边界避让/出 overflow portal」（归 cdk/floating 的 Popup + useFloatingPosition）；**不做 sticky（吸顶/吸底）**——absolute 脱流无吸附，且 sticky 的 inset 落在元素自身（与 `placement`/`offset` 的语义两套），归属见 delivery「ScrollView + 吸顶归属欠账」；不做 flex/grid 容器（要流式排布请组合 Stack/Grid）。

## 实现结构

```
packages/components/src/positioner/
├── positioner.tsx              # Positioner（被定位盒）：接 props → splitOffset → clsx(positionerVariants) 组装（渲染体只编排）
├── index.ts                    # 公共 barrel：Positioner + cva + 类型（Anchor 已独立成组件，见 modules/anchor.md）
├── types/                      # 契约集中：component.ts（PositionerProps / 轴与词表）+ utils.ts（resolver Params/Result）+ index.ts
├── utils/split-offset.ts       # splitOffset：裸键→所钉边 / 对象→逐边
├── variants/                   # position.ts（absolute|fixed）placement.ts（九格）offset.ts（4 边 × spacingKeys）index.ts（positionerVariants + anchorVariants）
├── styles/                     # positioner.scss（absolute|fixed）+ placement.scss（九格 + fill）+ offset.scss（@each 四边族）+ index.scss（@use 聚合）
└── _tests/positioner.test.tsx
```

## 样式约定

- 全部用逻辑属性：`inset-block-start/end`、`inset-inline-start/end`；块轴物理词只出现在 prop 词表里。
- 边中/居中的平移用**独立 `translate` 属性**（`translate: -50% 0` 等），不用 `transform`。
- 类名：`colox-anchor`（+ `--inline`）、`colox-positioner`（+ `--position-absolute|fixed`、`--placement-{word}`、`--fill`、`--offset-{top|bottom|start|end}-{key}`）；offset 族由 `@each $key in tokens.$colox-spacing-keys` 发射（4 边 × 21 键），与 Stack gap / Container gutter 同源写法。

## 测试

25 例：**Anchor**（默认档 / inline / className+rest+ref / 不带定位词表）；**Positioner**（默认 absolute / fixed / 九格逐一 / fill / 无 placement 无锚点类 / offset 四语义 / fill+offset 组合 / className+style+aria+ref）；**两者组合**（被定位盒嵌在框内、被定位盒自身当框再用）。

## 变更

- 2026-10 Positioner 首版交付：三机制件收官（flexbox/grid/定位）。API 对齐逐问定案——position 轴、`inline` 抱紧、placement 九格、offset 四向词表（否决物理 left/right，RTL 安全）+ 字符串简写、未钉方向的边允许（CSS 忠实拉伸）、prop 名 `offset`、边界（无测量/portal/z 轴）。
- 2026-10 组合模型第一次改判（N 方案）：去掉 `Positioner.Item` dot 件——根自定位后 Item 与嵌套 Positioner 同构，dot 件只剩克隆契约的负担；改为一个组件、嵌套即多件 + union 类型分层（运行时靠类型谓词判别）。
- 2026-10 组合模型第二次改判（用户指正「Positioner 里套 Positioner 的语义结构很差」）：**拆成两个名字**——`Anchor`（参照框）与 `Positioner`（被定位盒）。层数、DOM、定位语义全不变，改变的是**可读性**：谁提供参照、谁被定位从名字直读；`inline` 与锚点词表分居两件后，**union 与类型谓词判别整体删除**（类型天然分层）。
- 2026-10 `Anchor` 再提升为**独立组件**（用户追问「是否可以独立出来，而不是放在 Positioner 的 children 中」）：`children/` 只装 dot part（`Select.Option`/`Radio.Group`），平级搭档件走自己的组件槽位 → `src/anchor/` 独立目录 + `@colox/react/anchor` 入口 + 独立 story/docs/组件地图行（决策 2982693a）。本模块只剩 Positioner；类名与探针结果不变。
