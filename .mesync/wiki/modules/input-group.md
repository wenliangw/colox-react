# InputGroup（已搁置，无真实宿主）

状态：**搁置**（对齐轮用户拍板「场景并不明确，先放到后面」）。ROADMAP M3 保留「remaining」位，等真实产品线出现再开对齐轮。本页保存盘点快照，下轮从这里续。

## 能力边界事实（2026 对齐轮核对）

- **Input 已内嵌插槽面**：`leading`/`trailing` 插槽、`clearable` 内置清除、`allowTogglePassword` 密码显隐、`filterPattern` 输入限制——单片面向的纯文字前后缀（`https://`、`.com`）与密码显隐**已在 Input 壳内解掉**，组不应再造 addon 词法。
- **Select / InputNumber / DatePicker / AutoComplete 无插槽面**（仅 clearable 之类）——多件并联的缺口在它们身上。
- ROADMAP 里「`colox-input-group*` namespace 已预留」只存在于 ROADMAP 那句话，**代码里无任何占位**，可从零定义。

## 场景盘点（按值语义分类）

### A 类 · 多枚控件分割一个值（核心宿主）

- A1 区号+电话：`Select` + `Input`——海外注册/CRM，真实
- A2 金额+币种：`InputNumber` + `Select`——金融后台，真实
- A3 日期范围：`DatePicker` + 分隔件 + `DatePicker`——弹层各自 portal，组只粘外壳
- A5 数字+单位：`InputNumber` + 静态字（px/ms/%）——归属未定（组内静态段 vs InputNumber 自带 `trailing`），挂起

### B 类 · 控件 + 主线动作

- B1 搜索框+搜索按钮：`Input` + `Button`——经典
- B2 验证码+获取验证码按钮——**宿主未证实**
- ~~B3 密码+显隐~~：已被 `allowTogglePassword` 解掉，不出现在组

### C 类 · 多段复合筛选（一条陈述行）

- C1 `Select(字段)` + `Select(操作符)` + `Input(值)`——数据表格工具栏，真实

### D 类 · 负清单（已解/不成立）

- Input 纯文字前后缀 → Input 自身插槽
- 纯按钮并排（保存/取消）→ `Stack` gap，无输入线语义
- Textarea 等不等高/多行件 → 组是等高输入线，不进组

## 搁置原因

场景在册范围与负清单边界两轮未拍板；组与 Input 既有插槽能力的分界没有清晰答案；B2/A5 的宿主与归属悬置。无头绪时不硬设计。
