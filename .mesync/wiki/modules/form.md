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
├── variants/                    # labelPlacement（top/start）+ labelAlign（start/end/justify）+ labelWidth（sizeKeys → 类）
└── styles/                      # base（根/字段/槽）+ label（星号 mark + 文字槽）+ message（hint/error）+ label-align + label-width
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

**labelAlign 轴**（用户拍板第二轮 Form 优化）：start 形态下 label 文字在列内的水平排版对齐——`'start'`（默认，自然行首）/ `'end'`（文字尾部贴向控件）/ `'justify'`（两端对齐，两至四字中文 label 铺满列宽的排版手法；CSS = `text-align: justify` + `text-align-last: justify`，单行 label 全是「最后一行」所以必须带上后者，折行的长 label 每行也均分）。逻辑词（start/end 随 RTL 镜像，justify 无方向），form 级声明 + 字段级覆盖，`top` 形态无列可对齐、恒忽略。**start/end 对齐以列槽为舞台**（槽的 `text-align`，label 内容宽整体对齐——星号与文字一体移动）；justify 例外地把 label 撑满列宽 + 文字槽铺满（星号外置守行缘）。变体类 `colox-form-field--label-align-*` 由 cva 挂在字段根。

**必填星号（required mark）**（用户拍板第三轮 Form 优化）：① **来源自动派生**——`Form.Field` 发现任一 `Form.Validate required` 叶子即 required（星号与真实校验语义同源，不设 `Form.Field required` 双源声明，动态 required 自动跟随）；同一 verdict 驱动控件的 `aria-required="true"` 注入（只在 required 时注入键，undefined 键会盖掉作者自设）。② **位置** `requiredMarkPosition: 'start' | 'end'`（逻辑词，RTL 镜像；`'start'` 前置=`*姓名` 中式、`'end'` 后置=antd 式），form 级 + 字段级覆盖，top/start 两种 placement 都生效。③ **渲染**：label 拆成「星号件 + 文字槽」两块 flex（`align-items: baseline`），星号必须**外于文字槽**——否则 justify 会把星号当字元一并均分扯离文字；星号字形走 **CSS `content: '*'`**（span 为空、`aria-hidden`）——label 的 textContent 保持作者原文（label 查询、aria-labelledby 路径拿干净文本）。④ **隐藏口子**：`Form.Label showRequiredMark={false}` 单label隐藏（纯视觉选择——字段仍 required，aria-required 照注入）。星号色 = `--colox-color-text-error`（错误文字通道），贴字间距 0.25em。⑤ **星号永远贴文字**（用户指正后的修订）：label 尺寸收缩为内容宽（`inline-flex`），`labelAlign` 的 start/end 对齐以**列槽为舞台**——整个 label（星号+文字一体）在列内对齐，任意对齐词下星号永远贴着文字；justify 是唯一例外（文字槽撑满列宽 + 文字铺满，星号外置守在行边缘）。前版把 `flex: 1` 给了文字槽导致 end/justify 下文字走向列右/铺满而星号滞留行首、与文字拉出空档——已修。

## 调用关系

- 依赖：`../stack`（骨架）、`../checkbox`/`../radio`/`../switch`/`../input`/`../textarea`/`../input-number`/`../date-picker`/`../select`/`../slider`/`../autocomplete`（**仅身份识别与空值词**，不渲染它们；均为 value import，故 form 入口会带上这些模块——树摇按组件切入口在消费方层面成立）、`@colox/theme`（`sizeKeys`/`SpacingKey`）、`clsx`、`class-variance-authority`。
- 被依赖：`@colox/react` barrel、preview 应用 stories、docs 官网。

## 对外接口

- 导出 `Form`（dot：`Field`/`Label`/`Hint`/`Validate`）、`useForm`、`useFormContext`、`formFieldVariants` + 类型（`FormProps`/`FormRef`/`FormLabelPlacement`/`FormLabelAlign`/`FormRequiredMarkPosition`/`FormStore`/`FormValues`/`FormErrors`/`FormValidateOn`/`FormSubmitPayload`/`FormInvalidPayload`/`FormFieldProps`/`FormLabelProps`/`FormHintProps`/`FormValidateProps`/`FormFieldValidator`/`FormFieldContextValue`）。
- `FormProps`：`form?`（外持 store）、`validateOn?`（默认 `['submit','blur']`）、`labelPlacement?`（`'top'` 默认 / `'start'`）、`labelWidth?`（size 键，默认 `'24'`）、`labelAlign?`（`'start'` 默认 / `'end'` / `'justify'`，仅 start 形态生效）、`requiredMarkPosition?`（`'start'` 默认 / `'end'`）、`gap?`（spacing 键，默认 `'4'`）、`onSubmit?`（仅全绿时发 `{ event, values }`）、`onInvalid?`（`{ event, errors }`）。`noValidate` 恒开、`onSubmit`/`onInvalid` 原生同名已 Omit。
- `FormStore`：`getValues/getValue/getErrors/getError/getErrorLeaf/isValid/setValue/setError/validate/validateField/reset/subscribe/registerField`（`registerField` 归 `Form.Field` 用，文档标注）。
- 验收：36 例 form 单测（含 labelAlign 轴 2 例、required mark 3 例：派生+aria-required、位置与字段级覆盖、per-label 隐藏）；全仓 620 测试绿；真实浏览器 8 项探针（required mark 组合版：end/justify × 星号前后位的贴字几何、整体贴列、文字铺满、隐藏、字形与色通道）。

## 决策与来源

- 定案见决策节点「Form 层 API 定案（M3 首件）」；布局两刀（走 Container/Stack 现有骨架、Label 位置轴 top/start 的 token 键）由用户在 Phase 3 开工前拍板。
- labelAlign 轴见决策节点「Form 补 labelAlign 轴」（4f107390）；词表 `start/end/justify`（逻辑词，不带 center）与默认 `start` 由用户拍板。
- 必填星号见决策节点「Form 补 required mark（必填星号）」（4f3a4a7e）与修订节点「required mark 二修：showRequiredMark 改名 + 星号永远贴文字」（3a24f4a7）；「从 required 规则派生 + Label 可隐藏、位置词表 `start/end` 默认 `start`、Form 级+字段级」三刀与改名、贴字修复均由用户拍板。
- 前序依赖：Phase 1 全家族载荷统一（决策 140111f5）、Phase 2.5 表单叶子补强四件（决策 c28061b4）与 readOnly 家族面（决策 a1e2d2a8）——三者正是本层「一条规则读任意控件」的地基。
