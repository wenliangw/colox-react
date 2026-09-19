# 弹层组件：开合模型与失焦通道

给带弹层的组件（Select / AutoComplete / DatePicker 等）接焦点模型、或在弹层里新增可点件时，逐条对照检查。

## focus 开 / blur 收：弹层内每个可点件都必须保焦点

- **改这里**：给弹层控件写 `onFocus` 开面板 + `onBlur` 收面板。
- **必须检查：**
  - [ ] 弹层内**任何**会转移焦点的可点件都会触发 blur → 面板误收：选项行、面板 padding/空态、chip 移除钮、clear 钮——逐个 `onMouseDown={(event) => event.preventDefault()}`（keepFocus），否则「点行选值」会在执行前先丢焦点、把面板关掉。
  - [ ] 面板**容器**也要防：只给行加是漏的，点行间 padding 仍失焦（Select 修复时 Popup 根 + 行双层都加）。
  - [ ] 作者自持件（如 `Select.Template` 的 chip 内部按钮）库管不到——契约上写明或接受其失焦行为，别假设库已兜。
  - [ ] 这里的「blur」不止元素层——窗口失焦是另一条通道，见下节。
- **为什么**：Select 2026 焦点模型修复逐件排查出的清单——行级保焦点早已有，panel padding / chip remove 是漏网。

## iframe / 窗口失焦不触发元素 blur —— 必须补 window blur 通道

- **改这里**：靠 `onBlur` 收面板，且组件会跑在 iframe 里（storybook 预览、嵌入式宿主）或用户可能切窗口。
- **必须检查：**
  - [ ] 点击 iframe **外部**（宿主页面的侧栏/其他区域）或切到别的窗口时，聚焦元素**收不到 DOM blur**（也没有 focusout 冒泡出 iframe）——只有 iframe 的 `window` 收到 blur。只接 `onBlur` 就会出现「组件看起来 blur 了、面板却留在原地」（用户 storybook 实测）。
  - [ ] 修法：弹层打开期间挂 `window.addEventListener('blur', dismiss)`，关闭时摘除；这是弹层家族的公共职责，落在 cdk `useDismissible` 一处，Select/AutoComplete/DatePicker 同时受益。
  - [ ] 同一条 dismiss 通道还应覆盖：外部 pointerdown、Escape——三者是「交互上下文消失」的三个来源。
- **为什么**：Select 二轮修正（用户指正「点击 storybook 目录位置，Select blur 了但面板没收起」）——根因是 iframe 失焦只播 window blur；修在内核而非单组件。

## click 要 toggle 时，用「指针/键盘分流」消竞态

- **改这里**：既要 `onFocus` 开面板，又要点同一个控件 toggle 关面板。
- **必须检查：**
  - [ ] 直接两个通道写满会竞态：mousedown 聚焦 → focus 处理器已开 → click 处理器读到新 open 态再 toggle → **同一击先开后关**（用户看到「点了没反应」）。
  - [ ] 修法 = **指针/键盘分流**：控件 `onMouseDown` 先打标记 → `onFocus` 见到标记则**不开**（把决定权交给 click）→ `onClick` 执行 toggle 并清标记；Tab 等键盘聚焦无标记 → 直接开。blur 时一并清标记（mousedown 后拖走不点的情况）。
  - [ ] **input 形态不参与 toggle**：点击输入框是放光标，toggle 会把「点一下定位光标」变成关面板（antd 同款取舍：input 只开不关，button 才 toggle）。
  - [ ] 反向教训：不要为了绕竞态**删掉整个 toggle**（Select 首轮修复即此——用户随即指正「仍然需要保留 click 的 toggle 能力」）；竞态要靠分流消，不靠砍能力。
- **为什么**：Select 二轮修正定案（用户「上一次我的语言有些绝对了」）。

## 控件形态由能力开关决定，不由布局维度决定

- **改这里**：给组件加「可编辑 / 不可编辑」两种控件形态（input vs button）。
- **必须检查：**
  - [ ] 形态判定读**能力开关**（`showSearch`），不读布局/值轴（`mode`、`multiple`）——`isMultiple || showSearch` 这类判定会让「不可搜索的 multiple」错误地拿到可编辑 input（用户实测：能打字但过滤不生效，因为过滤受 showSearch 门控）。
  - [ ] 形态切换后同步三处：ref 类型断言（input/button 联合）、控制位可达名与 ARIA、触发器显示内容（multiple 有 chip 时按钮留空、空态显示 placeholder）。
- **为什么**：Select 2026 bug 修复——组件形态选择器从 `isMultiple || showSearch` 收敛为 `showSearch`，用户原话「没有设置 showSearch 不应该可以输入只能选择」。
