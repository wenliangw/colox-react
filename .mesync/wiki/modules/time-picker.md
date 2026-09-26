# TimePicker 组件

## 职责

单行时间编辑器：**文本 input**（Input 家族外壳契约）+ 输入面右端 **装饰 IconClock**（pointer-events:none、点透到壳开面板）+ **自绘面板**（cdk `Popup` + `useDismissible` + `useFloatingPosition`，`matchWidth={false}`——面板宽度靠内容自撑：两列 48px + gap + padding）。**canonical 值 = `'HH:mm'` 定宽串**（定宽使词法序 = 时间序，`null` = 空）。`onChange` 自造 **`{ event, value }`**（家族事件面第 13 叶）。**`valueFormat`**（默认 `'HH:mm'`）走 cdk date 词表 token（`H`/`HH`/`h`/`hh`/`m`/`mm` + 字面分隔符）**display-only**——内部值与载荷恒 canonical 不受 format 污染；placeholder = format 串。手输接受 pattern 本身 + 宽松语法 `/^\d{1,2}:\d{1,2}$/`（时 ≤23、分 ≤59），**完整词当刻提交为 canonical**（聚焦中文本逐字保留），**部分草稿静默 + blur 回滚**，空串当刻提交 `null`；**min/max 是编辑器机械非校验**——越界时间项禁选、越界手输静默按住 blur 回滚（时间世界回滚非 clamp）。**面板 = 两根纯数字循环列**（时 00–23 / 分 00–59，首尾相接）：每列可视区 **8 个时间项**（无滚动条）、上下各一箭头钮点击滚动、**步进 7 个选项**；**点选时间项即提交合并词并关面板**（date-only「点格即提交」同族）；选中项 = palette primary solid（DatePicker 选中格同款）。**窗口锚定**：打开时有值→值分量驻 slot 3（上方 3 项、下方 4 项），空值→按打开瞬间系统时分锚定；**min/max 越界选项禁选**（任何一次点选都无法铸出界词——诚实禁选语义）；键盘：↑/↓ 单选步进（窗口边缘滑一格跟随）、PgUp/PgDn 与箭头钮同款七步、Home/End 列顶/底、←/→ 换列、Enter/Space 提交、Esc 关面板。`disabled`/`readOnly` 锁面板（开放钳 `openable = !disabled && !readOnly`，useDismissible 同钳）。`clearable` = Select 同款行内交互（`IconButton size="4" variant="muted"` ✕ 钮，mousedown preventDefault 不抢焦点，提交走 onChange 流）。ref 透原生 input（`TimePickerRef = HTMLInputElement`）。

## 架构归属（十二轴定案：自建、零 cdk 新桶）

TimePicker **完全自建**：壳 = Input 家族外壳契约自实现、状态机 = 家族模式自建更瘦的 `use-time-picker`、clearable 钮自建；代码复用仅限既有 **cdk/floating** 弹层基建（Popup/useDismissible/useFloatingPosition）与 **cdk/input-control** 裸控件，以及 **cdk/date 公开面**（compilePattern/patternToParseSource/dateFormat）。**cdk 不新增桶**——picker 状态机是家族编排非能力内核（combobox 键盘巡行才是），时间列是视觉构件（批 3 showTime 单向内部引用即解）；cdk 保持 headless 能力内核/纯函数初衷。批 3（DatePicker showTime）经 date-picker → time-picker 的单向内部引用取「children 时间列视觉件 + hooks/useTimeColumns」，不碰 TimePicker 公共面/壳/状态机——本项目首个跨组件内部引用。

## 目录结构

```
time-picker/
├── time-picker.tsx          # 编排层：接 hook + 外壳 JSX（Input 家族壳 + Popup 承载面板）
├── index.ts                 # 出口（TimePicker + 5 类型 + timePickerVariants）
├── hooks/
│   └── use-time-picker.ts    # 状态机单源：draft 门禁/提交/blur 回滚/open/双列窗口+键盘游标
├── utils/
│   └── format.ts             # 本家时间偏门：常量(HOUR_COUNT 24/MINUTE_COUNT 60/COLUMN_VISIBLE 8/COLUMN_STEP 7/ANCHOR_SLOT 3/TIME_DEFAULT_FORMAT) + parseTimeText/draft 门/timePartsOf/formatTimeValue/canonicalBoundOf/anchorAround/visibleOptions（吃 cdk/date 公开面）
├── controls/
│   ├── panel.tsx            # 面板（时列 + 分列并列，role=dialog）
│   ├── time-column.tsx      # 单列：上下步进钮 + 8 项 listbox（未包裹 anchor 展开、渲染 mod 自然循环）
│   └── clear-button.tsx     # clearable 尾部 X 钮（IconButton base + 站点定位类，Select 同款）
├── _tests/
│   ├── time-picker.test.tsx  # 19 个：外壳/提交载荷/宽松语法/草稿与模糊回滚/面板锚定/窗口步进/循环/点选合并/禁选/clear/键盘
│   └── format-utils.test.ts  # 18 个：parseTimeText（pattern+宽松）/draft 门/canonicalBoundOf/formatTimeValue/窗口数学
├── types/{component,utils,hooks,controls,index}.ts
├── styles/{base,palette,size,index}.scss  # 外壳 = Input 契约 + 面板 overlay 织物 + 列/选项；palette 私有变量
└── variants/{size,palette,index}.ts       # size 四档 + palette 六族双轴
```

