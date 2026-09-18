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
