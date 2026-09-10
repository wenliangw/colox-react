# Input 组件

## 职责

带外壳的**基础 + 表单**双栖单行输入框：外壳（group shell）承载全部视觉契约（边框、焦点环、尺寸、invalid/disabled 态），内部是裸原生 `<input>`（ref、原生属性/事件全落于此）。提供前置/后置插槽（`leading`/`trailing` ReactNode）、三个内置控件（`clearable` 清除钮、`allowTogglePassword` 密码可见性切换、`type="search"` 自动搜索图标）、以及**输入限制通道** `filterPattern`（与原生 `pattern` 的校验通道正交）。类型的导出面保持 v1：`Input` / `InputSize` / `InputRef` / `InputProps` / `inputVariants` / `InputVariants`。

**不做校验引擎**：Input 是叶子组件。原生 constraint 校验属性（`pattern`/`required`/`min`/`max`/`maxLength`…）全透传、`invalid` 只提供手动状态上报通道、`:user-invalid` 用同一套红 token 渐进增强；规则/异步校验/错误消息/字段联动归未来的 Form/Field 层，动态表单是独立子系统（Form/Field/FieldArray/useForm），不与 Input 纠缠。Input 对表单层的承诺只有三件：受控/非受控对称、原生事件流、真 ref。

## 目录结构

```
input/
├── input.tsx                # 编排层：接 hooks + 调 resolver + 组装外壳 JSX（无判别/状态逻辑）
├── index.ts                 # 出口（六个公开符号，与 v1 一致）
├── hooks/                   # React hook（状态/行为逻辑，高内聚拆分）
│   ├── use-input-filter.ts    # filterPattern 行为：三车道（IME 透传/清除直通/过滤门禁）+ 合成/清除/回写
│   └── use-password-visibility.ts  # 密码可见性关切：active/resolvedType/revealed/toggle
├── utils/
│   └── resolve-input-slots.tsx  # 纯判别装配：searchLeading/showClear/showTrailing
├── controls/                # 内置尾插控件子组件（非公开面）
│   ├── clear-button.tsx       # ClearButton：mousedown 防失焦、aria-label="Clear input"
│   └── visibility-toggle.tsx  # VisibilityToggle：状态式图标（闭眼=隐藏/睁眼=可见）
├── _tests/                  # 6 个测试文件：state/size/slots/builtins/filter/contract
├── types/index.ts           # InputProps（全量扩展）+ InputSize + InputRef
├── styles/
│   ├── base.scss              # 外壳契约（focus-within 环/invalid/disabled）+ 裸 control + 插槽条
│   ├── slots.scss             # 内置按钮复位样式（clear/toggle）
│   ├── size.scss              # 尺寸类 colox-input-group--sm/md/lg（作用于外壳）
│   └── index.scss             # @use base + slots + size
└── variants/
    ├── size.ts              # 外壳尺寸类映射
    └── index.ts             # cva('colox-input-group', …) + InputVariants
```

组件内不放 `_stories/`（已迁至 `apps/preview/src/input/`：`input.stories.tsx` 尺寸/插槽/状态页、`builtins.stories.tsx` 清除/密码切换页、`filter.stories.tsx` 正则限制页）。

## 功能逻辑

### 外壳 DOM 契约

`div.colox-input-group > span.colox-input__leading? + input.colox-input__control + span.colox-input__trailing?`
空插槽不渲染 span；内置控件追加在消费者 `trailing` 内容**之后**。`className`/`style` 落外壳；`size` 类与 `--invalid`/`--disabled` 修饰类落外壳；`aria-invalid` 落内层 input。焦点视觉从 `:focus` 上移到外壳 `:focus-within`（焦点停留在插槽按钮上时环不灭）。

### 尺寸与图标继承

尺寸档（sm/md/lg）作用于外壳：padding + font-size + line-height；内层 control 零 padding、`font: inherit`。插槽图标（IconSearch/IconX/IconEye…）以 1em/currentColor 渲染，随外壳字号、色调零配置继承。

