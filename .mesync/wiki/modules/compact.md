# Compact — 视觉缝合基座(M3 收官件)

## 职责一句话

`Compact` 把相邻成员**缝合成一个视觉单元**:接缝处两边框合为一条线、圆角只落在两端、状态成员(聚焦/无效)升高画过接缝。它是**零词组件**——没有 gap/align/direction 词,布局间距归 `Stack`/`Container`/`Grid`;成员保持作者原元素(不包 wrapper、不克隆),值/状态/`{ event, value }` 载荷各归各,表单里一个成员一个 `Form.Field`。

## 来源与定位

输入组对齐轮(InputGroup 命名歧义 → 语义二分 → 通用缝合基座)的结论。**替代**了预留的 `InputGroup`:未来 `ButtonGroup`/`IconGroup` 的视觉层(共享边框、焦点蔓延、两端圆角)就站在这个基座上,各自只挂自己的语义。M3 就此收官(动态表单见下)。

## 视觉契约(全部在 `styles/base.scss`)

- **接缝**:`> * + * { margin-inline-start: -1px }` —— 与成员自身 1px 边框锁步的唯一字面量(注释标明)。
- **两端圆角**:**半径规则全部写在 0,3,0(类 + 两个伪类)**——成员自己的基类半径是 0,1,0,同分平手会由样式表顺序裁决(聚合 CSS 里 input/select 排在 compact 之后 → 成员圆角复活,首版实踩的 bug);端点规则显式把**内角归零**、外角取 `--colox-radius-lg`(成员自己的半径 token,无私有值),中间件全角归零;单子件不匹配任何半径规则、保持自身形状。成员的 `rounded` 自形在组内由接缝接管。
- **焦点环宿主是组(二修)**:成员各自的 ring 在组内静默(`> *:focus-within:not(:disabled) { box-shadow: none }`,`:not(:disabled)` 是特异性载子——0,3,0 永压成员 0,2,0 焦点环、不误伤按钮静态 shadow 变体,disabled 不可聚焦故谓词惰性)——成员 ring 只会画到邻居身上(首版实踩:选中样式仅圈自身 + 溢到相邻件,用户目视逮住);改为**组级一环**:`&:focus-within` 组外沿画 ring(radius lg 贴两端轮廓);focus 停在 invalid 成员时经 `:has(> [aria-invalid='true']:focus-within)` 整环转红。invalid 成员仍升高(z-index:1)让红边画到接缝,但不再自带环。
- **焦点边框也不许第二层(三修)**:输入族聚焦的 `border-color: brand-solid` 会在组环下再描一圈同色线(用户第二次目视逮住)——静息边框是全家共享的同一枚 muted token,可安全钉住:`>:is(.colox-input, .colox-input-number, .colox-select, .colox-date-picker, .colox-time-picker, .colox-textarea, .colox-autocomplete):focus-within:not([aria-invalid='true']) { border-color: var(--colox-color-border-muted) }`(`:is`/`:not` 提到 0,4,0,顺序无关);invalid 成员靠 `[aria-invalid]` 排除保住红边。**按钮变体色板不动**(solid 静息边框即 palette-solid、ghost/outline 聚焦变色是变体身份)——Compact 永不伸进变体色。缝的机器门禁是 `_tests/compact-spec.test.tsx`(源级契约断言,同 icons spec lint 先例)。
- **加件槽**:`colox-compact__addon`(文本/图标等不产值成员):inline-flex + not-nowrap + 描边/bg 同输入件、文本次级色 `--colox-color-text-muted`。纯 CSS 类,不产组件 API、不产值。
- 逻辑属性全程(RTL 安全,同 Container/Positioner 纪律)。

## API

`CompactProps = HTMLAttributes<HTMLDivElement>`(type alias——零词组件不声明空 interface,eslint no-empty-object-type)。子件即成员,不加包装。ref 直通根 div。

## 边界(红线)

- **没有** gap/align/direction/block 词——有这些需求 = 布局问题,交给 Stack。
- **不聚合值**、不产 ARIA 语义——每组件的语义仍由成员自身(`aria-invalid`、payload)承担,Compact 只读视觉。
- 不接管校验/表单:join 组里每成员独立 `Form.Field`。

## 测试与验收

4 例单测:根类与直系子件(无包装/克隆)、className 合并与 rest 透传(id/data-*/style)、ref 转发、混编成员(Select 前缀 + Input + Button)不碰成员行为。视觉(接缝/焦点蔓延/两端圆角)jsdom 不可见——story override 后真实浏览器复核。入口:ES/CJS/dts 子路径 `@colox/react/compact`,样式随 `style.css` 聚合。

## 关联决策

- 「组合件语义二分 + Compact 通用缝合基座」决策节点(本轮)含 InputGroup 更名歧义 → 不做的定性,与延后动态表单(b241f13c)同轮。
