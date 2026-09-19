# AutoComplete 组件

## 职责

自由文本 combobox：**组合式结构壳**——`<AutoComplete>` 渲染自己的锚点 div，把 combobox 契约**注入**进宿主元素（唯一组件型子元素；Input 家族为默认宿主，全部静态词 size/invalid/placeholder/clearable 自持），选项面走 Select 血脉的**声明叶**（`Suggestions` 区域 + `Option` 叶子，编译记录词形同构）。**值 = 纯文本**：'' = 空，任何敲击都是合法提交——建议只是便捷通道、永不构成约束（与 Select 的本质差异：无「非法值/回滚」概念）。`onChange` 自造 **`{ event, value }`**（本轮确立的**全家族组件层事件面统一词形**总则的第一兑现：文本值控件不再原生透传；当时留的「叶子直对原生控件的透传槽」豁免**已于全家族收敛轮废除**——Input/Textarea/Checkbox/Radio/Switch 同样自造载荷，宿主注入契约的 `onChange` 随之收 `{ event, value }`），选行额外走 `onSelect({ event, value, option })`。**面板开合自管为默认**（聚焦/点击开、空 query 显全量、输入即过滤、无候选自动关、Escape/失焦/选中关），`open/defaultOpen/onOpenChange` 受控可覆；**焦点恒留宿主**（ARIA 1.2 editable combobox：rows 经 aria-activedescendant 巡行，行 mousedown preventDefault 防失焦——Select 焦点模型同构）。**行为内核沉 `cdk/combobox`**（rule of two：Select search 为第一消费者、AutoComplete 第二）：默认过滤 = contains 匹配 text **或 value**、大小写不敏感、trim（query 空 = 全量显示；`filterOption` 覆盖），编译记录 `ComboboxOption` 结构互通——Select 共享机器、将来 Mentions 等同源接入。面板 = cdk `Popup`（portal、matchWidth 跟壳宽——建议列表是输入框上下文的工具面板，无固有几何，与日历的固有宽语义相反）+ `useDismissible` + `useComboboxKeyboard`（↑↓ 环绕巡行、Home/End、Enter 选中、Space 输入穿越、闭合态箭头先开后巡行）。行固定 md 档（不继承宿主 size）、无持久选中态（选完填值关面板，antd 同构——填充即选中）、无 highlight（富渲染通道 children 归消费方）、无 palette 轴、disabled 行跳过巡行但保持可见。

## 目录结构

```
autocomplete/
├── autocomplete.tsx         # 编排层：遍历子件 + 注入契约 cloneElement + 锚点 div + Popup 承载面板
├── index.ts                 # 出口（AutoComplete + 11 类型 + variants 两符号；Target/Suggestions/Option 经 Object.assign 挂载不进 barrel）
├── children/
│   ├── target/index.tsx     # Target 声明槽（恰一、浇一组件子元素；本体渲染 null）
│   ├── suggestions/index.tsx # Suggestions 声明区域（至多一、只收 Option；本体渲染 null）
│   └── option/index.tsx     # Option 声明叶（value+text+disabled+children 富渲染；本体渲染 null）
├── hooks/
│   └── use-autocomplete.ts  # 状态机单源：值受控对称/open 状态/filter/pick/注入 handlers/键盘/dismiss
├── utils/
│   └── leaves.ts            # 结构化编译遍历：Target 捕获 + 硬错误（多 Target/宿主 DOM 元素/区域外 Option）+ Option 记录
├── controls/
│   └── panel.tsx            # 建议面板：Popup listbox + 行（active/disabled wash、mousedown 防失焦、空态 span）
├── _tests/                  # 43 个：契约/编译错误/过滤/开合/键盘/值循环六组五件
├── types/{component,children,controls,hooks,utils,index}.ts
├── styles/{base,index}.scss # 壳无视觉轴 + listbox/行 overlay 织物（行固定 md）
└── variants/index.ts        # 空轴 cva 底座（家族惯例：轴可生长；视觉身份属宿主 Input）
```

cdk 新面：`src/cdk/combobox/` ——建议行为完整内核，能力一律文件夹化（根只留入口）：`types/`（`option.ts` 词形 `ComboboxOption` + `filter.ts` 筛选契约 `ComboboxFilterFn` + `hooks.ts` 键盘契约，`index.ts` 内部 barrel）+ `filter/index.ts`（`filterComboboxOptions` 纯函数 + `defaultComboboxFilter`，泛型保记录宽型）+ `walk/index.ts`（`walkComboboxLeaves` 通用子树走查，Select 编译共享）+ `hooks/use-combobox-keyboard.ts`（键盘巡行状态机，零内联类型）+ `index.ts`。

## 功能逻辑

### 树编译（utils/leaves）

