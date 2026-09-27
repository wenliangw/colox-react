# 样式与设计 token 取向

## 浅底 chip 的可辨认性 = 边缘定义 + 内容对比度，两条缺一不可

- 元信息/动作 chip（Textarea footer 胶囊）底色用 `bg-muted` 在白壳上会「溶掉」——分两步补齐：**① 1px `border-muted` 描边**给边缘定义（家族 surface 语义：浅底+描边同构）；**② 胶囊内文字定档 gray-700（`--colox-color-gray-solid`，#707070）**——muted（#9E9E9E，~2.5:1）太浅文字「溶」掉，default（#191919，~17:1）和正文同亮度抢戏，700 在浅底上 ~4.5:1（AA 达标）且比正文低一档——chip 内容必须有「可读且不争」的层级。
- **浅底 chip 的文字阶梯**：正文 900 / 胶囊 chrome 700 / 600 以下不占浅底（600 muted 只用于白底上的次要文字）。
- **chip 内部节奏与外壳同源**：分隔线两侧的 gap 与胶囊 padding-inline 同值（8px）——内部留白不发明第二套尺度，「padding 与 gap 同源」是胶囊均匀呼吸感的关键。
- 文字定档后，交互件（清除文字钮）的 hover 反馈**不能用深色偏移**（静止已中深）——换**色相通道**，且按**动作语义着色**：清除是破坏性动作 → `text-error` 破坏红（red-600，浅底上 ~4.8:1），品牌色留给主操作与焦点环（「有底换档、无底 wash」不变式的特例：色相偏移也是一种可见偏移，但颜色选择由语义决定）。
- **不加边框的灰 chip 是半成品**：只要 chip 有底色，就必须带边缘定义 + 内容全对比——这是将来所有 chip/badge 型 chrome 的默认起点。
- 加强版阶梯（若还不够）：① 描边加深一档；② 底色换品牌浅底（`brand-subtle`，注意与输入焦点环的竞争）。

来源：Textarea footer 胶囊「有些不太明显」三轮目视诊断（决策「胶囊加描边」→「胶囊文字提档」→「文字定档 700」）。

## 滚动条是平台 chrome 的补充件：贴边、token 上色、双引擎一致化

- **贴边不贴 padding**：滚动容器（裸控件）自己持有 inline padding，滚动条渲染在元素边框内侧、自然贴死外壳边缘——若 padding 挂在外层壳上，Windows 预留式 gutter 会插在 padding 内侧「飘着」（用户实测断言「视觉上很丑」）。结构顺序 = `边框 | 滚动条 | padding | 内容`。
- **平台一致 = 双引擎 CSS**：`scrollbar-width: thin` + `scrollbar-color`（Chrome 121+/Firefox 的标准属性）+ `::-webkit-scrollbar-*` 伪元素族（Safari 及老 Chrome 只认它）——Windows 原生粗灰 gutter 与 macOS overlay 统一成同一枚「细圆条」；Firefox 只能到「thin + 两色」这一级，像素级一致不承诺，跨平台观感一致承诺。
- **颜色全走 token**：thumb = `--colox-color-border-muted`、track 透明、圆角 token 全圆；不用平台自己的滚动条美学，也不写死色值。
- 滚动条只在「内容真的超出」时出现（growth 世界 overflowY hidden 无闪动、封顶世界才 auto）；溢出控制与手动调高（drag handle）的世界互斥（用户裁决：设了 maxRows 就不给 handle）。
- 将来任何滚动容器（面板、菜单、多选箱）沿用同一套双引擎配方 + 同 token。

来源：Textarea maxRows 封顶滚动条定案（用户反馈「Windows 原生滚动条很难看、位置不能吃 padding」后讨论达成）。

## 复合面板：内容并排扩宽，不占垂直空间

- **日期+时间的复合面板 = 横向并排扩宽，不在底部叠条**（DateTime 定案，用户主动自定义布局）：showTime 面板在日格（272px）右侧并排时间列 + footer「确定」，一块面板同时看到日期与时间——垂直空间不增、面板总宽是内容固有宽的和；antd 式底部展开面板被否。面板宽度恒「内容固有，不是宿主派生」的延续；将来复合/多栏面板先想并排，再想叠放。