### filterPattern（输入限制通道）

与原生 `pattern`（表单校验通道）正交。契约：**值全程属于模式语言**——每次用户输入跃迁的新值不匹配模式即拒绝（保留旧值、不触发消费者 onChange）。模式作者自行写成全/部分匹配语义（`/^\d*$/` 允许空值与中间态；`/^\d+$/` 会使打字式清空不可能）。IME 合成期间原样透传、合成提交后的终值才过门禁（合成中不改写 lastAccepted 锚点，拒绝时弹回合成前值而非拼音）。外部喂入的违反模式的受控值**永不改写**（只过滤用户跃迁）。清除按钮**旁路** filterPattern：显式清空永远合法（清晰语义，背靠「内置控件=机制」边界）。

`filterPattern` 的 RegExp 需无 `g`/`y` 旗标（`test` 有状态）；组件不做 clone——文档要求消费方传无状态模式或自行 reset。相关决策见决策链。

### 受控/非受控与清除直通

- 控制模式判定 `value !== undefined`（React 惯例）；受控/非受控完全对称——统一走消费者 onChange 单一事件流，无内部 value 状态。
- **清除钮直通消费者 onChange**（构造 `{target, currentTarget, type:'change'}` 事件形对象直接调用），不向 DOM 派发事件再绕合成系统：React 的 change 插件对受控输入报告旧值（value tracker 未同步）并在无状态更新时回写 DOM，DOM 派发通道不可靠；这是 MUI/Ark 同款做法。非受控旁路先 `input.value = ''` 再通知。相关实现事实见 `.mesync/corrections/form-inputs.md`。
- `filterPattern` 拒绝路径同样直接回写 DOM 值（受控回写 `restoreValue`；非受控回写 lastAccepted），不触发 onChange。

### 内置控件

- **清除（`clearable`，默认 false）**：追加到尾插槽；`disabled`/`readOnly` 下不渲染；`onMouseDown` preventDefault 防焦点转移；`aria-label="Clear input"`；`clearIcon` 可替换（默认 `IconX`）。
- **密码可见性（`allowTogglePassword`，默认 false）**：仅当 `true` 且 `type="password"` 时生效；内部 `revealed` state 为纯视觉状态（非 value），切换 input type text/password；`onMouseDown` 防失焦；`aria-label` 状态式："Show password"（隐藏时）/ "Hide password"（可见时）。图标语义 **状态式**：隐藏时显示闭眼 `eyeOffIcon`（默认 `IconEyeOff`）、可见时显示睁眼 `eyeIcon`（默认 `IconEye`）——「没输密码时闭眼、能看到内容时睁眼」；「点击后会发生什么」的动作式语义被否（见决策链）。
- **搜索前置图标（`type="search"`）**：无显式 `leading` 时自动渲染 `IconSearch` 进前置槽；显式 `leading` 优先。CSS 抑制 webkit 原生 search cancel 装饰，避免与内置清除钮重复。

## 调用关系

- 依赖：`@colox/icons`（IconSearch/IconX/IconEye/IconEyeOff，运行时依赖、vite 打包 external 保树摇）、`clsx`、`class-variance-authority`、`./styles/index.scss`、全局 token 层。
- 被依赖：`@colox/react` barrel、preview 应用 stories。

## 对外接口

- 导出 `Input`、`InputSize`、`InputRef`、`InputProps`、`inputVariants`、`InputVariants`。
- `InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>`，新增：`size?`（'sm'|'md'|'lg'，默认 'md'）、`invalid?`、`leading?`、`trailing?`、`clearable?`、`allowTogglePassword?`、`clearIcon?`、`eyeIcon?`、`eyeOffIcon?`、`filterPattern?`。
- 保留扩展点（未建）：插槽渲染函数形态 `ReactNode | (state) => ReactNode`——主流库皆不做，遇到真实需求再挣（按需追加纪律）。
