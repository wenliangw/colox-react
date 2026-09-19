# Form 组件

## 职责

**表单子系统**（M3 首件）：原生 `<form>`（`noValidate` 恒开，校验归本层）持有值、校验策略与提交生命周期，配合 `Form.Field` / `Form.Label` / `Form.Hint` / `Form.Validate` 四个 dot 成员与 `useForm` 建库。**不做**字段数组（`FieldArray` 未交付）、不做动态表单、不接管布局引擎——字段列走 `Stack`（token 键 `gap`），段落与并排用 `Container`/`Grid`/`Stack` 组合。

## 目录结构

```
form/
├── form.tsx                     # Form 根：<form noValidate> + 自持/外部 store + <Stack gap> 列 + 四成员 Object.assign
├── index.ts                     # 出口（Form / useForm / useFormContext + 类型 + formFieldVariants）
├── types/
│   ├── index.ts                 # 类型桶
│   ├── store.ts                 # FormValues / FormErrors / FormValidateOn / FormFieldVerdict / FormFieldRegistration / FormStore / 提交载荷
│   ├── component.ts             # FormProps（form/validateOn/labelPlacement/labelWidth/gap/onSubmit/onInvalid）+ FormRef
│   ├── context.ts               # FormContextValue（store + 策略 + 布局默认）
│   └── children.ts              # Field/Label/Hint/Validate 契约 + FormFieldContextValue + FormControlProps（注入面，@internal）
├── context/index.ts             # FormContext / FormFieldContext（null 默认 → 越界即抛）+ useFormContext / useFormFieldContext + useSyncExternalStore 三读钩子
├── hooks/use-form.ts            # useForm：闭包 store（values/errors/errorLeaves/fields/listeners）
├── utils/
│   ├── walk-form-leaves.ts      # 按组件身份拆成员与唯一控件（硬错误）+ buildRuleRunner（叶子按序、首个失败者拥有错误行）
│   ├── run-rules.ts             # 单叶子规则执行（required→min/max→长度→pattern→自定义，message 覆盖）+ isEmptyValue
│   ├── resolve-control-kind.ts  # isBooleanControl（Checkbox/Switch/Radio 单件）/ isGroupControl（两 Group）
│   ├── resolve-empty-value.ts   # 按组件身份取域内空值词（''/null/[]/false/min）
│   └── read-payload-value.ts    # 从家族载荷读下一值（无 value 键回落 event.target.value）
├── children/{field,label,hint,validate}/index.tsx
├── variants/                    # labelPlacement（top/start）+ labelWidth（sizeKeys → 类）
└── styles/                      # base（根/字段/槽）+ label + message（hint/error）+ label-width
```

## 功能逻辑

### 字段解剖与注入

`Form.Field` 的子件按**组件身份**走查（家族 walker 惯例）：`Form.Label`（至多一）、`Form.Hint`（可多）、`Form.Validate`（可多、声明序即错误行序），余下的**唯一组件型元素**是控件。零控件/多控件/多 Label/裸宿主元素/Fragment/字符串都是**硬错误**（消息见 walker）。

注入面（cloneElement，覆盖同名）：

- `id`（控件自带则沿用，否则 `useId` 生成）→ `Form.Label` 的 `htmlFor` 目标；**组控件（两 Group）不走 `htmlFor`**（div 不可被 label 关联），改为 label 自带 id + 组根 `aria-labelledby`。
- `name`（= 字段名）→ 原生表单收集/自动填充仍可用（Form 的值走 store）。
- `invalid` + `aria-describedby`：invalid 时指向错误行 id，否则指 hint id（hint 在无效时让位、错误行独占该槽）。
- `onChange`：收家族载荷 `{ event, value }` → `readPayloadValue` 写 store → `validateOn` 含 `change` 则校验 → **链式调用作者自己的 onChange**。
- `onBlur`：`validateOn` 含 `blur` 则校验 → 链式调用作者的 onBlur。
- 受控词：`checked`（布尔叶子）或 `value`（其余域）。
- `defaultValue`/`defaultChecked` 显式置 `undefined`：字段接管了非受控种子，两个词同时落到原生元素会触发 React 的受控/非受控警告。

### 布尔域判据与空值词（组件身份识别）

