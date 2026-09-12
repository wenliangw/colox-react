# API 设计品味

## size prop 一律表示视觉尺寸

组件库中 `size` prop 的语义固定为「视觉尺寸」，取值 `'xs' | 'sm' | 'md' | 'lg'`（Button 四档，Input 对齐后同序）：

- `Button` 用 `size` 表示按钮尺寸。
- `Input` 用 `size` 表示输入框尺寸；当与原生 `<input>` 的 `size`（字符宽度 number）冲突时，用 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>` 覆盖原生属性，而不是改名或暴露原生语义。
- **size 轴是跨组件共享的设计语言事实，不是组件私有档**：同档名必须同高同字同 padding-inline（Input 首版 26/36/48 自推值偏离 Button 的 size token 网格，被用户指正「Input 的 size 应该和 Button 对齐」后改四档同源）。涉及并排场景（输入框+按钮）时同档严丝合缝是硬验收。

将来做 `Select`、`Textarea` 等表单组件时保持一致：`size` 表示视觉尺寸、四档与 Button/Input 同源；遇到原生同名属性冲突，优先用 `Omit` 覆盖。

### IconButton size：预设档 + theme 键表双通道（用户定调）

- **`size?: 'xs'|'sm'|'md'|'lg' | SizeKey`**：预设档是组件层语义（IconButton 的四档对齐表单家族同档同高，xs 24/sm 32/md 40/lg 48——用户「默认与其他组件 size 对齐」），`SizeKey` 是 **@colox/theme 发射的 `sizeKeys` 键表联合类型**（与 Stack/Grid gap 收 spacingKeys 同构：键表由 theme 发射、组件只消费、类型即白名单——`size="7"` 有补全、`size="99"` 编译期报错）。
- **两个细节用户拍板**：组件内部使用（Input/Select 的控件钮）用裸键贴合容器语境（一律 `size="4"`），不走预设档；Input 的 size 档是「height+padding+字阶」复合语义，IconButton 只要纯方块足迹（flex 居中、字阶无用），语义不同但四档高度仍对齐家族。
- 键表类名 `colox-icon-button--size-<key>` 由 `sizeKeys` 动态生成，尺寸落 `var(--colox-size-<key>)`——绑定 token 变量而非写死 px，主题重定义自动跟随。
- 将来形状类组件（Avatar、Badge 等）的尺寸 prop 沿用：预设档对齐 + theme 键表兜底的双通道。

来源：IconButton 设计讨论（用户先后定下「四档但不套 Input 复合语义、允许裸 token 值」「键表像 spacingKeys 一样由 theme 提供」「内部站点用别的裸键」三节奏；决策见 `IconButton size 双通道`）。

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
- **自造事件面与原生槽的边界**：事件通道分两种，各守各的——**组级 onChange 是库自造的自定义事件面**（无原生槽可忠实），载荷为对象 `{ event, value }`：event = 触发成员的原生合成事件（哪成员触发、stopPropagation 可控），value = 语义载荷（下一单选值/数组）。**叶子 onChange 是原生事件透传槽**，不包 `(event, checked)`/`(event, value)` 包装——MUI 式叶子包装仍不做，「原生忠实」在叶子成立。组内成员受控时 `event.target.checked` 是 React 受控语义（恢复后的受控值），真相从 Group 的 `{ event, value }` 读。这是「自造事件面才组装载荷、原生槽永远透传」的诚实边界。
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
