# DatePicker 组件

## 职责

单行日期编辑器：**文本 input**（Input 家族外壳契约）+ 输入面右端 **装饰 IconCalendar**（pointer-events:none、点透到壳开面板）+ **自绘面板**（cdk `Popup` + `useDismissible` + `useFloatingPosition` matchWidth——打开方式经用户默认「原生不可绘制就自绘」路线）。**`picker` 维度（'date' | 'month' | 'year'）**：值词形随粒度——`'YYYY-MM-DD'` / `'YYYY-MM'` / `'YYYY'`（**canonical 恒唯一真相、null = 空**），面板对应日格/12 月格/12 年十年窗三视图。`onChange` 自造 **`{ event, value }`**（value = 规范化粒度串或 null——InputNumber 同构第三兑现）。**valueFormat prop 走标准 token 写法**（`yyyy`/`yy`、`M`/`MM`、`d`/`dd`、`EEE`/`EEEE` 星期几——**display-only**：反解无意义、parse 忽略；token 大小写不敏感、非字母即字面分隔符），默认随 picker（`'yyyy-MM-dd'`/`'yyyy-MM'`/`'yyyy'`）、placeholder = format 串；**内部值与载荷恒 canonical 不受 format 污染**（antd format 双通路教训——显示与真值脱钩）。**面板 chrome 默认中文**（日视图标题 `{year}年{month}` 如「2026年3月」、月视图 `{year}年`、年视图 `{start}–{end}年`、周头 一…日），`locale` prop 数据型定制 `{ months?, weekdays?, yearMonthFormat?, yearFormat?, decadeFormat? }` 逐字段回退中文默认、无渲染回调——chrome 文案、valueFormat 字段显示、内部 canonical 三层各管各。手输接受规范语法（按精度阶梯：完整日期 `YYYY-MM-DD`/`YYYY/M/D`、年月 `YYYY-M[M]`、裸年 `YYYY`）外加 format 模式本身，**精度 ≥ picker 粒度才提交**（更细截断、更粗回滚），**非法/越界 blur 回滚**——日期世界回滚非 clamp（日期域无「最近合法值」自然序，min/max 语义 = 面板禁格（月/年格按粒度前缀对界）+ 手输回滚，机制非校验）。日视图 = 6×7 固定 42 格周一开头（尾部邻月填充 muted、可点选并跳月）、年月导航 chevron；**当前格（今天/当月/当年）未选中时恒 subtle**（subtle 浅底 + 家族字色、hover 深一档 muted wash——Button subtle 配方，**与是否选中其他日期无关**），**选中 = 当前格时 subtle 完全让位、只剩 selected 样式**（subtle 规则带 `:not(--selected)` 显式排除——`:not()` 把特异度抬到双类级，靠源码序根本压不过单类 `--selected`，这是前一轮「选中今天多 border/不被 solid 盖住」的第二个根因）、禁格 aria-disabled 不穿 wash。**面板层级钻取（antd 广域心智）**：日格标题是**分节可点的钻取路径**——「2026年」「3月」两个钮各自钻取（点月落月格、**点年直落年格**，月格「2026年」点入年格），十年格标题终级纯 span；**在 picker 粒度之上点选只下钻不提交**（日 picker：点年落月格、点月落日格；月 picker：点年落月格、点月才提交；年 picker 十年格即终级）；下钻后焦点经 pendingFocusRef 落到新格 anchor（选中月 → 今天 → 格首）。标题钮语义色：默认 text-default、hover 变 palette solid（「这里通向某处」的家族语义）；chevron 仍 muted 惯用法——可点标题与导航钮区分靠语义色而非同款皮肤。**双档 chevron（antd 同构）**：单箭头走本 level 步长（日格 ±月、月格 ±年）、双箭头走父粒度（日格 ±年、月格 ±十年）；**年格只显示双箭头**（±十年）。**clearable = Select 同款行内交互**：值 + clearable → 尾部 X 钮（IconButton muted size=4）hover/focus 与日历图标**交换露出**（绝对定位叠槽 + opacity 交换，mousedown 防失焦），点击 commit null + 焦点留场 + 关面板；shell 点击对 `closest('button')` 早退不弹面板（Select 同款护栏）。视觉轴 palette 六族默认 primary 只染选中格（family solid 圆 + inverse 文字）、空态当前格 subtle、当前圈（family muted）——Switch「只染开态」、Slider「只染已走段」同源克制；**palette 私有变量与修饰类必须挂在 popup 根**（面板在 portal、壳非祖先——首版声明在壳上导致选中/今天绘制全灭，correction #16）。size 四档 + invalid/disabled 铁律。

