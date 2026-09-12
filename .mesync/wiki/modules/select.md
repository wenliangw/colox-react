# Select 模块

## 职责

`@colox/react` 的可搜索单选/多选组件。选项以 `Select.Option` 叶子声明（`value` + `text` 必填、可传 `children` 富渲染），外壳共享表单家族视觉契约（1px 边框、focus-within 环、四档尺寸、红 invalid 通道、terminal disabled），弹层是按 ARIA 1.2 editable combobox 建模的 portal listbox（焦点留在触发器 control，aria-activedescendant 走选项）。

## 设计要点

- **叶子契约（v2 改判）**：`Select.Option` 成员为唯一声明面——`value`（选择真值与 FormData 值）+ `text`（文本面：搜索过滤、触发器显示、multiple chip、缺省行渲染）必填；`children` 为可选富渲染（无则渲染 `text`）；`disabled` 照旧。消费方渲染定制是第一等 JSX 处方，数据式 + optionRender 回调徒增隔层——v1 的 options/optionRender 已撤。
- **成员编译**：`compileSelectOptions` 对 children 子树做纯结构遍历——穿透 Fragment、数组与传透型包装组件（成员以 children 传入的结构仍在），组件内部自造成员不可见（成员叶子自身从不渲染，与 rc-select 同边界）。编译记录 = `{ value, text, disabled, size, key, content, className, style }`；key = 元素 key ?? value；重复 value 允许（原生 select 语义）。
- **size 继承（本人优先）**：成员 `size` 缺省取父级 `Select.size`，可单独覆盖——行 tier 类 `colox-select__option--{tier}` 每行独立发射；optionSize 专 prop 随数据式 API 一并废除（面板行型归入家族继承轴）。
- **模式**：`mode: 'single'`（value `string`，`''` = 未选中，Radio.Group 空值惯例）/ `'multiple'`（`string[]`）。multi 下每次选择后面板保持打开；chip 独立移除按钮 + 空查询 Backspace 删除末位 chip。chip 文案取 `text`（富 children 成员也不克隆 children 进 chip）。**tag 模板（compile-time 模板叶，详见决策 c7778102）**：`Select.Template name="tag"` 唯一组件子节点声明 chip 视觉处方；渲染期逐 chip cloneElement 注入三元契约 `{ props, option, onRemove }`——`props` 必须属性背包（折叠通道 aria-hidden/style，作者 `{...props}` 靠前展开不得覆盖），`option` 成员编译记录（未声明值合成兜底），`onRemove` 内部移除通道（onChange 载荷 + stopPropagation）；模板组件须输出单一根元素（fragment 根破坏一值一节点索引）。不提供 tagRender 回调（双通道违反正交前科）；cdk 通用 Template 引擎待第二个消费者出现再提权。**溢出折叠（A 方案，实现形态经一轮改判）**：chip 行单线不折行；chips 挂载全量、行内只渲染前 k 枚、折叠尾部 visibility:hidden + position:absolute 脱流隐藏（不可见/不进 a11y 树/仍可测宽），`+M` 行内 chip 排尾零叠压（叠加徽标前科：断 pill 视觉污染）；**折叠预算 = inner 宽 − control 的 CSS min-width（computed，绝不读 offsetWidth）− trailing 宽 − 2×gap**——不取行自身宽（随切片回缩自我坍塌归零，前科一轮），也不取任何元素的当前宽（control flex:1/0% 基底贪婪吸收空余，当前宽分支恒真再坍，前科二轮，最终定案）；ResizeObserver 只观察 inner（以它为容器参考值）；SSR/jsdom 无布局时徽标隐藏全量显示；+M 无自家交互，点击走壳逻辑开面板，面板里全部成员照旧可管理。计数纯函数 `countFittingTags`（utils/tag-fitting.ts）+ 测量 hook `useTagFold`（hooks/use-tag-fold.ts）单测覆盖（含贪婪宽回归）。
- **onChange 载荷**：`{ event, value, option }` —— `event` 为触发交互（选项点击 / combobox Enter 按压 / chip 移除 / 清除按钮的原生合成事件，类型 `MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>`），`value` 为下一选择，`option` 为被选/被切换成员的**叶子编译记录** `{ value, text, disabled }`（清除时 `undefined`）。
- **showSearch**（默认 false）：single 可搜索时用内嵌输入 control 替代显示行——关闭时显示选中项 text、打开时翻转到 query 流；multiple 恒有 control 承载 query。默认过滤 = text + value 大小写不敏感子串，`filterOption` 可替换；`onSearch(query)` 原始流直出（远程编排归消费方）。
- **焦点与键盘**：闭合 control 上 Enter/方向键打开并移动高亮；打开后上下方向键循环走（跳过 disabled），Home/End 跳首尾，Enter 激活；Space 只在非 input control 上拦截（`event.currentTarget instanceof HTMLInputElement` 判别）。
- **可达名（重要坑）**：`role="combobox"` 的 ARIA name 来源是 author——测试库/读屏器不取元素内容。control 必须显式携带可达名：默认 = 选中 text → 原始 value → placeholder，`aria-label` 覆盖；行 `aria-label={text}` 钉住富渲染下行名；`id` 落在聚焦 control 上（`<label for>` 正确指向）。
- **FormData**：`name` 挂载隐藏原生 input——single 一枚 / multiple 每值一枚（原生忠实）。
- **ref**：`SelectRef = HTMLInputElement | HTMLButtonElement` 联合——暴露焦点 control（普通 single = 触发按钮；可搜索 single/multiple = 内嵌 input）。

