# Empty — 空状态占位块

## 定位

Empty 是「这一块没有内容」的版面状态件：居中图 + 标题 + 描述 + 可选动作，告诉读者这里没东西、以及可以做什么。它是**页面级状态**，不是瞬时消息（Toast/Notify）也不是流内状态（Alert）——静态展示：无事件、无状态、不可关闭。

## API

```ts
type EmptyType = 'empty' | 'search' | 'error';
interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  type?: EmptyType; // 'empty'（默认）
  figure?: ReactNode; // 覆盖内置图
  title?: ReactNode; // 主行
  description?: ReactNode; // 副行（可选）
  action?: ReactNode; // 底部动作（可选）
}
```

- **`type` 三场景选内置场景插画**：`empty` 文件夹+飘出的数据页（蓝橙）/ `search` 放大镜悬停漂浮文档（绿蓝）/ `error` 环星行星+月亮（红橙）——**组件私有多色氛围场景插画**，每场景自带一组氛围色系，全部骑主题 token（浅深自适应）；图是**纯氛围绘画**（无标签、无交互），语义色仍归 `title`/`action` 消费者自述。题材贴主题元素：空数据→文件/文件夹/数据；加载失败→服务异常、远距宇宙元素（星球/星系/月亮），不直白复刻现实。
- **`data-scene` 钩子**：figure 包裹层标记 `data-scene={type}`（empty/search/error），消费方可用 CSS 按场景对内置图做皮肤化调整（`[data-scene="error"] svg`）。
- **`figure` 自由覆盖**：自定义 SVG/图片/任意 ReactNode 完全替代内置图，自管语义。词 = `figure` 非 `image`/`illustration`（用户评「image 语义不好」后拍板）：`image` 暗示只收图片文件，而槽的实际形态是任意 ReactNode；`figure` 与内部 `__figure`/「内置场景图」术语一致，HTML `<figure>` 同源，图/标题/描述/动作四件套读起来顺。
- **三个文字槽都是 ReactNode**：`title` 是主行，`description`/`action` 可选。`title` 用 `Omit<HTMLAttributes, 'title'>` 顶掉原生 `<div title>` 工具提示以承载富标题——Input 撞原生 `size` 时 `Omit` 覆盖的同法（api-design 先例）。
- **免 size 轴**：图径走 `--colox-size-20`（80px）token（场景插画需要比 48px 图标更大的画布），间距走 spacing token（size 轴仍无真实消费场景不立项）。

## 组成

```
empty/
├── empty.tsx                 # Empty 根（forwardRef）：type→插画映射 + data-scene + 三槽渲染
├── presentations/
│   ├── empty.tsx             # EmptyDataFigure 文件夹+数据页场景（蓝橙氛围；飘出页带迷你柱状图）
│   ├── search.tsx            # SearchEmptyFigure 放大镜+漂浮文档场景（绿蓝氛围）
│   ├── error.tsx             # ErrorEmptyFigure 环星行星+月亮场景（红橙氛围；轨道虚线+星野）
│   └── index.ts
├── index.ts                  # 出口：Empty + EmptyProps/EmptyRef/EmptyType
├── types/
│   ├── component.ts          # EmptyRef/EmptyType/EmptyProps（Omit title）
│   └── index.ts
├── styles/
│   ├── base.scss             # colox-empty 居中竖排 + 图私有色板（中性层+场景色层）+ 槽节奏
│   └── index.scss
└── _tests/                   # empty.test.tsx（7 例）
```

## 实现结构

- **单件 props 形态**（Alert 同例：内容三件顺排、无 context、无 switch，不建 dot-part、不走纯组合式三通道）。
- **`EMPTY_FIGURES` 映射**：`Record<EmptyType, typeof EmptyDataFigure>` 把 scene 词映到插画组件，渲染 `{figure ?? <Figure />}`——`??` 此处正确（`figure` 的 null/undefined 都表示「缺省」，落入内置图，非数字控件的 null 陷阱）。figure 包裹层带 `data-scene={type}`。
- **插画经 font-size 定尺**：`.colox-empty__figure { font-size: var(--colox-size-20) }`，插画 `width="1em" height="1em"` + viewBox 160——足迹骑 theme token、不写死 px。
- **渐变 id 防撞车**：插画用到的 gradient 各用 `useId()` 派生 id（folder/glass/planet），一页多实例（同场景并排）绝不撞 id。
- **布局纯 flex**：根 `flex column` + `align-items center` + `text-align center`；figure 距标题 spacing-4、标题距描述 spacing-2、动作距描述 spacing-4。
- **可及性**：内置插画 svg `aria-hidden="true"`（装饰，含义在文字里）；标题元素归消费方（要真语义就传 `<h3>` 作 `title`）；根不加 role（静态块，消费方按需声明）。

## 样式约定