## 目录结构

```
date-picker/
├── date-picker.tsx          # 编排层：接 hook + 外壳 JSX（shell 契约类 Input）+ Popup 承载面板
├── index.ts                 # 出口（DatePicker + 8 类型 + variants 两符号）
├── hooks/
│   └── use-date-picker.ts    # 状态机单源：draft 门禁/提交/blur 回滚/open/view/网格键盘
├── utils/
│   ├── date-core.ts          # 零时区日历数学：Hinnant 算法、月网格、addMonths、粒度工具（parseGranularIso/buildMonthViewCells/buildYearViewCells/decadeOf）
│   ├── format-date.ts        # 纯函数：pattern 编译、formatIso、精度化 parseDateText、草稿门禁、PICKER_DEFAULT_FORMAT
│   └── locale.ts             # 面板 chrome 本地化：中文默认（月标/周头/日·月·十年三标题格式串）+ resolve/compose
├── controls/
│   ├── panel.tsx            # 面板（header 导航 + 日格/月格/年格三视图；--empty 空态作用域）
│   └── clear-button.tsx     # clearable 尾部 X 钮（IconButton base + 站点定位类，Select 同款）
├── _tests/
│   ├── date-picker.test.tsx  # 55 个：契约/编辑状态机/面板/键盘/月·年 picker 组
│   ├── date-core.test.tsx    # 15 个：日历数学 + 粒度值与视图
│   ├── format-date.test.tsx  # 17 个：编译/格式化/解析/精度/门禁
│   └── locale.test.tsx       # 7 个：中文默认/逐字段回退/不突变/compose 定制/占位透传
├── types/{component,utils,hooks,controls,index}.ts
├── styles/{base,palette,size,index}.scss  # 外壳 = Input 契约 + 面板 overlay 织物 + compact 网格 + palette 私有变量
└── variants/{size,palette,index}.ts       # size 四档 + palette 六族双轴
```

## 功能逻辑

### 日期数学零时区（date-core）

不碰 `Date.parse`/`new Date(iso)`——`YYYY-MM-DD` 被 Date 按 UTC 午夜解析，跨时区 weekday 会漂移。日历数学走 **Howard Hinnant 纯算法**：`daysFromCivil`/`civilFromDays` 以 1970-01-01 为锚互转天数与公历坐标；weekday = `(days + 3) % 7` 周一开头（1970-01-01 是周四=3 校验过）。衍生物全部同源：`buildMonthGrid`（首周一对齐的 6×7 固定 42 格，前后邻月填充保面板形状）、`addMonths`（日 clamp 进目标月长）、`compareIso`（canonical 串字典序即时间序）、`todayIso`（系统本地日历，只做高亮与视图播种）；粒度工具：`parseGranularIso`（`YYYY`→`YYYY-MM`→`YYYY-MM-DD` 阶梯、缺位日/月补 1）、`partsToGranularIso`（按 picker 截断规范化）、`granularIsoOf`、`decadeOf`、`buildMonthViewCells`（12 月格）、`buildYearViewCells`（12 年十年窗）。

### 格式化/解析（format-date）

- **pattern 编译**：`y/m/d/e`（大小写不敏感）为 token，同字母连续段记一条长度；其余字符为 literal。`yyyy`=4 位、`yy`=2 位（parse 映射 2000-2099）、`M/d`=不补零、`MM/dd`=补零、`EEE`=短星期名、`EEEE`=全名（英文规范词，Java/antd 标准表）。weekday parse 位匹配 `[A-Za-z]+` 并丢弃（display-only）。
- **formatIso**：canonical ISO → pattern 渲染；ISO 不可解析（null/畸形）返回空串。
- **parseDateText（精度化）**：先 pattern 解析（year 必需、月/日 token 缺位补 1；精度 = 出现的粒度档）→ 再规范语法阶梯（严格 `^\d{4}-\d{2}-\d{2}$` + 宽松 `^\d{4}[/-]\d{1,2}[/-]\d{1,2}$` + 年月 `^\d{4}[/-]\d{1,2}$` + 裸年 `^\d{4}$`）→ `isValidDate` 验证 → 精度 ≥ picker 粒度才产出 canonical（更细截断到 picker、更粗 null 回滚）。非法返回 null（编辑器回滚语义）。
- **草稿门禁 isDraftAllowed 是宽松过滤**：数字/字母/空格/规范分隔符 `/ - .`/pattern literal 字符全放行——门禁只挡明显废字符，严格校验在 commit/blur 的 parse。IME 合成中透传仅显示。

