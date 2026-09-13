# docs 官网设计品味

2026-09 方向修正后确立：**参考锚点 = Ant Design / MUI 这类成熟组件库官网的信息架构与密度纪律**；皮肤仍走自家 token/palette/variant 三轴。上一版「Radix 式极简留白」已被用户否定（决策 b6231811），不要回退。

## 密度纪律（最重要的纠正）

- 克制 ≠ 大留白：antd 的克制是**信息架构规整 + 高密度专业排版**
- 正文 14px 级、行高 ~1.6；H1 ~32px；H2 ~24px **带细规则线**（bottom hairline）；层次靠字号/字重/规则线，不靠空旷
- 分节间距规整（40-48px 级），禁止「有的区块挤在一起、有的空一大片」
- 卡片网格紧凑：卡片内边距适中，内容与盒子匹配，不留大块死白
- 禁止海报感：不出现 56px+ 巨型标题配大面积空白

## 组件文档页 = 官网灵魂（第一优先级）

每个组件页由下列区块构成，button 页先打样再铺开：

1. **页头**：H1（组件名）+ 一行描述 + `import { X } from '@colox/react';` 代码行（可复制）+ 元信息行（GitHub / Edit this page / Design 等）
2. **H2 分节**（带细规则线）：`When to use`（适用场景 prose + 能力清单）/ `Examples`（demo 块）/ `API`（属性表）/ `Design tokens`
3. **demo 块**：预览区 + 标题 + 描述 + **可折叠代码**（代码默认收起、一键展开）+ 复制入口；demo 块之间规整分隔
4. **API 属性表**：Prop / Type / Default / 说明 四列（现有 mdx 表格已具备，需样式对齐 antd 密度）
5. **分组侧栏**：9 组件按类目分组（General / Form / Layout 之类），分组标题 = 小号 muted 大写字母；活动项 = 主色文字 + 浅色底 + 左侧色条
6. **右栏 TOC**：保留 docusaurus 默认能力，样式驯化到 antd 密度

## 首页 = 卖点页（不是组件目录）

用户定位（2026-09）：**组件种类与样式的陈列归文档**；首页只讲「为什么用它」并**用真实交互证明**。

章节结构（编号 + 交替 surface）：

1. **hero**：家族渐变 wash + pill + 45.5px 双色标题 + 定位文案 + 双 CTA + 可复制安装 chip｜右侧 **playground**（palette/variant/size 驱动真实场景 + 实时 JSX 行，换值时代码行 pulse）
2. **六族色谱条**（色彩签名）
3. **01 — start**：紧贴 hero 的双栏快速上手（左文案 + 双按钮｜右两段代码）——不放页尾居中，避免与上方割裂
4. **02 — design language**：设计理念三卡（语义优先 / 每条轴一个命名词 / 按入口树摇），每卡带 figure
5. **03 — fit**（bg-subtle 带）：适用场景三卡（数据密集 / 多主题 / 设计系统基座），正文各一行 + figure
6. **04 — AI-native**：flow 图（agent → mcp → wiki → 正确代码）+ wiki 浏览器 + MCP 浏览器 + harness 接线卡
7. **05 — toolchain**（bg-subtle 带）：flow 图（Figma → theme-builder → CSS/TS → app）+ CLI 终端
8. **06 — theming**：token 说明 + palette 切换器
9. **07 — explore**（渐变 wash 收尾带）：大标题 + 双按钮 + 9 组件 pill 链接 + 6 个包名 chip
10. 页脚
    **信息剂量纪律（用户反馈「重复内容多」后确立）**：每条信息只讲一次——安装命令/双 CTA/GitHub 归 hero（快速上手只教用法、只留一段代码）；token 主题故事归 theming 章节；AI 故事归 04 章节；Figma 管线归 toolchain 章节；收尾带只留一个行动 + 组件 pill + 包名 chip。

**TopBar 规范**：品牌标记 = 六族色块 SVG（`static/img/colox-mark.svg`，2×3 排布、按页面色谱顺序，是品牌资产故用固定色值）+ 标题；导航 = Docs（docSidebar）+ **Components 下拉（9 个文档）** + **Toolchain 下拉（wiki/mcp/theme-builder/theme 四个包的 GitHub）**；右侧 = **GitHub 图标链接（mask SVG 走 token 着色，随主题变色）** + 主题开关 + **离线全文搜索**（@easyops-cn/docusaurus-search-local，构建期建索引、无需 Algolia；桌面为 ⌘K 提示的胶囊输入框，移动端收成搜索图标）；下拉菜单按产品菜单打扮（发丝边 + 圆角 + 柔和影 + hover 染主色）。

滚动显现：统一用 src/components/reveal 包（一次性、支持 delay 0-3 交错、reduced-motion 自动收敛）

交互纪律：**每个卖点配一个能玩的真实交互**（playground / wiki 面板 / MCP 面板 / harness 切换 / CLI 终端 / 主题切换 / copy 按钮），一律走自家组件与 token，SSG 安全（useState 即可，无需客户端专用组件）。

## 皮肤仍走自家设计语言（抄结构不抄皮肤）

- 颜色/圆角/间距/动效一律 `--colox-*` token；不复制 antd 的品牌色、插画、阴影
- 版式骨架用自家 Container/Grid/Stack；展示用自家 Button/IconButton；无裸 div 板车、无 inline style
- 动效维持「轻」：反馈 + 明暗切换渐隐 + 一次性入场，时长走 motion token

## 视觉验收纪律（本次教训）

- **能看图就必须自己先看**：先看参照（ant.design 同类页）再看成品，对照后再交付；截图前先重拍（旧截图不代表当前构建）
- 不能看图时（模型无视觉输入）不交付视觉稿；改用计算样式探针 + 明确告知用户「视觉未验收」
- 评审与编码可分工：视觉评审走视觉模型/子代理，编码走 v4-pro；子代理可用 read_image（已实测 HAS_VISION）
