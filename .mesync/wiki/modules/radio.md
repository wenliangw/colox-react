# Radio 组件

## 职责

**单选**组件：单选框（Radio 叶子）+ 单选组容器（`Radio.Group` dot-part）。叶子是裸原生 `<input type="radio">`（`appearance: none` 自己画圆，ref、原生属性/事件全落其上），`children` 即 label 文案（无独立 `label` prop）；选中走**环+点模型**（品牌描边环 + 内部品牌实心点，内圆不整填——单选平台的经典辨识惯例，与 Checkbox 的实心方块观感区分）；`invalid` 红通道与 Input/Checkbox 同 token 同优先级（只画未选中态）；四档尺寸与 Button/Input/Checkbox 同源。Group 是「内容必须在树」判据下的 dot-part：成员以 `value` 声明参与、组在 context 下发**单值**选中态/select 命令/name/disabled 继承；显式 control 或无 `value` 的成员独立于组。单选无 indeterminate——真相就是「选中了哪一个」。

## 目录结构

```
radio/
├── radio.tsx                # 根组件（编排层：接 hooks + 调 resolver + 组装 JSX）+ Object.assign 挂载 Group
├── index.ts                 # 出口（Radio/useRadioGroupContext/radioVariants + 类型）
├── children/
│   └── group/index.tsx        # Radio.Group：单值容器（受控/非受控对称）、Provider 下发
├── context/index.ts         # RadioGroupContext + defaultRadioGroupContextValue（no-op）
├── hooks/
│   ├── use-radio-group.ts            # 单选态：value/defaultValue 对称 + selectValue 选中命令
│   └── use-radio-group-context.ts    # 受保护出口（无警告语义——裸 Radio 脱离组是合法用法）
├── utils/
│   └── resolve-radio-state.ts        # 纯判别：成员判定 + checked/disabled/name 解析（本人优先、组继承）
├── _tests/                  # radio.test.tsx（叶子）+ radio-group.test.tsx（组）
├── types/index.ts           # RadioProps/RadioSize/RadioRef + RadioGroupProps/GroupRef/ContextValue
├── styles/
│   ├── base.scss              # label 根 + circle 包裹 + control 自绘 + mark 点覆盖层（::before 50% 圆点）
│   ├── group.scss             # colox-radio-group 纵向布局
│   ├── size.scss              # 四档尺寸类 colox-radio--xs/sm/md/lg
│   └── index.scss             # @use base + group + size
└── variants/
    ├── size.ts              # 尺寸类映射
    └── index.ts             # cva('colox-radio', …) + RadioVariants
```

示例在 `apps/preview/src/radio/radio.stories.tsx`（一个 Overview：States / Sizes / Group 三 Section）。

## 功能逻辑

### DOM 契约

`label.colox-radio > span.colox-radio__box > input.colox-radio__control + span.colox-radio__mark`，`children` 渲染为 `span.colox-radio__label`（无 children 不渲染）。块类名 = `colox-radio`。`className`/`style` 落 label 根；`size` 类与 `--invalid`/`--disabled` 修饰类落根（disabled 用解析后的继承值）；`aria-invalid` 落内层 input。圆点不占 DOM：`__mark::before`（50% 宽高、`radius-full`、currentColor）上色随态——无 per-tier 字面量。input 获得 `ref`/原生属性/事件/`value`/`name`：组共享 `name` 时浏览器原生单选取代 + FormData 原生收集。

### 环+点模型（与 Checkbox 实心模型的区分）

选中态 = 品牌描边环 + 内部点：`:checked` 只染 `border-color`（内圆保持 bg-solid），mark 上 opacity 1 + `color: brand-solid`，点以 currentColor 充填（50% 直径）。这与 Checkbox 的「品牌实心底 + 反色/描边加粗 mark」是两套形态语言：方块实心 vs 圆环点——单选/多选的双控件辨识由形态承载。disabled 时点转 `text-disabled`。无 indeterminate。

### 状态优先级

- **invalid 只画未选中态**（与 Checkbox 同一裁决）：红边框 + 红焦点环作用于未选中圆；选中后 `:checked` 夺回品牌环（同特异性 0,2,0 + 源顺序），焦点交互瞬间红环红边仍短暂标记。
- **disabled 终局优先**：边框/底色 disabled 三件套，选中点 text-disabled。

### Group 单值语义（resolveRadioState + useRadioGroup）

成员 = 声明 `value` 且未显式 `checked`/`defaultChecked`：checked 派生自 `group.value === memberValue`，选中走 `group.selectValue(value)`。**无移除语义**：radio 不可反选，重复点击已选中成员时 DOM 无 change 事件——selectValue 由成员 change 驱动，天然不会重复上报（受控/非受控同构）。显式 control / 无 value 成员独立。组级 `onChange(value: string)` 取代单选态的 next 值通道；成员 `onChange` 仍原生透传（受控值语义，见 Checkbox 同款边界——消费方从 Radio.Group 读 next）。`disabled`/`name` 组继承、本人优先。

### 受控/非受控对称

叶子：`checked`/`defaultChecked` 原生对称直通（非受控时 `target.checked` 即翻转值；受控 radio 只能在「选中未选中者」时触发 change）。Group：`value`/`defaultValue` 对称、统一走组 `onChange(value: string)` 单一事件流（`useRadioGroup` 内 `useState(defaultValue ?? '')` + 受控透传）。

## 调用关系

- 依赖：`clsx`、`class-variance-authority`、`./styles/index.scss`、全局 token 层。**无图标依赖**（圆点 CSS 化——按需追加纪律，不为单选点引入新图标）。
- 被依赖：`@colox/react` barrel、preview 应用 stories。

## 对外接口

- 导出 `Radio`（含 `Radio.Group`）、`useRadioGroupContext`、`radioVariants`、`RadioVariants`、`RadioProps`/`RadioSize`/`RadioRef`/`RadioGroupProps`/`RadioGroupRef`/`RadioGroupContextValue`。
- `RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value'>`（`type` 锁死 radio、`value` 收紧为 string），新增：`size?`（'xs'|'sm'|'md'|'lg'，默认 'md'）、`invalid?`、`value?: string`（成员键 + 表单值）。
- `RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>`，新增：`value?: string`、`defaultValue?: string`、`onChange?: (value: string) => void`、`disabled?`、`name?`。Group 根 div `role="radiogroup"` + `colox-radio-group`（纵向布局，gap spacing-2）。
- 未建（按需追加纪律）：`options` 数组便捷形态；Radio.Button 形态（antd 风格按钮单选——需形态轴，遇到真实需求再挣）。