## 状态层与提交手势分层：选中穿 subtle，实底留给动作

- **选中 ≠ 提交**：面板选中项是当前 pending 状态标记 → palette `<family>-subtle` 洗底 + `<family>-solid` 字（Button subtle 同族、hover 升 muted；**hover 预选反向排除选中项**——预选灰洗底绝不落在选中格上）；实底（`<family>-solid`）只属于「提交」手势本身（TimePicker Confirm 钮）——颜色语义跟动作语义走，实底不再替状态背书。组件需要私有色变量时按 palette 六族旋调（subtle/solid/solid-hover/solid-active），默认品牌挂回退。
- **未提交值的字面呈现 = 占位灰、并挂状态类**：值位以 placeholder 灰字 + `--pending` 修饰类呈现 pending 词，提交后回正本值字色——「未定」是肉眼可判的状态，不只靠面板。
- **「无滚动条」是滚轮型小窗的隐藏术，不是建模副产物**：TimePicker 列的滚动世界曾是「窗口不滚、条带自滑」（无滚动条是副产物）——经原生滚动改造（用户实测条带动画卡顿 + 三列选中行错位）后列变成**真滚动容器**，但滚动条是「平台 chrome 补充件」场合外的东西（48px 宽的滚轮槽贴一根 8px 滚动条 = 视觉噪音），于是走到**隐藏术**：`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`——细则：可见滚动条走 Textarea 那条「双引擎配方 + token 上色」；**滚轮型小窗走隐藏术**。两条线区分「要不要 chrome」，再区分「chrome 长什么样」；`overscroll-behavior: contain` 防惯性外溢进页面。**滚轮型小窗的对齐感 = 点击归位 + 打开 seat，不用 scroll-snap 教训**：时选轮的强对齐案（`scroll-snap-type: y mandatory` + `scroll-padding-top` 吸附线）把自由滚动钳成格进格出，被用户对比 antd 后否决——半格停靠合法、编辑感来自点击后的平滑归位 glide；scroll-snap 只有在「停靠本身是产品语义」（轮播/卡片页）的世界才是正当场景，滚轮时间窗不是。

来源：TimePicker 批 3 六条优化（用户直给：选中样式 subtle、底部确认按钮才提交、列滚轮滚动但不展示滚动条；DatePicker surface→subtle 目视修正同源）+ 原生滚动改造（滚动条隐藏术随真滚动容器一并落地）。

## 提示层表面：palette 七族 + 0.9 透明档 + 半透明面（无 blur，Tooltip 对齐定案）

