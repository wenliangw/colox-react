# Compact — 视觉缝合基座(M3 收官件)

## 职责一句话

`Compact` 把相邻成员**缝合成一个视觉单元**:接缝处两边框合为一条线、圆角只落在两端、状态成员(聚焦/无效)升高画过接缝。它是**零词组件**——没有 gap/align/direction 词,布局间距归 `Stack`/`Container`/`Grid`;成员保持作者原元素(不包 wrapper、不克隆),值/状态/`{ event, value }` 载荷各归各,表单里一个成员一个 `Form.Field`。

## 来源与定位

输入组对齐轮(InputGroup 命名歧义 → 语义二分 → 通用缝合基座)的结论。**替代**了预留的 `InputGroup`:未来 `ButtonGroup`/`IconGroup` 的视觉层(共享边框、焦点蔓延、两端圆角)就站在这个基座上,各自只挂自己的语义。M3 就此收官(动态表单见下)。

## 视觉契约(全部在 `styles/base.scss`)

- **接缝**:`> * + * { margin-inline-start: -1px }` —— 与成员自身 1px 边框锁步的唯一字面量(注释标明)。
- **两端圆角**:`:first-child:not(:last-child)` 起端 / `:last-child:not(:first-child)` 末端,`--colox-radius-lg`(成员自己的半径 token,无私有值);单子件不缝、不动形。
- **状态成员画过接缝**:`:focus-within` / `[aria-invalid='true']` 升 z-index——相邻成员会盖住左邻右边界,状态成员升高后自己的色边/ring 画到接缝位。
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
