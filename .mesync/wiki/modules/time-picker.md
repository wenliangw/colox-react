# TimePicker 组件

## 职责

单行时间编辑器：**文本 input**（Input 家族外壳契约）+ 输入面右端 **装饰 IconClock**（pointer-events:none、点透到壳开面板）+ **自绘面板**（cdk `Popup` + `useDismissible` + `useFloatingPosition`，`matchWidth={false}`——面板宽度靠内容自撑：三列 48px + gap + padding + 底部确认钮）。**canonical 值 = `'HH:mm:ss'` 定宽串**（定宽使词法序 = 时间序，`null` = 空）。`onChange` 自造 **`{ event, value }`**（家族事件面第 13 叶）。**`valueFormat`**（默认 `'HH:mm:ss'`）走 cdk date 词表 token（`H`/`HH`/`h`/`hh`/`m`/`mm`/`s`/`ss` + 字面分隔符）**display-only**——内部值与载荷恒 canonical 不受 format 污染；placeholder = format 串。手输接受 pattern 本身 + 宽松语法 `/^\d{1,2}:\d{1,2}(:\d{1,2})?$/`（时 ≤23、分 ≤59、秒 ≤59、缺秒补 0），**完整词当刻提交为 canonical**（聚焦中文本逐字保留），**部分草稿静默 + blur 回滚**，空串当刻提交 `null`；**min/max 是编辑器机械非校验**——越界时间项禁选、越界手输静默按住 blur 回滚（时间世界回滚非 clamp）。

**面板 = 三根纯数字循环列**（时 00–23 / 分 00–59 / 秒 00–59，首尾相接）+ **底部确认钮**。列 = 8 项可视窗 + **滚轮交互**：**原生滚动容器**（滚动条隐藏：`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`，`overscroll-behavior: contain`）——鼠标滚轮/触控板把缩放后 delta（50px/项、line 模式 ×3）**直驱 scrollTop 自由滚动**（半格停靠合法、无 snap、不选中任何格）、上下箭头钮点击 **rAF 直写滑行 ±7 项**（240ms ease-out、每帧直写 scrollTop 与滚轮共用同一条 scroll-handler 通道——缝的 ±一圈 wrap 折进每次写入；**滑行窗口内重复点击被 leading 节流（throttle）吸收**（`cdk/utils/throttle`，窗口=滑行时长，**步进钮同窗置灰** `--locked`+aria-disabled——吸收了就要看起来被吸收），滑完才能再点；motion 门控（`data-colox-motion="off"`/reduced-motion）下降级 instant）、**无滚动条**；轨道铺**三圈循环**（内容高 3×count×stride，虚拟渲染可视窗 ±飞行余量共 22 个 option + 上下 spacer），滚动穿圈界时 scrollTop 在 scroll handler 里静默平移一圈（三圈同构、跳变不可见——**该带界重锚只服务滚轮**：归位滑行同为直写、缝 wrap 折进写入永不越带，不存在「飞行中写 scrollTop 取消平滑动画」的互斥）；**选中骑值**——subtle 洗底（`--selected`）画在 pending 值所在格上、随内容滚动，**点击才改选择** + 240ms rAF 直写滑行滑回第 4 格槽位（**点击归位**，与滚轮同一条运动通道，对齐 = 点击动作而非滚动约束，antd 模型用户拍板；**归位目标 = 三圈中离当前视位最近的同值座**——chevron/键盘跨 23↔00 缝的步进顺势滑向相邻圈、保持点击方向，不再反向上滚）；**hover 预选**：悬停格穿**中性灰洗底**、离开恢复原选中格（纯 CSS，不动值、不动输入框预览；预选不穿 palette 以免冒充选中；**选中项排除在 hover 之外**——选中格不吃 hover、保持本色；滚动期间**选项格** pointer-events 关闭防 hover 冲刷闪动）；选项间 **2px 间距**（option margin-bottom 2px，stride = 28+2 = 30px）。**选中 ≠ 提交**：点选/键盘移动只更新 **pending 词**（滚轮不选中）——输入框值位以 **placeholder 灰字**实时预览当前选择（`--pending` 修饰类）、面板选中项穿 **palette subtle**（subtle 底 + solid 字，Button subtle 同族）；**只有底部确认钮提交**（文案 = `confirmText` prop，默认「确定」，与 DatePicker 面板内置文案默认中文一致——国际化等真实需求出现再建；**整个底部区域暂时不开插槽**：无真实消费方，等要放自定义内容时再开；aria-label 同步 = confirmText。提交 = 合并词定值 + 关面板 + 焦点回输入框），Esc/点击外部 = 丢弃回滚。确认钮在 pending 词越界时禁用（诚实禁选双保险）；打开时 pending = 已提交值、**空值打开即预选系统钟**（开面板瞬间读本地钟 seed pending：三列洗底骑在钟值上、焦点随预选、Confirm 直接提交该词；seed 定格在打开时刻——面板久开不回读时钟；钟值越界时确认钮保持禁用）。**窗口锚定**：打开时有值→值分量驻 slot 3（上方 3 项、下方 4 项），空值→按打开瞬间系统时分秒锚定；**min/max 越界选项禁选**（选项的可用性 = 与 pending 词的合并结果在界内——任何点选路径都铸不出界词）；键盘：↑/↓ pending ±1、PgUp/PgDn ±7、Home/End 列顶/底、←/→ 换列、Enter/Space 选中当下 pending（不提交）、Esc 关面板。`disabled`/`readOnly` 锁面板（开放钳 `openable = !disabled && !readOnly`，useDismissible 同钳）。`clearable` = Select 同款行内交互（✕ 钮提交 null 走 onChange 流）。ref 透原生 input（`TimePickerRef = HTMLInputElement`）。