- **surface = 设计语言 palette 七族**（用户点名「移除 dark/light，直接支持 palette 多色」，2026 轮定案 + 补 white）：gray（默认）/primary/info/error/warning/success/white——六色族与 DatePicker 同词表同族映射（primary→brand、info→blue、error→red、warning→orange、success→green），white = 白阶梯（**用户最早记的「黑色和白色的透明度色值」到本轮两半都用了**）；**默认面取中性深**（gray = 设计语言 0.9 黑色透明度挡位 `--colox-palette-black-900` / #000000E5——**0.85 不是挡位**，阶梯只有 0/0.05/…/0.8/0.9），**五色族 = family solid 各以 color-mix 90% 同档**（色族无透明度编码挡，mix 是唯一的诚实同档配方），**white = `--colox-palette-white-900` 同档 + 文字翻深 text-default**（其余六族 inverse 白；文字走 `--colox-tooltip-text` panel 级变量，与 fill 同一换色处）。**borderless、七族同一条几何**（用户拍板去 border——border 内缩填充致变体观感尺寸不一致）；阴影走「drop-shadow 投影」——见「投影」条目。
- arrow = **旋转菱形零裁剪**（√2×深度方块旋转 ±45/±135、上半埋进气泡盒下（DOM 序 [arrow, content]）、对角线硬停渐变只涂外半）：**裁剪是投影杀手**——clip+filter 同元素 = 自投影被裁空（实测零投影：裁剪把滤镜输出整体切掉——上一轮「AntD union 剪影」其实只有气泡半张），mask+filter = 投出整盒矩形；菱形以「无裁剪 + 埋藏半」同时换来三角画形、真三角投影、圆角三样。埋藏半是透明窗（渐变外半不涂），90% 玻璃下与素面板逐像素一致（条纹页实测）。**圆角只给突出的尖角**（用户点名「不是所有角都需要 border-radius」）：单角 `border-radius: 0 0 radius-xs 0`——基座两角贴气泡边保持直角，旋转携带局部配方四 placement 同一条。箭头填充跟随气泡同源——共享自定义属性 `--colox-tooltip-fill`（panel 声明/palette 在 panel 级覆写，复合选择器防 cascade 打架）一处换七色（用户要求「箭头颜色跟随气泡」的心法）；sm 档箭头小一号（深度 spacing-1-5→spacing-1，√2 几何自动缩放——设计语言 spacing 阶梯无 5px 与 1.25 档，整档走 6→4）。
- **backdrop blur 已整体移除（用户拍板，翻转早先的毛玻璃偏好）**：「好像 blur 带来了很多负面问题，反而收益不大」——霜纹的机制成本（backdrop-root 透镜律、素净祖先纪律、clip/mask 与自身的投影博弈）全是 blur 存在才有的约束；半透明本色 + 联体投影已足够提示层的出生感。教训 = **机制成本 > 视觉收益时，先撤机制**；透镜律与投影形状律作为独立教训保留在 corrections（未来别的表面再上 blur 时仍然成立）。
- **进场 = fade + scale**（0.92→1 过渡，token 驱动、时长 fast）：动画与 placement 无关（Popup 已占 opacity+位移轨道，Tooltip 只补 scale 口感；分方向进场需要解析后 placement 的 JS 状态注入、先渲染后翻面会闪错向，不值）；遵守 motion 轴（reduced 直显）；**退场 fade 随 Popover 同批兑现**（cdk Popup 退出通道 `exitDuration`：退出窗内面板保留挂载 + `--exiting` 类播 fade-out——`TOOLTIP_EXIT`=100 = `--colox-motion-duration-fast` 运行时镜像；窗口是减秒时钟，重开即取消）。
- **半透明优先于实底**（Tooltip 打磨轮）：浮层底色穿半透明（无 blur）——浮层盖在页面上但页面从后面透出，不是一块实板；装饰体保持在主机盒外（见上）。**透明度走设计语言挡位**：中性面用黑/白阶梯的 900 档（0.9），色面用同档 mix——不造 0.85 这类阶梯外挡（用户提议的两个值里 0.9 是有 token 的那一个）。
- **阴影形态（panel 级单条 union + 方向随箭头 + token 色值）**：浮层深度挂在**最外层容器**（blur 退场后 panel 级 filter 合法）——一条 drop-shadow 一次剪影气泡+装饰联体，装饰与内容层零滤镜（无 clip-path 是前提——裁剪元素的自身投影被裁空、mask 投整盒）；**阴影方向跟箭头走**（`data-placement` 前词换偏移：top (0,4) / bottom (0,-4) / left (4,0) / right (-4,0)，坐在箭头侧的缝隙）——阴影=面板朝触发物的倾斜；**颜色 = 设计语言阴影主值 rgba(25,25,25,0.10)**（`--colox-shadow-sm/md/lg` 共用的主层 alpha——token 只发 box-shadow 简写、无裸色条目，把主色原样抄进 `--colox-tooltip-shadow-color`，不发明 0.13 这类补偿 hack；半透明稀释后≈0.09 是物理诚实，比 token 浅一步）。负数 spread 是 drop-shadow 的公开代价。**阴影画在装饰之下的老教训不变**（半透明装饰下任何补影会泛色），以投影形态收敛解决。
- **阴影机制简单优先于像素级无渗**（用户两连否决「这原本是一个简单的需求」「mask-clip 也没有意义」）：不为几 unit 的视觉残差维持投影层/遮罩挖孔/让位带机制；真到「装饰像素==本体像素逐点相等」才轮得到遮罩挖孔，而那已是机制成本大于视觉收益的禁区。
- **装饰指针恒瞄准触发物**（Boundary-collision 反馈轮）：边界碰撞（flip/shift）怎么搬面板，箭头这类定位式装饰的中心都应钉在触发物的参考中心——cdk 在算位置时把「参考中心相对面板边界的偏移」写成 `--colox-floating-arrow-offset` 内联变量（每帧随 autoUpdate 刷新），消费方 `clamp()` 到面板内沿；「箭头在面板上居中」是常态下的巧合而非定义，不能硬写 50%。
- **提示层呼吸感**（视觉松一轮，用户反馈「太紧凑、箭头小」）：hint 是短文案浮层、密度以「读一遍就走」为准——14px 字下 padding 8/16（梯子各档同步上移一档：sm 6/12、md 8/16、lg 10/20，错位原则保持）；箭头随面板比例走（6px 在 280px 面板上显弱，改 8px 方块）；gap 随箭头开关（有箭头 8 / 无箭头 6，箭头尖不埋进 trigger）。数字直觉（设计桌上估的 6/12 密度）被用户目视一轮纠回——提示层密度是发车前需要真实目视的轴。

