# 样式类名与 CSS 选择器一致性

## 现状

- jsdom 测试只断言「类名挂到 DOM 上」，**不验证 CSS 里存在对应选择器**——类名写错前缀时测试全绿、视觉效果全失效。
- Input 前科（两条）：
  1. **invalid/disabled 不生效**：cva base 是 `colox-input-group`，但 TSX 修饰类误写 `colox-input--invalid`/`colox-input--disabled`，与 base.scss 的 `&--invalid`（编译 `.colox-input-group--invalid`）前缀不一致 → storybook 里 invalid 不红、禁用不变灰，测试却全绿（断言同错）。
  2. **块名抢注未来组件名字空间**：v2 外壳把块类名改成 `colox-input-group`，被用户指正——「Input 组件的前缀应该是 colox-input，不应该是 colox-input-group，**InputGroup 未来是另外的一个组件**」。DOM 外壳不是新组件，是 Input 自己；块名 = 组件自身名字空间。

## 改这里

- 给组件新增/改名「落 DOM 的类」（状态修饰类、变体类、块名、插槽结构类）。

## 必须检查

- [ ] 块名（`colox-<name>` 首段）= **该组件名**（或该组件的公开 dot-part 名，如 `colox-grid-item`）；不得起 `xxx-group`/`xxx-shell` 等包装结构名充当块名，也不得占用同族未来组件的名字空间（InputGroup 型前科）。Input 名下块的形态：元素 `colox-input__*`、修饰 `colox-input--*`。
- [ ] 修饰类前缀与 **cva base 类**一致（`<block>--<modifier>`）；类名在 `input.tsx` 的 clsx、`variants/` 映射、`styles/*.scss` 选择器**三处同字符串**。
- [ ] 构建后 grep 产物确认选择器真实存在：`dist/style.css` 里每个新类名（正确名 ≥1、旧错误名 =0）。
- [ ] jsdom 测试挡住的是「挂载正确」，挡不住「CSS 生效」——状态样式（invalid/disabled/focus 环）改完必须 storybook 肉眼过一遍。
