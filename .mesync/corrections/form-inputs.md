# 表单类组件：受控输入的程序化写入

Input v2 清除按钮的实现中踩出的 React 事实，将来 Select/DatePicker/Slider 等任何「程序化改写受控输入值」的组件都必须对照检查。

## 裸 `<textarea>` 有 UA 首选宽度，reset 必须显式填满内容盒

- **改这里**：在组件私有 reset 里给裸 `<textarea>` 写 `display: block; font: inherit; border: none; …` 但不设 `width`。
- **必须检查**：`<input>` 默认 `size=20` 的宽度习惯不适用于 textarea——裸 textarea 的 UA 首选宽度约 20 cols（`cols` 默认值），外壳 padding 内会出现一段非预期的固有宽度。
- [ ] reset 写 `width: 100%`（货真价实的 fill），或外壳 flex 布局吸收。
- **为什么**：Textarea v1 落地时对照 input 形态 reset 检查发现该差异（见 `.mesync/wiki/modules/textarea.md` 裸 control reset 节）。

## 外壳+裸控件组件：UA resize grip 会绕过外壳契约

- **改这里**：给「外壳 + 裸 `<textarea>` 内层」的组件透传原生 `resize`（UA 默认 `both`），或声称「resize 保留」。
- **必须检查：**
  - [ ] UA grip 只写内层控件的 inline 宽高——外壳（width:100%、边框/圆角/焦点环）不跟随，拖出的尺寸溢出外壳，视觉契约撕裂；宽向拖拽还可超出外层容器（UC 只认 CSS max-width 钳制）。
  - [ ] 右下角是 UA grip 的固有位置，与角落 chrome（清除钮/计数）同位冲突。
  - [ ] 结论：尺寸策略由组件持有——`resize: none` + 自持高度行为（autosize 默认开 + 自绘 drag handle），宽度永远容器驱动；恢复原生 grip 是消费方 CSS 逃生舱。
- **为什么**：Textarea 首版把「resize 保留」整包透传，用户实测拖拽 grip 三个问题（外壳不跟随/溢出外层容器/内容溢出）后改判。

## 无界增长控件：内置 chrome 不许悬浮盖字，footer 行是唯一归处

- **改这里**：给「随内容无限增高、无滚动条」的控件在右下角绝对定位任何悬浮件（清除钮/计数徽标/drag handle）。
- **必须检查：**
  - [ ] 无界世界里**最后一行文字永远贴着盒子底部**——右下角悬浮件每一刻都在压字（不只是极端情况），用户实测断言「会遮挡文字内容」。
  - [ ] 悬浮件的遮挡与内容长度无关、却与 autosize 世界绑定：固定 rows 世界遮挡概率低，增长世界遮挡概率 ~100%。
  - [ ] 结论：chrome（count/clear/handle）一律进 shell 内**流内 footer 行**（左簇计数|清除、右端 handle），渲染条件 = 组件任一 chrome 开启；footer 行的代价（固定行高 ~24px）明面化。
- **为什么**：Textarea clearable 右下角悬浮版被用户否定（「即使是绝对定位也会遮挡文字内容」），连带拖出「计数与清除是否都放框内」的讨论，最后拍板 footer 工具条 + drag handle 同行。

## 自实现 autosize（scrollHeight 直接测量）的必查点