## 实现结构

```
packages/components/src/select/
├── select.tsx          # 编排层：解析 props → 编译成员 → 接 hooks → 组装 children 单元 JSX（渲染体零三目）
├── index.ts            # 公共 barrel（组件 + 类型 + variants）
├── types/              # 类型契约集中（按能力层分文件）：component.ts（根契约 7 件）/ hooks.ts / children.ts / utils.ts + index.ts 内部全量 barrel
├── hooks/use-select.ts # 状态对称（value/defaultValue、open/defaultOpen、query 流、publish；契约在 types/hooks.ts）
├── hooks/use-tag-fold.ts # 多选折叠测量 hook：inner 参考预算 + ResizeObserver + 计数（契约 UseTagFoldArgs/Result 在 types/hooks.ts）
├── utils/select-options.ts       # compileSelectOptions（子树遍历编译）+ 默认过滤 + find/filter（SelectFilterFn 契约在 types/utils.ts）
├── utils/resolve-select-surface.tsx  # 派生值 resolver：inputValue/controlLabel/buttonDisplay 逐级回退链（if + return；ResolveXxxParams 契约在 types/utils.ts）
├── utils/tag-fitting.ts   # countFittingTags：chip 行折叠计数的纯函数（对行宽+badge 宽求可见前缀，单测覆盖）
├── children/           # 按功能拆分的渲染单元（渲染体只编排的用户指正产物；各 XxxProps/Ref 契约在 types/children.ts，私有行组件 SelectOptionRowProps 留 panel 原地）
│   ├── control/        # SelectControl：两种形态（内嵌 InputControl / 触发 button）+ combobox ARIA 面
│   ├── tags/           # SelectTags：multiple chip 行（text 文案 + 移除钮）+ 溢出折叠（视觉切片：挂载全量、尾部脱流隐藏、行内 +M chip）
│   ├── clear-button/   # SelectClearButton：mousedown 防失焦清除钮，换装 IconButton（size="4"；不复用 Input 的——aria-label/类名名字空间不同）
│   ├── form-values/    # FormSelectValues：给 Form 组件设置 value 的隐藏输入通道（single 一枚 / multiple 每值一枚）
│   ├── panel/          # SelectPanel：portal listbox 行渲染（行 tier/selcted/active/disabled）+ 空态
│   ├── option/         # SelectOption 叶子：compile-time-only 成员（渲染 null，dot-part 挂载到根）
│   └── template/       # SelectTemplate 叶子：name="tag" 模板槽（渲染 null）；编译校验在 utils/select-options 的 findSelectTemplate
├── variants/           # size 四档 cva（仅外壳；行 tier 由成员 size 解析，不设变体）
├── styles/             # base.scss（壳/control/chiip/trailing）+ size.scss（壳四档 + 行四档）+ popup.scss（listbox/option）
└── _tests/             # select.test.tsx（单模式）+ select-multiple.test.tsx（多模式）
```

### 依赖的 cdk 层（内部，不进公共 barrel）

- `src/cdk/floating/popup/`：portal 到 document.body 的无头承载；**首帧守卫用 `opacity + pointer-events` 而非 `visibility`**——避免面板从 a11y 可达树里消失（也是测试库 `getByRole('listbox')` 的隐含依赖）；SSR mounted 守卫（无 hydrate 失配）。
- `src/cdk/floating/hooks/use-floating-position.ts`：包 `@floating-ui/dom`（computePosition + autoUpdate，flip/shift/size，fixed 策略，`positioned` 状态守首帧）。
- `src/cdk/floating/hooks/use-dismissible.ts`：外部 pointerdown capture + Escape 关闭。
- `src/cdk/floating/hooks/use-combobox-keyboard.ts`：activeIndex 状态机（循环、跳 disabled、Home/End、Enter 激活带事件），暴露 `onControlKeyDown`。

