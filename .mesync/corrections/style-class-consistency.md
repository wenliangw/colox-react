# 样式类名与 CSS 选择器一致性

## 现状

- jsdom 测试只断言「类名挂到 DOM 上」，**不验证 CSS 里存在对应选择器**——类名写错前缀时测试全绿、视觉效果全失效。
- **Tag template 演示前科（2026-10）**：自定义 chip 的清除钮用裸 `<button>` 挂站点类 `colox-select__tag-remove`——站点类只承载语境语义（muted 换装后连色规则都删了，仅剩注释），**不含结构盒**；裸按钮顶着 UA 默认字号/padding（~24px 高）溢出 20px 的 chip。修复 = 演示改成 `IconButton size="4" variant="muted"`（与内置 chip 同构），docs 加一条作者指引。
- **Select clear 过渡前科（2026-10）**：站点类写 `transition: opacity …` shorthand，把 IconButton 基座的完整过渡列表**整条覆盖**——muted 档 hover 的 color 过渡被静默杀掉（Input 侧无覆盖所以有过渡，肉眼误判为「两组件行为不一致」）。修复 = 基座把过渡约定收成私有 hook `--colox-icon-button-transition`，站点组合它（`transition: var(--hook), opacity fast …`）而非替换。
- Input 前科（两条）：
  1. **invalid/disabled 不生效**：cva base 是 `colox-input-group`，但 TSX 修饰类误写 `colox-input--invalid`/`colox-input--disabled`，与 base.scss 的 `&--invalid`（编译 `.colox-input-group--invalid`）前缀不一致 → storybook 里 invalid 不红、禁用不变灰，测试却全绿（断言同错）。
  2. **块名抢注未来组件名字空间**：v2 外壳把块类名改成 `colox-input-group`，被用户指正——「Input 组件的前缀应该是 colox-input，不应该是 colox-input-group，**InputGroup 未来是另外的一个组件**」。DOM 外壳不是新组件，是 Input 自己；块名 = 组件自身名字空间。
- **消息条目动画相位类（swap 换场、2026-12）两代方案**：① keyframe 相位类（`--swap-out/in`）——class 换绑 animation-name，store 的 JS 定时器与 CSS 动画开始时刻**不同步**、动画结束（面 shorthand 的 fill 未被基类覆盖）弹回自然值 → 用户浏览器报「像闪一下」；② 修正 = 弃 keyframe 相位，改 **transition 属性自同步**：`--was-swapped`（`animation: none` + transition，常驻）供驻留过渡（回升段 fast）、`--swap-out`（下潜段 slow + opacity 0.4 钉浅谷、初版 0 被用户报「到 0 才再进入」改 0.4；`--swap-out-soft` 0.6=update 软谷——同级类排后覆写，下潜/回升时长由「变化后状态」的类集决定，不对称节奏零新机制）、store 浅谷换载荷清类回升。「删相位类 = animation-name 弹回别的动画并重放」仍成立——was-swapped 的 `animation: none` 常驻正是为了冻结名字（类在名在）。

## 改这里

- 给组件新增/改名「落 DOM 的类」（状态修饰类、变体类、块名、插槽结构类）。
- 给元素加/删**按类换绑 animation-name 的相位类**（swap/phase/state 驱动动画的元素）。
- 在演示/docs 里给裸元素挂**站点类名**（`colox-select__tag-remove` 等）。
- 在站点类里覆盖基座的 CSS **shorthand**（`transition`/`background`/`inset`/`animation`…）。

## 必须检查

- [ ] 块名（`colox-<name>` 首段）= **该组件名**（或该组件的公开 dot-part 名，如 `colox-grid-item`）；不得起 `xxx-group`/`xxx-shell` 等包装结构名充当块名，也不得占用同族未来组件的名字空间（InputGroup 型前科）。Input 名下块的形态：元素 `colox-input__*`、修饰 `colox-input--*`。
- [ ] 修饰类前缀与 **cva base 类**一致（`<block>--<modifier>`）；类名在 `input.tsx` 的 clsx、`variants/` 映射、`styles/*.scss` 选择器**三处同字符串**。
- [ ] 构建后 grep 产物确认选择器真实存在：`dist/style.css` 里每个新类名（正确名 ≥1、旧错误名 =0）。
- [ ] jsdom 测试挡住的是「挂载正确」，挡不住「CSS 生效」——状态样式（invalid/disabled/focus 环）改完必须 storybook 肉眼过一遍。
- [ ] 站点类**不含结构**（盒/尺寸/复位都在 IconButton 基座）——demo/模板若挂站点类，元素本身必须是 IconButton（`size="4" variant="muted"`），否则 UA 样式溢出（tag-remove 前科）；改完探针对比内置 chip 的按钮盒尺寸。
- [ ] 覆盖 shorthand 前先确认站点还依赖基座的其他成员（Select clear 需要基座 color/transform 过渡 + 自己的 opacity reveal）：依赖就**组合基座 hook**（`var(--colox-icon-button-transition)`）或逐成员赋值，绝不整条替换。
- [ ] 改完探针断言过渡成员列表（computed `transitionProperty`/`transitionDuration` 应含基座成员），storybook 里 hover 过渡肉眼过一遍。
- [ ] **keyframe 相位 + JS 定时器 = 必然不同步**（动画起跑与 setTimeout 不是同一时刻，结尾 fill 回弹/闪是常态结局）——要「衔接自然」优先 **transition 属性自同步**（改 opacity 值，别换 animation-name）。
- [ ] **animation-name 回弹**：按类换绑 animation-name 的元素，「删类」不是回静止而是弹回别的动画并重放——防回弹 = 冻结类常驻（`--was-swapped` 的 `animation: none` 永在，由 exit 动画接管前不清）；真的需要删相位类时，删完必须先确认下一个 animation-name 是谁。
- [ ] 相位类选择器必须**压过**面进场类：双类 `.colox-message.colox-message--was-swapped`（0,2,0）> 面进场类（0,1,0），与 exit 类（0,2,0）同分靠**CSS 顺序**——was-swapped 规则必须排在 enter/exit 规则前让 exit 接管。

## overflow:hidden 裁剪容器必须有轴长度

- 给「裁出局部」（细条、peek、遮罩窗口）的元素加 overflow:hidden。
- 想用透明度弱化「被压在后排」的装饰层。

## 必须检查

- [ ] `overflow: hidden` 的**裁剪必须配套轴长度**（height/max-height/width）——只有 overflow:hidden 而没有轴长度 = 内容原样完整渲染（裁剪从未发生）；此刻若再挂 opacity，症状就变成「多个半透明整卡」而不是「细条」（deck peek 前科：容器无高度 + opacity 0.6，用户报「没有堆叠、多个像设置了透明度」）。
- [ ] 装饰性层级**不靠 opacity 表达**——opacity 只降全层透明、不裁内容，用户把它读作 bug；「在后排」用形状（裁到细条）+ 影深表达。
- [ ] 裁切高度取**真实 token 档**（size-10 = 40px，露满图标行），且用 max-height 而非 height——比裁切档还矮的内容（tiny custom 卡）保持自然高度不被撑满。
- [ ] jsdom 挡得住 DOM 结构（裁切 wrapper 是否挂上），**挡不住 CSS 生效**——裁切/透明度类样式改完 storybook 肉眼过一遍。