## 架构归属（十二轴定案：自建、零 cdk 新桶）

TimePicker **完全自建**：壳 = Input 家族外壳契约自实现、状态机 = 家族模式自建更瘦的 `use-time-picker`、clearable 钮自建；代码复用仅限既有 **cdk/floating** 弹层基建（Popup/useDismissible/useFloatingPosition）与 **cdk/input-control** 裸控件，以及 **cdk/date 公开面**（compilePattern/patternToParseSource/dateFormat，`second` token 是词表既有类型）。**cdk 不新增桶**——picker 状态机是家族编排非能力内核（combobox 键盘巡行才是），时间列是视觉构件（未来 showTime 单向内部引用即解）；cdk 保持 headless 能力内核/纯函数初衷。

## 目录结构

```
time-picker/
├── time-picker.tsx          # 编排层：接 hook + 外壳 JSX（Input 家族壳 + Popup 承载面板）
├── index.ts                 # 出口（TimePicker + 5 类型 + timePickerVariants）
├── hooks/
│   └── use-time-picker.ts   # 状态机单源：draft 门禁/提交/blur 回滚/open/pending 词/三列值 + 键盘
├── utils/
│   └── format.ts            # 本家时间偏门：常量(HOUR_COUNT 24/MINUTE_COUNT 60/SECOND_COUNT 60/
│                            #   COLUMN_VISIBLE 8/COLUMN_STEP 7/COLUMN_FOCUS_SLOT 3/
│                            #   列几何 COLUMN_OPTION_HEIGHT 28+COLUMN_OPTION_GAP 2=COLUMN_OPTION_STRIDE 30/
│                            #   TIME_DEFAULT_FORMAT) + parseTimeText(wordOfParts)/draft 门/timePartsOf/
│                            #   formatTimeValue/canonicalBoundOf（吃 cdk/date 公开面）
├── controls/
│   ├── panel.tsx            # 面板（时列+分列+秒列 + 底部确认钮（confirmText，默认「确定」），role=dialog + columns/footer 结构）
│   ├── time-column.tsx      # 单列滚轮：上下步进钮 + 原生自由滚动可视窗（三圈循环轨道 + 圈跳同帧追窗 +
│                            #   滚动期 pointer-events 抑制 + 点击归位滑行（三圈最近座跨缝保向）+ hover 灰洗底 +
│                            #   选中骑值 + 跨缝直写滑行 wrap 折帧/chevron throttle 门锁+置灰）
│   └── clear-button.tsx     # clearable 尾部 X 钮（IconButton base + 站点定位类，Select 同款）
├── _tests/
│   ├── time-picker.test.tsx # 37 个：外壳/提交载荷/宽松语法/草稿与模糊回滚/面板锚定/三列/chevron 原生 smooth 滚动/
│                            #   链式重定向/循环/点选预览+确认提交/确认文案定制/丢弃回滚/禁选/confirm 禁用/clear/键盘/滚轮自由
│                            #   滚动不动选中/点击归位滑行/圈跳同帧追窗/快滚越圈界窗口同步/滚动期 pointer-events 抑制/
│                            #   三列选中洗底骑值/空值打开预选系统钟+Confirm 提交/预选越界 confirm 禁用/
│                            #   上下 chevron 跨缝保方向直写滑行/滑窗 throttle 拦截重复点击+置灰/motion 门控免闸
│   └── format-utils.test.ts # 19 个：parseTimeText（pattern+宽松）/wordOfParts/draft 门/canonicalBoundOf/
│                            #   formatTimeValue/列常量
├── types/{component,utils,hooks,controls,index}.ts
├── styles/{base,palette,size,index}.scss  # 外壳 = Input 契约 + 面板 overlay 织物 + 列/轨道/选项/槽位洗底/确认钮
└── variants/{size,palette,index}.ts       # size 四档 + palette 六族双轴
```

