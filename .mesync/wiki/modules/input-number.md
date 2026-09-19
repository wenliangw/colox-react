# InputNumber 组件

## 职责

单行数字编辑框：**文本 input 基底**（`type="text"` + `inputmode="decimal"`，移动端数字键盘）+ **`role="spinbutton"` 语义** + 右端内置 **chevron ↑/↓ 步进条**。词形 `value/defaultValue: number | null`（**null = 空**——数字输入的空态必须可表达），`onChange` 自造 **`{ event, value }`** 事件面（数字解析归库）。**中间态草稿**（`-`、`0.`、`.5` 等不完整小数）不通知；blur 回写最后合法值、超出 `[min, max]` 自动 **clamp**（数字域边界是「机制」不是「校验」——与 Input 无校验引擎不冲突）。step 支持小数、步进结果自动对齐 step 小数位（浮点尘埃消除）、键盘 ArrowUp/Down = ±step。不改动原生受控管线。

## 目录结构

```
input-number/
├── input-number.tsx        # 编排层：接 hook + 组装外壳 JSX（shell 契约类 Input）
├── index.ts                # 出口（InputNumber + 5 类型 + variants 两符号，同 Input 出口面）
├── hooks/
│   └── use-input-number.ts   # 状态机单源：门禁/提交/blur 回写/clamp/步进/回同步
├── utils/
│   └── format-input-number.ts # 纯函数：语法门禁 regex、parse、precision 推导、round、clamp、format
├── controls/
│   └── stepper.tsx          # 内置步进条（两半 chevron 按钮；tabIndex=-1 不在 Tab 序）
├── _tests/input-number.test.tsx  # 30 个测试：契约/draft/提交/blur/步进 5 组
├── types/{component,utils,hooks,controls,index}.ts
├── styles/{base,size,index}.scss  # 外壳 = Input 契约（border/focus-within/invalid/disabled + 四档）
└── variants/{size,index}.ts
```

## 功能逻辑

### 基底选择与「原生忠实」判据

文本 input + `inputmode="decimal"`，**不用**原生 `type="number"`：原生 number 的 spinner 无法样式化（藏掉后反正要自绘步进器），值恒 string 且 `1e5`/空串怪异值多。与 Slider 的判据同源——**原生表达可完整绘制时才用原生**（range 成立、number 不成立）。`role="spinbutton"` + `aria-valuemin/max/now` 补回语义（null 值省略 aria-valuenow）。

### 状态机（use-input-number）

- **门禁**：每次用户跃迁须留在草稿语法内 `/^-?(?:\d+)?\.?\d*$/`（允许空/裸负号/小数点中间态），不合法字符拒绝并保持旧草稿（`1e5` 进不来）；IME 合成中透传仅显示。
- **提交**：完整小数 `/^-?(?:\d+\.?\d*|\.\d+)$/` 解析后 commit；**同值跳过**（"007" 只报 0 和 7）；**空串 = null 立即提交**（空态可表达）。
- **blur**：部分草稿回写最后合法值；超出 min/max clamp 并上报；显示规范化（"007" → "7"）。
- **步进**：`current ?? clamp(0, min, max)` 为基座 ±step → precision 舍入（step 小数位数）→ clamp；到界静默 no-op。程序化提交（步进/clamp）的事件 = 合成 change 形对象（Input handleClear 同款）。
- **回同步**：外部受控值移动时（current 变化且非自己 echo）draft 重生；`current` 判定用 `value !== undefined`——**null 是真实值**，`??` 会吞掉受控 null（首版 bug，测试抓出）。
- **整洁纪律**：全文件 if 一律带 `{}`（首版 13 处单行 if 被用户指正）；handleKeyDown 首版 if/else if 双分支复制 preventDefault+stepBy，改为单 if + `||` 判定 + 方向三元（用户指正「完全可以单 if + || 逻辑实现」）；handler 类型改用 `FocusEventHandler`/`KeyboardEventHandler` 显式标注（去掉 `Parameters<>` 取型）。

