# Checkbox 组件

## 职责

**多选**组件：单选框（Checkbox 叶子）+ 多选组容器（`Checkbox.Group` dot-part）。叶子是裸原生 `<input type="checkbox">`（`appearance: none` 自己画盒子，ref、原生属性/事件全落其上），`children` 即 label 文案（无独立 `label` prop）；支持三态视觉 `indeterminate`（横条，纯视觉）、manual `invalid` 红通道（与 Input 同 token）、四档尺寸同源（xs/sm/md/lg）。Group 是「内容必须在树」判据下的 dot-part：成员以 `value` 声明参与、组在 context 里下发选中数组/翻转命令/name/disabled 继承；显式 `checked`/`defaultChecked` 的成员独立于组。**不做级联计算**：indeterminate 的「部分选中」数学（选中几个孩子）永远属于消费方——库只可视化第三态。

## 目录结构

```
checkbox/
├── checkbox.tsx             # 根组件（编排层：接 hooks + 调 resolver + 组装 JSX）+ Object.assign 挂载 Group
├── index.ts                 # 出口（Checkbox/useCheckboxGroupContext/checkboxVariants + 类型）
├── children/
│   └── group/index.tsx        # Checkbox.Group：select array 容器（受控/非受控对称）、Provider 下发
├── context/index.ts         # CheckboxGroupContext + defaultCheckboxGroupContextValue（no-op）
├── hooks/
│   ├── use-checkbox-group.ts           # Group 选中态：value/defaultValue 对称 + toggleValue 翻转命令
│   ├── use-checkbox-group-context.ts   # 受保护出口（无警告语义——裸 Checkbox 脱离组是合法用法）
│   └── use-indeterminate.ts            # indeterminate prop → DOM property 镜像（useLayoutEffect）
├── utils/
│   └── resolve-checkbox-state.ts       # 纯判别：成员判定 + checked/disabled/name 解析（本人优先、组继承）
├── _tests/                  # checkbox.test.tsx（叶子）+ checkbox-group.test.tsx（组）
├── types/index.ts           # CheckboxProps/CheckboxSize/CheckboxRef + CheckboxGroupProps/GroupRef/ContextValue
├── styles/
│   ├── base.scss              # label 根 + box 包裹 + control 自绘 + mark 覆盖层（check/bar）
│   ├── group.scss             # colox-checkbox-group 纵向布局
│   ├── size.scss              # 四档尺寸类 colox-checkbox--xs/sm/md/lg
│   └── index.scss             # @use base + group + size
└── variants/
    ├── size.ts              # 尺寸类映射
    └── index.ts             # cva('colox-checkbox', …) + CheckboxVariants
```

示例在 `apps/preview/src/checkbox/checkbox.stories.tsx`（一个 Overview：States / Indeterminate / Sizes / Group 四 Section）。

## 功能逻辑

### DOM 契约

`label.colox-checkbox > span.colox-checkbox__box > input.colox-checkbox__control + span.colox-checkbox__mark(IconCheck + span.colox-checkbox__mark-bar)`，`children` 渲染为 `span.colox-checkbox__label`（无 children 不渲染）。块类名 = `colox-checkbox`（组件自身名字空间）。`className`/`style` 落 label 根；`size` 类与 `--invalid`/`--disabled` 修饰类落根（disabled 用**解析后**的继承值）；`aria-invalid` 落内层 input。box 包裹 span 是定位容器（control 是盒子的视觉本体、mark 绝对定位覆盖其上）；input 获得 `ref`/原生属性/事件/`value`/`name`，FormData 原生收集可用。

### 状态优先级（视觉态裁决）

- **invalid 只画未选中态**：红边框 + 红焦点环作用于未选中盒；一旦勾选/不确定（实心态），品牌边框夺回（同特异性 0,2,0、实心态规则源顺序在后）。键盘焦点落在 invalid+checked 盒上时红环红边短暂标记（交互瞬间的错误提醒，`aria-invalid` 语义始终存在）。
- **disabled 终局优先**：disabled 规则排在最后，压过实心态的边框/底色（灰底 + 白勾）。
- **勾选描边权重**：`IconCheck` 的图标系统默认描边 1.5 单位（16px 渲染 1px）在品牌实心底上呈发丝状——checkbox 在 styles 层以 `stroke-width: 3` 局部翻倍（md 档 ≈2px 实线、xs ≈1.5px、lg ≈2.25px，随排版阶梯等比加粗），图标包契约不动。

