# Compact — 视觉缝合基座(M3 收官件)

## 职责一句话

`Compact` 把相邻成员**缝合成一个视觉单元**:接缝处两边框合为一条线、圆角只落在两端、焦点环整组一环、invalid 成员让**整个单元**红框红环。它是**零词组件**——没有 gap/align/direction 词,布局间距归 `Stack`/`Container`/`Grid`;成员保持作者原元素(不包 wrapper、不克隆),值/状态/`{ event, value }` 载荷各归各,表单里一个成员一个 `Form.Field`。

## 来源与定位

输入组对齐轮(InputGroup 命名歧义 → 语义二分 → 通用缝合基座)的结论。**替代**了预留的 `InputGroup`:未来 `ButtonGroup`/`IconGroup` 的视觉层(共享边框、焦点蔓延、两端圆角)就站在这个基座上,各自只挂自己的语义。M3 就此收官(动态表单见下)。

## 视觉契约(全部在 `styles/base.scss`)

- **接缝**:`> * + * { margin-inline-start: -1px }` —— 与成员自身 1px 边框锁步的唯一字面量(注释标明)。
- **两端圆角**:**半径规则全部写在 0,3,0(类 + 两个伪类)**——成员自己的基类半径是 0,1,0,同分平手会由样式表顺序裁决(聚合 CSS 里 input/select 排在 compact 之后 → 成员圆角复活,首版实踩的 bug);端点规则显式把**内角归零**、外角取 `--colox-radius-lg`(成员自己的半径 token,无私有值),中间件全角归零;单子件不匹配任何半径规则、保持自身形状。成员的 `rounded` 自形在组内由接缝接管。
- **焦点环宿主是组(二修)**:成员各自的 ring 在组内静默(`> *:focus-within:not(:disabled) { box-shadow: none }`,`:not(:disabled)` 是特异性载子——0,3,0 永压成员 0,2,0 焦点环、不误伤按钮静态 shadow 变体,disabled 不可聚焦故谓词惰性)——成员 ring 只会画到邻居身上(首版实踩:选中样式仅圈自身 + 溢到相邻件,用户目视逮住);改为**组级一环**:`&:focus-within` 组外沿画 ring(radius lg 贴两端轮廓);focus 停在 invalid 成员时经 `:has(> [aria-invalid='true']:focus-within)` 整环转红(:has 缺失的浏览器优雅降级为品牌环,成员红边仍标段)。
- **焦点边框也不许第二层(三修)**:输入族聚焦的 `border-color: brand-solid` 会在组环下再描一圈同色线(用户第二次目视逮住)——静息边框是全家共享的同一枚 muted token,可安全钉住:`>:is(.colox-input, .colox-input-number, .colox-select, .colox-date-picker, .colox-time-picker, .colox-textarea, .colox-autocomplete):focus-within:not([aria-invalid='true']) { border-color: var(--colox-color-border-muted) }`(`:is`/`:not` 提到 0,4,0,顺序无关);invalid 成员靠 `[aria-invalid]` 排除保住红边。**按钮变体色板不动**(solid 静息边框即 palette-solid、ghost/outline 聚焦变色是变体身份)——Compact 永不伸进变体色。缝的机器门禁是 `_tests/compact-spec.test.tsx`(源级契约断言,同 icons spec lint 先例)。
- **加件槽**:`colox-compact__addon`(文本/图标等不产值成员):inline-flex + not-nowrap + 描边/bg 同输入件、文本次级色 `--colox-color-text-muted`。纯 CSS 类,不产组件 API、不产值。
- **宽度归组(四修)**:输入族 `flex: 1 1 auto; min-width: 0`(`$compact-input-family` Sass 变量单一注册点,与焦点边框钉同族)——组有宽 = 各 100% basis 均分填满、无宽 = 百分比降级 auto 按内容撑开(首版实踩:定宽组里四 input 被浏览器 min-width 地板顶死、呈现「不到一半」,用户目视逮住);`min-width: 0` 允许沉到 input 地板之下。
- **invalid 属于整个单元(六修,用户否决「只标段」)**:改定案——成员 invalid 后**全单元红色**(轮廓 reddens):`:has(> [class*='--invalid']) > *:is(族, .colox-compact__addon):not([class*='--disabled']) { border-color: red-solid }`(0,4,0;放在焦点边框钉之后——两规则同分平手,后者赢,聚焦时保持红);**组环在 invalid 单元内任意聚焦都红**:`&:focus-within:has(> [class*='--invalid'])`(替换原「聚焦的成员恰是 invalid」版)。**invalid 信号 key 在根元的 `--invalid` 类,不是 aria 属性**(七修):家族的 `aria-invalid` 挂**内层控件**上、根元只有 cva 类——首版 tint 按 `[aria-invalid='true']` 查直系子件永不触发 → 「一半红框」(invalid 成员靠自己的类红、邻件没被染),用户第五次目视逮住;同因还埋着第二个 bug(钉框规则的 `:not([aria-invalid])` 恒真,聚焦 invalid 成员也被钉成 muted)。「compact 是一个整体」,焦点环与 invalid 都按单元说话。按钮变体色板豁免、disabled 成员自有灰屏(按类名后缀 `[class*='--disabled']` 排除)。中间尝试(接缝侧透明、只标段)被用户明说否决:「仅有一个 invalid input,但 compact 应该是一个整体才对」。
- **形状件豁免(五修)**:`$compact-shape-keepers: '.colox-switch', '.colox-slider'`——圆形轨道自己的设计语言,不进半径规则(switcher/slider 若被塞进组,圆角不改形)。
- **动效与阴影也归组(五修)**:按钮 shadow-sm/md/lg 静态变体在组内静默、`:active { transform: none }`(scale(0.97) 会撕开缝)——抬升/缩放与 ring 同类 artifact。
- **弹层开着 = 单元 engaged(八修)**:组环宿主扩展为 `&:focus-within, &:has(> [class*='--open'])` —— 成员的弹层在 portal 里、焦点会被带出组子树,`:focus-within` 看不见,但弹层是成员自己的 UX、单元环不该灭。家族根元统一挂 `--open` 状态类:Select 一直有(开态 chevron 旋转也用它)、DatePicker/TimePicker 本轮补上(`colox-date-picker--open`/`--time-picker--open`,无样式、纯状态信号)。**焦点换手空窗(用户第六次逮住:「点击箭头触发弹层时 border 闪一下,选中样式丢失又恢复」)**:不可聚焦的 shell(chevron 是 span)在 mousedown 默认行为里把焦点从组内 Input 拿走(落到 body)——组 `:focus-within` 掉、环灭一帧,click 才把焦点从控制件取回、环复明。修法 = **非交互区 mousedown `preventDefault` 焦点驻车**(三件统一:select/date-picker/time-picker 的 shell,守卫 `closest('button, input')` 豁免按钮与真控件),click 再原子换手,无缝可画;Select 开态点 chevron 同时改成**显式关闭**(原路径是 blur-close + click-refocus-reopen 的隐形双闪)。注意 icon 全 `pointer-events: none`,真实浏览器点击落在背景节点,但守卫判定 target 类型用 `instanceof Element`(不是 HTMLElement)——SVG 也能当 target(jsdom 不认 pointer-events,首版守卫用 HTMLElement 被 SVG 挡掉,单测逮住)。
- **环只归输入族(九修,用户指名)**:用户「box-shadow 应仅对输入框这类组件支持」——品牌环改挂 `&:focus-within:has(> :is($compact-input-family):focus-within), &:has(> [class*='--open'])`(组环只在焦点落在输入族成员/其弹层开时画);**按钮及其他成员保持自己的焦点 affordance**——静默规则同步划区 `&:is(族):focus-within:not(:disabled)`,按钮自己的 `:focus-visible` 环恢复(它画在自身盒内 + 2px 扩散,越缝 2px 属标准行为,已向用户明示)。红环重构为嵌套 `&:has(> [class*='--invalid']) { &:focus-within:has(> :is(族):focus-within), &:has(> [class*='--open']) {...} }`(0,5,0/0,3,0 稳压品牌环 0,4,0/0,2,0,顺序无关)。
- **size/palette 继承(九修,用户问「是否可以输入通用属性由子组件继承」→ 答案:可以,走 context 回退)**:Compact 增两个继承词 `size?: 'xs'|'sm'|'md'|'lg'`(镜像 FormSize)、`palette?: primary|gray|info|error|warning|success`(六色并集),经 `@colox/cdk/compact-context`(新建 cdk 内核文件)供给成员;**成员自己的词永远优先**(`size ?? compact?.size`,`select` 的硬默认 'md' 让位为连锁末位 `?? compact?.size ?? 'md'`)、Form 级注入的 size 作为成员 prop 也优先于 compact 默认。**绝不克隆**:Form 级 size 走 cloneElement 注入的先例在 Compact 不适用(定案红线「成员保持作者原元素」),context 是唯一不违反零词本意的通道。消费面 = 全部持 size/palette 的成员:Input/InputNumber/Select/Textarea + Date/TimePicker + Button + Switch/Slider + Checkbox/Radio(经 resolveXxxState 入参);Autocomplete 无 size 词、本轮未接入(报告已列出为开放项)。
- **divide 分割线(九修,用户指名「中间 border 非常丑,应该用 divide 样式」;再修,用户「没看到 divide」+「分割线除了颜色以外,高度也应该短一些,不要直接与 border 相连」)**:`colox-compact--divide` 修饰类(零词原则:类不加 prop,同 addon 先例)——成员**卸掉自己的边框**、**单元画一道外框**(`border: 1px solid muted` + 半径 lg)、**每个非首成员在自己的 start 边界坐一条短浮动条**:`> * + *::before` 伪元素(`content:''; position:absolute; inset-block:25%` 高半程、不接外框;`inset-inline-start:0; inline-size:1px; background:subtle`)。**首版两病灶**:①border-inline-start 机制画全高线与外框焊死;②strip 规则 `border:0`(0,2,0)排在后面把侧边框清零 → 分割线整体隐形(用户「没看到 divide」)——伪元素条与边框机制脱钩 + 成员 `> *` 已有 `position:relative` 可直接骑乘;`> * + * { margin-inline-start: 0 }` 单独保留(坐边界本身,不再 -1px 叠带);invalid 转投**外框 + 全部浮动条**一起红;禁用 overflow:hidden(会吞掉外画的 ring)。无 divide 类 = 传统叠带风格,两态并存。
- 逻辑属性全程(RTL 安全,同 Container/Positioner 纪律)。