- **多色氛围场景插画配方（参考 Semi/Arco 的空状态插画气质；骨架仍自绘）**：统一的结构母题 = **前景主角 + 环境氛围**——① 前景物体（文件夹+数据页/放大镜+文档/环星行星+月亮）渐变面 + 圆角叠层；② 环境氛围层：两大色光晕（14% wash 混色圆）打底 + **克制的软圆点缀**（empty 三颗数据微粒 / error 一颗亮星 + 两颗软远星）——点缀**要少、要软**：实心圆低透明度（r≥3，不用 r≈2.5 的碎点、不用锐角星闪），80px 图面上散点密度一大就变视觉噪音（用户五轮点出「小元素太多」）；③ 底部渐变软影让主角「坐」在地上（太空场景不要软影——行星漂浮在轨道上，氛围该是失重的）。
- **场景色系 = Colox 设计语言色族，不是外来色**：empty=蓝+橙、search=绿+蓝、error=红+橙——palette 六族里各场景挑两个撞色族，深浅主题下族色自动换映射。**语义色仍归文字与动作**：插图颜色是「场景气质」（氛围绘画），不是「状态→颜色」的语义映射——error 场景有红橙暖调是气质，不替代 `title`/`action` 的文字语义。
- **图私有色板变量分两层**（挂在 `__figure` 作用域）：
  - 中性层：`--colox-empty-panel: bg-muted`（物体面）/ `--colox-empty-faint: color-mix(text-muted 22%, bg-muted)`（物体内细节——混色比直用 border-muted 好在两主题下都与 panel 可区分）/ `--colox-empty-shadow: text-subtle`（软影）；
  - 场景色层：`--colox-empty-wash-*: color-mix(solid-* 14%, transparent)`（14% 软光晕——不用带交互语义的 `-wash-active/hover` 状态 token，自造安静值）+ `--colox-empty-solid-*: var(--colox-color-*-solid)`（星闪/柱条/镜圈/行星/月亮）。
- **渐变 stop 直吃 token**：`stopColor="var(--colox-empty-*)"` 浏览器原生支持 CSS var，渐变也骑主题。
- **插画与图标的分界**（上轮定案延续）：`@colox/icons` 收 stroke 基础 glyph（制式八条 spec 门禁），空状态场景画是组件私有绘面、不进 icon 包。
- **`title` 撞原生属性走 `Omit` 而非改名或暴露原生语义**（api-design「Input size Omit」先例）：`title` 是生态空状态词，为保住富标题槽 `Omit` 掉原生 div tooltip。
- **`type` 是组件切换、非类修饰 → 零修饰轴不硬造 variants 层**：根类静态 `colox-empty` + className 尾部合并，`data-scene` 只做消费方皮肤钩子；Recipe 双形态的「无条件套用 variants」针对有多轴矩阵组件。

## 测试

7 例（`empty.test.tsx`）：figure 包裹层 data-scene 逐场景（empty/search/error）/ 默认渲染内置 svg / 内置插画 aria-hidden / figure 槽覆盖替换（无 svg）/ 三槽渲染 / 缺省槽不渲染 / className 合并 + 原生透传。

## 变更

- 2026-11 Empty 首版交付（M5 收官件）。用户提案「按场景提供一些内置图」——`type` 三场景定型。内置图首版走 icon 包线稿（新增 `IconInbox`），撞原生 `<div title>` 已按 api-design「Omit 覆盖」先例处理。
- 2026-11 用户评「空状态的图标太生硬了，找开源设计图参考」——二轮改判内置图为**组件私有软插画**（参考 antd Empty MIT 的填充软形/椭圆软影/圆角叠层手法，自绘三张中性色版：开盖空盒/放大镜空白卡/警示卡片），齐换主题自适应 token 色板；首版为 Empty 单拉的 line 图标 `IconInbox` 无消费者，按「遇到再加」从 @colox/icons 撤销归位（含 spec lint 表项回退）。
- 2026-11 用户「再丰富一些，变成多色的，有氛围的，甚至有丰富场景的」——三轮升级为**多色氛围场景插画**：三场景各配一组设计语言色族（blue/orange、green/blue、red/orange），统一「前景主角 + 环境氛围」母题（色光晕 + 星闪 + 圆点 + 渐变软影），viewBox 96→160、图径 48→80px（size-20），渐变 id 用 useId 防同页撞车，figure 加 `data-scene` 消费方皮肤钩子；「永不自动染色」改判为「场景气质多色、语义色仍归文字与动作」。
- 2026-11 用户「搜索的占位图定稿；空数据通常跟文件、文件夹、数据等相关，图的表达应该靠近这些元素；加载失败通常跟服务异常、可以跟星球、星系、月亮等离现实很远的元素靠近」——四轮改两场景题材：**empty** 空盒冒泡泡改判为**文件夹 + 纸上飘出的数据页**（文件夹：背板渐变 + 袋口 + 标签扣 + 槽内两页白纸；飘出数据页带迷你柱状图——「数据」字面表达；`EmptyBoxFigure` 随改名 `EmptyDataFigure`）；**error** 雷雨云压卡片改判为**环星行星 + 月亮 + 轨道虚线**（行星径向渐变红→14% 软光晕发光、半透明橙色环分背/前两条环带包住星球、小月亮骑在轨道虚线上、星野满天——服务异常读作「信号失联的星球」，远离现实；太空场景无地面软影）。search 定稿不动。
- 2026-11 用户「暂无数据和加载失败的小元素太多了，变得像视觉噪音」——五轮「去噪」：empty 的 4 尖星闪 + 4 碎点（8 件）砍成**3 颗软数据微粒**（实心圆低透明，一粒浮在数据页上方呼应、两粒压角落）；error 的 6 尖星闪 + 5 碎点 + 月亮陨坑（12 件）砍成**1 颗最亮星 + 2 颗软远星**（尖星闪只留最亮那颗当星野锚点，其余改实心圆 r=3-4，月亮去掉 r=2.2 的陨坑碎点）。点缀纪律：60px 级图面上，锐角星闪 ×4 + 碎点 ×N 是撒胡椒面；氛围要「少而软」的圆颗粒，宁可留白。
- 2026-11 用户评「image 这个语义是不是不太好」——自定义插图槽改名 `figure`（用户拍板三选一）：`image` 暗示图片文件、不带「插图位」语义，且槽实际收任意 ReactNode；`figure` 与内部术语（`__figure` 包裹层、内置场景图）、HTML `<figure>` 语义同源，`figure`+`title`+`description`+`action` 读成图/标题/描述/动作一套整件。组件尚未提交，改名零成本全链路一次切齐（types/组件/测试/story/docs/changeset/ROADMAP/wiki）。