### 跨组件复用

- 搜索 control = **cdk 的 `src/cdk/input-control/`**（forwardRef 裸 `<input>`，`colox-input-control` 基础类 + className 合并），自带裸化 reset、自足工作于任何外壳——Input 与 Select 双消费者实锤，迁出 input/ 私有件位置。
- 清除按钮 Select 自建（`colox-select__clear`），复用 Input 的 keepFocus 模式（mousedown preventDefault + click 清除）。按钮本体与 tag-remove 均为 IconButton（`size="4"`）——复位/方形足迹/聚焦环/禁用态上提基座，站点类只留换位 reveal 与 chip 内着色（决策 07ea9169）。

## 样式约定

- 面板全部用既有 token：`--colox-color-bg-overlay`/`--colox-color-border-muted`/`--colox-shadow-md`；hover/键盘高亮 `--colox-color-gray-wash-hover`。**选中不做背景染色**（用户指正：行尾 IconCheck 已是选中信号，brand-wash 背景 + brand 文字多余）——`--selected` 类仍挂在行 DOM 上（测试/API 钩子），仅一条视觉规则：check 图标上主色 `--colox-color-brand-solid`、行文字保持默认（用户第二轮指正：「IconCheck 应该是主色，但文字保持默认的文字颜色」）；**选中行也不接受 hover/active 的灰底**（第三轮指正：单选重开时键盘高亮初始化落在选中行，灰底误读为选中染色——多选初始高亮为 -1 故无此现象；CSS 以 `--selected:hover`/`--selected.--active` 归零覆盖）；`aria-selected` 照旧背书。
- **clear 与 chevron 不并排**（用户指正）：根壳带 `colox-select--clearable` 状态类（有值且 clearable 且未 disabled 时挂上）——默认只显示 chevron，`:hover`/`:focus-within` 时 X 替换箭头（focus-within 保证键盘用户可达）；空值/disabled 无 X，chevron 常驻。**命中原罪（四轮修复）**：chevron 渐隐（opacity→0）仍保持层叠上下文 + DOM 序在 × 之后 → 永远压住 × 的命中面，`elementFromPoint` 命中 chevron SVG——真实点击从不落在 × 上（「点不到」+ 面板开着时焦点被拽走）；修复 = 装饰件命中让位收进 **IconBase 基座**（全部 icons 默认 `pointer-events="none"` 表现属性，spec §9）——chevron 是 icon 即自动携带，组件侧零处理（先加过一版组件级规则，随后按「基座即契约」撤回；决策 d9d62f07）；Playwright 实弹验证双场景（关/开面板）全通。
- z-index 无设计 token → cdk 内 `var(--colox-z-popup, 1000)` 内部变量 + 回落。
- 面板最大高 256px + 滚动；chip 高度 `--colox-size-5` 恒定（不随 tier）。
- 行 tier `colox-select__option--{tier}` 每行按成员解析发射（继承父级或本人覆盖）。

## 测试

88 例全绿（v1 的 61 例全部保留并改写为新契约）：键盘循环/跳 disabled/Home/End、Enter 载荷（event.key 断言）、受控对称、mouse 选择载荷（记录 + event.target）、重新选择同值仍发射、clearable（payload option undefined）、隐藏 input、invalid/disabled、过滤（默认/自定义/onSearch）、富 children 渲染 + text 行名钉住、size 继承/逐行覆盖、传透包装编译、受控 open、默认 open（SSR mounted 守卫）、外部点击/Escape 关闭、multiple chip/Backspace/Enter 反选/多隐藏 input、focus 保持、空态、折叠计数纯函数 4 例 + jsdom 徽标隐藏 1 例 + 模拟指标回归 1 例（inner 预算折叠与放宽长回双向断言，防「折叠自食」归零）、tag 模板 9 例（注入契约/包装发现/未声明值合成兜底/onRemove 载荷+面板不弹/折叠隐藏包注入自定义根/宿主元素/无子/重复模板/未知槽硬错误）+ tag 模板受控移除 2 例（面板关/开两态 pointerdown+click 序列）。测试依赖 test-setup.ts 的 ResizeObserver stub（autoUpdate + 折叠重测需要）；option 的 id 用 `document.getElementById` 查询（useId 冒号不能进选择器）。

## 变更

