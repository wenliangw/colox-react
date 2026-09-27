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

## 提示层表面：palette 六族 + 0.9 透明档 + 玻璃面（Tooltip 对齐定案）

- **surface = 设计语言 palette 六族**（用户点名「移除 dark/light，直接支持 palette 多色」，2026 轮定案）：gray（默认）/primary/info/error/warning/success——与 DatePicker 同词表同族映射（primary→brand、info→blue、error→red、warning→orange、success→green）；**默认面取中性深**（gray = 设计语言 0.9 黑色透明度挡位 `--colox-palette-black-900` / #000000E5，用户记的「黑色透明度色值」即此阶梯——**0.85 不是挡位**，阶梯只有 0/0.05/…/0.8/0.9），**五色族 = family solid 各以 color-mix 90% 同档**（色族无透明度编码挡，mix 是唯一的诚实同档配方）；文字统一 text-inverse 白（六族 inverse 全白）。**borderless、六族同一条几何**（用户拍板去 border——border 内缩填充致变体观感尺寸不一致）；阴影走「drop-shadow 投影」——见「玻璃面」条目。
- arrow = **旋转菱形零裁剪**（√2×深度方块旋转 ±45/±135、上半埋进气泡盒下（DOM 序 [arrow, content]）、对角线硬停渐变只涂外半、圆角 radius-xs 2px——用户点名「尖角太锋利要圆角」）：**裁剪是投影杀手**——clip+filter 同元素 = 自投影被裁空（实测零投影：裁剪把滤镜输出整体切掉——上一轮「AntD union 剪影」其实只有气泡半张），mask+filter = 投出整盒矩形；菱形以「无裁剪 + 埋藏半」同时换来三角画形、圆角、真三角投影、透镜四样。埋藏半是透明窗（渐变外半不涂），90% 玻璃下与素面板逐像素一致（条纹页实测）。**凸出主机的装饰绝不骑边**：backdrop-filter 只采样自身盒内，骑边装饰会把气泡自己的半透明填充 blur 进自己（实测气泡 66 vs 箭头 62 的硬台阶），埋藏半覆在气泡玻璃下、外半采页面，无骑边混色。箭头填充/透镜跟随气泡同源——共享自定义属性 `--colox-tooltip-fill`（panel 声明/palette 在 panel 级覆写，复合选择器防 cascade 打架）一处换六色（用户要求「箭头颜色跟随气泡」的心法；bg+blur 双声明与气泡逐字同款——红蓝分野实测箭 B=4/气泡 B=7 边界混色，0.9 档下即全量信号）；sm 档箭头小一号（深度 spacing-1-5→spacing-1，√2 几何自动缩放——设计语言 spacing 阶梯无 5px 与 1.25 档，整档走 6→4）。
- **透镜的生死由 DOM 位置决定（本轮新律）**：backdrop 透镜不能挂在任何带 filter/backdrop-filter 的祖先之下——滤镜祖先构成 backdrop root，子孙采样被圈进祖先画布、透镜失效（实测：content 伪元素形态箭头 B=20 死值；投影挂 panel 后连气泡也 B=20 失焦）。装饰需要透镜时：装饰应是「素净祖先前」的兄弟子元素 + 投影由每个玻璃面自己带（filter + backdrop-filter 同元素共处是活组合），不能用祖先级滤镜画联体投影。
- **进场 = fade + scale**（0.92→1 过渡，token 驱动、时长 fast）：动画与 placement 无关（Popup 已占 opacity+位移轨道，Tooltip 只补 scale 口感；分方向进场需要解析后 placement 的 JS 状态注入、先渲染后翻面会闪错向，不值）；遵守 motion 轴（reduced 直显）；**退场暂无**（Popup 无退出通道，与 Popover 一起补）。
- **玻璃面优先于实底**（Tooltip 打磨轮）：浮层底色穿半透明 + `backdrop-filter: blur(8px)`——浮层盖在页面上但页面从后面透出，不是一块实板；装饰体保持在主机盒外（见上）。**透明度走设计语言挡位**：中性面用黑/白阶梯的 900 档（0.9），色面用同档 mix——不造 0.85 这类阶梯外挡（用户提议的两个值里 0.9 是有 token 的那一个）。
- **磨砂铁律（修订版）：阴影绝不铺在半透明装饰之下**（用户先报 light 箭头被 box-shadow 染灰，后拍板回阴影）：透光的物理不变——任何画在装饰下方的阴影都会穿过半透明填充泛上来；教训收敛为**投影形态**：每个玻璃面自带 `filter: drop-shadow` 投影（AntD 式剪影投影，alpha 补偿 0.13 对冲半透明稀释——drop-shadow 对剪影 alpha 施影，0.13×0.9 ≈ token 0.10 的实际深度（0.9 档比旧 0.82 更贴 token）；token 的 -1px spread 无法表达为公开代价），残差实测 delta ≤ 10 units。**不另设投影层/遮罩挖孔/让位带**——用户两连否决（「这原本是一个简单的需求」「mask-clip 也没有意义」）：**简单优先于像素级无渗**；真到「装饰像素==本体像素逐点相等」才轮得到遮罩挖孔，而那已是机制成本大于视觉收益的禁区。
- **装饰指针恒瞄准触发物**（Boundary-collision 反馈轮）：边界碰撞（flip/shift）怎么搬面板，箭头这类定位式装饰的中心都应钉在触发物的参考中心——cdk 在算位置时把「参考中心相对面板边界的偏移」写成 `--colox-floating-arrow-offset` 内联变量（每帧随 autoUpdate 刷新），消费方 `clamp()` 到面板内沿；「箭头在面板上居中」是常态下的巧合而非定义，不能硬写 50%。
- **提示层呼吸感**（视觉松一轮，用户反馈「太紧凑、箭头小」）：hint 是短文案浮层、密度以「读一遍就走」为准——14px 字下 padding 8/16（梯子各档同步上移一档：sm 6/12、md 8/16、lg 10/20，错位原则保持）；箭头随面板比例走（6px 在 280px 面板上显弱，改 8px 方块）；gap 随箭头开关（有箭头 8 / 无箭头 6，箭头尖不埋进 trigger）。数字直觉（设计桌上估的 6/12 密度）被用户目视一轮纠回——提示层密度是发车前需要真实目视的轴。