## 功能逻辑

### 解析/草稿（utils/format.ts）

- **`parseTimeText(text, pattern)`**：先 pattern 解析（compilePattern + patternToParseSource，`hour24`/`hour12` 任一命中记时、`minute` 记分、`second` 记秒、calendar token 捕获即弃），失败回落宽松语法 `/^\d{1,2}:\d{1,2}(:\d{1,2})?$/`（先去空白；时 ≤23、分 ≤59、秒 ≤59、缺秒补 0）；产出 `TimeParts { hour, minute, second }` 或 null。修剪空白后空串不在此函数处理（空终端在状态机）。
- **`wordOfParts(parts)`**：三分量校验后的 canonical 词（越界分量 → null）——状态机构建 pending/合并词的公共拼法。
- **`isTimeDraftAllowed`** 宽松门禁：数字、`: . 空格`、pattern 字面字符全放行——只挡废字符，严格校验在 commit/blur 的 parse；IME 合成中透传仅显示。
- **`formatTimeValue(value|null, pattern)`**：parts 包 `{year:1970,month:1,day:1,...parts}` 走公开 `dateFormat`——显示出口不抛（null 渲染 `''`）。
- **`canonicalBoundOf(bound)`**：string 走 parseTimeText、Date 走本地壁钟 hh/mm/ss、undefined/垃圾返回 null（越界词退出比较）。

### 列滚轮（原生自由滚动 + 三圈循环 + 点击归位 + hover 预选）

每列一个**原生滚动容器**（`__listbox`：`overflow-y: auto`、CSS 隐藏滚动条、`overscroll-behavior: contain`、`__track` 内容轨道）+ **上/下步进钮**。**轨道 = 三圈循环**：内容总高 3×count×30px，虚拟渲染 `slotIndex`（= 槽位虚拟索引）前后各一扇飞行余量（lead 10、trail 12，共 22 个 option）+ 上下两个 spacer 补出三圈总高——DOM 恒定 22 项、无 ARIA 重复。**三柄权力分立（antd 模型，用户拍板）**：①**滚轮只动视图**——wheel（50px/项缩放、line ×3）**直驱 scrollTop 自由滚动**，半格停靠完全合法（无量化、无 scroll-snap），scroll handler 只做圈跳 + 窗口追赶，**不读槽、不上报、不选中**；②**点击才改选择**——点选被点格成为 pending（`handleSelectOption` 合并越界守卫）+ `value` effect 用 **rAF 直写滑行**把它**滑回第 4 格槽位**（240ms ease-out、motion 门控下降级 instant；**每帧直写 scrollTop、与滚轮同一条 scroll-handler 通道**——自动归位 = 点击动作，不是滚动约束）；**归位目标 = 三圈最近同值座**（`canonical(value) ± lap` 三座中离当前 scrollTop 最近的一座）——chevron/键盘跨 23↔00 缝的步进**保持点击方向**（原先恒取中圈 canonical 的归位跨缝时反向上滚）；**缝的 ±一圈 wrap 折进每帧写入**——写入恒落在带内，scroll handler 同帧追窗（窗口余量保证全程有效）。chevron ±7 入口套 **leading 节流 throttle（`cdk/utils/throttle`，窗口=GLIDE_MS=240ms）**——滑行中重复点击被吸收、滑完才可再点，**窗口内步进钮置灰**（`--locked` 修饰类 + aria-disabled、家族 disabled 文本色——闸门与视觉同窗同释放；motion 门控下无滑行可等：免闸免灰、instant 直落）；滑行中滚轮输入直接取消本次滑行（用户之手优先）。案前教训链：native smooth 因飞行中禁写 scrollTop 与缝口圈跳互斥；预平移方案因瞬时写入与追窗 render 之间插帧可画出旧窗口——两者都因为滑行与圈重锚走两条运动通道；直写滑行让两者并肩同一条通道后，闪帧机制性消失（滚轮正是该通道的既有验证者）；③**hover 只预选视觉**——纯 CSS `:hover` 给悬停格穿**中性灰色洗底**（`--colox-color-gray-wash-hover`，**刻意不用 palette**：预选不冒充选中，palette subtle 是选中的专属皮肤），**选中格排除在 hover 外**（`:hover:not(:disabled):not(--selected)`——选中项不吃 hover、保持本色），离开即恢复原选中格显示，不动任何值。**滚动期抑制 hover 冲刷**：scroll 事件期间列表盒挂 `--scrolling`、**选项格** `pointer-events: none`（antd/rc-picker 同款手法）——快滚时从游标下流过的格无法点亮 hover 洗底（闪动主因之一）；静止 100ms 后类剥除、hover 恢复。**抑制必须下放到格、列表盒保持可命中**（前案教训）：`pointer-events: none` 若挂在滚动容器上，首个滚轮事件过后指针命中测试把后续 wheel 重定向到页面——preventDefault 监听失联、页面联动滚动、列只滚一格即停（用户报告后修复）。**选中洗底骑值（`--selected`）不骑槽**：洗底画在 pending 值所在格上（`selected !== null && mod(item) === selected && !disabled`），随内容滚出窗口、归位滑行后落在槽上——自由滚动永不重画它；空值打开即预选系统钟、洗底骑钟值。**圈跳**：scroll handler 把 `scrollTop` 钳在中间圈的槽带 `[count×30−90, 2×count×30−90)`，越界 ± 一圈（720px）静默平移——三圈同构、跳变不可见（时列起点 630px、终点 1350px）；**圈跳分支同帧同步渲染窗口**（`setSlotIndex(修正后位置)`）——否则快滚过圈界时窗口滞留一帧、内容闪空（快滚闪动的根因之二）。挂载 seat 用 layout effect 直接赋 scrollTop（首帧前、不经 smooth；`lastTopRef` 挡住首帧 scroll 事件）。

