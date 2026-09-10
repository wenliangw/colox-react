# 表单类组件：受控输入的程序化写入

Input v2 清除按钮的实现中踩出的 React 事实，将来 Select/DatePicker/Slider 等任何「程序化改写受控输入值」的组件都必须对照检查。

## 受控输入上不要走 DOM 派发改写值

- **改这里：** 在受控（`value !== undefined`）的 `<input>`/`<textarea>` 上程序化 `input.value = X` + `dispatchEvent(new Event('input'/'change', {bubbles: true}))` 期望消费者 onChange 收到新值。
- **必须检查：**
  - [ ] React 的 change 插件对受控输入报告的是 **value tracker 里的旧值**（消费者读到旧值），事件结束后无状态更新时还会把 DOM **回写**成受控值。
  - [ ] 换成原型 setter（`HTMLInputElement.prototype` 的 value descriptor）绕过 tracker：DOM 值新了，但消费者**读到的仍是 tracker 旧值**。
  - [ ] 纯 `input.value = ''` 赋值 + 派发：对受控输入 React 会因 tracker 已同步而**吞掉事件**（onChange 一次都不触发），非受控还可能触发。
  - [ ] 结论：受控输入的可靠路径 = **直接构造事件形对象调用消费者 onChange**（`onChange?.({ target, currentTarget, type: 'change' })`），DOM 交给消费者的 re-render 更新；非受控另先直写 DOM。这是 MUI/Ark 同款做法。
- **为什么：** React 19 的 value tracker 与 change 插件去重使「DOM 派发渠道」对受控输入不可靠（vitest 实测四种配方矩阵：plain/proto × input/change，无一对受控输入正确送达新值——要么吞掉、要么报旧值、要么回写）。
