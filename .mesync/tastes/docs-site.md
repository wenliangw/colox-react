# docs 官网设计品味

2026-09 与用户对齐（四刀拍板）后确立的产品级设计方向；执行时逐条对照。

## 气质：工程克制（类 Radix/TanStack）

- 黑白灰骨架 + palette 点缀：唯一允许的彩色 = 语义色的**展示性**使用（三轴陈列、组件 demo）；版式本身的颜色全部来自 surface 档（bg/border/text 的 default/muted/subtle）
- 大量留白、组件是主角：官网的卖点 = 组件 + 三轴，不是花哨的 skin
- 英文文案、简洁短句；不喊口号
- 徽章化/渐变 hero = 「品牌氛围」方向，未被选择，不要加回来

## 动效：轻（只表达层级与反馈）

- 三类允许：① 反馈类（hover/active/focus——组件自带过渡足矣）；② 明暗切换渐隐（表面色 transition，用 motion token 时长）；③ hero 一次性入场（淡入 + 微上移，一次性、不循环）
- 不允许：滚动显影、卡片 hover 微抬升、视差、粒子、循环背景动画（被排除的「中/重」档）
- 所有动效时长用 `--colox-motion-duration-*` token——reduced-motion 门径（motion.css 归零时长）自动生效，不必另写媒体查询
- 首页入场动画当前直接挂在 `main`（.page 类），不走 scroll 触发

## 版式：用自家组件搭骨架（dogfood 纪律）

- 版式骨架 = Container/Grid/Stack + 展示性 Button/IconButton；不得为首页写裸 div 板车
- 自家 token 名词走 CSS 模块类（className + CSS 变量），**严禁 inline style 对象**——demo 本身就是 doctrine #1 的示范
- 三轴陈列区 = 官网的灵魂版面：palette 六族 / Button 五档阶梯 / IconButton 七音阶 + mono 标签 / size 四档——按钮正文即档名（Button 阶梯不用下标签，IconButton 阶梯配 mono 下标签）
- 画廊卡片 hover 只做 border-default + bg-subtle 反馈；不抬升、不加阴影
- 组件库展示必须默认 gray 哲学可见：文案里明说「Components default to gray — an accent is always opt-in.」

## 主题接线（docusaurus ↔ colox）

- docusaurus 的 toggle / 配置是唯一主题真相；ColoxTheme `theme` prop 受控，clientModules 同步 data-theme → data-colox-theme
- 全局样式表加载走 clientModules（`import '@colox/react/style.css'`）；customCss 只放自身 scss
- customCss/scss 里**绝不写死 token 值**——颜色一律 var(--colox-*) 引用

## 交付节奏

- 首页先交付、双主题 + 结构性探针验收；playground 样板单独一批；每批小、可评审
- 视觉终审以用户目视为准（模型不可读图时用计算样式探针做结构验收，明确汇报验证范围）