**列几何**：可视窗 238px = 8×28 + 7×2 gap；option margin-bottom 2px（stride = 28+2 = 30px 与 TS 常量镜像）；slot 3 = 归位槽（上方 3 项、下方 4 项）。**同一条归位机制**服务所有改值入口：chevron（±COLUMN_STEP=7）/键盘（↑↓±1、PgUp/PgDn±7、Home/End 落界）/typed 重锚定/受控值——hook 改 pending → `value` effect 在 canonical±lap 三座中取离当前 scrollTop 最近座为 target、 `|scrollTop − target| ≥ 1` → **rAF 直写滑行 240ms**（每帧 `scrollTop = wrap(top + travel·ease-out)`：wrap 把位置折进中间带——缝处 ±一圈的内容同构平移发生在写入内部，写入恒在带内；每帧零 React 渲染、无队列、无合成器动画，滑行中再点 = 取消旧滑行重定向）；**滑行与滚轮共用同一条 scroll-handler 通道**（事件同帧追窗；带界重锚只在滚轮越带时触发——直写写入永不越带）；**chevron 入口 leading 节流**（`cdk/utils/throttle`，窗口=GLIDE_MS=滑行时长）——滑行中重复点击被吸收、滑完才可再点，**窗口内步进钮置灰**（aria-disabled + `--locked`，与闸门同窗同释放；motion 门控免闸免灰）；滚轮输入取消本次滑行（用户之手优先）；等位守卫同时吞掉挂载 seat 与「点已居槽格」的 no-op。焦点骑 pending 值（`tabindex=0`；空值打开即预选系统钟、焦点随预选）。

### 状态机（use-time-picker）