## API

`CompactProps = HTMLAttributes<HTMLDivElement>` + 两个继承词 `size`/`palette`(可选,context 回退,成员自声优先;两者不进 DOM——从 rest 里抽出)。子件即成员,不加包装、不克隆。ref 直通根 div。`colox-compact__addon`(纯类)与 `colox-compact--divide`(纯修饰类)是零词原则下的两个类态入口。

## 边界(红线)

- **没有** gap/align/direction/block 词——有这些需求 = 布局问题,交给 Stack。
- **不聚合值**、不产 ARIA 语义——每组件的语义仍由成员自身(`aria-invalid`、payload)承担,Compact 只读视觉。
- 不接管校验/表单:join 组里每成员独立 `Form.Field`。

## 测试与验收

8 例渲染单测(根/直系子件、className/rest、ref、混编、size 继承、自声优先、palette 继承、divide 类)+ **10 条规格门禁**(`_tests/compact-spec.test.tsx`,源级断言,icons spec lint 同先例):半径规则、形状件豁免、输入族组环+成员环静默划区、红环双形态、invalid+addon、divide 外框/分割线/卸边框/转红、输入族定宽均分/边框钉、按钮阴影/缩放静默——把七轮目视教训锁成机器检查。cdk 门禁全绿 + story/docs 构建通过;视觉终判仍靠真实浏览器(jsdom 看不见接缝,教训:第一轮交付「圆角只在两端」在 jsdom 通过、目视现形)。入口:ES/CJS/dts 子路径 `@colox/react/compact`,样式随 `style.css` 聚合。

## 关联决策

- 「组合件语义二分 + Compact 通用缝合基座」决策节点(本轮)含 InputGroup 更名歧义 → 不做的定性,与延后动态表单(b241f13c)同轮。
