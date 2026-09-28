# API 设计品味

## 组件层事件面统一自造 { event, value } payload（全家族落定，无豁免）

- **组件层 `onChange` 一律自造 `{ event, value }` payload**（事件对象 + 组件真值），不再按「值是不是文本」特判——文本值控件的 onChange 同样 `{ event, value: string }`。这是 InputNumber → Slider → DatePicker → AutoComplete → 全叶子收敛的演进终点：从「数字/日期控件专用」升格为「组件层事件面统一词形」。
- **无豁免**（原「叶子直对原生控件的透传槽」条款已废弃）：Input/Textarea/Checkbox/Radio/Switch 单件同样自造载荷——`event` = 原生 change 事件（传播控制、DOM 事实面），`value` = 组件自己的下一值（Input/Textarea = 文本，单个 Checkbox/Radio/Switch = boolean）。**payload 里的 `value` 与同名 prop 不冲突**：prop `value` 是表单 token / 组键（字符串），载荷 `value` 是状态本身（boolean）。叶子与组载荷同形，只有 `value` 语义不同（组 = 下一数组 / 下一单值）。
- 判据从「是不是叶子」改为「这个组件自己有没有真值」：有真值就装进载荷，事件对象原样保留在 `event` 里（原生面不丢）。
- 事件块内部顺序：onChange → onSelect → onOpenChange（组件层事件按主次排）。
- 来源：AutoComplete 设计对齐用户裁定「后面所有的 event 都走我们自造的 payload 格式」；本轮用户追加「表单组件的事件产出的 Payload 要统一 … 有 Form 组件统一行为」把豁免一并废除。

## readOnly 家族面：原生可表达走原生，其余自造且不灰化

- **分工**：Input/Textarea/InputNumber/DatePicker 用**原生 `readOnly`**（浏览器自带只读语义与播报，InputNumber 顺带藏步进、DatePicker 顺带关面板）；Checkbox/Radio/Switch/Slider/Select 与两 Group 的原生元素**没有只读语义**（`readonly` 对 checkbox/radio/range/button 无定义），走**家族自造 readOnly**。
- **自造三件**：① 拦截用户跃迁——change 事件意味着浏览器已经改了，就把 DOM 回滚（checkbox/radio/switch 用 `!checked` 翻转回来、indeterminate 一并复位；slider 回写已渲染值）并**不发 onChange**；② `aria-readonly="true"`（组场景根不加，成员各自播报）；③ 根修饰类 `<block>--readonly` + `cursor: default`——指针读作「改不了」。
- **不灰化**：readOnly 是「值不可改」，disabled 是「控件不可用」——前者保留正常面料、仍可聚焦、可读、**照常进表单提交**；灰化与 `not-allowed` 是 disabled 的语言，两者同时声明时 disabled 压倒（源码序在 readonly 之后）。
- **组继承**：`readOnly` 与 `disabled` 同类（能力限制）→ **sticky（`||`）**，组声明即禁令、成员不可退出；`size`/`invalid` 是状态类才「本人优先」。
- 来源：Phase 2 审计后用户拍板「家族补齐 readOnly 面（阻止交互 + aria-readonly）」。

## size prop 一律表示视觉尺寸

组件库中 `size` prop 的语义固定为「视觉尺寸」，取值 `'xs' | 'sm' | 'md' | 'lg'`（Button 四档，Input 对齐后同序）：