- **draft 门禁 → 空当刻提交 null → 完整词 parse 通过且未越界即提交 `HH:mm:ss`**（与上次已提交值相同不重报）——外部 value 变化经 `lastCommittedRef` 差分重同步 draft 并 `resettle` 列座，自提交先更 ref 防回显打断输入（date 编辑器同款）。
- **blur**：面板开着 = 跳入面板的正常失焦，**跳过归一化**（点确认钮的失焦绝不能把预览提交掉）；关着：parse 失败/越界 → 回滚到已提交值显示；成功且异于已提交 → 规范化提交；成功且相同 → 仅规范化显示。
- **打开面板**：`resettle(current)`（已提交三分量落三列值或系统时分秒）+ 空值时 `setDirty(true)` **预选系统钟**（seed 一次定格：pending = 打开时刻钟词、Confirm 直接提交；面板久开不回读时钟），再置 open（受控 open 时只报 onOpenChange）。**pending 词 = dirty 时三值拼的 modular word**；有值打开 dirty=false、首次移动才点燃 pending。
- **pending 同步 effect**：`[pendingWord, isOpen, dirty, valueFormat]` 依赖面变化时 `draft := formatTimeValue(pendingWord)` ——面板选择实时写输入框灰字预览，手输（直接 setDraft）永不被覆盖。**`preview` 修饰** = `isOpen && dirty && pendingWord ≠ current`。
- **移动**：`moveColumn(unit, ±n)`（步进钮/PgUp/PgDn 相对步，mod 算术）；`landColumn(unit, value)`（点选/Home/End 落值直接 setValue）；**点击 = `onSelectOption` 带合并越界守卫**（越界合并拒收——滚轮不碰值、键盘落界是唯一能造出越界 pending 的无关守卫入口，悬停确认钮禁用兜底）；**提交只走 `handleConfirm`**（pending ≠ 已提交且未越界才 fire onChange，相等 = 无变化只关面板）+ 关面板 + 焦点回输入框；**`closePanel()` 丢弃 pending**（draft 回落 lastCommittedRef 显示）。
- **列步进** `moveColumn(unit, delta)`：chevron 直接传 ±7；**↑/↓** pending ±1、**PgUp/PgDn** ±7、**Home/End** 落列界（0 或 23/59）、**←/→** 换列：pendingFocusRef 记目标列，effect 里 `[data-unit] button[tabindex="0"]` 程序化聚焦焦点槽（date 网格同款模式）；**Enter/Space** 消耗不提交；**Esc** 走文档级 useDismissible 关面板。
- **选项级禁选 = 合并有效性（诚实语义）**：单一 `isDisabledOption(unit, value)`——把该轴的 value 换入 pending 锚 parts（dirty 前 = 已提交值，空值开面板 = 系统钟）拼词比较；min/max 为 string|Date 双收，比较走 `canonicalBoundOf` 的 `'HH:mm:ss'` 定宽词（词法序 = 时间序，Date 走本地壁钟）。

### 面板与可访问性

`role="dialog" aria-label="Choose time"`；每列 listbox `aria-label="Hours"/"Minutes"/"Seconds"` + `data-unit`；选项 `role="option"` + `data-time`（mod 值）+ `aria-selected`（= pending 且未禁，值语义）/`aria-disabled` + **`--selected`** 类标记 pending 值所在格（palette subtle 洗底——骑值不骑槽，随内容滚动、归位滑行后落槽上）；**`--preselected` 观感 = 纯 CSS `:hover`**（悬停格穿中性灰洗底、离开恢复，**选中项排除**；滚动期 by `--scrolling` 的**选项格** pointer-events 关闭）；焦点槽 tabIndex 0 骑 pending 值（空值打开即预选系统钟、焦点随预选，其余 -1，roving）；步进钮 `aria-label="Previous/Next hours|minutes|seconds"` tabIndex -1；Confirm 钮 `aria-label={confirmText}`（默认「确定」），disabled = 越界 pending。paletteClass 同时骑外壳与 Portal 面板根（面板不在外壳祖先链上，palette 私有 CSS 变量需级联进弹层——DatePicker 同款门户教训）。面板宽度本征（3×48px 选项 + 2×8px gap + padding），挂 overlay 织物 token（bg-overlay、border-muted、radius-md、shadow-md）。

## 边界

- **批 3 单向引用纪律**：未来 showTime 只许 date-picker 引 time-picker 内部件（children 时间列视觉件 + hooks），不引公共面/壳/状态机；反向引用是禁地。
- **时区/本地化**：时间值恒本地壁钟语义（min/max 的 Date 走本地时分秒）；pattern 词表无 meridiem token（`h` 12 制裸渲染），本地化是 cdk/date 点名缺口。
- **触屏**：列的滚轮交互走 wheel 事件 + 箭头钮 + 键盘——无触摸拖拽监听（面板历史也无），是后续演进点。

## 交付请求（本轮六条）