## 功能逻辑

### 解析/草稿（utils/format.ts）

- **`parseTimeText(text, pattern)`**：先 pattern 解析（compilePattern + patternToParseSource，`hour24`/`hour12` 任一命中记时、`minute` 记分、calendar token 捕获即弃），失败回落宽松语法 `/^\d{1,2}:\d{1,2}$/`（先去空白；时 ≤23、分 ≤59）；产出 `TimeParts { hour, minute }` 或 null。修剪空白后空串不在此函数处理（空终端在状态机）。
- **`isTimeDraftAllowed`** 宽松门禁：数字、`: . 空格`、pattern 字面字符全放行——只挡废字符，严格校验在 commit/blur 的 parse；IME 合成中透传仅显示。
- **`formatTimeValue(value|null, pattern)`**：parts 包 `{year:1970,month:1,day:1,...}` 走公开 `dateFormat`——显示出口不抛（null 渲染 `''`）。
- **`canonicalBoundOf(bound)`**：string 走 parseTimeText、Date 走本地壁钟 getHours/getMinutes、undefined/垃圾返回 null（越界词退出比较）。

### 窗口数学（未包裹整数）

每列一个**未包裹 anchor** + 一个**未包裹键盘游标**，不变式 `anchor ≤ cursor ≤ anchor+7`；选项渲染 `((offset % count) + count) % count`——窗口贴近循环边界时自然换行绘制（无滚动条），未包裹数字让 anchor/cursor 数学无缝。`anchorAround(value) = value - 3`（slot 3 = 上方 3 项下方 4 项）。

### 状态机（use-time-picker）

- **draft 门禁 → 空当刻提交 null → 完整词 parse 通过且未越界即提交 `HH:mm`**（与上次已提交值相同不重报）——外部 value 变化经 `lastCommittedRef` 差分重同步 draft，自提交先更 ref 防回显打断输入（date 编辑器同款）。
- **blur**：parse 失败/越界 → 回滚到已提交值显示；成功且异于已提交 → 规范化提交（走 valueFormat 显示）；成功且相同 → 仅规范化显示。
- **打开面板**：先落窗（`anchorAround` 值分量或系统时分）+ 游标落值分量，再置 open（受控 open 时只报 onOpenChange）。
- **列步进** `scrollColumn(unit, ±1)`：anchor 与游标同骑 ±7（游标保槽）；**↑/↓** `moveCursor`：向窗口外一步则窗滑一格跟随，否则仅游标；**Home/End** 落在列界（时/分 0 或 23/59）距离游标最近的未包裹一圈、再 `anchorAround` 落槽；**←/→** 换列：pendingFocusRef 记目标列他列游标 mod 值，effect 里 `[data-unit] [data-time]` 程序化聚焦（date 网格同款模式）。
- **点选/Enter/Space** `handleSelectOption(unit, value)`：合并词 `HH:${committedMinute}` / `${committedHour}:MM`（空值分量按 0），`isDisabled` 出界则拒收（禁选项本身已不可点，双保险按钮语义）；提交 + 关面板 + 焦点回 input。
- **键盘打开**：input ArrowDown/Enter 当 panel 关时 preventDefault 并打开。
- **选项级禁选 = 合并有效性（诚实语义）**：`isDisabledHour(h) = isDisabled(pad(h):pad(committedMinute ?? 0))`、分钟对已提交时——某分量此刻点选的**合并结果**出界则该分量禁选；min/max 为 string|Date 双收，比较走 `canonicalBoundOf` 的 `'HH:mm'` 定宽词（词法序 = 时间序，Date 走本地壁钟时分）。

### 面板与可访问性

`role="dialog" aria-label="Choose time"`；每列 listbox `aria-label="Hours"/"Minutes"` + `data-unit`；选项 `role="option"` + `data-time`（mod 值）+ `aria-selected`/`aria-disabled` + 游标位 tabIndex 0（其余 -1，roving）；步进钮 `aria-label="Previous/Next hours|minutes"` tabIndex -1。paletteClass 同时骑外壳与 Portal 面板根（面板不在外壳祖先链上，palette 私有 CSS 变量需级联进弹层——DatePicker 同款门户教训）。面板宽度本征（2×48px 选项 + 8px gap + padding），挂 overlay 织物 token（bg-overlay、border-muted、radius-md、shadow-md）。

## 边界

- **批 3 单向引用纪律**：showTime 只许 date-picker 引 time-picker 内部件（children 时间列 + hooks/useTimeColumns），不引公共面/壳/状态机；反向引用是禁地。
- **时区/本地化**：时间值恒本地壁钟语义（min/max 的 Date 走本地时分）；pattern 词表无 meridiem token（`h` 12 制裸渲染），本地化是 cdk/date 点名缺口。
- **Form 兼容**：家族载荷同形（value prop 分层同名、`{event,value}` 载荷 value = 组件下一值），Form.Field 无注册表即收。