- `Button` 用 `size` 表示按钮尺寸。
- `Input` 用 `size` 表示输入框尺寸；当与原生 `<input>` 的 `size`（字符宽度 number）冲突时，用 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>` 覆盖原生属性，而不是改名或暴露原生语义。
- **size 轴是跨组件共享的设计语言事实，不是组件私有档**：同档名必须同高同字同 padding-inline（Input 首版 26/36/48 自推值偏离 Button 的 size token 网格，被用户指正「Input 的 size 应该和 Button 对齐」后改四档同源）。涉及并排场景（输入框+按钮）时同档严丝合缝是硬验收。
- **两轴容器上 size = 内容的空间（主轴尺寸），方向轴决定它作用在宽还是高**（Drawer 定案，用户拍板「size 指的应该是内容的空间」）：`direction='left'|'right'` 时 size 控制宽、`direction='top'|'bottom'` 时 size 控制高，同一档位值双向对称生效——size 轴与方向轴正交，无「某方向 size 失效」的隐藏例外；逃生舱按方向分 `width`/`height`（数字=px，覆盖档位）——「档位管语义、逃生舱管精确」的家族模式。档位值必须落在 design-language WIDTH_HEIGHT scope 真实 token 上（Drawer 用 large_size 80/96/112 = 320/384/448px，同一 token 集天然宽高双适用，不造独立高度档）。
- **行为词按机制语义命名，不为对齐别的家族而借用词**（Drawer 定案，用户拍板把 `placement` 改 `direction`）：`placement` 是浮层相对定位术语（「相对 trigger 放置」），Drawer 无 trigger——用 `direction` 表达「从哪个边缘滑出」，取值物理词 `'left'|'right'|'top'|'bottom'`（方向词不是对齐词，生态 antd/MUI/Chakra 全用，心智零成本）。命名纪律：**词描述行为机制（滑出的边缘）而非参照系**，与 usePresence 先例同向；浮层族的 `placement` 保留给有 trigger 的锚定浮层，overlay 族用 `direction`，两族词界清晰。

将来做 `Select`、`Textarea` 等表单组件时保持一致：`size` 表示视觉尺寸、四档与 Button/Input 同源；遇到原生同名属性冲突，优先用 `Omit` 覆盖。Textarea 已兑现并固化（2026 Textarea v2）：**无「档高」组件（高度内容驱动）沿用同档字阶 + padding-inline 的同源不变式**——多行控件的高度遵循 rows 基准 + `autoSize`（antd 词形 `boolean | { minRows?, maxRows? }`，**默认开**：不写也随内容无限增长；`{ maxRows }` 封顶转入内部滚动世界、`false` 回固定 rows），size 档只管字阶与 padding，文档明说与 Input「同档同高」的字面差异（家族不变式为「同档同字阶同 padding-inline」）；原生 `<textarea>` 恰好无 `size` 属性、无需 Omit（原生无冲突就不制造冲突）。**尺寸策略由库持有、UA 能力初审后取舍**：原生 `resize` grip 因「只改内层、外壳不跟随」被关闭，手动调高改为**自绘 drag handle**（footer 工具条右端，主题一致 + 键盘可达 + 位置可控；原生 grip 进不了 footer 行，用户拍板「grip 与工具条同行」即锁死自绘路线；逃生舱 = 消费方 CSS 覆盖 `.colox-textarea-control { resize: vertical }`）；原生候选 `field-sizing: content` 因 2023 基线缺口（Firefox 152 才落地）记为演进点——「原生能力优先」要过基线这道门，过不了就自实现（与「定位数学外包、行为所有权不外包」同向）。autosize 只 auto 高度、宽度永远容器驱动——生态（antd/MUI/Chakra）无一做宽向 auto，表单对齐靠宽度容器化。**溢出控制不与手动控制并立**：handle 只活在无界增长世界（默认/true/minRows），封顶或关闭的世界不渲染（用户裁决，两套控制并存语义打架）。**内置 chrome 一律在流内占行、不悬浮盖字**：footer 工具条承载 count/clear/handle——无界世界里末行永远贴底，右下角悬浮件必压字（clearable 悬浮版被用户实测否定；「计数与清除都放框内会遮挡文字」），计数展示等元信息由 `showCount`（antd 词）内置。**chrome 合成的胶囊形态**：同排的「元信息 + 动作」聚进一枚 pill（bg-muted + 满圆角），内部细竖线分隔语义边界（`12 / 80 | 清除`）；动作件用**文字而非图标**（清除 = 文字钮「清除」，clearIcon prop 随未发布窗口撤销）——文字承载语义、胶囊承载容器视觉。**footer 无分隔线、文字列对齐优先**（用户三轮拍板）：先要 footer 四边 4px 贴角，后目视发现胶囊内文字与正文文字列错开很别扭 → 改判**胶囊文字与正文首字对齐**（footer 起始侧 = 档级 padding − 胶囊内 padding，胶囊盒比文字列左探出自己的一层 padding；胶囊内边距实测 4px 太紧、放宽回 8px——补偿同步加宽、对齐不破）；handle 端仍恒定 4px 贴右下角；上下各 4px、`flex-end` 让 handle 与胶囊共底；不用 border-top/min-height，行高由内容 + padding 决定——内置 chrome 的「文字列对齐」优先于「盒子贴边」。**交互图形的识别优先于语义精确**：drag handle 图标用原生角 hatch（三条 45° 斜线向角收拢）而非「≡ 三横线」——即便交互只调高度，也沿用平台原生把手的心智长相（用户「和原生保持一致、降低心智」；方向如实性交给 `ns-resize` 光标）。

### IconButton size：预设档 + theme 键表双通道（用户定调）

- **`size?: 'xs'|'sm'|'md'|'lg' | SizeKey`**：预设档是组件层语义（IconButton 的四档对齐表单家族同档同高，xs 24/sm 32/md 40/lg 48——用户「默认与其他组件 size 对齐」），`SizeKey` 是 **@colox/theme 发射的 `sizeKeys` 键表联合类型**（与 Stack/Grid gap 收 spacingKeys 同构：键表由 theme 发射、组件只消费、类型即白名单——`size="7"` 有补全、`size="99"` 编译期报错）。
- **两个细节用户拍板**：组件内部使用（Input/Select 的控件钮）用裸键贴合容器语境（一律 `size="4"`），不走预设档；Input 的 size 档是「height+padding+字阶」复合语义，IconButton 只要纯方块足迹（flex 居中、字阶无用），语义不同但四档高度仍对齐家族。
- 键表类名 `colox-icon-button--size-<key>` 由 `sizeKeys` 动态生成，尺寸落 `var(--colox-size-<key>)`——绑定 token 变量而非写死 px，主题重定义自动跟随。
- 将来形状类组件（Avatar、Badge 等）的尺寸 prop 沿用：预设档对齐 + theme 键表兜底的双通道。

来源：IconButton 设计讨论（用户先后定下「四档但不套 Input 复合语义、允许裸 token 值」「键表像 spacingKeys 一样由 theme 提供」「内部站点用别的裸键」三节奏；决策见 `IconButton size 双通道`）。

### IconButton 视觉轴：variant/palette 复用 Button 轴 + hover 反馈基座化（用户反转裁决）

- **variant = 六档强度阶梯与 Button 同构**（决策 c066fcc2）：Button solid/subtle/surface/outline/ghost 五档、IconButton 同轴补齐并 plain 打头（Chakra 对齐：用户「Button 组件的 variables 还有 subtle 和 surface…确认都补，IconButton 也对齐」）。每档语义唯一：solid=实底、subtle=浅底、surface=浅底+描边、outline=纯描边、ghost=wash、plain=纯图标/素面。七档结局（决策 49d74585）：IconButton 尾部补 muted——**阶梯末端 = 图标音色轴**（solid 最响 → plain 满色 → muted 静音）；muted 静止 = text-muted 语境档（palette 不参与、文档明说的具名例外）、hover/active 升 text-default（#9E9E9E→#191919 大偏移、反馈可见）。

- **反馈默认进基座、覆盖留给站点**：hover/active wash + 按压缩放是图标钮通用契约，基座默认提供（最初「hover 不进基座」是过度保守——独立组件零反馈被用户指摘「IconButton 好像没有 hover 效果」后反转）；站点要克制时用自己的类覆盖，而不是逼所有消费方自己上 hover。
- **形状开关显式化**：方形圆角（radius-xs）是默认足迹；圆形是 `rounded` prop 的显式选择——用户「圆底应该使用 rounded prop 来设置，默认应该是方形（圆角）」。
- **视觉轴词汇与 Button 同源**：variant = plain/muted/ghost/outline/surface/subtle/solid 七档（默认 plain），palette = design-language 六族轴（primary/gray/info/error/warning/success，默认 gray）——不发明 IconButton 私有颜色表/档名；旧 intent 五色轴与旧 text 变体名均已废止。
- **变体决定图标色**（用户「设置 variant 后，图标的颜色也应该跟着变；ghost 的图标颜色好像不正确」）：plain/surface/subtle 与 outline/ghost 涂 palette solid、solid 涂 inverse——色随变体走，不留给语境猜（plain 的继承版被用户反转：决策 666d8aa8「图标默认颜色就是 primary」）。变体反馈通道各异但都可见：plain = 图标同族加深（无底）、ghost/outline = wash 浅底、subtle/surface = 换档 muted、solid = 派生深涂装——「无反馈」才是问题，反馈形态跟变体走；总则「**有底换档、无底 wash**」（决策 c066fcc2）。
- **plain 类型零盒子**：盒子拥抱图标（宽高 auto），size 通道以 font-size 直驱图标尺寸——纯图标钮不携带静止包装（用户「只以图标大小展示，而不是有额外的宽高」）——size 对默认变体仍然诚实。
- **状态色同族加深恒优于跨族跳色**：静止已是 palette 色的组件，hover/active 取同族 solid-hover/active（决策 666d8aa8，用户「hover 应该使用 primary-hover」）——不做黑→蓝式的色跳跃；老规则「hover 色偏移要可见」仍成立：静止黑 + hover 黑 = 无反馈，所以静止要么给 palette 色、要么给可见的加深目标。
- **默认形态最小化**：纯图标 plain 是默认（无静止铬），加铬（ghost 色/outline 边/surface 描边/subtle 底/solid 实底）是显式选择（用户「variant 需要增加 text 形式……并且默认应该为 text」，后改 plain——Chakra 词、语义更准）。
- **形状参数家族同源**：方形默认圆角对齐 Button/Input 的 radius-lg(8px)——radius-xs(2px) 视觉上等于没有（用户指正）；圆形仍是 rounded prop 显式开关。
- 将来 shape 类组件（Avatar/Badge 等）沿用：显式 rounded 开关、家族轴词汇复用、反馈基座默认化。

来源：IconButton 视觉轴裁定（决策 05b83bed，caused_by IconButton 独立原语）。

来源：Input 组件新增时对 `size` 语义的取舍（见决策「Input size prop 语义」）；Input v2.1 对齐设计语言时固化跨组件同源规则。

## boolean prop 命名：正向能力词 `allow<Ability>`，条件边界即语义

- 布尔开关命名表达「允许什么能力」且默认 false：`allowTogglePassword`（用户改拍自我的 `showVisibilityToggle`：「有点复杂，可以改名 allowTogglePassword 默认 false，为 true 且 type 是 password 才开」）。
- 激活条件写进 prop 语义本身（`allowTogglePassword && type==='password'` 才生效），不发明「万事皆开」的笼统开关；`show*` 系命名太笼统（show 的是按钮还是状态？），能力词直给目的。
- **显示权重：视觉件的显示开关属 `show<What>` 词族**（2026 Form required mark 用户拍板 `showRequiredMark`）：开关的对象是「某个可见件的显隐」而非「某个能力」时，`show*` 直指对象、语义够准——必填星号默认显示（从规则派生），`showRequiredMark={false}` 单处隐藏。边界：能力型布尔（allow/能否）+默认 false；显隐型布尔（show/显不显）+默认 true（跟着真相显示，否定是局部例外）。
- 将来做 Boolean 开关类 prop（autoComplete 视觉件、下拉清空、格式化器等）沿用：`allow<Ability>` + 精确条件绑定 + 默认 false；纯视觉件的显隐口子归 `show<What>` + 默认显示。</think>

来源：Input v2 props 定案（用户对该命名的改拍）。

## 表单叶子：机制组件不背产品、状态映射归消费方

- **内置 = 机制；状态→图形映射 = 消费方**：库提供清空机制、密码可见性机制、搜索自动图标机制；「没输入时闭眼、有输入时偷看」这类与产品状态绑定的图形映射由消费方用 data + 三元在插槽里写。槽是舞台、图标是零配置演员、剧本归消费方——Input 背机制不背产品。
- 表单叶子三不：不做校验引擎（rules/async/messages/字段联动归 Form 层）、不做动态表单（独立子系统）、不隐藏原生事实面（原生事件对象完整进 `event`，事件面统一 `{ event, value }` 载荷——「原生事件全透传」的旧表述已废弃）。Input 对表单层的承诺只有三件：受控/非受控对称、统一事件载荷、真 ref。
- 空间复用词（数字正则、日期掩码）用**模式语言全程约束**表达（`filterPattern` 拒绝即回值不可见），与校验通道（native `pattern` + `:user-invalid`）双轨清晰。

来源：Input v2 设计讨论（用户以密码状态图标为例定出「背机制不背产品」边界）。

## Form 层 API 取向：级联走继承轴、注入只在生效时发生（批 B 定案）

- **能力级联与策略覆盖同走继承轴**：form 级 `disabled` 锁定、form 级 `validateOn` 策略，与 labelPlacement/labelWidth/labelAlign/requiredMarkPosition 同一套「form 级声明 + 字段级覆盖」体系。`disabled` 是能力剥夺类 → **sticky 不可退出**（用户拍板，与 Checkbox/Radio.Group 的 disabled 继承同一语法）；`validateOn` 是策略类 → 字段级可覆盖（「login blur 查重 + password change 强度」混合策略由此表出）。
- **退出权分三类（批 C 装饰轴定案）**：剥夺类 `disabled` 不可退出（sticky）；策略类 `validateOn`/`colon` 走 field 级覆盖；视觉状态类 `size` **控件自声即胜**——注入只在控件未声明 size 时发生，且不加 Form.Field 第三层（控件的 size prop 就是字段级出口）。
- **装饰字形一律 CSS 绘制，不污染文本面**：required 星号与 colon 冒号都是外置 span + CSS `content` + aria-hidden——label 的 textContent、label 查询、aria-labelledby 路径永远读到作者原文；冒号恒在文字尾（end 星号之后）。
- **内部表示与出口形态分离（批 C 结构定案）**：stores 内部恒扁平点键（epoch/deps/注册/focus 机制全在扁平面工作、零变化），`getValues`/`getErrors`/规则入参/提交载荷按需重建嵌套树——消费者代码只看到业务形态（fetch 进来是树、submit 回去是树），机制与消费形态各吃各的词形，重建只是纯函数+缓存。
- **卸载支出默认保留，显式清理不做后缀魔法（批 C 结构定案）**：unmount 保值（preserve 语义）、丢弃走 `unregister(name)` 一次调用；不给 Field 加 preserve prop（无双语义）、不清值不清错的半吊子版本也不做——「卸载=保、调用=丢」两等分，行为清楚、缺省保守、无 prop 猜测。
- **软事实不落盘（批 C 结构定案）**：touched/dirty/isSubmitting 状态面、数组词形、preserve prop 都是「无真实宿主的能力预设」——反问「谁来消费」揭宿主缺席时，不做（默认开、成本换不确定性不立项）；项目里没有的反面不被编出来。
- **注入只在生效时发生**：form 级 disabled 只在锁定时给控件注入 `disabled: true`——undefined 键会杀掉作者自设的 disabled（aria-required 同款教训，「注入键只在生效时出现」的延续）。
- **订阅原语一行收库**：联动/自动保存/实时预览这类「订阅字段变化」样板由公开 hook 收敛成一行（`useFormWatch(store, name?)` / `useFormWatchError(store, name)`）；命名与函数族同词族（useForm/useFormContext/useFormWatch），不满世界造新词。
- **a11y 落点默认开 + form 级逃生舱**：失败提交聚焦/滚动首个错误控件默认开启（`focusOnInvalid` 默认 true），form 级关闭做逃生舱——错误可及性优先于「库默认无惊喜」，逃生舱留在最小面。
- **装载与通知分离（编辑表单回填三件，批 C 定案）**：`setValues`/`reset`/种子是「装载」——静默 merge、不校验、**不报告**；`onValuesChange` 是「编辑的回声」——只由用户编辑通道发出，载荷 `{ name, value, values }`。自动保存盯通知通道，就永远不会把刚回填的记录再存一遍。校验、装载、通知三条通道各管各的，不混流。
- **Form 级 initialValues 只喂自持 store**：外部 store 时该 prop 忽略，装载归主人（useForm(initialValues)/setValues）——每个值的入口单一，Form 不隐写外部状态面。

## Checkbox 组语义与三态（Group 值数组 / indeterminate 纯视觉）

- **组 = 值数组语义**：多选的状态形态就是 `string[]`（`value`/`defaultValue`/`onChange(value: string[])`），成员以原生 `value` prop 声明参与键（表单值 + 组键双职，不发明 `groupKey` 之类的平行 prop）；显式 `checked`/`defaultChecked` 的成员退出组（本人优先），`name`/`disabled` 组继承、本人优先、组 disabled 不可退出。
- **组容器走 dot-part**（`<Checkbox.Group>`）：「内容必须在树中」判据成立——多选集合天然是父子树，成员需要在组上下文里生存；Leaf 三件（props/事件/ref）不动，组级语义（数组 onChange）是组自己的出口，叶子 onChange 走同一载荷（`{ event, value: boolean }`，value = 该成员自己的下一勾选态）。
- **组级与叶子级载荷同形**：事件通道是同一种 `{ event, value }`，差异只在 `value` 语义——组级 = 下一数组（单选组 = 下一单值），叶子 = 该成员自己的状态（boolean）。event = 触发成员的原生合成事件（哪成员触发、stopPropagation 可控）；组内成员受控于组时，`event.target.checked` 是 React 受控语义（恢复后的受控值），真相从 Group 的 `{ event, value }` 读。
- **载荷按组件语义扩展字段，对象形态免反查**：`{ event, value }` 是原模不是上限——Select 的载荷加 `option`（被选/被切换项从叶子编译出的记录，受控消费方不用拿着 value 反查选项集合）；对象形态加字段非破坏，趁未发布补齐。**行为词全家族同名同义**：`clearable` 对齐 Input 已定名，后续组件（DatePicker 等）有清除语义一律 `clearable`——命名对齐减少用户心智负担（用户拍板「后续组件命名全部对齐」）。
- **indeterminate 是纯视觉通道**：第三态只改图形（bar vs check），真相永远在 `checked`（事件流、表单值、FormData 只认它）；「选中了几个孩子」的级联数学归消费方，库只负责可视化——「状态→图形映射归消费方」在复选框上的延续。

- **单选组（Radio.Group）同构但单值**：状态形态是 `string`（`value`/`defaultValue`/`onChange({ event, value })`），成员仍以原生 `value` 声明参与键；**无移除语义**——radio 不可反选，select 命令由成员 change 事件驱动，重复点击已选中成员时 DOM 无 change、天然不上报（受控/非受控同构、原生忠实）。组容器命名按同族惯例 `colox-radio-group`（dot-part 名段合法）。

- **组是成员共享契约（size/name/disabled）的自然载体**：`size` 进 Group props、成员继承、本人优先、缺省 md——组成员几乎总是同档，逐成员设 size 是重复劳动（用户拍板「继承能力」）；`name`/`disabled` 继承同构。继承解析下沉 resolver（`size ?? group.size`），context 默认值即家族默认 md。
- **组 context 命名纪律**：状态字段**不带宿主前缀**——`disabled` 而非 `groupDisabled`（字段已住在组上下文类型里，归属不言自明，前缀是命名噪音）；成员上报选择走 context 的 **`onChange` 事件槽**（on 开头的事件命名，与组公开 prop `onChange` 同槽；成员以 `(value, event)` 上报、hook 组装 `{ event, value }` 发布——`selectValue`/`toggleValue` 这类动词命令名只留在 hook 内部，命令归命令、事件归事件）。

来源：Checkbox 设计定案（用户拍板「Group 做」+ 追问 indeterminate 语义后定句）；Radio 交付沿用并落实单值语义；用户对 Group 的两次指正（size 继承能力、context 字段命名）固化上述两条；用户提案「组自定义事件应以对象输出 { event, value }」定下自造事件面载荷形态。

## 选项集合一律叶子化声明：Select.Option 成员与各组同面

- **Select 选项集合 = Select.Option 叶子**（数据式 `options`/`optionRender` 撤销，用户改判）：定制渲染是第一等的 JSX 处方（children 直写），数据式回调把 JSX 隔一层、消费方定制代码丑陋。portal 面板不构成「成员在树不成立」的理由——portal 只改 commit 挂载点，React 子树完整，children 直接织入面板 JSX；「成员在树中」判据的对象从 DOM 摆放扩展为「React 树被父组件组合处理」。选项集合三条声明面（Radio/Checkbox 成员、Select.Option）就此统一。
- **Option 必填 value + text**：value 是选择真值（受控/FormData），text 是文本面本源——搜索过滤、触发器显示、多选 chip、缺省渲染共用同一条 text；children 只做富渲染（无 children 即渲染 text）。必填 text 免除「抽 children 文本」的隐式魔法（富节点抽文本错漏无声），这也是 antd 叶子式兜底 `label` prop 的教训——文本面不会因叶子化而消失。命名用 text 与 value 对偶、无 aria/表单语义联想负担（用户拍板 text 优于 label）。
- **成员 size 沿父级继承、本人优先**：Option 持 `size` 可覆盖父 Select 的尺寸档（缺省跟随）——「组是 size 共享契约的自然载体」在 Select 选项集合上的延续；`optionSize` 独生专 prop 随数据式 API 一并废除。

## 多选 chips 溢出交互：折叠 +N（不搞横向滚动）

- **chip 行单线定高，溢出折叠为 +M 计数徽标**：壳高恒定与表单家族单行契约一致（源头 bug 是 flex-wrap 折行撑高壳）；「状态看触发、管理看面板」分工成立——触发器只展示能放下的 chips + 计数，面板里全集可见可管；生态先例 antd `maxTagCount: responsive` 同结论。
- **+M 是纯提示，无自家交互**：点击走壳空白同逻辑（开面板）；不发明计数件的专属行为。**+M 以行内 chip 形态排尾，不叠加覆盖**——绝对定位覆盖会切进被遮 chip 中段露出断 pill（叠加形态前科一轮，用户指正「视觉污染，效果特别差」后改判）；状态件与内容同位排布才零污染。
- **计数靠 layout 响应式测量，不设固定 maxTagCount prop**：壳宽随宿主布局变化，固定数字阈值在窄宿主溢出、宽宿主浪费；ResizeObserver 重测一次到位，不引入临时公共 prop 面。**切片必须双向可重算**（响应式放宽是常态）：挂载全量 + 尾部脱流隐藏（visibility + position），隐藏 chip 兼任测量源——收紧折、放宽长回、新值即折叠也有宽度。
- 来源：用户报告多选溢出折行跑版后两候选（横向滚动/+N 折叠）讨论拍板 A 方案（决策 59ee6358）；叠加形态经 Storybook 评审改判为视觉切片（决策 1c6ee3a7）。

## 消息系统：palette/variant 家族同构 + 策略默认 + 防污染（Toast/Notify 优化定案）

- **消息面补上家族既有的 palette/variant 双轴（家族同构最后一公里）**：表单/按钮/图标早已有 palette 六族（gray/primary/info/success/warning/error）+ variant 面料，消息系统是家族里唯一只有 mode 四色图标的成员——补上两轴让消息面与 Button 的 private-var 播种做法同源（palette 默认随 mode、驱动图标色 + variant 面料），也顺带修掉「旧 shell 的 mode 调色从未命中图标类、四 mode 图标全 info 蓝」的潜伏 bug。mode 仍决定图标字形，palette 决定色、variant 决定多厚刷上面料——三轴各司其职，不合并。
- **词界清晰：内部判别词与视觉轴各自说各自的形状**——判别词（toast/notify）是 cdk 运行时事实，variant（plain/subtle/solid/outline）是用户面视觉词；旧名撞车已两度让位：MessageVariant→MessageFace（让出 variant 给视觉轴）→**`type: MessageType`**（用户拍板 face 改 type——「type 说它是什么类目」，注册判别词就该占 type 词位）；被腾出的语义轴词位（info/success/warning/error）改叫 **`mode: MessageMode`**（旧 MessageTone——「mode 说它是什么腔调」，旧 `type` 词位归判别词）。词描述它自己的那一层：内部事实给内部词、用户面语义给用户词。
- **默认是「省心的正确」**：toast 天然单条（轻量居中提示，一槽一条即够）、notify 天然堆叠（带标题卡片多条合理共存）——两个面的身份自带最优策略，让默认值表达它（Toast `strategy: 'single'`、Notify `stack`），per-call 覆盖是逃生舱不是样板。默认即正确 > 强制每次声明。
- **防污染是消息系统的产品责任**：用户两次点名前台污染（「太多 Toast 频繁触发导致视口污染」「Notify 消息过多减少视口污染」）——轻量提示用 single 替换阀、卡片用 fold 计数胶囊阀（终态，deck 四代前科收敛：透明/裁切/露边视觉堆叠全废——**积压场景的关注点是数量与不丢失，不是堆叠形状**；自动关闭在积压里=丢消息，故折叠态冻结计时、关卡按 LIFO 手动 pop、最后一卡恢复计时配倒计时胶囊）。**消息的退场动画只属于「最后一张」**——中间关闭是「同位置更新」：被关卡即时消失（无退场窗）、次新卡原地补位 + 词面 zoom 进场（single 替换同款语言），像翻书不像离场；看不见的积压永远不播退场动画（清空 ✕ 把积压即时清、只让可见卡走退场窗）。**折叠期间的「露出」统一 zoom 语言**——不管露出的原因（关当前卡翻出上一张 / 新到卡直接上屏），胶囊出现之后的每一次露出都是「更新」不是「到达」：帧留存 + 词面重挂 zoom（新到卡在 add 时直接 contentVersion 置 1）；只有折叠降生的那一张（胶囊同刻首现）走整套进场动画——彼时它是到达，不是露出。**露出必重挂必重播**——词面 key 取 `id:contentVersion` 复合：裸 version 会让不同条目同值被 React 复用节点（key 相等=同一元素），zoom 静默只播第一次；「每次进入 display 槽都是一次新词面」是硬承诺，key 必须保证换条目必换。**控件只服务其语境**——倒计时胶囊是阅读态（读秒），✕ 撤回；✕ 语境 = 多于一张可清空，剩一张时它的动作与卡上 ✕ 重复，控件按可用性收放，不按存在惯性。**single 在 store.add 时原地替换**（同 type+同 position 已有条目时 `replaceInPlace`：保留条目 id 与 DOM 节点、不重新挂载、不区分 palette/variant——「一个位置仅一条」是单一真相，叠加+让位+z-index 只是它的实现噪声），store 按条目 carry 的 type 判别 kind、各 kind 自持默认——机制下沉到能同时拿到「同槽同 type」正确域的层（面层做会散落）。**换载荷的瞬间要有反馈、落点留在可见域、收尾要快**（M4 续，用户「更新的时候加个淡出淡入，视觉感受更好」→「像闪一下，衔接更自然」→「不要到 0，到 0.4 试试」→「回升再快一些、update 初始透明度 0.6」）——透明度过渡形态曾被做成单容器 transition 驻留链（浅谷 0.4 / update 0.6、不对称回升），最终被用户点名为**整体退役**（「update 直接进行，zoom 进场即可」、「替换前也直接进行 update，然后 zoom 进场即可」）：**换字反馈统一为 zoom 进场**——新载荷即时落位、内容结点以 contentVersion 为 key 重挂、播放挂载触发 keyframe（scale 0.92 + fade，motion-normal，无相位类无定时器），update 与替换同款、容器上没有任何透明度过渡。补的是「换内容」的反馈不是「换位置」的动画；隐形 patch（duration/key 等）即时不闪烁——「给用户视觉反馈」与「不打扰」分层各配各的。
- **防污染的折叠表达 = 不显示 + 计数，不发明堆叠视觉**：计数胶囊沿 Select 多选溢出的 `tag-overflow` 先例（折叠为「有多少条」的计数字面——比硬隐藏更诚实）；被折起来的内容一旦以任何形状呈现（透明/细条/露边）就会「读不出而像 bug」，宁可整段停止渲染。**胶囊一衣到底**：倒计时态与计数态同一件衣服（初版 +N chip 的紧凑几何），语义换词不换样式——用户点名回收「第一版胶囊样式」。

来源：Toast/Notify 继续优化定案（决策 10252fe1，caused_by Toast 设计对齐定案 89cd1415）；原地替换两点修正（决策 f9f95d95，caused_by 10252fe1）；替换/更新淡出淡入 staged swap（决策 b2a192d8，caused_by f9f95d95，用户浏览器反馈「更新的时候加个淡出淡入」）；换场改单容器 transition 链式 + 0.3s motion-slow（决策 2eef2f61，caused_by + supersedes b2a192d8，用户反馈「像闪一下，衔接更自然」+ 给 transition 实现建议）；谷底透明度 0→0.4 浅谷（决策 48cafcc8，caused_by 2eef2f61，用户「现在的效果好多了，但不要到 0，到 0.4 试试效果」）；回升提速 + update 软谷 0.6（决策 887bb77c，caused_by 48cafcc8，用户「0-1 透明度再快一些、update 初始透明度 0.6」）；update 改 zoom 进场 + data/onClose 终结合约（决策 1c5eff77，caused_by c0abf854，用户「update 移除透明度过渡改为 zoom 进场 + 新增 data/onClose」）；替换过渡整体退役 + shadow 走设计语言 + Toast 改名（决策 be61c45c，caused_by 1c5eff77，用户「替换前也直接 update 然后 zoom + 三点改名 + shadow 走设计语言」）；积压折叠终态 = 计数胶囊 + 冻结 + LIFO pop（决策 c66af602，supersedes e6f28983，用户「更好的想法」——不堆叠、积压冻结、按栈 pop、胶囊 ✕ 清空 + 最后一卡倒计时胶囊）；pop 即时同位置更新 + 胶囊样式回收（决策 cc563aba，caused_by c66af602，用户「点击关闭直接同位置更新，不要再走退出动画了，只有最后一个卡片走退出动画。胶囊样式和最早一版不一致，喜欢第一版」）；折叠期间露出统一 zoom + 胶囊 ✕ 指针修复（决策 06952e3d，caused_by cc563aba，用户「当出现计数之后，再次露出的卡片使用 zoom 动画过渡出现（新增卡片/关闭露出上一个）」+「计数的 x 图标无法点击也没有 pointer 样式」）；zoom 每次露出必播（id:version 复合 key）+ 倒计时胶囊收 ✕（决策 057438ea，caused_by 06952e3d，用户「zoom 只有第一个被替换的卡片有，后面就没有了」+「出现倒计时胶囊时就不需要 x 了」）。

## 浮层锚定：锚点归组件自建/并入当事人节点，绝不依赖父级隐式约定（MessageViewport asChild 定案）

- **「定位上下文」是组件自己的责任，不是父元素的隐式义务**：`positioning="absolute"` 时代的 MessageViewport 把锚定寄托在「父元素恰好 `position: relative`」上——约定在 JSX 里不可见，父级漏设就穿透到 body（用户实测体验差后点破「依赖父元素设置 relative 是一个脆弱的约定行为」）。整治 = `asChild`：viewport 不渲染自己的盒子，把锚点类 `--content`（`position: relative`）merge 到消费者自己的元素上、槽作为绝对定位兄弟注入——**当事人节点就是定位上下文**，父级零约定。
- **零 div 用声明式并盒，不用命令式改父样式**：用户曾提议「viewport 不渲染 div，找父元素设 position: relative」——命令式改父元素有两层死结：① React 每次 commit 用 style diff 重置未声明的 inline 键，JS 直写的相对定位会被抹掉，要每帧重写（纯渲染被副作用污染）；② 卸载时恢复原值、StrictMode 双调用下注入/恢复打架。asChild（cloneElement 并类 + 注入绝对定位兄弟）拿到同样的零 div 收益，且完全声明式——沿 Tooltip/Popover「零容器 + clone trigger」先例。
- **中间层盒子不做布局，布局归内容自带**：children 方案里 viewport 盒只贡献「锚点 + 消息层」（Anchor 式 layout-neutral 相对盒），Container 管宽度语义、Stack/Grid 管布局机制——层宿主不学布局 API，不复制 Container props（每加一轴都要跟 = API 面债 + 职责含糊）。
- **双形态收敛为单一写法，不并存**：无 children = 屏幕固定层（`--fixed`），`asChild` = 内容锚定（`--content`）——结构自证锚点，删掉 `positioning` 词面而非保留双通道（同语义双通道不设优先级是 Select 模板教训的延续）。单个元素子节点是硬约束（多子节点/无子节点抛硬错误——并入需要唯一当事人），所以「pointer-events 隔离」也简化：固定层 drop + 卡片 re-enable，内容层槽显式 `pointer-events: none` 自让位。

来源：MessageViewport 层级结构与锚定讨论（用户「层级结构不够明显，需要与你讨论」→「依赖父元素设置 relative 是脆弱约定」→「viewport 又没有 Container 布局能力」→提议「不渲染 div，找父元素设 relative」→ 我提 asChild 并盒，用户拍板「方案更好，意图也更清晰」）。决策 c4c018e0。

## variant 是从设计语言推导的封闭轴

- 轴必须来自 Figma 真实状态；取值集合小且穷举；轴间正交（非法组合用 `compoundVariants` 显式声明）。
- 状态（disabled/loading/hover/focus）永远不进 CVA；色槽不混入形态轴（形态 × 语义色调是两条独立轴）。
- 不提供「用户注册新 variant」的 API：新 variant 走 issue/PR 进库（正向演进）。antd/MUI 同立场。
- 装饰修饰（投影等）走独立 boolean 轴（如 Button `shadow` → `colox-button--shadow`），值全走 theme token、不在组件里写死；装饰轴与形态/意图轴正交，不进 CVA 状态。
- 外部定制三层通道：① 主题变量覆盖（主通道）② className 尾部插槽（逃生舱，内部 CSS 永远单类特异性）③ recipe 导出（复用配方）。

## Recipe 双形态导出 + 用户 fork

- **该惯例无条件套用**：即使组件没有多轴矩阵（如 Layout Stack 仅 gap/align/justify 三独立值域），也必须走 `variants/` 层 + cva + VariantProps 类型派生——2025 年 Stack 首版以 clsx + 模板串直拼修饰类交付，被用户纠回；复杂度低不是豁免理由（fork 通道与类型单源在单轴组件上一样成立）。事实形态以 Button 为准：`variants/` 下 per-axis `as const` 类映射文件 + `index.ts` 导出 cva 成品与 VariantProps 类型。

- 每个组件在 `<component>/variants/recipe.ts` 导出双形态：`<component>Recipe`（**纯数据配置**，可合并/扩展/序列化）+ `<component>Variants`（cva 成品函数）+ `<Component>VariantProps` 类型。
- cva 函数是死的（配置已编译进类名拼接），只有数据对象能合并——所以数据是导出主体，函数是便利副产品。
- 使用方在 app 端 `ui/` 层 fork 官方组件：spread 官方 recipe 换 base/改默认/加自定义变体值；官方组件本体不开放换配方。
- 覆盖层级：L0 主题变量 < L1 官方 recipe < L2 用户 fork < L3 className 尾插。
- 配套 `extendRecipe(base, patch)` 工具（深合并 variants），消灭 fork 时的多层 spread 样板；只随有消费者的组件落地，不提前造。
- recipe config 永远是纯数据对象（无函数/闭包），保证可 spread、可序列化、可测试、可进文档。

## 用户侧主题配置（colox.theme.json，v1 已定案）

- 命名为 `colox.theme.json`（用户从 `colox.palette.json` 改拍为 theme：配置表达的是主题层而非仅是色板）。
- 编译模型走**变量链**（runtime var() 引用，非烘焙）：palette 导出为 CSS 变量、语义层引用 palette；配置编译产物是完整赋值的色板轴文件，双主题自动跟随；被用户认可的点：轻量支持多主题。
- **主题产物三文件布局定案**：palette.css（色板基线，主题无关，永远加载）+ light.css / dark.css（纯主题语义赋值，各自自包含）。演进史：早期为避免三文件把 palette 住进 light.css → 造成「只载 dark 不载 light 则语义全失效」的隐性存在约束 → 用户担忧使用方误解文件职责（把主题文件当可挑着加载的自包含文件），遂推翻早期的两文件否决、把 palette 拆分独立。属性轴选择器带 `:root` 前缀（0,2,0 稳压基线 0,1,0）→ 三文件任意加载顺序 + 打包器 CSS 重排都正确；加载契约收敛为「palette.css 永远在场，主题文件按需叠加」。
- **便利性用拼接产物实现，不用上帝文件**：用户嫌 3~4 行 import 后定案——build 期把五段单一职责源（base reset + palette 基线 + light + dark + motion 门控）串联成 `index.css` 聚合入口（同一份声明、零复制），使用方一行引入；颗粒文件仍各管一件事，加便利层不动职责层。拼接的安全前提（reset/motion 零变量 + 命名空间互斥 + `:root` 前缀特异性压基线）必须先论证再产出。
- 语义覆盖值语法定死两种：字面量 hex 或 `{ "palette": "gray/900" }` 引用（用户否决裸字符串自动识别）。
- 主题产物永远是完整赋值；覆盖在编译期合入。语义覆盖只到「语义槽」，派生靠 var 链自动重算。
- **brand = 独立语义组且动态**：编译期由种子生成器产出 brand 阶（写进定制色板轴），语义层 brand.* 是工程侧静态引用链（Figma 不拥有）；ColoxTheme 的 palette 轴切换整体替换 brand 阶变量 → 双主题全链重派生。默认 brand 阶是 indigo 阶的引用链（零视觉漂移）。组件层后续改吃 brand.*（Button primary 从 indigo 换出）。种子生成器保留。
- 多主题 = themes 块的轻量继承（extends + semantic 覆盖），编译成各自完整赋值文件；双轴正交（theme 轴 × palette 轴）。dark 的明暗切换走 attribute 轴。
- **scope: "media" v1 不做**（用户拍板；我的推荐同向）：属性轴已覆盖 JS 驱动的换肤，媒体轴对应「纯静态零 JS 跟随系统」的需求没有真实消费方，属猜测性接口；selector 只是编译期字符串装配，将来加 media 不破坏 v1 配置格式。

## 事件与原生行为：全透传，不合成

- 组件不发明合成事件（`onPress`/`onLongPress`），也不隐藏原生事件：HTMLAttributes 继承 + `...rest` 透传，`onClick`/`onFocus`/`onKeyDown` 等原样可达。
- 组件无内部状态（Button 无 loading/async 内核）→ 没有状态回调（`onLoadingChange` 之类）可补；防连点、异步提交是消费侧组合，不进内核。
- 键盘可达性（Space/Enter 触发 click）由浏览器原生标准化，不重造。

来源：Button props 收口时用户确认「事件不用特别补充」。

## Layout 组件：机制最小化，token 键锁 prop

- 演进史：初版走成对组件（HStack/VStack，「调用点直白语义」）；后用户为收紧布局心智负担改定**三机制件路线**（flexbox/grid/absolute 三种正交内核，预设壳是 Chakra 丰产哲学的产物、与本部定位不符），成对组件缩减为**单 `Stack` 机制件**（direction 轴承载全部 flexbox）并删除 HStack/VStack。未来 Grid、Positioner 同此路线，Container 保留为唯一语义壳。
- 可选能力走 **dot part 挂载即启用**（`<Stack.Responsive gap={{ base, md, … }} />`）：静态组件零 theme context，只有挂载件读 context（断点名解析，数值只活在 theme 运行时的 matchMedia 传感器）；与 ColoxTheme.Storage/Breakpoints 同惯例，内部注册 LWW、卸载还原。
- 组件名描述**容器职责**：绝对定位容器定名 Positioner 而非 Absolute（absolute 是子件行为，容器只提供定位上下文）。
- `gap` 只收 spacing token 键（20 键全刻度），不收任意数字/px——间距永远落在主题网格上；`align`/`justify` 收语义词（start/center/between…）不收 flexbox 裸值；direction 含反向值。
- **对齐词一律 box-alignment 逻辑词族（start/center/end），禁物理 left/right**（RTL 下物理词镜像错位）。Container 的 `align` 与 Stack 的 `align` 同词族但不同职：Container 管壳自身行内轴放置（对标 align-self），Stack 管 flex 子项的交叉轴——文档写明区别，不换词。
  - Form 的 `labelAlign`（2026 兑现：start 形态 label 列内文字对齐 `start/end/justify`）沿用同一纪律——text-align 词也走逻辑词，antd 的 left/right 物理词不被采纳（用户拍板）；**新轴默认取现状词**（start = 开启即既有视觉，不破现有表单），业务场景一行 form 级声明即全局生效；轴向的继承走既有体系（form 级声明 + `Form.Field` 字段级覆盖）；justify 单行文本需 `text-align-last: justify`（单行 label 全是「最后一行」）。
  - 对齐轴与装饰件分开：Form 的 required mark（2026）是**外于文字槽的独立件**——justify 会把行内所有字元均匀扯开，星号若进文字流会被拉离文字（孤悬列首）；同理往后「对齐轴 + 装饰件」共存的场景都用这个结构。
  - **对齐的舞台是列槽、label 整体被对齐**：start/end 对齐作用于槽里的整个 label（内容宽收缩、星号+文字一体移动），星号在任何对齐词下都贴文字；justify 是唯一例外（文字槽撑满列宽铺满、星号守行缘）。教训来自用户指正：把 `flex: 1` 给文字槽，end 下文字走列右、星号滞留行首——先被拉宽的子件会偷走对齐语义，对齐**不作用于拉伸件**。
  - **装饰字形走 CSS content 不污染文本面**：required 星号是空 span + `::before { content: '*' }`（aria-hidden）——label 的 textContent 保持作者原文（label 类查询、aria-labelledby 拿干净文本，测试无 * 前缀）；装饰的语义孪生（aria-required）落在真控件上。「显示跟着真相走」：星号**从 required 规则派生**（单一真相源，不设双源显式声明），隐藏（`showRequiredMark={false}`）是纯视觉选择、不改程序化语义。
- 修饰类（direction/gap/align/justify 档）**始终全量输出**（含默认档，同 Button CVA 惯例）；CSS 忠实默认（方向 row、对齐 stretch、分布 start、gap 无类即 0）。

## ColoxTheme 运行时：组合式 API，props 不堆 Provider

- 形态：`<ColoxTheme>` 根组件，props 直接承载**单属主轴**（`theme` / `defaultTheme` / `palette`），仅**可选子组件**保留为 dot 形式：`<ColoxTheme.Storage />`、`<ColoxTheme.Breakpoints values={…} />`。
- 演进史：最早四个正交面全做 dot part（用户否掉全量 props API：「属性比较多时非常影响开发时的代码体验以及 props 无法合理的进行分类」）；后用户进一步定案——theme/palette 属性少、无在树中按需挂载的需求，收进根 props；Storage/Breakpoints 表达「可选能力」，保留子组件形态（挂载即启用）。
- 子组件向根注册**走 useColoxTheme 唯一受保护出口**（`const { register, unregister } = useColoxTheme()`），不裸调 `useContext(ColoxThemeContext)`；ColoxThemeContext 不进公共 barrel。context 直接提供注册能力，不设独立 hook；同类多实例 last-write-wins（和 CSS 源顺序覆盖同一直觉）。
- 回调不设（变化响应 = 订阅 context/store 值）；`'system'` 词汇进主题值域（声明与 setTheme 命令同词），跟随系统的状态机由 context 内部控制，使用方零实现。
- 运行时不做配置文件接线（colox.theme.json 纯编译期）：文件管编译产物、代码管运行接线。palette prop 的值即 output.name 轴名——人肉对齐的漂移风险已知并接受。
- 四轴事实源是 `<html>` 属性，React 层只做写入者+订阅器，不建平行状态。motion 轴例外更简：`'system'`/缺省**不写属性**，`prefers-reduced-motion` 媒体查询原生跟随（无 JS 传感器），只有显式 true/false 写入 `data-colox-motion`。**存储模型 = React 状态流**：`<ColoxTheme>` 根持 useReducer 状态 + context 下发（snapshot 字段 + 命令 + register/unregister 平铺为一个 context 值）；属性写入是 useInsertionEffect 副作用，matchMedia 传感器/存储恢复在 layout/普通 effect 里接线并自动清理；无模块级全局变量。无 Provider 时 useColoxTheme `console.warn` + 静态默认值（命令式 setter 与子组件 register/unregister 皆变 no-op）——调用保护只存在 useColoxTheme 一处，所有消费方同出口。

## 集合逐项定制：模板叶 + clone 注入，否决 prop 回调 render-prop

- 集合型组件的逐项渲染定制（Select 多选 chip、将来 Checkbox.Group 成员等）标准形态 = **compile-time 模板叶**（`<Select.Template name="tag">` 唯一组件子节点），渲染期逐项 `cloneElement` 注入契约——不是 `tagRender` 式 prop 回调。
- 否决 prop 回调的理由（用户原话精神）：「prop 的形式入参渲染节点不直观也很别扭」；回调把 JSX 隔一层——与 optionRender 撤销同一病因，叶子才是第一等 JSX 处方。
- **注入契约三元组**：`props`（必须属性背包，库将来新增必须属性消费方 spread 一次自动跟进，可前向兼容——「组件不套壳」）/ `option`（成员编译记录，未声明值合成兜底恒定义）/ `onRemove`（内部移除通道，视觉归消费方、行为归库）。背包 `{...props}` **靠前展开**、库属性赢。
- 模板组件必须输出单一根元素（fragment 根破坏「一值一节点」测量索引）；宿主元素/重复模板/未知槽 = 编译期硬错误。
- 不提供模板 + 回调双通道（双源真相与优先级文档负债，违反正交原则——options 与叶子并存被否的前科）。
- 通用引擎节奏：**模式先行、引擎后行**——clone 一步无抽象价值（一行 cloneElement），共性在校验 + 类型基座 + 遍历 visitor；第二个消费者出现才提权 cdk（rule of two；InputControl 提权同规）。

来源：Select tag 定制定案（决策 c7778102，caused_by 59aa4801 选项叶子化改判）。

## 双通道 API：props 直给普案 + 声明树定制（Tooltip 定案，Popover 同模板落实）

- 同一组件两形态并存：普通文字走 `content` prop 直给（`<Tooltip content="删除">`），定制 DOM 走组合树（`Tooltip.Trigger` + `Tooltip.Content`）。用户裁决：一般 tooltip 仅展示普通文字直接 props，确有定制 DOM 场景才组合式——双形态共存而非二选一。
- 判别 = 子树走查（任一 part 在场即组合模式）；组合模式各 part 恰一、props 模式 children 恰一个 trigger 元素（**组件型/DOM 均可**——tooltip 注入面只有 aria 归因，cloneElement 对 DOM 同样成立；AutoComplete 报 DOM 宿主硬错误的起因是值词契约注入对裸 DOM 无意义，此处不适用）；`content` prop 与组合模式同给 = **编译期硬错误**（同语义双通道不设优先级，Select 模板双通道被否教训的延续——不是禁止双形态，是禁止无裁决地并存）；content 空值 = 不弹（等价关闭语义，条件提示通道）。
- part 分工：Trigger = 声明叶（渲染 null，宿主由根抽走并注入 `aria-describedby`——作者已有值**合并保留**不覆盖）；Content = 内容载具（自有 DOM，`className`/`style` 逃生舱落在内容盒）。
- 宿主槽词 = `Trigger`（用户原词，交互触点语义；与 AutoComplete 的 `Target` 定位参照词按家族分界——combobox 走 Target、交互浮层走 Trigger，词界见 composition 卷）。
- 表面词：`palette = 'gray' | 'primary' | 'info' | 'error' | 'warning' | 'success' | 'white'`（默认 gray；variant dark/light 已随表面轮废止——见 styling.md 提示层条目）；`showArrow` 布尔默认开（装饰箭头随面板染色；名字与「显示」语义对齐，定名轮把 `arrow` 改为 `showArrow`）；`size = 'sm' | 'md' | 'lg'` 三档阶梯（提示层字体比正文错一位）。
- **延时对象**：`delay = { in?: number, out?: number }`（用户词面；部分对象与缺省 merge：in 300 / out 0；focus 通道恒零延迟即时开、`in` 只管 hover 通道）。
- **closeOnScroll 布尔**：默认 `false` = 滚动时跟随（autoUpdate 既有机制零成本）；`true` = window 捕获滚动即关面板。滚动关闭是显式开关不是默认行为。
- **closeOnOutsideClick 布尔（默认 true）**：与 Popover 同词同义（只闸「外部点击」这一条关闭通道——false = 外点不关，Escape 与失窗不是点击照常关；命名对齐 `closeOnScroll` 词族；默认 true = 现状 additive 纪律）。
- **可见性词族 `visible`/`visibleOn`**（定名轮用户把 `open` 改 `visible`、`onOpenChange` 改 `onVisibleChange`）：`visibleOn = 'hover' | 'click' | 'manual'`（默认 hover——hover+focus 双通道、focus 零延迟即时开；click 即时 toggle；manual=受控 `visible` 直排、交互不自动开合、**opt-in 关闭通道回音**——外点（closeOnOutsideClick 开）与滚动（closeOnScroll 开）回音 `onVisibleChange(false)` 由受控主人跟随、Escape/失窗 manual 下静音，用户定调「这种特殊事件用户不必手写、库来处理」）；**无 `defaultVisible`**（hover/click 是纯展示通道无需首显词、manual 受控，default 无消费方）；无 onChange（提示层无值字面）。

### Popover：双通道模板的交互孪生，三类词随交互面升级（Popover 对齐定案）

- **双通道 API 与 Tooltip 同模板**：props 形态 `title`/`content` + 单一 trigger 子元素；组合形态 `Popover.Trigger`（恰一）+ `Popover.Title`（至多一）+ `Popover.Content`（至多一）；同给编译期硬错误；title prop 与 Title part 同给亦硬错误。**content 空值 = 永不打开**（比 Tooltip 的「渲染 nothing」进一层：机器层 `setVisible(true)` 直接 no-op——状态不翻转、无回显、`aria-expanded` 恒 false 不撒谎）。
- **`visibleOn` 三通道全给**（用户覆写我先只做 click+manual 的推荐）：click（默认）即时 toggle 且**开即焦点进面板**（非模态 dialog 的 WAI 模式本体）；hover 走 `{in:300, out:100}`——**out 延迟就是指针桥**：面板可交互（不穿透），指针跨缝隙进面板必须在 out 内送达；**不做隐藏桥元素**（Radix HoverCard 式——面板贴 trigger、缝隙 8px 下计时器桥已足（antd mouseLeaveDelay 同构），桥元素是额外 DOM 机制）；manual = 受控直排、opt-in 关闭通道（外点/滚动）回音 `onVisibleChange(false)`、Escape/失窗静音。`delay` 部分对象 `??` merge、无 `defaultVisible`、`visible`/`onVisibleChange` 词族与 Tooltip 同。
- **指针交互不劫键盘焦点**：hover 开永不抢焦点（悬停不能偷走键盘焦点，与指针交互打架）；click 开才把焦点给面板；外点关焦点随点击自然落位、**不偷回 trigger**；Escape 关焦点归还 trigger——「焦点跟随手势来源」是浮层族的通则。
- **`closeOnOutsideClick`（默认 true，用户点名新增）**：命名对齐既有 `closeOnScroll` 词族（close-on-<触发源>）；只闸「外部点击」这一条关闭通道——false = 外点不关（钉住面板：筛选盘/对比视图/拖放目标），**Escape 与失窗不是点击、照常关**，trigger toggle 照常活。两条纪律：**闸只逐条命中通道，不设总闸把面板变死**（Escape+失窗是键盘与窗口的出路）；**布尔能力 prop 默认值 = 现状行为**（默认 true 即现状外点关，与 cdk exitDuration 默认 0 = 现状同款 additive 纪律——opt-out/opt-in 以显式参数表达，零破坏新增）。**manual 契约（用户第二轮定调）**：opt-in 通道（外点/滚动）manual 下回音 `onVisibleChange(false)` 由受控主人跟随、常开通道（Escape/失窗）manual 下静音——「这两个关闭时机特殊，需要特定时机关闭处理，用户不应关注这种特殊事件」。
- **面板宽度 = 内容固有**（DatePicker「面板宽度=内容固有」先例）：不设固定宽档（size 三档是 Tooltip 提示层的事），上限归消费方 CSS 逃生舱。
- trigger 零容器克隆、`aria-haspopup/expanded/controls` 接线与作者词合并保留、Content 的 `className`/`style` 逃生舱——全部 Tooltip 模板直搬。

来源：Popover 设计对齐五轴定案（决策 b11e9c04；其中「三通道全给」与「实底分道/指针桥」由用户拍板覆写或点名）。

## 布尔开关用真 input + checked 词形，不仿 button 路

- Switch 兑现（2026，Checkbox 同构）：**真 `<input type="checkbox" role="switch">` 即控件**——ref/name/value/键盘/焦点全原生、表单零成本；否决 antd 的 button+role 路（牺牲原生表达去手写键盘/表单）。
- 受控词形 = `checked`/`defaultChecked`（原生属性词，家族布尔组件同词；不上 antd 的 `value`）。
- `children` 即文案标签（label 根包裹，Checkbox 同构）；轨道内不放 ON/OFF 文字（小档装不下，checkedText 属扩展点）。
- 「控件即它自己」的视觉表达：appearance:none 把轨道涂在 input 本体上，thumb 是 overlay——与 Checkbox「box 即 input」同一不变式。
- 视觉轴词汇家族同词：开关的调色板叫 `palette`（Button 已有同轴，不引入 MUI 的 `color`）；语义 = **只染开态**（开关靠「开色」被读），关态面料与 invalid 红通道不随调色板漂移；接线同 Button 私有变量模式（类声明 `--colox-switch-palette-*`、绘制规则读变量，零特异性级联干扰）。

来源：Switch 六问对齐定案（决策 Switch API 定案）。

## 数字值控件用真 range input + 自造事件面（Slider 先例）

- Slider 兑现（2026）：**真 `<input type="range">` 即控件**——ref/键盘/焦点/表单全原生零成本；视觉绘制 appearance:none + 引擎伪元素（WebKit 用 gradient + background-clip: content-box，Firefox 用 `::-moz-range-progress`），组件算出已走百分比写入 `--colox-slider-progress` CSS 变量（受控/未受控都内同步）。
- **事件面新档位（用户拍板「自造 { event, value }」）**：数字值叶子的 onChange 自造载荷 `{ event, value }`——event = 原生 change 事件（原生面完整保留进载荷：propagation、DOM 事实面），value = 提交数字（原生 range 的值是 string，库里解析后才交给消费方，消费方不背 `valueAsNumber`）。「叶子事件永远原生透传」的旧规则就此失效：原生 string 值与数字契约不符时，库解析比消费方解析更诚实。**当时留的「布尔叶子（Checkbox/Radio/Switch/Input）保持透传不变」例外已被后续全家族收敛废除**（见文首总则：叶子与组同形载荷，无豁免）。**InputNumber 沿用此先例**。
- `min`/`max`/`step` 收窄为 number：原生 `string | number` 联合不符合数字值契约，组件面收窄压过原生宽类型。
- marks 纯显示层：刻度只做视觉、不碰 step（antd 的 step=null 隐式吸附不抄）；palette 六族只染已走条纹 + thumb 圈，未走段/刻度/禁用面料保持中性（同 Switch「只染开态」的语义克制）。
- 几何同源家族不变式：条纹随档走 spacing 阶梯（4/6/8/10 与 thumb 12/16/20/24 同倍率，比例稳定 2.4-3:1——4px 恒定被用户目视否定后改档）、行高 24/32/40/48 四档、focus-visible = palette muted 环、motion 走 token。

来源：Slider 六问对齐定案（决策「Slider API 定案」）；用户对「原生 range 是否能更好自定义视觉」发问后的确认（原生基座 + 伪元素绘制可行性，含 WebKit 进度渐变技巧）。

## 日期值控件：显示走标准 token 格式化，真值恒 canonical 不被 format 污染

- DatePicker 兑现（2026）：**显示格式化走标准 token 写法**（valueFormat prop——用户原词，不改成 `format`）：`yyyy`/`yy`、`M`/`MM`、`d`/`dd`、`EEE`/`EEEE` 星期几；token 大小写不敏感、非字母即字面分隔符、默认随 picker 粒度、placeholder = format 串。**内部值与 onChange 载荷恒 canonical（随 picker 粒度）**——format 只碰显示层，绝不反向污染真值（antd format 双通路教训：显示与真值脱钩是「显示面」职责的诚实边界）。
- **星期几 display-only**：星期几是日期的派生物，反解无意义——parse 位匹配并丢弃，文档明示「weekday 不参与解析」。
- **日期域越界回滚不 clamp**：min/max 语义 = 面板禁格 + 手输越界静默持有、blur 回滚。日期域无「最近合法值」的自然序（数字域 clamp 是机制、日期域回滚才是诚实表达）。
- **值词形与粒度显式一致（picker 维度）**：选月值就是 `'YYYY-MM'`、选年值就是 `'YYYY'`，绝不把粒度藏进内部归一（不伪装成每月 1 号的完整日期）——canonical 恒真相的另一面是粒度显式存在词形里；默认 valueFormat 随 picker（yyyy-MM-dd / yyyy-MM / yyyy），显式传入仍覆盖。
- **手输解析 = 数学化精度规则，非 per-case 语法**：文本解析出精度（年 < 月 < 日），精度 ≥ picker 粒度才提交——更细截断归一（month picker 收 '2026-03-02' 提交 '2026-03'）、更粗回滚（'2026' 不成立）。一套阶梯规则管三个 picker，不写三份特判。
- **面板 chrome 本地化 = 数据型 locale 对象**：内置面板文案（年月标题/周头）默认跟产品语言（中文），定制走 `{ months?, weekdays?, yearMonthFormat?, yearFormat?, decadeFormat? }` 标签数组 + 占位格式串直给——不用语言简码地图（猜不全的封闭集合）、不用渲染回调（字符串格式化不需要 React 节点，回调隔一层）。chrome（locale）与字段显示（valueFormat）与内部值（canonical）三层各管各、互不渗透。**TimePicker 同约但更克制**：确认钮文案默认「确定」（中文）、定制 = 单枚 `confirmText` 字符串 prop——**不提前建 locale 对象**（单串文案没有对象的需求，语言包等真实国际化请求出现再调整）；**整个 footer 也不提前开插槽**（无真实消费方出价：没人要用底部放自定义内容就不造 render prop——「软事实不落盘」纪律的 API 版）。
- **浮层面板宽度 = 内容固有，不是宿主派生**：日历面板 272px（日格足迹 7×32 + 6×4 间隙 + 2×12 内边距），宿主宽时不拉伸面板（只占左段）、宿主管窄时不压缩内容（向右溢出交 floating shift 兜底）；同一 popover 内多形态内容（日/月/年格）共享一个固有宽——用最宽栏内容定 min-width、窄形态摊满（`width: 100%`）不缩水，level 切换面板宽度不跳变。
- **日历面板层级钻取 = 广域心智（antd 同构）**：header 标题是钻取路径（日 → 月 → 年），选中上级格逐级回落、落在 picker 粒度之上只下钻不提交——用既有格子词汇换面板层级，不为跳大跨度日期发明新控件；标题**分节可点**（日格年/月各成钮——点月落月格、点年直落年格，不强制逐级爬）；pick 语义由「level 与 picker 的关系」统一裁决（高于粒度下钻、等于粒度提交），交互词汇随语境切换不发明第三动词；**双档 chevron**：单=本格步长、双=父粒度（年格只剩双）——步长档位是 antd 式日历心智的一部分。
- **引导性标题钮的语义色：默认 text-default、hover 走 palette solid**（「这里通向某处」）；导航 chevron 保持 muted 惯用法（color-only 反馈、无底 wash）——引导与导航穿各自的皮肤，控件组内可点/不可点、引导/导航区分靠语义而不是同款样式。终级标题（十年格）纯 span 无 hover。
- **clearable 家族词：交互形态也是共享契约**——不只共享 prop 名。行内 X 钮 + 值存在时与尾部图标（Select 的 chevron / DatePicker 的日历图标）hover/焦点交换露出、mousedown 防失焦、shell 点击对 button 早退；谁在家族里用 clearable 就穿同一套交互形态，不发明第二种清除入口（DatePicker 首版 panel footer 文字钮被用户否掉：「应该和 Select 组件的 clearable 交互行为保持一致」）。
- **「现在」锚点与选中态正交**：今天/当月/当年**未选中时永远**穿 subtle（family 浅底 + 家族字色、hover 复用 Button subtle 的 muted wash），不随有没有选中其他日期消失——暗示层与状态层各管各；**选中 = 当前格时 subtle 显式让位**（subtle 规则带 `:not(--selected)`），selected 独占背景/文字。注意：`:not()` 伪类会把规则特异度抬一个类级——「靠源码序让 selected 赢」是不可靠的（(0,2,0) 的 today 压过 (0,1,0) 的 selected，顺序救不了），排除必须写在选择器里。surface（浅底+描边）先试后被用户目视否定：「调整为 subtle 吧」。
- 将来做时间类/区间类控件的显示格式化沿用：标准 token 词形 + 真值 canonical 与显示彻底分离；token 表对齐成熟的广域标准（Java/antd），自定义 token 语言不发明。

来源：DatePicker 六问对齐定案 + 用户两条补充（补日历图标；valueFormat 标准 token 写法并支持星期几）+ 用户目视评审修正（「年月默认使用中文描述，允许用户自定义」→ locale 数据型定制定案）+ 用户三轮评审（surface 改 subtle；「需要支持月视图和年视图，我认为是必要的」→ picker 维度定案）。

## 日期/时间值契约：出口恒 canonical 串，消费便利走公开 cdk 工具面（DateTime 定案）

- **值契约恒串一个词，绝不因「消费方便」放 Date 对象进出**（TimePicker + DatePicker showTime 定案，用户问过 Date 出口后被摊牌劝回）：`datetime = 'YYYY-MM-DDTHH:mm'` T 形固定宽，字典序即时间序（min/max 时间界免费）；入口宽容归一（T/空格双收、date-only 缺时补 00:00），出口恒单一词形。Date 对象进不了值契约四条硬伤：粒度纯度（月/年/时间无诚实 Date，伪造日参差）、Form JSON 序列化下 Date 变线串、原生 Date 可突变 + 时区坑复活（零时区正是为躲它）、对已交付词形全线翻工。**组件值契约与工具面是两个域**：工具面（cdk）可以自由收 Date 对象，组件契约依旧只认串。
- **工具面 = 单一值对象 + 链式调用，不用后缀自证词形**（用户评审批 1 后改拍：Iso 后缀满天飞是「没有单一数据类型」的症状）：`date(source)` 工厂归一 string|Date|`…Z` 即时串 → 不可变 `ColoxDate`，`addDays/addMonths/addYears` 链式、名字即语义不带 iso；`format(source, pattern)` 独立可用——链式不是强制，不必所有调用都从 `date()` 开头。方法名语义化优先（复数词形 `addMonths` 对齐引擎与惯例），输入宽容（双格式恒收）不需要在名字上强调。
- **parts 一等格式：出入对等，六字段不丢信息**（用户定名 `dateParts()`/`.parts()` 并拍板六字段）：`date()` 直接吃对象格式（`date({year,month,day})`，钟点字段缺省 0），`.parts()`/`dateParts(value)` 吐 `{year,month,day,hour,minute,second}` 完整坐标——datetime 转对象不丢钟点、回读分毫不差；对象入参同享工厂诚实纪律（日历非法抛 TypeError）。「坐标→值串」方向不再公开：内部拼串留模块私有，外部出值走 `date(parts).format('yyyy-MM-dd')`。
- **兜底是调用方的参数，不是第二个函数名**（用户拍板 A 方案）：`dateParts(source, fallback?)` 一个入口两种容错——无兜底参数诚实抛；`dateParts(source, null)` 认不出给 null（引擎值词门，站点各译退路）；给坐标则兜底坐标原样返回。`parseGranularIso` 公开身份并入此参数而死（值→坐标唯一公开名）；引擎语法从严变宽——`'2026-3'`、`'2026/3/2'` 这类非 canonical 拼法被显示/面板接住（入口宽容顺延），真垃圾串仍各走各的退路。其后 `granularIsoOf` 也并入 `format(value, 档位pattern)`——civil 内部的 `parseValueWord` 随之无消费者而死，锚点/今天高亮两处组件消费点改走公开词类。
- **渲染只有公开 `format(pattern)` 一个出口，`iso` 只留无参即时词**（用户点破「partsToGranularIso 其实就是格式化」后继手「按你的说法，保持干净」）：`partsToIso`→私有 `valueWord`、`partsToGranularIso`→`iso(pattern)`、最后连 `iso(pattern)` 本身也并入 `format`——三档输出与 `'yyyy'/'yyyy-MM'/'yyyy-MM-dd'` 一一对应，硬编码专用小格式化器不占公开词表；`parseDateText` 的截断规范化走 `date(parts).format(GRANULARITY_PATTERN[g])`。`iso` 收敛为单规则：无参 = 即时词（toISOString 形态，wire/交换用）；pattern 渲染（值词、显示词）一律 `format`——每个词一条规则。
- **显示出口不抛：`format` 认不出渲染 null，音量是调用方的政策**（用户定「公开 format 不应直接抛异常」，拍板返 null 无 warning，formatIso 并入）：`format(null|垃圾串|Invalid Date, pattern)` → null（保留「空 vs 垃圾」信号，`''` 会抹掉二者差别）；组件显示走 `format(value, valueFormat) ?? ''` 一行、无私有 helper。归一化层（date/dateParts）仍诚实抛、显示层哑——两层分治下沉一层。`formatIso` 死亡、引擎 `renderToken`/WEEKDAY 词表随之删除，`compilePattern` token 流留解析；dts 用 null 源→null、值对象/parts→string、串/Date→string|null 三态冗载钉住诚实类型。
- **公开类型只露方法面，构造全封闭**（用户确认）：`ColoxDate` 公开形是纯 interface（dts 只有 6 个方法签名，无 constructor/无 fromParts 这类内部通道）；真身是模块内 DateValue + 工厂令牌——实例只能出自 `date()`。内部实现腔（构造、parts 字段）不进 dts。
- **命名直白化第二轮（零争议先做）**：`todayIso()`→`today()`、`weekdayOfParts()`→`weekdayOf()`、类型 `IsoPrecision`→`ParsePrecision`——实现词根出局、日期语义即名字；残余的互转/截断/显示函数名的词系选择用户另逐条定。
- **显示词与即时词分离，渲染单一出口**（用户定：「iso 默认输出与 `new Date().toISOString()` 保持一致」，后手「保持干净」收掉 iso(pattern)）：`format(pattern)` 是唯一的 pattern 渲染出口（值词、显示词都走它，时区无关民用坐标）；`iso()` 无参 = UTC 即时词（完整时间 + T + Z + 毫秒位，真 UTC 值）——序列化边界走本地壁钟→UTC，且工厂可回读往返；解析 Z 串不碰 `new Date(string)`（自己解数字 + `Date.UTC` 转本地、先校验后算，日历非法直接抛不滚动）。
- **format 词表 = 完整标准词 + 补零 + 大小写载义**：年月日、时分秒、星期全支持（`y/M/d/E/H/h/m/s`），`M` 是月 `m` 是分、`H` 24 制 `h` 12 制——大小写即语义；token 长度即补零；「pattern 里没有时间 token 就不渲染时间」（仅年月日 → 舍弃时间），格式带着时间 token 就按格式来。
- **工具面的错误 = 诚实抛出，显示出口除外**：归一化工厂（date/dateParts 无兜底）对非法源抛 TypeError，编辑器的故事才是回滚；显示层（format）不抛、认不出渲染 null——两层两种容错，不混。
- **min/max 双收 string | Date**：`Date` 按**本地日历壁钟**读（getFullYear 族），归一到 ISO 串参与比较——入口宽容只宽容在「作者给的词形」，比较世界永远一根串轴。
- **零依赖纪律**：需求面已被自家零时区纯算法覆盖（+ 时间只是 60 进制与串比较）时不引入 dayjs/date-fns——库真正强项（时区/相对/duration）没有消费者就不引入；真实缺口出现再评估。
- **纯函数 cdk 的设计秩序 = API 面先行**（用户立方法，与组件设计同款）：先设计「公开哪些方法」，公开面保持纯函数干净——每个词一条规则、无隐式形态、无双模；功能复杂度由内部分层消化（types/constants/按域模块），**内部再怎么重构，API 面保持一致**。cdk/date 已按此节奏走到今天：五连并入与 types/constants 分层全在内部，公开面的变更只有收窄与更名（iso 无参化、专门词并入通用词），从未改语义。
- **纯函数是基座、链式是薄糖**（用户修正先前「值对象 + 链式」重心）：大多日期库都是纯函数调用方式，date 的核心设计从链式值对象为中心改为纯函数套件为中心——解析/渲染/数学/有效性/比较/today/即时词/原生桥接各能力域以独立纯函数公开；链式语义更清晰、保留为上层糖（锦上添花，不承载能力本体）。时区/本地化等缺口按同一基座占位接入，不让当前形态封死未来。先前批 1「链式值对象三决」是阶段产物，此条为较新立场。
- **日期纯函数命名纪律（用户逐项定）**：能力动词前置 `date` 族前缀（dateFormat/dateParts/dateDiff/dateStartOf/dateEndOf/dateTimestamp）配裸谓语语法（addDays/today）；add 全族复数（addMonths 非 addMonth，week/day/hour/minute/second 七大粒度齐备）；diff 诚实 raw（精确秒差、取整与转换是调用方的事）；pattern 唯一标准（国际规范 + 单字母不补零双补零 + h/H 并存）。
- **diff 的诚实 = 日历真值 + 余数降维**（用户拍板的 dateDiff 形态）：`{ count, remainder }` 双输出——count 是从 start 不越过 end 推满的整数单元（年/月走日历 clamp 推进而非平均秒数除）；remainder 是到推进点的真实残差、**按下一维单位表达**（年/月→天、天→时、时→分、分→秒，秒为地板余 0），从不内置取整到整数（调用方决定）；week 刻意不进降维链（只活在 secondsToWeeks 与周粒度边界）；end < start 翻负保持函数对称。17 位 DATEID 同理诚实：纯数字串形态（不是数字）——超 Number 安全范围时字符串字典序 = 数值序，这就是为什么日期 ID 该是字符串。
- **cdk 只收纯函数、两消费者成核、公开面 curated**：date 数学整体抬入 cdk（DatePicker 改吃它）因为两个消费者（TimePicker + showTime）成立；日期/时间方法同居 cdk/date 一个入口；公开面只放用户逐项拍的能力词（dateFormat/dateParts/dateDiff/add×7/today/dateStartOf/dateEndOf/dateTimestamp/DATEID/secondsTo*），网格 builder 这类内部构造器不发——公开路径随将来 cdk 独立包迁移。

来源：TimePicker + DateTime 集成设计定案四轮对齐（用户拍板值契约串出口 + 公开工具面、min/max 双收、不引日期库；用户指令「cdk 保持 @colox/react/cdk/date 公开路径，因为 cdk 后面会独立一个 package」）；批 1 评审后用户改拍公开面形态（「为什么都加 Iso——签名设计问题」→ 链式值对象 + `.iso()` 即时词 + format 独立可用三决）。

## TimePicker 面板交互与架构边界（批 3 优化后）

- **选择预览 + 确认提交（两动词，反转批 2「选择即提交」）**：点选/滚轮/键盘移动只更新 pending 词——值位以 placeholder 灰字实时预览当前选择、选中项穿 palette subtle；只有面板底部 Confirm 钮真正提交（合并词定值 + 关面板 + 焦点回输入框）；Esc/点外部丢弃回滚；Enter/Space 只选中不提交。批 2「面板不是草稿台、选完就走」被用户六条优化翻案：三列滚轮时代每次误触点选都直接定值关面板、错了还得重开重转，谨慎提交（picks preview, commit is the deliberate gesture）才是用户要的节奏。
- **面板规格数字级直给（用户逐项定，不自行拍板）**：纯数字循环列、时-分-秒三列、每列可视 8 项、箭头钮平滑步进 7 项（**rAF 直写滑行 240ms ease-out、与滚轮同一条 scrollTop 直写通道**，滑行窗口内重复点击被 throttle 吸收且步进钮同窗置灰，motion 门控下降级 instant）、列无滚动条（真实滚动容器的 CSS 隐藏术）、滚轮**自由滚动**（50px/项缩放、line 模式 ×3，直驱 scrollTop——半格停靠合法）、选项间距 2px、选中项驻可视槽第 4 格（上 3 下 4）、空值按打开瞬间系统时/分/秒锚窗——iOS 滚轮式交互的用户直给数字是契约，实现照单全收。
- **滚动观感必须连续：JS 补间的离散批次做不出连续感，真滚轮走真滚动**：滚轮是连续输入，却曾用 React 驱动的 FLIP/滑程串行化实现——批周期锁死（滑 200ms 等 drain）、每批强制 reflow、排队滞后，真机上「冲刺—停」顿挫被用户否定；重做后 **wheel 直驱原生 scrollTop**（合成器滚动、零 React 每帧渲染、触控板自带惯性）；程序化移动（归位滑行）与滚轮**共用同一条 scrollTop 直写通道**——rAF 每帧 `scrollTop = wrap(top + travel·ease-out)`，零 React 渲染、零队列，再点击 = 取消重定向（chevron 入口另叠 **leading 节流 throttle** 吸收滑行中的重复点击，窗口 = 滑行时长同源）。「JS 补间 vs 原生滚动」的旧二分在直写滑行这里合流：问题从来不是 JS 动了 scrollTop，而是每帧夹带 React 渲染与批队列；240ms 单段直写滑程只碰 scrollTop，与合成器滚轮同源。`data-colox-motion="off"` / prefers-reduced-motion 下滑行降级为 instant（门控在调用点重接）。**强对齐的中间案也被用户否掉**：整项量化 + mandatory snap 把滚动钳成格进格出（对比 antd 后「滚动效果还是很差」）——对齐感来自点击后的平滑归位，不来自滚动约束。
- **空值打开的预选 = 系统钟，seed 定格在打开时刻（所见即所提）**：无值时开面板把本地钟读为 pending（三列洗底骑在钟值上、Confirm 一次点击直接提交）——座上显示什么、洗底选什么、确认提交什么三者严格同一；**seed 只在打开瞬间读一次**（面板久开不回读时钟，避免「看的是 A 提交的却是 B」）；钟值越界时确认钮照常禁用（诚实门禁不受预选豁免）。预选可见性 = subtle 洗底（与用户点选同一套选中皮肤，不另造「预选态」视觉词汇）。
- **滚轮的三柄权力分立：滚动只动视图、点击才改选择、hover 只预选**（antd 模型，用户对比后拍板）：① 滚轮**自由直驱** scrollTop——半格停靠合法，不选中、不预选、不碰 pending（对齐是点击动作，不是滚动约束；整项固定 scrollTop 步进 + 停稳读取的两版前案撤销）；② **点击 = 改选择 + 归位**——pending 落在被点格、rAF 直写滑行滑回第 4 格槽位（滑行即反馈）；**归位目标 = 三圈中离当前视位最近的同值座**（`canonical(value) ± lap` 取最近）——相对步进跨缝**保持点击方向**（向下按钮跨 23→00 向下滑出中圈带、向上按钮反之），恒取中圈 canonical 的归位在缝处反向上滚（TimePicker 用户报告「跨边界反而向上滚，反直觉」的前科）；③ **hover = 纯 CSS 灰洗底预选、选中项不吃 hover**——悬停格穿灰色洗底、**选中格显式排除**（`:not(--selected)`：选中项保持自己的 palette 皮肤不被预选灰污染）、离开恢复原选中格，**不动输入框预览**（预览只跟点击走，鼠标扫过逐格跳字比滚动选中还吵）。滚动/选择/预选三条通道各管各的，视觉语义不互相污染。
- **滚动的运行期纪律：快滚不闪、不误触、滚动容器保持可命中**：① **滚动期关的是「格」的 pointer-events，不是滚动容器的**——`--scrolling` 只给选项格 `pointer-events: none`（hover 冲刷闪动被压、动量窗口内杂散点击被吞），**滚动容器本身必须可命中**：指针命中测试把 wheel 重定向到页面会让 preventDefault 监听失联——首页滚动联动、列只滚一格即停（用户报告的 bug 前科）；② **圈跳分支同帧同步渲染窗口**——虚拟窗口的 `setSlotIndex` 必须随圈跳一起执行，否则跨圈界快滚时窗口滞留一帧、内容闪空（闪动主因之二）；③ **循环不是掉帧元凶，成本可辩护**：三圈循环的成本 = 3× content 高度 + 圈跳 O(1) 平移（同构绕圈零绘制差异），闪动全部来自上述两条可修根因——「若非优化不可就砍循环」的退路存在（硬界 23/59），但优化可修时不砍产品特性；④ **离散步进滑行 = rAF 直写，与滚轮同一条运动通道；任何 scrollTop 写入必须同帧同步窗口**：native smooth 滑行期间圈钳制/重锚写入会取消 UA 动画，而跨缝一步恰恰必须 wrap——两条运动通道互斥（闪动前科一）；跨缝的 ±一圈 wrap **折进每次写入**（`wrap(top + travel·ease)`，写入恒落在带内、带界重锚只留给滚轮越带时刻），不要在滑行外另行做预/后平移（瞬时写入与追窗 render 之间会被浏览器插一帧画旧窗口 = 闪动前科二）。滑行中滚轮输入直接取消滑行（用户之手优先）；chevron 步进入口套 **leading 节流（throttle，`cdk/utils/throttle`，窗口 = 滑行时长 = GLIDE_MS）**——滑行结束前重复点击被吸收、滑完才可再点，**窗口内步进钮置灰**（`--locked` + aria-disabled、家族 disabled 文本色）——闸门与视觉同窗同释放（「吸收了就要看起来被吸收」，置灰 ≠ disabled：不剥夺焦点语义，只是诚实暴露闸门；motion 门控下无滑行可等 → 免闸免灰）。防抖（trailing debounce）不适用：步进是离散命令，等 240ms 静默再补发会滞后半拍、连点排队追尾——**命令门锁用节流（首击即发 + 窗口吸收），输入结算用防抖（停稳补发）**，两种原语按命令性/结算性认领（「滚轮没问题，箭头应该和滚轮一样」的用户裁决：滚轮之所以丝滑正因为它是这条直写通道的既有验证者）。
- **选中洗底骑值不骑槽**：滚轮的选中表达 = pending 值所在格（`--selected`）上的 subtle 洗底——随内容滚出窗口、点击归位后落在槽上（antd 同构）；曾按「固定槽位地标（`--at-slot`）」实现（槽不动、值滚过、三列恒水平对齐），被用户对比 antd 后改判：选中应跟着值走，对齐由「点击归位 + 打开时的 seat」保证——固定地标与自由滚动不相容（半格停靠时地标 straddle 两格）。
- **cdk 边界纪律（行为核不进 cdk）**：picker 编辑器状态机是家族编排（绑壳与事件面）非能力内核、时间列是视觉构件——headless 能力内核与纯函数进 cdk，组件编排状态机与视觉构件不进（两消费者也不进）；破环最小解 = 时间侧零引用日期侧，批 3 showTime 经单向内部引用取时间列视觉件。
- **诚实禁选 = 选项合并有效性**：选项 enablement 按「此刻点选会铸出的合并词」判定（锚分量 = 当前 pending 词，未动时 = 已提交值），出界即禁、pending 整体出界时 Confirm 钮禁用——任何提交路径都铸不出界词；滚轮可把列滚上个别禁值（别的分量可以把它救回来），只要 pending 不在界内就锁 Confirm；时间域无 clamp（手输越界照旧 blur 回滚）。
- **选中色走 subtle：selected 与「提交」解耦后的视觉层**：选中 = pending 状态标记（palette `<family>-subtle` 洗底 + `<family>-solid` 字——Button subtle 同族，hover 升 muted），不再是「已提交值」的实底宣言；实底（solid）移交给 Confirm 钮这个「提交手势」本体。面板因此要私有色变量三件套（subtle/solid/solid-hover/solid-active），palette 六族逐一旋调、默认品牌挂二级回退。

来源：TimePicker 批 3 六条优化交付（用户直给六条：时/分/秒三列、滚轮滚动无滚动条、箭头点击 smooth 滚动、选中预览灰字 + 底部确认钮才提交、「不要直接关闭 Panel」、选中样式 subtle、列选项间距 2px）+ 滚动反馈跟进（用户「缺少一些滚动反馈」→ 勾选「所有步进都平滑」→ 滑程串行化落地，后被推翻）+ 原生滚动改造（用户实测「滚动很卡…选中项与其他列无法水平对齐」→ 候选两案讨论 → 原生 scroll 拍板）+ 滚动语义收敛（用户两条裁定：固定 scrollTop 步进 + 停稳后设置选中，后被推翻）+ antd 模型收敛（用户对比 Ant Design 拍板：自由滚动允许不对齐/滚动不选中不预选/点击确认选中并自动归位/hover 预选离开恢复；两问确认：Confirm 钮保留、hover 只做面板视觉）+ 打磨轮（用户「hover 时使用灰色」+「快速滚动闪动掉帧，是否循环引起」→ hover 灰洗底 + 滚动期 pointer-events 抑制 + 圈跳同帧追窗，循环保留裁决）+ 打磨轮二（用户「列滚动触发页面滚动、列无法滚动」+「选中项不吃 hover，需要排除」→ pointer-events 抑制下放到选项格、滚动容器保持可命中；hover 排除选中项）+ 底部定案（用户「底部是不是应该允许自定义 / 确认文案默认用中文"确定"，国际化以后再说」→ `confirmText` prop 默认「确定」，locale 机制与 footer 插槽延后——最小定制即真需求）+ 预选轮（用户「没有值时打开面板预选中当前时间并可直接确认，预选中用 subtle」→ 空值打开预选系统钟 + seed 定格原则；同轮「违反很多代码习惯」→ 完整自查整改：props 三处同序、重复实现合并、三目链消解、注释瘦身——详见 code-style 品味）+ 跨缝方向轮（用户「点击向下箭头滚动到 23→00 边界时变成向上滚动，有点反直觉，向上按钮也一样」→ 归位目标改三圈最近同值座保持步进方向 + 平滑飞行期圈钳动豁免 + 滑后静止期带外静默重锚）+ 跨缝闪帧修复（用户「滚动过边界之后整个数字列闪了一下」→ 带外落点的重锚漏同步虚拟窗口、旧窗口画一帧新偏移 = 闪空；改滑行前预平移 + 同帧追窗，滑后零写入）+ 直写通道轮（用户「还是有闪动不丝滑，但是滚轮滚动没有这个问题…箭头的行为应该是一样的…如果要写 debounce，可以放到 cdk 中，cdk/utils 下」→ 箭头滑行改 rAF 直写与滚轮同一条运动通道（缝 wrap 折进每帧写入、零插帧窗口差）+ chevron 节流门锁落地 `cdk/utils`）+ 门锁正名轮（用户「箭头可以补一下这个状态，暂时置灰；这里应该用防抖还是节流」→ 闸门正名为 `throttle`（leading 节流），`cdk/utils` 按真名拆 `debounce`（trailing）/`throttle`（leading）两原语 + 步进钮窗口内置灰 `--locked`，motion 门控免闸免灰）+ 批 2 交付（用户架构裁决「放 cdk 收益不大且污染设计初衷」+ 五默认「无异议」转定案 + 组件落地 37 单测）。

## 组合件语义二分：取值组自持语义、视觉组共用缝合基座（Compact 定案）

- **「组」按语义分两类,不是按名字**:取值组(Checkbox.Group / Radio.Group)是**控值容器**——组持一份值、成员是值的状态,它们不共享边框、不缝合;视觉组(ButtonGroup / IconGroup / 输入组)是**接缝缝合**——成员各自产值,只是看起来是一个整体。
- **视觉缝合是跨场景唯一的公共平面**:接缝折叠、两端圆角、焦点蔓延、状态成员画过接缝——每件组组件都会遇到同一段问题,所以抽成**唯一基座 `Compact`**,不为每个 Group 重做视觉层(antd 实证:Button.Group 与 Input.Group 双双废弃、收敛进 Space.Compact)。「这么多组合件适配不了 Compact」的反面:正因为多,才不能各家缝各家的方言。
- **Compact 零词且零语义**:没有 gap/align/direction 词(间距节奏是 Stack 的职责)、不产 ARIA、不聚合值——成员保持作者原元素(无包装、无克隆),值/状态/`{ event, value }` 载荷各归各,表单里一个成员一个 `Form.Field`。它不是布局容器,是「不下班的接缝」。**零词不等于无继承词**:`size`/`palette` 作为 context 回退供给成员(成员自声优先)——克隆注入的 Form 先例在缝合件不适用;修饰态走类不走 prop(`colox-compact__addon` 加件、`colox-compact--divide` 分割线、`colox-compact--palette-*` 单元自身取色通道)——词越少,歧义越少。variant 家族不对齐(动作件内已子集对齐,差额是纯图标件的正当差异),第三继承词等真实场景再启用。**词的双重身份**:palette 同时是「成员默认词」和「单元自己可视面的色源」(环/框/分割线读私有变量通道,无词回中性现状)——单元的状态可视面跟单元的词说话、成员的颜色跟成员的词说话,invalid 永远是最大声的那个(红规则直书颜色、不借通道)。
- **覆写成员的形状必须走足特异性,状态可视面归组且不留第二层**:缝的半径规则写在 0,3,0(类+双伪类)——成员自带基类半径是 0,1,0,同分平手拼样式表顺序会复活成员的圆角(首版 bug,用户目视逮住);端点外角、内角归零两套声明都显式,单子件不匹配即保持原形;形状件(Switch/Slider)豁免——自己的设计语言不为缝让路。**焦点环宿主是组,但只替输入族说话**(用户定哪:「box-shadow 仅对输入框这类组件支持」):成员各自的 ring 在组内静默(`:is(族):focus-within:not(:disabled)` 划区)、组 `:focus-within:has(族)` 整圈一环——成员环只会自圈并溢到邻居身上;按钮等非输入成员**保持自己的焦点 affordance**(单元不假装自己是文本控件)。**环静默后焦点边框变色同步静默**:环+border-color 是「选中态」的同一枚两半(组环+成员自身色边=两层选中样式,第三次被逮);输入族静息边框=全家共享的 muted token、可安全钉回,变体色板(Button solid/ghost 等)永不直升。**invalid 属于整个单元**(用户明语:「仅有一个 invalid input,但 compact 应该是一个整体才对」):成员 invalid → 全单元红色轮廓 + invalid 单元内任意聚焦红环——状态的可视面由单元说话,不做成员级手术(接缝透明/z 升高都被否)。**弹层开着 = 单元 engaged**(用户明语:「点击箭头触发弹层时 border 闪一下,选中样式丢失又恢复」):关键不是闪、是「丢失」——弹层是成员自己的 UX,焦点被带进 portal 时组环不该灭,所以环认成员的 `--open` 类;且开面板走 shell-click 的成员,非交互区 mousedown 一律 `preventDefault` 焦点驻车——焦点在组内连续移动,不允许「blur 空窗」的中间帧。**分割线也是一道美学账**(用户明语:「中间 border 样式非常丑,应该用 divide 样式更好」+「高度也应该短一些,不要直接与 border 相连」):重叠边框拼出的中间线是「黏合的盒子」,divide 修饰类卸成员边框、单元画一框、边界坐**短浮动条**(伪元素高半程、不接外框;border 机制不行——全高线与外框焊死,还会被 strip 的 border:0 按序清零导致整条隐形,「没看到 divide」)——border 的语义从「成员各画各的」让位给「单元画框+单元画分割」,分割线本身弱化成漂浮的界碑。**宽度/阴影/动效归单元**:输入族 `flex:1 1 auto; min-width:0`(定宽均分、无宽内容撑开双语义)、按钮 elevation 与 :active 缩放在组内静默。「组是一个视觉单元」的预期下,选中/焦点/invalid 可视面单点唯一,凡是会「画到邻件/撕开缝」的成员状态一律静默。
- **命名歧义的解法是不做那个组件**:被场景 MIX(Input+Select+Button 混编)撑爆的名字「InputGroup」直接不交付——基座做出来,歧义从根上消失;未来 ButtonGroup 等域组件 = Compact(视觉)+ 自己薄薄一层语义。
- **Affix(单输入+前后装饰件)也不单独立组件**:`<Compact><span className="colox-compact__addon">¥</span><Input/></Compact>` 直接表达——「affix 槽允不允许产值件」的判据问题自动消解:Compact 从不替子件说话,值永远在子件自己的载荷里。
- **取自场景对齐而非抢跑**:「不带着未拍板的 API 形态开工」的延续——InputGroup 是带着歧义名被用户拦下,先摆场景与伪代码,再被追问出「Compact 适配性」的疑虑,最终收敛为语义二分 + 通用基座。名字歧义、词边界(零词)、判据消解三个设计问题都在对齐轮解法里互相成全。

来源:输入组对齐轮(用户「InputGroup 确实值得做,先对齐一下使用场景和组件设计」→ 命名歧义质问「如果允许混编,是不是叫 InputGroup 命名有些歧义」→ 组合件多样性质疑「我不确定做 Compact 是否能适配这么多场景」→ 语义二分 + 通用基座拍板)。

## 消息面渲染器 chrome：结构态不骑换场

（Toast 续优化，用户「添加 showIcon, closeable props / 允许自定义 action / 组件目录结构应有 types/ 和 constants/」）

- **chrome（门控渲染的开关）是渲染器自有的结构态，不是载荷**：`showIcon`/`closeable` 这类控制图标/关闭钮显隐的 props 不进换场、不骑动画——add/update/replace 一律**即时切换**，只有文字（content/title/mode/palette/variant… 这些「要说的话」）走 contentVersion 重挂播 zoom 进场。动画反馈留给「内容变了」，机制开关要即时——否则「内容已换完、图标才迟一步消失」的错位感。
- **门控词面按用户词**：`showIcon`/`closeable` 用用户点名词（antd 的 showIcon 同源）；`closeable` 与 Modal/Drawer 的 `showClose` 同义不同词——用户明确给词时以用户词面为准，跨组件统一留待将来核对（不在此轮擅自替 Modal/Drawer 改名）。
- **消息系统纯报告、不索求决策——两档都不持有 action 槽**：Toast 曾补 `action: { label, onClick }`（c0abf854 轮），round 12 用户重估后移除（3 秒自动消失的瞬时提示不应索要决策）；round 14 用户把 Notify 的也移掉——「看了消息做决定」的交互是对话框/页面的活，不是瞬时反馈层的，撤销/重试这类决定型交互最终归零于消息面，自造交互走 `content`/`custom`（任意 ReactNode）。**数据形态是单动作槽唯一有理由的形态**：一旦放开成 ReactNode，就与 content 完全重叠（同一位置、同一件事、两个通道）——「定死 Button」不是缺陷而是该槽位存在的唯一理由；同理 action 在仓库内零真实消费者（只有 demo 例），符合「无真实消费场景的能力不立项」。round 14 的推论延伸：当时「Toast 无 action、Notify 有 action」的两档分界，让位于「两档都无 action」的更齐边界；基座的 `MessageAction`/`MessageOptions.action` 随最后消费者离场整体删除——消费者退场、基座字段同步清退，不留死代码。
- 来源：Toast chrome 三轴定案（决策 c0abf854，caused_by 887bb77c——用户点名 props 与目录结构）；action 移除（决策 4fe6007e，caused_by 5b048b4a——用户质疑「定死 Button」与「content 是否已够用」，三选项对齐拍板移除）。

## 目录结构：constants/ + types/ 按仓库惯例

（Toast 续优化同轮，用户「调整组件的目录结构，应该有 types/ 和 constants/」）

- **`constants/` 按主题命名文件**：面默认值收 `constants/defaults.ts`（`TOAST_DEFAULT_POSITION/STRATEGY/VARIANT`），随 TimePicker 先例（`constants/time.ts`/`column.ts`，直接 `../constants/time` 引，无 index barrel）；api 只消费不定义——「组件内部常量收 `<component>/constants/` 域内单一事实源」的既有规矩新落地一遍。
- **`types/` 按能力层分文件 + index barrel**：Toast 的契约层是它的 API 面（纯方法命名空间没有 component.ts 这一层）——`types/api.ts`（`ToastOptions` + `ToastActions`，旧名 ToastCallOptions/ToastNamespace 于 be61c45c 轮按用户拍板改名）+ `types/index.ts`（内部全量 barrel）；公共出口仍是 `<component>/index.ts` 选择性具名（ToastActions 不进公共面，只有 ToastOptions 进）。
- **基座（cdk/message）同样按惯例组织**（用户「整理 message 组件的目录结构：types/，stores/，constants/ 等符合品味规范的结构」）：`types/message.ts` + `types/index.ts`（全量类型契约集中——MessageAddOptions/MessageRenderer 从 factory/store 归位）+ **`stores/store.ts`**（状态层单独成层——code-style 的 stores/ 惯例在基座落地）+ `constants/defaults.ts`（DEFAULT_DURATION/DEFAULT_EXIT/ROOT_SCOPE 默认值）+ `constants/viewport.ts`（POSITIONS/DECK_THRESHOLD 主题常量）+ `constants/icons.ts`（MODE_ICONS 映射）。结构件（`box.tsx` 共享外壳）与注册件（`factory.ts`）留根目录、`styles/` 不动——主题命名文件直接路径引用无 barrel，类型归 types、状态归 stores、默认值归 constants。
- 来源：同上轮（决策 c0abf854）；基座目录重整（决策 5b048b4a，caused_by be61c45c——用户点名四个改名 + 目录结构）。

## 消息生命周期回调：data 透传 + onClose 归一载荷

（Toast 续优化，用户「Toast 新增 data 和 onClose，onClose 的 payload 是 { id, data }，data 作为透传参数」）

- **`data` 是不透明透传值**（`unknown`）：组件不读写、不解释，原样保存、终结时原样交还——调用方挂自己的业务上下文（请求 id、文件名、记录），消息面零产品语义。透传 = 单一职责的正面表达：我不懂你，但我原封不动还给你。
- **终结合约 = 一次 + 归一载荷 `{ id, data }`**：`onClose` 随「载荷终结」发一次——关闭（✕/dismiss api）、自动超时、清场、原地被替换；`update` 延续同一载荷不触发。发一次由状态机路径保证：每条终结只在一条路径上发（替换落位即发旧载荷、退场/清场转发各自活载荷——mid-swap 曾是需要显式护栏的重发窗口，换场机制退役后窗口自行消失）。载荷把 id 与透传值并列——消费方一个函数闭包全拿到（事件面统一载荷 `{ event, value }` 的同款心法：回调载荷自包含）。
- **替换也是终结**：single 策略下 A 被 B 原地替换——A 的载荷终结（替换落位即发 A 的 onClose）、B 的 onClose 归条目录（下次关 B 才发）——「每次 add 都是一条独立生命周期」，换内容不等于同一生命周期（update 才延续）。
- 来源：Toast data/onClose 定案（决策 1c5eff77，caused_by c0abf854——用户点名 payload 词形）。

## 类型名说形状：名称按内容指派、用户点名直落

（Toast 续优化，用户「ToastCallOptions 改名为 ToastOptions / ToastNamespace 改名为 ToastActions / api.ts 改名为 factory.ts」）

- **接口名说形状不说机制**：`ToastOptions`（这个面的一次调用的选项——「调一次 toast 要给什么」）比 `ToastCallOptions` 更短更准；`ToastActions`（纯方法集合——「Toast 这个对象能做的动作」）比 `ToastNamespace` 更直白——namespace 是 JS 实现词，不是语义词。名字里不该有实现腔（同「today() 不说 todayIso()」的命名纪律）。
- **名字冲突处理 = 用户新意优先**：`ToastOptions` 公开面一度是 `MessageOptions` 的别名，用户点名把 call options 改名成它——按用户新意重新指派该名字、删掉旧别名（update patch 回落到 MessageOptions），pre-release 无 break 负担时不搞并列双名。
- **文件名命名随内容**：`api.ts` → `factory.ts`——该文件的主体就是 `ToastFactory` 类与 `toastFactory` 单例，文件名与内容同名互证。types/api.ts 仍叫 api（它是契约类型层，不是工厂）。
- **判别词与语义轴各占自己的词位**：kind 判别词占 `type`（`MessageType` 'toast'|'notify'——「type 说它是什么类目」，旧名 face）+ 语义轴占 `mode`（`MessageMode` info/success/warning/error——「mode 说它是什么腔调」，旧名 MessageTone）；共享外壳 `MessageBox` 说形状（「box 说它是盒子」比 ItemShell 的容器腔直白）。接口名说形状的同一纪律在基座层再走一遍——同一轮把 `--tone-*` 死类钩子改成 `--mode-*` 让钩子名与轴名一致。
- 来源：Toast 改名轮（决策 be61c45c，caused_by 1c5eff77——用户点名三个改名）；基座命名轮（决策 5b048b4a，caused_by be61c45c——用户点名 face→type/type→mode/MessageTone→MessageMode/MessageItemShell→MessageBox 四项）。
