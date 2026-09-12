# Select 模块

## 职责

`@colox/react` 的可搜索单选/多选组件。选项以 `Select.Option` 叶子声明（`value` + `text` 必填、可传 `children` 富渲染），外壳共享表单家族视觉契约（1px 边框、focus-within 环、四档尺寸、红 invalid 通道、terminal disabled），弹层是按 ARIA 1.2 editable combobox 建模的 portal listbox（焦点留在触发器 control，aria-activedescendant 走选项）。

## 设计要点

- **叶子契约（v2 改判）**：`Select.Option` 成员为唯一声明面——`value`（选择真值与 FormData 值）+ `text`（文本面：搜索过滤、触发器显示、multiple chip、缺省行渲染）必填；`children` 为可选富渲染（无则渲染 `text`）；`disabled` 照旧。消费方渲染定制是第一等 JSX 处方，数据式 + optionRender 回调徒增隔层——v1 的 options/optionRender 已撤。
- **成员编译**：`compileSelectOptions` 对 children 子树做纯结构遍历——穿透 Fragment、数组与传透型包装组件（成员以 children 传入的结构仍在），组件内部自造成员不可见（成员叶子自身从不渲染，与 rc-select 同边界）。编译记录 = `{ value, text, disabled, size, key, content, className, style }`；key = 元素 key ?? value；重复 value 允许（原生 select 语义）。
- **size 继承（本人优先）**：成员 `size` 缺省取父级 `Select.size`，可单独覆盖——行 tier 类 `colox-select__option--{tier}` 每行独立发射；optionSize 专 prop 随数据式 API 一并废除（面板行型归入家族继承轴）。
- **模式**：`mode: 'single'`（value `string`，`''` = 未选中，Radio.Group 空值惯例）/ `'multiple'`（`string[]`）。multi 下每次选择后面板保持打开；chip 独立移除按钮 + 空查询 Backspace 删除末位 chip。chip 文案取 `text`（富 children 成员也不克隆 children 进 chip）。
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
├── utils/select-options.ts       # compileSelectOptions（子树遍历编译）+ 默认过滤 + find/filter（SelectFilterFn 契约在 types/utils.ts）
├── utils/resolve-select-surface.tsx  # 派生值 resolver：inputValue/controlLabel/buttonDisplay 逐级回退链（if + return；ResolveXxxParams 契约在 types/utils.ts）
├── children/           # 按功能拆分的渲染单元（渲染体只编排的用户指正产物；各 XxxProps/Ref 契约在 types/children.ts，私有行组件 SelectOptionRowProps 留 panel 原地）
│   ├── control/        # SelectControl：两种形态（内嵌 InputControl / 触发 button）+ combobox ARIA 面
│   ├── tags/           # SelectTags：multiple chip 列（text 文案 + 移除钮）
│   ├── clear-button/   # SelectClearButton：mousedown 防失焦清除钮（不复用 Input 的——aria-label/类名名字空间不同）
│   ├── form-values/    # FormSelectValues：给 Form 组件设置 value 的隐藏输入通道（single 一枚 / multiple 每值一枚）
│   ├── panel/          # SelectPanel：portal listbox 行渲染（行 tier/selcted/active/disabled）+ 空态
│   └── option/         # SelectOption 叶子：compile-time-only 成员（渲染 null，dot-part 挂载到根）
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
- 清除按钮 Select 自建（`colox-select__clear`），复用 Input 的 keepFocus 模式（mousedown preventDefault + click 清除）。

## 样式约定

- 面板全部用既有 token：`--colox-color-bg-overlay`/`--colox-color-border-muted`/`--colox-shadow-md`；选中行 `--colox-color-brand-wash-active` + brand 文字，hover/键盘高亮 `--colox-color-gray-wash-hover`。
- z-index 无设计 token → cdk 内 `var(--colox-z-popup, 1000)` 内部变量 + 回落。
- 面板最大高 256px + 滚动；chip 高度 `--colox-size-5` 恒定（不随 tier）。
- 行 tier `colox-select__option--{tier}` 每行按成员解析发射（继承父级或本人覆盖）。

## 测试

71 例全绿（v1 的 61 例全部保留并改写为新契约）：键盘循环/跳 disabled/Home/End、Enter 载荷（event.key 断言）、受控对称、mouse 选择载荷（记录 + event.target）、重新选择同值仍发射、clearable（payload option undefined）、隐藏 input、invalid/disabled、过滤（默认/自定义/onSearch）、富 children 渲染 + text 行名钉住、size 继承/逐行覆盖、传透包装编译、受控 open、默认 open（SSR mounted 守卫）、外部点击/Escape 关闭、multiple chip/Backspace/Enter 反选/多隐藏 input、focus 保持、空态。测试依赖 test-setup.ts 的 ResizeObserver stub（autoUpdate 需要）；option 的 id 用 `document.getElementById` 查询（useId 冒号不能进选择器）。

## 变更

- 2026-09 Select 首版交付（数据式 options，已撤）：单/多模式、搜索、clearable、optionSize、FormData、ARIA combobox。
- 2026-09 Select v2 评审改判：options/optionRender/optionSize 撤除，Select.Option 叶子声明 + value/text 必填 + size 继承（本人优先）；payload option = 叶子编译记录；渲染体拆 children/ 功能单元（零三目）。V1 排除 tags-in-placeholder、optgroups、虚拟滚动、typeahead、远程 debounce。
- 2026-09 Select 类型集中化（用户提议，全库第一个试点）：全部类型契约（公开 + hooks/children/utils 内部）收进 `types/`，按能力层分 `component.ts`/`hooks.ts`/`children.ts`/`utils.ts`；`types/index.ts` = 内部全量 barrel，公共出口 `select/index.ts` 保持选择性具名导出（内部名字不漏进公共面）；各单元删内联类型定义改 import。动因（用户原话精神）：「类型定义长了影响读实现的体验；改代码多读几个文件成本不高；AI 时代代码为人的阅读体验服务」。