一次遍历发现宿主与成员，规则全部**编译期硬错误**（fail fast）：Target 恰一（多报错）、Target children 恰一个**组件型**元素（DOM 宿主元素报错——注入契约对组件才有意义；零/多子报错）、Suggestions 至多一、Option 只准住在 Suggestions 内。Fragment/数组/包装器组件可透视（成员可结构性触及，rc-select 同边界）；内部自造成员的组件不可见（成员永不渲染自身、props 即数据）。编译记录：`{ value, text, disabled, key(节点 key 兜底 value), content(children ?? text), className, style }`（`AutoCompleteOptionRecord`——**自带结构不 extends cdk 记录**，防 kernel 类型漏进公共 d.ts；结构与 `ComboboxOption` 互相兼容所以过滤内核直接吃）。无 Option 声明放宽允许（退化纯文本框，面板永空）。

### 注入契约（TargetRequiredProps）

```ts
{ value, onChange, id, name, invalid, disabled, readOnly, aria-*, onFocus, onBlur, onKeyDown,
  role: 'combobox', 'aria-expanded', 'aria-controls',
  'aria-autocomplete': 'list', 'aria-haspopup': 'listbox',
  'aria-activedescendant'?: string }
```

cloneElement 注入**覆盖同名**（值词归 AutoComplete——作者在宿主上写 value/onChange/aria 会被覆盖，文档写明），**静态词自持**；**控件词根转发**（Form 前补强轮新增：`id`/`name`/`invalid`/`disabled`/`readOnly` + `aria-describedby`/`aria-labelledby`/`aria-required` 由根收下再注入宿主——label 关联与表单接线必须到可聚焦 input，此前全落锚点 div；disabled/readOnly 的解析为「根声明者优先、否则读宿主自己的」，`isInteractable` 用解析后的值，其余仍落锚点 div）；宿主自己的 onFocus/onBlur/onKeyDown/onChange 被**链式调用**（库先做、作者回调随后；宿主是 Input 家族，其 `onChange` 即家族载荷 `{ event, value }`，链式调用原样转发同一载荷）。`disabled/readOnly` 由 AutoComplete **读宿主 props 观测**（面板不弹、选择物禁）。锚点与 ref = 根自渲染的 div（`colox-autocomplete`），popup anchor 它而非宿主 ref——不依赖被包组件的 ref 语义。

### 状态机（use-autocomplete）

- **值受控对称**：`value` prop 赢、absent 时内部 state（`defaultValue ?? ''`）；提交统一走 `notifyChange`（uncontrolled 写 state + onChange payload 恒发）。
- **open 受控对称**：`open` prop 赢；内部 `setOpen` 只在非同值时发 `onOpenChange`。
- **打开策略**（仅非受控）：聚焦且有候选 → 开（空 query 显全量）；输入 → 过滤后非空开、零匹配关；Escape/失焦/选中关。`next.trim()` 非空才触发策略——空值不关开态（清空继续显全量）。
- **光标复位**：闭合 → activeIndex -1；值变化且开态 → 首个可用行（「输入重置到首个候选」设计裁定；prev-ref 门防开合切换误触发）。focus 打开不预高亮（-1）。
- 选择 = `notifyChange(option.value) + onSelect payload + 关`；回车选择与点击选择同通道（`selectOption`），载荷 event 随触发源（Key/Mouse）。

### 键盘与 ARIA

`useComboboxKeyboard`（cdk combobox 内核，契约在 `types/hooks.ts`）：↑↓ 巡行绕环跳 disabled、Home/End、Enter（闭合先开、开着且 active≥0 才选中）、Space 输入宿主穿过（`instanceof HTMLInputElement` 判断——注入落到 Input 内层原生 input，判断成立）；行 id `${listboxId}-item-${index}` 挂 `aria-activedescendant`。`useDismissible`（cdk floating 弹层件）双通道（外点/Escape）护隐。

## 测试图谱（43）

- `autocomplete.test.tsx`（13）：契约（combobox 角色/aria 词/面板闭合/结构件渲染 null）、ref=锚点、聚焦开面板、富 children 优先、disabled 行态、编译硬错误 ×6、Fragment/包装器透视。
- `autocomplete-filter.test.tsx`（6）：空 query 全量、text 大小写不敏感、value 匹配、trim、filterOption 覆盖、disabled 行保留在过滤结果。
- `autocomplete-open.test.tsx`（9）：聚焦开/失焦关、输入匹配开/零匹配关、Escape 关且焦点留宿主（jsdom 下**命令式 focus + fireEvent 派发**双步 helper——fireEvent.focus 只派发不真聚焦，DatePicker 靠组件内 ref.focus 同结论）、onOpenChange 通知、受控 open、disabled/readOnly 宿主压弹出、空成员不开、行 mousedown 不失焦。
- `autocomplete-keyboard.test.tsx`（9）：↓ 开+首行高亮、环绕、双向跳 disabled、闭合态 ↑ 从尾、Home/End、Enter 选中（value 填充 + onSelect/onChange 载荷 + 关面板）、闭合 Enter 只开不选、Space 穿越、输入时光标复位首候选。
- `autocomplete-payload.test.tsx`（6）：输入载荷 { event, value }、defaultValue、点击选中填值、disabled 行点击忽略、受控值不随键入变（仅通知）、注入链式宿主 handlers。