### 面板 chrome 本地化（locale）

面板 chrome 是一张数据面：`resolveDateLocale` 把 `locale` prop 逐字段回退中文默认（月标 `1月…12月`、周头 `一…日`、日视图标题 `{year}年{month}`、月视图 `{year}年`、年视图 `{start}–{end}年`），`composeYearMonth`/`composeYear`/`composeDecade` 用占位符组装标题。定制 = 标签数组/格式串直给，无渲染回调、无语言简码。chrome（locale）与字段显示（valueFormat）与内部值（canonical）三层互不渗透——EEE token 的英文名不受 locale 影响。

### 状态机（use-date-picker）

- **门禁**：草稿字符全部合法才接受，否则保持旧草稿；IME 合成透传。
- **提交**：parse 成功 + 在 `[min, max]` 内 + 非同值 → 立即 commit（受控/非受控对称走 `onChange({ event, value })`）；**空串 = null 立即提交**；越界合法日期**静默持有**（不 commit），blur 回滚显示。
- **blur**：parse 失败或越界 → 显示回滚到最后提交值；parse 成功但未 commit 过 → 补 commit（合成事件）+ 显示规范化；parse 成功同值 → 仅显示规范化（手输 `2026/3/2` 焦点中保原文、blur 转 `2026-03-02`）。
- **回同步**：外部受控值移动时 draft 重生；`current` 判定 `value !== undefined`——**null 是真实值**（correction #13）。
- **程序化提交事件**（面板选日/清空）= change 形合成对象、target/currentTarget = 输入元素（InputNumber 步进同款）。
- **open/view**：open 受控/非受控（defaultOpen 播种）+ onOpenChange；打开时 view 重置到选中值/当前的粒度视口；view 是判别联合 `DateViewport`（date: `{picker, year, month}` / month: `{picker, year}` / year: `{picker, decadeStart}`）。跨视口键盘跃迁（PgUp/PgDn、Arrow 越界）改动 view；picker 切换经 ref 守卫重播种（不因普通值回声抢镜）。
- **focus 补挂**：跨视口导航的聚焦目标在旧 DOM 里不存在——`pendingFocusRef` 记目标 + 无依赖 effect 在渲染后 `querySelector([data-iso])` 补挂（首版同步 focus 落空被测试抓出）。面板打开时 activeIso（选中 > 今天/当月/当年粒度化 > 网格首格，首个在视图内且不在禁界者）承载 roving tabIndex 0。

### 面板与键盘