### 尺寸与设计语言

尺寸四档**与 Button/Input 同源**：行高 24/32/40/48（`--colox-size-6/8/10/12` 固定 height），字号行高同档同名（xs 12/16、sm 14/18、md 16/22、lg 18/24）。盒子尺寸低两阶：16/20/24/28（`--colox-size-4/5/6/7`）。勾选图标 `IconCheck` 以 mark 的 `font-size`（= 行高同档字号）作 1em 渲染——勾字形随排版阶梯缩放且零 px 字面量。盒子 `radius-sm`。

### indeterminate（第三态）

**纯视觉横条**（CSS 2px bar，不新增图标）：勾选态与不确定态共享 brand-solid 底 + brand-inverse 前景（Button solid-intent 模型），仅 mark 形状不同（check vs bar）。它是 DOM property 而非 HTML attribute：React 类型里没有它，`useIndeterminate` 用 `useLayoutEffect` 把 prop 镜像到 `input.indeterminate`（官方推荐做法）。清除语义：浏览器在下次点击时自动清掉 indeterminate 再翻转 checked——「全选」行点击即进入决定态；表单值/事件流始终只看 `checked`。级联数学归消费方（见 SelectAllDemo）。

### Group 成员判定（resolveCheckboxState）

成员 = 声明 `value` 且未显式 `checked`/`defaultChecked` 的 checkbox：checked 派生自 `group.value.includes(value)`，翻转走 `group.toggleValue(value)`；显式控制者独立（`value` 只喂原生表单）。`disabled`/`name` 组继承、本人优先（组 disabled 不可退出）。成员受控于组：成员自己的 `onChange` 仍透传原生事件，但 `target.checked` 是 React 受控输入的标准语义（恢复后的受控值）——下一选中数组从 `Checkbox.Group` 的 `onChange` 读取（叶子未受控时 `target.checked` 即真实翻转值）。`toggleValue` 纯函数逻辑（含/不含 → 增/删）住 hook，不依赖 DOM 事件目标。

### 受控/非受控对称

叶子：`checked`/`defaultChecked` 原生对称直通（非受控时 `target.checked` 即翻转值）。Group：`value`/`defaultValue` 对称、统一走组 `onChange(value: string[])` 单一事件流（`useCheckboxGroup` 内 `useState(defaultValue ?? [])` + 受控透传）。

## 调用关系

- 依赖：`@colox/icons`（IconCheck，运行时依赖、vite 打包 external 保树摇）、`clsx`、`class-variance-authority`、`./styles/index.scss`、全局 token 层。
- 被依赖：`@colox/react` barrel、preview 应用 stories。

## 对外接口

- 导出 `Checkbox`（含 `Checkbox.Group`）、`useCheckboxGroupContext`、`checkboxVariants`、`CheckboxVariants`、`CheckboxProps`/`CheckboxSize`/`CheckboxRef`/`CheckboxGroupProps`/`CheckboxGroupRef`/`CheckboxGroupContextValue`。
- `CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value'>`（`type` 锁死 checkbox、`value` 收紧为 string），新增：`size?`（'xs'|'sm'|'md'|'lg'，默认 'md'）、`invalid?`、`indeterminate?`、`value?: string`（成员键 + 表单值）。
- `CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>`，新增：`value?: string[]`、`defaultValue?: string[]`、`onChange?: (value: string[]) => void`、`disabled?`、`name?`。Group 根 div `role="group"` + `colox-checkbox-group`（纵向布局，gap spacing-2）。
- 未建（按需追加纪律）：`options` 数组便捷形态；嵌套 Group（内层组自成体系，但外层不感知——罕见场景，遇到真实需求再挣）。