1. 时分秒三列（canonical `HH:mm:ss`）；2. 列滚轮滚动、不展示滚动条（**原生滚动容器 + CSS 隐藏滚动条**——首版「窗口不滚动、条带自滑」模型经「卡顿 + 三列错位」反馈改造；原生滚动后又经「固定 scrollTop 步进 + 停稳后设置选中」反馈改强对齐，最终经与 Ant Design 对比收敛为**自由滚动 + 点击归位 + hover 预选**，两项前案撤销）；3. 箭头点击 ±7 平滑步进（**rAF 直写滑行 240ms ease-out + leading 节流 throttle**——首版 FLIP 过渡 → 滚动反馈跟进改全步进平滑 + 滑程串行化 → 原生滚动改造后走浏览器平滑滚动 → 两轮闪动（飞行中禁写 scrollTop 与缝口圈跳互斥；预平移写入与追窗 render 插帧）后改**与滚轮同一条 scrollTop 直写通道**：缝 wrap 折进每帧写入、滑行窗口内重复点击被 throttle 吸收、步进钮同窗置灰）；4. 选中不关面板、输入框灰字（placeholder 样式）预览当前选择、面板底部确认钮才真正提交（Esc/外部点击丢弃；**确认文案 = `confirmText` prop，默认「确定」**——与 DatePicker 家族内置文案默认中文一致，国际化的语言包机制等真实需求再建，整个底部区域暂不开插槽）；5. 选中样式 subtle（`<family>-subtle` 底 + solid 字——洗底**骑选中值**而非槽位地标，自由滚动带它出窗、点击归位带它回槽；hover 灰洗底预选且**选中项不吃 hover**）；6. 列选项间 2px 间距（option margin-bottom 2px，stride 30px 与 TS 常量镜像）。7.（预选轮）**空值打开面板预选系统钟并可直接确认提交**（浅 subtle 洗底骑钟值；seed 定格在打开时刻，越界则确认钮禁用）+ **代码习惯完整自查整改**（props 三处同序：属性→方法→事件，confirmText/confirmBlocked 归位；scrollColumn=moveColumn 穿透 wrapper 删除；isDisabled×3 合并为单一 isDisabledOption；pad/mod 顺位 utils 去重；columnState/合并词/换列/方向词四链三目消解；模块头注释瘦身）。8.（跨缝方向轮）**chevron 跨 23↔00 缝的方向修正**——归位目标从「恒中圈 canonical 座」改为**三圈中离当前视位最近的同值座**（向下按钮跨缝向下滑、向上按钮跨缝向上滑，纠正用户报告的「跨边界反向上滚」反直觉）；配套**飞行期圈钳制动豁免**（滑行途中写 scrollTop 会取消浏览器平滑动画）+ **落地静止 100ms 后带外 ±一圈静默重锚**（同构不可见））。9.（跨缝闪帧修复）带外落点的圈重入从「落地静止后重锚」改为「**滑行前瞬时预平移 + 同帧追窗**」——旧方案的重锚只写 scrollTop 没同步窗口、旧窗口画一帧新偏移 = 整列闪空（用户报告）；预平移后滑程起止都在带内、落地即带内，滑后静止期零写入。10.（直写通道轮）箭头步进滑行改 **rAF 直写**（每帧 `scrollTop = wrap(top + travel·ease)`，与滚轮同一条 scroll-handler 通道、缝 wrap 折进写入、落点恒在带内）+ chevron **leading 节流（`cdk/utils/throttle`，窗口 = 滑行时长）**——用户「还是有闪动不丝滑，但滚轮没问题」：native smooth 要求飞行中禁写 scrollTop 而缝口圈跳必须写（互斥）；预平移方案的瞬时写入与同帧追窗 render 之间会被浏览器插一帧画旧窗口闪空。两者都因滑行与圈重锚走两条运动通道；直写后滑行即滚轮（滚轮正是用户实测的丝滑通道），闪帧机制性消失；throttle 保证滑行结束前无法再点（滚轮输入仍随时接管取消滑行）。11.（门锁正名轮）chevron 闸门从「leading debounce」正名为 **leading 节流（throttle）**——`cdk/utils` 拆出两个真名原语：`debounce` = trailing 经典（停稳后补发）、`throttle` = leading 首击即发 + 滑窗吸收；**步进钮窗口内置灰**（`--locked` + aria-disabled、家族 disabled 文本色，与闸门同窗同释放）；motion 门控下免闸免灰、instant 直落——用户「箭头补一下状态暂置灰；应该用防抖还是节流」：防抖 = 点击后等 240ms 才发步（步进滞后半拍、连点排队追尾），节流 = 点击即走 + 窗口吸收，与「滑完才能再点」严格同一；置灰让吸收可见。

## Form 兼容

家族载荷同形（value prop 分层同名、`{event,value}` 载荷 value = 组件下一值），Form.Field 无注册表即收。
