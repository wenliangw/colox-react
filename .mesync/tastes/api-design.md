# API 设计品味

## 组件层事件面统一自造 { event, value } payload（AutoComplete 定稿总则）

- **组件层 `onChange` 一律自造 `{ event, value }` payload**（事件对象 + 组件真值），不再按「值是不是文本」特判——文本值控件的 onChange 同样 `{ event, value: string }`。这是 InputNumber → Slider → DatePicker → AutoComplete 四代演进的终点：从「数字/日期控件专用」升格为「组件层事件面统一词形」。
- **唯一豁免 = 叶子组件直对原生控件的透传槽**：Input/Checkbox/Radio/Switch 这类叶子透传原生 onChange（值由原生事件自带）不变。边界判据 = 「是不是叶子直对原生控件」，不是「值是什么类型」。
- 事件块内部顺序：onChange → onSelect → onOpenChange（组件层事件按主次排）。
- 来源：AutoComplete 设计对齐用户裁定「后面所有的 event 都走我们自造的 payload 格式」。

## size prop 一律表示视觉尺寸

组件库中 `size` prop 的语义固定为「视觉尺寸」，取值 `'xs' | 'sm' | 'md' | 'lg'`（Button 四档，Input 对齐后同序）：

- `Button` 用 `size` 表示按钮尺寸。
- `Input` 用 `size` 表示输入框尺寸；当与原生 `<input>` 的 `size`（字符宽度 number）冲突时，用 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>` 覆盖原生属性，而不是改名或暴露原生语义。
- **size 轴是跨组件共享的设计语言事实，不是组件私有档**：同档名必须同高同字同 padding-inline（Input 首版 26/36/48 自推值偏离 Button 的 size token 网格，被用户指正「Input 的 size 应该和 Button 对齐」后改四档同源）。涉及并排场景（输入框+按钮）时同档严丝合缝是硬验收。

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
- 将来做 Boolean 开关类 prop（autoComplete 视觉件、下拉清空、格式化器等）沿用：`allow<Ability>` + 精确条件绑定 + 默认 false。

来源：Input v2 props 定案（用户对该命名的改拍）。

## 表单叶子：机制组件不背产品、状态映射归消费方

- **内置 = 机制；状态→图形映射 = 消费方**：库提供清空机制、密码可见性机制、搜索自动图标机制；「没输入时闭眼、有输入时偷看」这类与产品状态绑定的图形映射由消费方用 data + 三元在插槽里写。槽是舞台、图标是零配置演员、剧本归消费方——Input 背机制不背产品。
- 表单叶子三不：不做校验引擎（rules/async/messages/字段联动归 Form 层）、不做动态表单（独立子系统）、不发明合成事件（原生事件全透传）。Input 对表单层的承诺只有三件：受控/非受控对称、原生事件流、真 ref。
- 空间复用词（数字正则、日期掩码）用**模式语言全程约束**表达（`filterPattern` 拒绝即回值不可见），与校验通道（native `pattern` + `:user-invalid`）双轨清晰。

来源：Input v2 设计讨论（用户以密码状态图标为例定出「背机制不背产品」边界）。

## Checkbox 组语义与三态（Group 值数组 / indeterminate 纯视觉）

- **组 = 值数组语义**：多选的状态形态就是 `string[]`（`value`/`defaultValue`/`onChange(value: string[])`），成员以原生 `value` prop 声明参与键（表单值 + 组键双职，不发明 `groupKey` 之类的平行 prop）；显式 `checked`/`defaultChecked` 的成员退出组（本人优先），`name`/`disabled` 组继承、本人优先、组 disabled 不可退出。
- **组容器走 dot-part**（`<Checkbox.Group>`）：「内容必须在树中」判据成立——多选集合天然是父子树，成员需要在组上下文里生存；Leaf 三件（props/事件/ref）不动，组级语义（数组 onChange）是组自己的出口，叶子 onChange 始终原生透传。
- **自造事件面与原生槽的边界**：事件通道分两种，各守各的——**组级 onChange 是库自造的自定义事件面**（无原生槽可忠实），载荷为对象 `{ event, value }`：event = 触发成员的原生合成事件（哪成员触发、stopPropagation 可控），value = 语义载荷（下一单选值/数组）。**叶子 onChange 是原生事件透传槽**，不包 `(event, checked)`/`(event, value)` 包装——MUI 式叶子包装仍不做，「原生忠实」在布尔叶子成立（**数字值叶子例外**：Slider 已由用户拍板自造 `{ event, value }`，见文末「数字值控件」节——原生 range 值是 string，数字契约的解析归库里）。组内成员受控时 `event.target.checked` 是 React 受控语义（恢复后的受控值），真相从 Group 的 `{ event, value }` 读。这是「自造事件面才组装载荷、原生槽永远透传」的诚实边界。
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

## 布尔开关用真 input + checked 词形，不仿 button 路

- Switch 兑现（2026，Checkbox 同构）：**真 `<input type="checkbox" role="switch">` 即控件**——ref/name/value/键盘/焦点全原生、表单零成本；否决 antd 的 button+role 路（牺牲原生表达去手写键盘/表单）。
- 受控词形 = `checked`/`defaultChecked`（原生属性词，家族布尔组件同词；不上 antd 的 `value`）。
- `children` 即文案标签（label 根包裹，Checkbox 同构）；轨道内不放 ON/OFF 文字（小档装不下，checkedText 属扩展点）。
- 「控件即它自己」的视觉表达：appearance:none 把轨道涂在 input 本体上，thumb 是 overlay——与 Checkbox「box 即 input」同一不变式。
- 视觉轴词汇家族同词：开关的调色板叫 `palette`（Button 已有同轴，不引入 MUI 的 `color`）；语义 = **只染开态**（开关靠「开色」被读），关态面料与 invalid 红通道不随调色板漂移；接线同 Button 私有变量模式（类声明 `--colox-switch-palette-*`、绘制规则读变量，零特异性级联干扰）。

来源：Switch 六问对齐定案（决策 Switch API 定案）。

## 数字值控件用真 range input + 自造事件面（Slider 先例）

- Slider 兑现（2026）：**真 `<input type="range">` 即控件**——ref/键盘/焦点/表单全原生零成本；视觉绘制 appearance:none + 引擎伪元素（WebKit 用 gradient + background-clip: content-box，Firefox 用 `::-moz-range-progress`），组件算出已走百分比写入 `--colox-slider-progress` CSS 变量（受控/未受控都内同步）。
- **事件面新档位（用户拍板「自造 { event, value }」）**：数字值叶子的 onChange 自造载荷 `{ event, value }`——event = 原生 change 事件（原生面完整保留进载荷：propagation、DOM 事实面），value = 提交数字（原生 range 的值是 string，库里解析后才交给消费方，消费方不背 `valueAsNumber`）。「叶子事件永远原生透传」的旧规则对**数字值控件失效**：原生 string 值与数字契约不符时，库解析比消费方解析更诚实。布尔叶子（Checkbox/Radio/Switch/Input）保持透传不变。**InputNumber 沿用此先例**。
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
- **面板 chrome 本地化 = 数据型 locale 对象**：内置面板文案（年月标题/周头）默认跟产品语言（中文），定制走 `{ months?, weekdays?, yearMonthFormat?, yearFormat?, decadeFormat? }` 标签数组 + 占位格式串直给——不用语言简码地图（猜不全的封闭集合）、不用渲染回调（字符串格式化不需要 React 节点，回调隔一层）。chrome（locale）与字段显示（valueFormat）与内部值（canonical）三层各管各、互不渗透。
- **浮层面板宽度 = 内容固有，不是宿主派生**：日历面板 272px（日格足迹 7×32 + 6×4 间隙 + 2×12 内边距），宿主宽时不拉伸面板（只占左段）、宿主管窄时不压缩内容（向右溢出交 floating shift 兜底）；同一 popover 内多形态内容（日/月/年格）共享一个固有宽——用最宽栏内容定 min-width、窄形态摊满（`width: 100%`）不缩水，level 切换面板宽度不跳变。
- **日历面板层级钻取 = 广域心智（antd 同构）**：header 标题是钻取路径（日 → 月 → 年），选中上级格逐级回落、落在 picker 粒度之上只下钻不提交——用既有格子词汇换面板层级，不为跳大跨度日期发明新控件；标题**分节可点**（日格年/月各成钮——点月落月格、点年直落年格，不强制逐级爬）；pick 语义由「level 与 picker 的关系」统一裁决（高于粒度下钻、等于粒度提交），交互词汇随语境切换不发明第三动词；**双档 chevron**：单=本格步长、双=父粒度（年格只剩双）——步长档位是 antd 式日历心智的一部分。
- **引导性标题钮的语义色：默认 text-default、hover 走 palette solid**（「这里通向某处」）；导航 chevron 保持 muted 惯用法（color-only 反馈、无底 wash）——引导与导航穿各自的皮肤，控件组内可点/不可点、引导/导航区分靠语义而不是同款样式。终级标题（十年格）纯 span 无 hover。
- **clearable 家族词：交互形态也是共享契约**——不只共享 prop 名。行内 X 钮 + 值存在时与尾部图标（Select 的 chevron / DatePicker 的日历图标）hover/焦点交换露出、mousedown 防失焦、shell 点击对 button 早退；谁在家族里用 clearable 就穿同一套交互形态，不发明第二种清除入口（DatePicker 首版 panel footer 文字钮被用户否掉：「应该和 Select 组件的 clearable 交互行为保持一致」）。
- **「现在」锚点与选中态正交**：今天/当月/当年**未选中时永远**穿 subtle（family 浅底 + 家族字色、hover 复用 Button subtle 的 muted wash），不随有没有选中其他日期消失——暗示层与状态层各管各；**选中 = 当前格时 subtle 显式让位**（subtle 规则带 `:not(--selected)`），selected 独占背景/文字。注意：`:not()` 伪类会把规则特异度抬一个类级——「靠源码序让 selected 赢」是不可靠的（(0,2,0) 的 today 压过 (0,1,0) 的 selected，顺序救不了），排除必须写在选择器里。surface（浅底+描边）先试后被用户目视否定：「调整为 subtle 吧」。
- 将来做时间类/区间类控件的显示格式化沿用：标准 token 词形 + 真值 canonical 与显示彻底分离；token 表对齐成熟的广域标准（Java/antd），自定义 token 语言不发明。

来源：DatePicker 六问对齐定案 + 用户两条补充（补日历图标；valueFormat 标准 token 写法并支持星期几）+ 用户目视评审修正（「年月默认使用中文描述，允许用户自定义」→ locale 数据型定制定案）+ 用户三轮评审（surface 改 subtle；「需要支持月视图和年视图，我认为是必要的」→ picker 维度定案）。