面板 header = 导航 chevron 组（**双档**：单箭头走本 level 步长——日格 ±月、月格 ±年，aria 「Previous/Next month|year」；双箭头走父粒度——日格 ±年、月格 ±十年，aria 「Previous/Next year|decade」，两枚 chevron 直排叠距成 glyph、零新图标；**年格只挂双箭头** ±十年）+ 标题槽（**分节可点**：日格 = 年钮 + 月钮两个 `title-button`（点月落月格、点年直落年格），月格 = 年钮，十年格 = 终级纯 span；标题钮色 = text-default + hover palette solid——与 muted 惯用法的 chevron 区分，控件组内可点/不可点、引导/导航各自穿对应皮肤）；**面板宽度与壳脱钩**：Popup `matchWidth={false}`（不写内联 min-width），面板固有 `min-width: 272px`（日格足迹 7×32 + 6×4 + 2×12 内边距）——三档恒同宽、宽壳不再把面板拉成右半空白、窄壳下向右溢出由 floating shift 兜底，紧凑格 `width: 100%` 摊满面板（80px 级宽月/年格）、`height: 56px` 加高（4 行 + 3 间隙 ≈ 日格 body 高度，三档面板高差异缩到 ~24px 级且**月/年两格完全同高**）——标题槽同盒纪律：panel-title（含终级 span）统一 `padding: spacing-1` + `line-height: line-height-sm`，可点钮与纯 span 的 header 高度一致，不因年格标题是 span 就矮一截；body 按 level 三视图：日视图（7 列 6 行 weekday 行 + gridcell）、月/年视图（`--compact` 3 列 4 行、宽格 + radius-sm、沿用同套 `--selected/--today/--disabled`）。**当前格未选中时恒 subtle、选中时让位**：`--today` 类无条件挂（与选中态并存）——subtle 浅底 + 家族字色、hover 深一档 family muted wash（Button subtle 同款 hover），两条 today 规则都带 `:not(--selected)` 排除：选中时 `--selected`（solid + inverse）独占背景/文字，subtle 完全消失（`:not()` 伪类把特异度抬到 (0,2,0)，压过单类 (0,1,0) 的 `--selected`——**靠源码序赢不了，必须显式排除**，这正是四轮「选中今天仍是 subtle」的根因）；focus-visible 仍叠 focus 环。**clearable 行内交互（Select 同款）**：`showClear = !disabled && !readOnly && clearable && current !== null` → 壳挂 `--clearable` 修饰类，尾部槽 = 日历图标 + X 钮（绝对定位叠槽），hover/focus-within 时 X 淡入、图标淡出（transition 组合 IconButton base 钩子 + fast opacity 腿）；X 的 mousedown preventDefault 保焦点；shell onClick 对 `target.closest('button')` 早退——X 点击清空并关面板、绝不开面板。ARIA：`role=dialog`（aria-label 随 **level**：Choose date/month/year）> `role=grid` > `role=row` > button `role=gridcell`，`aria-disabled` + 原生 disabled 双标。键盘：按键与 chevron 步长都随 **level**（日格 ±1/±7 天、Home/End 周首尾、PgUp/PgDn ±月；月格 ±1/±3 月、Home/End 年首尾、PgUp/PgDn ±年；年格 ±1/±3 年、Home/End 十年窗首尾、PgUp/PgDn ±十年）；**Enter/Space 在 base level 提交、在上级 level 下钻一层**（经 pendingFocusRef 把焦点挂到新格 anchor——选中月 > 今天 > 格首）；Escape 关面板（useDismissible）；输入域 ArrowDown/Enter 开面板；**打开面板时 level 重置回 picker 的 base level**，切 picker prop 同样重置 view + level。

### 受控/非受控

`value !== undefined` 判定，受控/非受控完全对称；内部 input 恒由 draft 受控。

## 调用关系

- 依赖：`@colox/cdk/input-control`（裸 control 单元）、`@colox/cdk/floating`（Popup/useDismissible/useFloatingPosition via Popup）、`@colox/icons`（IconCalendar/IconChevronLeft/IconChevronRight）、`clsx`、`class-variance-authority`、全局 token 层。零新增运行时依赖。
- 被依赖：`@colox/react` barrel（`@colox/react/date-picker` 子路径）、preview stories、docs mdx。

## 对外接口

- 导出 `DatePicker`、`DatePickerProps`、`DatePickerRef`、`DatePickerSize`、`DatePickerPalette`、`DatePickerPicker`、`DatePickerLocale`、`ResolvedDatePickerLocale`、`DatePickerChangePayload`、`datePickerVariants`、`DatePickerVariants`。
- readOnly 走**原生** `readOnly`（只读时面板不可开 `openable = !disabled && !readOnly`）；家族自造面见 `.mesync/tastes/api-design.md`「readOnly 家族面」。
- `DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'|'type'|'value'|'defaultValue'|'onChange'|'min'|'max'>`，新增：`picker?`（'date'|'month'|'year' 默认 'date'，决定值形与面板视图）、`size?`、`invalid?`、`palette?`（六族默认 'primary'）、`value?: string|null`、`defaultValue?: string|null`、`min?`/`max?`（ISO 日期界，粒度前缀对界）、`valueFormat?`（默认随 picker）、`locale?`（`{ months?, weekdays?, yearMonthFormat?, yearFormat?, decadeFormat? }` 逐字段回退中文默认）、`clearable?`（默认 false）、`open?`/`defaultOpen?`、`onChange?: (payload: DatePickerChangePayload) => void`、`onOpenChange?: (open: boolean) => void`。