- **布尔叶子 = Checkbox / Switch / Radio（单件）**：它们注入 `checked`；`Checkbox`/`Radio` 的 `value` 是字符串表单 token/组键、`Switch` 的 `value` 是原生字符串透传——注入 `value` 会写错词。**组不是布尔件**。
- **空值词按域**（`resolve-empty-value`）：布尔 `false`、`Checkbox.Group` `[]`、`InputNumber`/`DatePicker` `null`、`Slider` `min ?? 0`、`Select` 走 mode（multi `[]`、否则 `''`）、文本族（Input/Textarea/Radio.Group/AutoComplete/未知件兜底）`''`。**存在的理由**：控件必须从首帧起就被受控注入（否则「非受控 → 受控」切换会触发 React 警告），且 store 要有值才能参与校验；两处用同一个 seed：渲染期算 `current`（`store 值 ?? defaultValue/defaultChecked ?? 空值词`）、挂载 effect 把 seed 写进 store（校验/提交即可见，无需一次编辑）。

### 校验模型

- **规则叶子两职**：声明规则 + 渲染自己拥有的错误行。`buildRuleRunner` 按声明序跑叶子，**首个失败的叶子拥有错误**（store 记 `errorLeaf` 下标）；`Form.Validate` 只在自己等于 `errorLeaf` 时渲染（`role="alert"` + `errorId`）。
- **store 只认消息**（`FormErrors` = 名字→消息），叶子下标走旁路（`getErrorLeaf`），公开面保持纯净。
- `setError` 程序化写入（服务端裁决）：字段有规则时落在**第一条叶子**上，无规则则无错误行（也没有 `aria-describedby` 指向不存在的节点）。
- **策略**：`validateOn` 恒表单级（默认 `['submit','blur']`）；提交恒全量校验。**`deps` 是独立信号**：任何值变化后，声明该字段为依赖的字段重跑其规则（不受策略约束）。
- 异步规则：`await` 后按结果落错，**v1 无 pending 态**（明说）。

### 布局（走现有骨架）

`Form` 根把 children 交给 `<Stack direction="column" gap={gap}>`（默认 `'4'`，spacing 键）——字段间节奏即 Stack 的节奏，无第二套布局。字段自身也是 Stack：`top` = 列（`gap="1-5"`：label / 控件 / 消息）；`start` = 行（`gap="3"`，label 槽固定宽 + 内层列 Stack），label 槽宽度来自 `sizeKeys`（`labelWidth="24"` → `--colox-size-24`，永不 px），`padding-block-start: spacing-2` 让 label 与控件首行文字对齐。`Form.Field` 的 `className`/`style`/原生属性落在字段的 Stack 根上（变体类与布局骨架同元素）。

## 调用关系

- 依赖：`../stack`（骨架）、`../checkbox`/`../radio`/`../switch`/`../input`/`../textarea`/`../input-number`/`../date-picker`/`../select`/`../slider`/`../autocomplete`（**仅身份识别与空值词**，不渲染它们；均为 value import，故 form 入口会带上这些模块——树摇按组件切入口在消费方层面成立）、`@colox/theme`（`sizeKeys`/`SpacingKey`）、`clsx`、`class-variance-authority`。
- 被依赖：`@colox/react` barrel、preview 应用 stories、docs 官网。

## 对外接口

- 导出 `Form`（dot：`Field`/`Label`/`Hint`/`Validate`）、`useForm`、`useFormContext`、`formFieldVariants` + 类型（`FormProps`/`FormRef`/`FormLabelPlacement`/`FormStore`/`FormValues`/`FormErrors`/`FormValidateOn`/`FormSubmitPayload`/`FormInvalidPayload`/`FormFieldProps`/`FormLabelProps`/`FormHintProps`/`FormValidateProps`/`FormFieldValidator`/`FormFieldContextValue`）。
- `FormProps`：`form?`（外持 store）、`validateOn?`（默认 `['submit','blur']`）、`labelPlacement?`（`'top'` 默认 / `'start'`）、`labelWidth?`（size 键，默认 `'24'`）、`gap?`（spacing 键，默认 `'4'`）、`onSubmit?`（仅全绿时发 `{ event, values }`）、`onInvalid?`（`{ event, errors }`）。`noValidate` 恒开、`onSubmit`/`onInvalid` 原生同名已 Omit。
- `FormStore`：`getValues/getValue/getErrors/getError/getErrorLeaf/isValid/setValue/setError/validate/validateField/reset/subscribe/registerField`（`registerField` 归 `Form.Field` 用，文档标注）。
- 验收：34 例单测（根契约/策略/外持 store、注入面与组接线、校验树硬错误、规则族与 deps、store 控制面）；真实浏览器 10 项探针。

## 决策与来源

- 定案见决策节点「Form 层 API 定案（M3 首件）」；布局两刀（走 Container/Stack 现有骨架、Label 位置轴 top/start 的 token 键）由用户在 Phase 3 开工前拍板。
- 前序依赖：Phase 1 全家族载荷统一（决策 140111f5）、Phase 2.5 表单叶子补强四件（决策 c28061b4）与 readOnly 家族面（决策 a1e2d2a8）——三者正是本层「一条规则读任意控件」的地基。