- **改这里**：给 textarea 写「随内容增高」的实现，或在未来 DatePicker 备注输入等形态复用该 hook。
- **必须检查：**
  - [ ] 测量前先清 inline height 恢复 rows 自然高——上一次写入的高度绝不能参与下一次测量（否则只增不减）。
  - [ ] 三个触发源缺一不可：原生 `input` 监听（非受控打字与 IME——只挂 onChange 会在非受控时静默失效）+ value 依赖的 layout effect（受控外部喂值）+ ResizeObserver。
  - [ ] **ResizeObserver 只对宽度变化重测**（换行重排）——高度变化可能是自己的写入或 drag handle 的落笔，全量回调会与拖拽互殴成环、把拖拽的高度瞬间弹回。
  - [ ] **手动高度 = 别人写入的 inline height**：adjust 每次比对 `el.style.height`，不是自己上次写入的值就记为「手动最小高度」，此后测量基底 `max(内容, rows 基准, 手动)`——显式用户尺寸永不被内容抹掉（handle 拖拽直写内层内联高度，靠这条通道进入最小值流）。
  - [ ] 清除/程序化写值是没有 input 事件的静默写路径——需要显式重测回调（`useTextareaClear` 的 `onCleared` → `adjust` + 计数 refresh）。
  - [ ] overflowY 增长期 `hidden`（防滚动条闪动）、封顶后 `auto`；行高取 computed style，解析失败（样式未载）跳过钳制降级。
  - [ ] 拖拽/键盘步进的地板 = 内容高（无滚动条世界内容必须完整可见，只升不降）；步进用实时行高、起点用真实盒高。
- **为什么**：Textarea autoSize + drag handle 定案的自实现清单（决策「Textarea autosize 定案」→「Textarea 四世界定案」），每条对应一个真实的失效路径。

## 滚动容器：padding 必须落在滚动元素自己身上

- **改这里**：外壳带 padding、内层控件可滚动（预留式 gutter 平台：Windows Chrome 121+、Firefox）；或给滚动控件写滚动条样式时不写双引擎。
- **必须检查：**
  - [ ] 滚动条渲染在元素边框内侧——padding 挂外壳时，预留 gutter 插在「外壳 padding」和「内容」之间，视觉上滚动条飘在 padding 里、文字远离边缘（用户实测断言「很丑、不能吃容器的 padding」）。
  - [ ] 修法 = padding 移到滚动控件自身（尺寸档用后代选择器下发），结构与 input 单行形态的心智不同（单行 input 的 clear 槽位在外壳、多行滚动控件必须反着来）。
  - [ ] 定制滚动条要双引擎：`scrollbar-width/color`（Chrome 121+/FF）+ `::-webkit-scrollbar-*`（Safari/老 Chrome），thumb 用 border-muted token、track 透明——只有一套则 Safari 或旧 Chrome 落差。
- **为什么**：Textarea maxRows 封顶滚动条定案（用户反馈 Windows 原生滚动条难看 + 位置吃 padding 后讨论达成）。

## 受控输入上不要走 DOM 派发改写值

- **改这里：** 在受控（`value !== undefined`）的 `<input>`/`<textarea>` 上程序化 `input.value = X` + `dispatchEvent(new Event('input'/'change', {bubbles: true}))` 期望消费者 onChange 收到新值。
- **必须检查：**
  - [ ] React 的 change 插件对受控输入报告的是 **value tracker 里的旧值**（消费者读到旧值），事件结束后无状态更新时还会把 DOM **回写**成受控值。
  - [ ] 换成原型 setter（`HTMLInputElement.prototype` 的 value descriptor）绕过 tracker：DOM 值新了，但消费者**读到的仍是 tracker 旧值**。
  - [ ] 纯 `input.value = ''` 赋值 + 派发：对受控输入 React 会因 tracker 已同步而**吞掉事件**（onChange 一次都不触发），非受控还可能触发。
  - [ ] 结论：受控输入的可靠路径 = **直接构造事件形对象调用消费者 onChange**（`onChange?.({ target, currentTarget, type: 'change' })`），DOM 交给消费者的 re-render 更新；非受控另先直写 DOM。这是 MUI/Ark 同款做法。
- **为什么：** React 19 的 value tracker 与 change 插件去重使「DOM 派发渠道」对受控输入不可靠（vitest 实测四种配方矩阵：plain/proto × input/change，无一对受控输入正确送达新值——要么吞掉、要么报旧值、要么回写）。