## 状态与测试

101 个测试：date-core 15（闰年/天数往返/周一索引/网格起点与 inMonth 旗标/邻月不泄漏/月位移 clamp/年界穿越/非法日期/ISO 补零 + 粒度解析/截断/月·年格构建/decadeOf）、format-date 17（编译/大小写与字面混合/parseSource/format 各 token 与星期名/粒度格式化/解析双语法与精度阶梯/非法拒绝/部分草稿/星期丢弃/门禁）、locale 7（中文默认含 year/decade/逐字段回退/不突变调用方/compose 定制/占位透传）、行为 62（契约 8 + 编辑状态机 14 + 面板/清除 18 + 键盘 6 + 月 picker 5 + 年 picker 4 + 层级钻取 7——见 _tests/date-picker.test.tsx 分组注释）。

## 构建·门禁

- 组件多入口 `@colox/react/date-picker` → `dist/es/date-picker.js` + `dist/cjs/date-picker.cjs` + `dist/types/date-picker/index.d.ts`；package.json `./date-picker` 子路径。
- 组件级 gate：datepicker 101/101、全组件测试、`pnpm typecheck`、eslint、`pnpm build` 全绿。

## 已知边界与扩展点（v1 留白）

- **Range 选择 / 时间 + 时间面板 / 今天按钮**：Q5 v1 一律不做（层级钻取已于六轮交付：标题点击 日 → 月 → 年 逐级下钻、选中上级格逐级回落）。
- **月名 token（MMM/MMMM）**：v1 只有数字档 M/MM——标准 token 表面按需扩展（编译/格式化/解析三处同点扩展）。
- **Weekday 反解**：EEE/EEEE parse 位只匹配不读值（星期几是日期派生物，parse 忽略是文档承诺）。
- **M/d 无分隔歧义**（`123` 贪心读 `12/3`）：v1 确定性贪心策略，文档明示。
- **yy 解析映射**：恒 2000-2099（无滚动窗口语义）。
- **全角数字**：与 InputNumber 同域留白。
- **min > max 无防护**：语义悖谬归消费方。
- **chevron 的 aria-label 恒英文**（Previous/Next month|year|decade，随档位）：与 InputNumber 步进钮同惯例，AT 文案不进 locale（v2 可按需扩）。

## 决策

- 定案决策（六问全按推荐 + 用户两条补充：补日历图标、valueFormat 标准 token 写法并支持星期几）：见 resonance 决策「DatePicker API 定案」。
- 目视评审修正（用户三点：面板无当前日期选中态——portal 级联 bug；年月默认中文 + locale 定制；Storybook 拆 Clearable 节）：见 resonance 决策「DatePicker 面板 chrome 本地化修正」。
- 二轮评审修正（今天空态 surface 效果 + clearable 改 Select 同款行内交互 + 年/月粒度维度探问）：见 resonance 决策「DatePicker clearable 行内化与 today 空态 surface」。
- 三轮评审修正（surface 效果目视不佳改为 subtle；picker 月/年维度拍板实现）：见 resonance 决策「DatePicker picker 年/月视图维度定案」。
- 四轮评审修正（当前格恒 subtle、选中当前同格去环）：见 resonance 决策「DatePicker 当前格样式修正」。
- 五轮评审修正（选中当前同格移除 subtle——特异度机制修正：让位写进 `:not(--selected)` 选择器而非赌源码序）：见 resonance 决策「DatePicker 当前格选中时移除 subtle」。
- 补交互（标题点击层级钻取 日 → 月 → 年、选中上级格逐级回落、跳大跨度日期）：见 resonance 决策「DatePicker 面板层级钻取」。
- 七轮评审修正（antd 三刀：标题分节可点（年直钻年格）+ 双档 chevron（日格 ±月/±年、月格 ±年/±十年、年格仅双 ±十年）+ 标题语义色 hover）：见 resonance 决策「DatePicker 面板 chrome 对齐 antd 三刀」。
- 关联 icon 交付：`@colox/icons` 批次一扩为十一枚（IconCalendar：边框 + 顶栏规则线 + 绑定桩，join-round 成角、整数网格、[2,22] 光学内容框——spec lint 门禁照常过）。
