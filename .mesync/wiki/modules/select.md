# Select 模块

## 职责

`@colox/react` 的可搜索单选/多选组件。数据式声明（`options: SelectOption[]`，选项渲染在 portal 面板中、消费方无布局话语权），外壳共享表单家族视觉契约（1px 边框、focus-within 环、四档尺寸、红 invalid 通道、terminal disabled），弹层是按 ARIA 1.2 editable combobox 建模的 portal listbox（焦点留在触发器器官，aria-activedescendant 走选项）。

## 设计要点

- **选项模型**：`SelectOption = { value: string; label: ReactNode; disabled?: boolean }`。`value` 是选择真值与 FormData 值；`label` 是展示 + 默认过滤面。不做 `Select.Option` 子组件声明式（选项在 portal 面板里渲染，子组件徒增 wiring 成本；富内容走 `optionRender` 插槽）。
- **模式**：`mode: 'single'`（value `string`，`''` = 未选中，Radio.Group 空值惯例）/ `'multiple'`（`string[]`）。multi 下每次选择后面板保持打开；chip 独立移除按钮 + 空查询 Backspace 删除末位 chip。
- **onChange 载荷**：`{ event, value, option }` —— `event` 为触发交互（选项点击 / combobox Enter 按压 / chip 移除 / 清除按钮的原生合成事件，类型 `MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>`），`value` 为下一选择，`option` 为被选/被切换项完整对象（清除时 `undefined`）。
- **showSearch**（默认 false）：single 可搜索时用搜索器官替代展示行——关闭时显示选中项 label、打开时翻转到 query 流；multiple 恒有器官承载 query。默认过滤 = label + value 大小写不敏感子串，`filterOption` 可替换；`onSearch(query)` 原始流直出（远程编排归消费方）。
- **焦点与键盘**：闭合器官上 Enter/方向键打开并移动高亮；打开后上下方向键循环走（跳过 disabled），Home/End 跳首尾，Enter 激活；Space 只在非 input 器官上拦截（`event.currentTarget instanceof HTMLInputElement` 判别）。
- **可达名（重要坑）**：`role="combobox"` 的 ARIA name 来源是 author——测试库/读屏器不取元素内容。器官必须显式携带可达名：默认 = 选中 label → 原始 value → placeholder，`aria-label` 覆盖；`id` 落在聚焦器官上（`<label for>` 正确指向）。
- **FormData**：`name` 挂载隐藏原生 input——single 一枚 / multiple 每值一枚（原生忠实）。
- **optionSize**：面板行型独立 prop（默认 md），弹层不继承触发器尺寸——弹层是独立排版语境。
- **ref**：`SelectRef = HTMLInputElement | HTMLButtonElement` 联合——暴露焦点器官（普通 single = 触发按钮；可搜索 single/multiple = 内嵌 input）。

## 实现结构

```
packages/components/src/select/
├── select.tsx          # 主组件（壳 + 器官 + Popup + 隐藏 input）
├── index.ts            # 公共 barrel（组件 + 类型 + variants）
├── types/index.ts      # SelectOption / SelectChangePayload / SelectProps / SelectRef
├── hooks/use-select.ts # 状态对称（value/defaultValue、open/defaultOpen、query 流、publish）
├── utils/select-options.ts  # 默认过滤（label+value 子串）、findSelectOption、filterSelectOptions
├── variants/           # size 四档 cva（size 轴；optionSize 不是 CVA variant——独立排版轴）
├── styles/             # base.scss（壳/器官/chiip/trailing）+ size.scss（壳四档 + 面板行四档）+ popup.scss（listbox/option）
└── _tests/             # select.test.tsx（单模式）+ select-multiple.test.tsx（多模式）
```

### 依赖的 cdk 层（内部，不进公共 barrel）

- `src/cdk/floating/use-floating-position.ts`：包 `@floating-ui/dom`（computePosition + autoUpdate，flip/shift/size，fixed 策略，`positioned` 状态守首帧）。
- `src/cdk/floating/popup.tsx`：portal 到 document.body 的无头承载；**首帧守卫用 `opacity + pointer-events` 而非 `visibility`**——避免面板从 a11y 可达树里消失（也是测试库 `getByRole('listbox')` 的隐含依赖）。
- `src/cdk/floating/use-dismissible.ts`：外部 pointerdown capture + Escape 关闭。
- `src/cdk/floating/use-combobox-keyboard.ts`：activeIndex 状态机（循环、跳 disabled、Home/End、Enter 激活带事件）。

### 跨组件复用

- 搜索器官 = **Input 拆出的 `src/input/organ.tsx`**（forwardRef 裸 `<input>`，`colox-input__control` 基础类 + className 合并）。该类在 input base.scss 中是**平铺选择器**（不嵌套在 `.colox-input` 下），自带裸化 reset，任何外壳内可自足工作。
- 清除按钮 Select 自建（`colox-select__clear`），复用 Input 的 keepFocus 模式（mousedown preventDefault + click 清除）——不复用 `ClearButton` 因其 aria-label 硬编码 "Clear input" 且类名属 input 名字空间。

## 样式约定

- 面板全部用既有 token：`--colox-color-bg-overlay`/`--colox-color-border-muted`/`--colox-shadow-md`；选中行 `--colox-color-brand-wash-active` + brand 文字，hover/键盘高亮 `--colox-color-gray-wash-hover`。
- z-index 无设计 token → cdk 内 `var(--colox-z-popup, 1000)` 内部变量 + 回落。
- 面板最大高 256px + 滚动；chip 高度 `--colox-size-5` 恒定（不随 tier）。
- `colox-select__listbox--{tier}` 由 optionSize 驱动（始终发射，含默认 md）。

## 测试

61 例新增（总计 197 例全绿）：键盘循环/跳 disabled/Home/End、Enter 载荷、受控对称、mouse 选择载荷、重新选择同值仍发射、clearable、隐藏 input、invalid/disabled、过滤（默认/自定义/onSearch）、optionRender、optionSize、受控 open、外部点击/Escape 关闭、multiple chip/Backspace/多隐藏 input、focus 保持。测试依赖 test-setup.ts 的 ResizeObserver stub（autoUpdate 需要）；option 的 id 用 `document.getElementById` 查询（useId 冒号不能进选择器）。

## 变更

- 2026-09 Select 首版交付：单/多模式、搜索、clearable、optionSize、FormData、ARIA combobox。V1 排除 tags/optgroup/虚拟滚动/typeahead/远程 debounce。