- 2026-09 Select 首版交付（数据式 options，已撤）：单/多模式、搜索、clearable、optionSize、FormData、ARIA combobox。
- 2026-09 Select v2 评审改判：options/optionRender/optionSize 撤除，Select.Option 叶子声明 + value/text 必填 + size 继承（本人优先）；payload option = 叶子编译记录；渲染体拆 children/ 功能单元（零三目）。V1 排除 tags-in-placeholder、optgroups、虚拟滚动、typeahead、远程 debounce。
- 2026-09 Select 类型集中化（用户提议，全库第一个试点）：全部类型契约（公开 + hooks/children/utils 内部）收进 `types/`，按能力层分 `component.ts`/`hooks.ts`/`children.ts`/`utils.ts`；`types/index.ts` = 内部全量 barrel，公共出口 `select/index.ts` 保持选择性具名导出（内部名字不漏进公共面）；各单元删内联类型定义改 import。动因（用户原话精神）：「类型定义长了影响读实现的体验；改代码多读几个文件成本不高；AI 时代代码为人的阅读体验服务」。
- 2026-09 Select 交互评审：① Storybook「点击 X 不清空」= story/docs 演示接线前科（`value="banana"` 常量 + 无 onChange → onChange 发射但绝不回写），改 `defaultValue` 非受控——组件本身绿测无 bug；② trailing 区 X 与箭头并排 → `--clearable` 状态类驱动 hover/focus-within 箭头让位 X；③ 选中行背景染色撤除（IconCheck 单通道）。
- 2026-09 Select 交互评审二轮：① IconCheck 上主色（唯一视觉规则）、行文字保持默认；② 多选 chip 溢出跑版修复——用户拍板 A 方案（+M 折叠）：chip 行禁折行 + 全量渲染 + 叠加徽标 + 响应式测量（详见决策 59ee6358）。
- 2026-09 Select 折叠形态改判：叠加徽标被指「视觉污染（断 pill）」→ 视觉切片 + 行内 +M chip（挂载全量、尾部脱流隐藏兼任测量源；详见决策 1c6ee3a7，59ee6358 被其 supersede）。
- 2026-09 Select 折叠测量 bug 修复：首版把「行自身宽」当折叠预算，行随切片回缩 → 计数自我坍塌归零（用户现象：继续选中后空间够却只剩 +M、全选后零 chip）；改预算 = inner − control 底线 − trailing − 2×gap，RO 观察 inner/control/row 三方（纠错条款见 corrections/measurement.md）。
- 2026-09 Select 折叠测量 bug 修复二轮（重构版）：上一版的「control 当前宽 > 底线则受让」分支是第二次坍塌（control flex:1/0% 基底在折叠后吸收空余，分支恒真 → 预算坍回切片内容宽 → 一个 option 都不展示只剩 +M）；终版抽 `useTagFold` hook：预算 = inner − control computed min-width − trailing − 2×gap，全恒定占位、RO 只观察 inner；回归测试把 control 模拟为贪婪宽 220（前版 mock 8px 等于底线，盲区漏测）。纠错条款 corrections/measurement.md 已二轮补全。
- 2026-09 Select clear × 命中修复：渐隐中的 chevron（opacity<1 的层叠上下文，DOM 序后于 ×）吃掉 × 的全部点击——真实点不中（jsdom 测不出，Playwright elementFromPoint 实证）；chevron 加 `pointer-events: none`。纠错条款 corrections/hit-testing.md。
- 2026-09 IconButton 换装（决策 07ea9169）：clear 钮与 tag-remove 换装公共 IconButton（size="4"），base.scss 站点类裁剪为纯上下文规则（clear 只剩 position/换位 reveal；tag-remove 只剩 chip 内着色）；探针 A/B 复验全绿。
- 2026-09 Select 交互评审三轮：选中行灰底再修正——单选重开时初始键盘高亮落在选中行，`--active` 灰底误读为选中染色（多选初始高亮 -1 无此相）；选中行 hover/active 一律不染灰底（check 仍是唯一选中信号）。
- 2026-09 Select tag 定制定案：`Select.Template name="tag"` 模板叶 + cloneElement 注入 `{ props, option, onRemove }`（用户否决 tagRender 回调形式，props 背包 = 无壳 + 前向兼容；详见决策 c7778102）；docs 演示组件落 `apps/docs/src/components/select/tag-template-demo.tsx`（MDX ESM 对箭头函数组件导出解析极脆——注释里的 `<EmojiTag />` 字面量都会被当正文 JSX 解析，教训：docs 复杂 demo 一律 app 侧文件）。