### 受控/非受控

`value !== undefined` 判定；受控/非受控完全对称——统一走消费者 onChange 单一事件流。内部 input 恒由 draft 受控（组件私有 DOM 真相）。

### 外壳与步进条

外壳契约照抄 Input 家族：flex + 1px border-muted + radius-lg + focus-within 品牌环 + invalid 红通道 + disabled 面板 + 四档（24/32/40/48 + 左 padding 阶梯 8/12/16/24 与 Input 同源）。步进条 = 右端竖条（spacing-5 宽）hairline 分隔、上下两半 chevron 按钮（IconChevronUp/Down、1em 随档字阶、muted 色 hover 升 text-default——家族 muted 按钮惯用法）；按钮 `tabIndex=-1` 不进 Tab 序（键盘步进走 Arrow 键 + spinbutton 语义，指针走按钮），mousedown preventDefault 防失焦。readOnly 隐藏步进条。step ≤ 0 回退 1。

## 调用关系

- 依赖：`@colox/cdk/input-control`（裸 control 单元，同 Input/Select）、`@colox/icons`（IconChevronUp/Down）、`clsx`、`class-variance-authority`、全局 token 层。
- 被依赖：`@colox/react` barrel、preview 应用 stories。

## 对外接口

- 导出 `InputNumber`、`InputNumberSize`、`InputNumberRef`、`InputNumberProps`、`InputNumberChangePayload`、`inputNumberVariants`、`InputNumberVariants`。
- `InputNumberProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'value' | 'defaultValue' | 'onChange'>`，新增：`size?`（'xs'|'sm'|'md'|'lg'，默认 'md'）、`invalid?`、`value?: number | null`、`defaultValue?: number | null`（默认 null）、`min?`、`max?`、`step?`（默认 1）、`onChange?: (payload: InputNumberChangePayload) => void`。
- 保留扩展点（未建）：formatter/parser/千分位/precision prop/wheel（显示美化层按需再挣）；长按连发；`min > max` 不校验（消费方责任）。

## 状态与测试

`_tests/input-number.test.tsx` 30 个测试：契约 8（文本基底/inputmode/role/aria 三元组/aria-valuenow 省略/invalid+disabled/默认 md+类合并/readOnly 藏步进/ref/原生透传）、草稿与提交 16（解析提交/部分草稿不通知/裸负号/前导点小数/清空 null/非法字符拒绝/粘贴指数整体拒绝/同值跳过/blur 回写/blur 规范化/blur min clamp/blur max clamp/defaultValue 种子 + null 空/外部回同步）、步进 7（上下/到界 no-op/小数精度无浮尘/空值锚 min/部分草稿上步进覆盖/键盘 Arrow+onKeyDown 透传/step 非法回退）。

## 构建·门禁

- 组件多入口 `@colox/react/input-number` → `dist/es/input-number.js` + `dist/cjs/input-number.cjs` + `dist/types/input-number/index.d.ts`；package.json `./input-number` 子路径。
- 组件级 gate：全部 376/376 测试、`pnpm typecheck`、eslint、`pnpm build`。

## 已知边界与扩展点（v1 留白）

- **formatter/parser 通道**（货币/百分比/单位显示）+ **precision prop**（强制位数，当前 = step 推导）+ **千分位**：显示美化层，遇真实需求按需追加。
- **wheel 步进**：v1 不做（文本基底下默认没有——滚轮改值是陷阱）。
- **长按连发**、**step 按钮按住重复**：v2。
- **min > max** 无防护（语义悖谬归消费方；clamp 顺序 min→max 的结果取 max）。
- **IME 数字输入**（全角数字 `１２` 等）：合成结束 commit 时若不在草稿语法内会被拒绝——全角数字域留白（消费方 filterNormalize 或 v2 normalize 层）。