## 浮层卡片表面：实底 + union 投影 + 内容固有宽（Popover 定案）

- **实底卡片与半透明提示层分道**：提示层的半透明是 Tooltip 专约（短句阅读面），Popover 是可交互长文卡片——玻璃半透明伤对比度（dark 下更甚），表面 = opaque `--colox-color-bg-default`（dark 主题自动翻）+ **无边框** + `radius-lg`；无边框同构 AntD、避开箭头-边框接缝难题。不透明的底色同时意味着面板无霜纹、panel 级滤镜合法（Tooltip 的 backdrop-root 透镜律在卡片世界不适用）。
- **深度 = panel 级 union drop-shadow（shadow-lg 档折叠）**：`drop-shadow(0 10px 14px rgba(25,25,25,0.10)) drop-shadow(0 4px 5px rgba(25,25,25,0.06))`——`--colox-shadow-lg` 双层折叠进 drop-shadow（drop-shadow 无 spread 参数、blur 略收保两档质感）；主层 alpha 0.10 = 设计语言阴影主值（token 发射集无裸色条目、把主色抄进组件私有变量——Tooltip 抄值纪律延伸，不发明补偿数值）。**方向随 data-placement 前词**（top→(0,+) / bottom→(0,−) / left→(+,0) / right→(−,0)，阴影坐箭头侧缝隙）——阴影 = 面板朝触发物的倾斜（Tooltip 方向纪律延伸）。
- **箭头 = Tooltip 菱形配方原样复用**：旋转 ±45/±135 方块、上半埋进实底下（实底比玻璃更狠——埋藏半完全隐形、无叠暗楔之说）、对角线硬停渐变只涂外半、单角圆角（只圆尖角 radius-xs）；深度涨到 `--colox-spacing-2` 8px（卡片比提示层大一号）；填充 = `--colox-popover-fill`（panel 实底同源，一处换两色）。定位仍钉 `--colox-floating-arrow-offset` + clamp。
- **进场 fade+scale / 退场 fade**（motion token 持有；退场走 cdk Popup 退出通道 `POPOVER_EXIT`=100——与 Tooltip 同批兑现「退场与 Popover 一起补」；结束帧 scale(1) 与 popup 自带 translateY(0) 同为恒等、零跳变）。
- **面板宽度 = 内容固有**（无 size 轴，DatePicker 先例）：作者 JSX 决定宽度，固定档不匹配内容固有原则；上限归消费方 CSS 逃生舱。

来源：Popover 设计对齐五轴定案（实底卡片/焦点全案/指针桥/退场三件/内容固有宽）；Tooltip 表面轮的用户裁决延伸。
