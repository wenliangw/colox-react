# 盒型与尺寸陷阱（盒子不是你以为的样子）

纯布局语义的防漏清单。两条都**由真实浏览器探针抓出、jsdom 全绿放行**——凡「形态/内容决定盒子」的改动，单测通过不代表盒子是对的，必须量 `getBoundingClientRect()`（static 产物探针：`storybook-static` + `python3 -m http.server` + `iframe.html?id=<story-id>&viewMode=story`）。

## 空内容的可交互件必须有确定盒，否则塌成 0 尺寸

- **改这里**：让 flex/grid 行里的可交互元素（按钮、触发器）按状态决定有无内容——内容为空时不渲染任何子节点。
- **必须检查：**
  - [ ] 无内容 + `padding: 0` + 行内 `align-items: center`（不 stretch）的可交互件高度塌成 **0**：不可见、不可点、Playwright 判 hidden（前科：Select 二轮把 multiple 无 showSearch 的控件从 input 换成 button 后，有 chip 时按钮无内容 → 76×0）。
  - [ ] 修法优先级：给控件确定盒（`align-self: stretch`，由行高撑起）> 塞不可见占位内容（脏补丁）。
- **为什么**：Select 真实浏览器探针抓出（jsdom 100 例全绿仍放行），修 `align-self: stretch`。

## 「抱紧内容」的开关不能只写 `display: inline-block`

- **改这里**：给组件做「盒子抱紧内容」的能力（badge 包壳、fit 宽壳、上下文盒）。
- **必须检查：**
  - [ ] flex/grid 子项会被 **blockify**：`display: inline-block` 在列向 flex 里被 `align-items: stretch` 拉满，「抱紧」静默失效（前科：Positioner `inline` 首版实测把 84px 按钮的壳拉到 736px）。
  - [ ] 修法：**同时声明 `width: fit-content`**（跨父布局成立；普通行内流里 inline-block 本就 shrink-to-fit，加它无副作用）。
  - [ ] 反向：需要「填满」的壳（全宽遮罩）别用同一开关——抱紧与填满是两种意图，各自显式。
- **为什么**：Positioner 探针抓出后补 `width: fit-content`（见决策 21aa9023），模块文档同记。

## 填条/进度类旁的数值标签必须占固定槽，否则标签变宽回流把填条拉倒退

- **改这里**：在 flex 行里给「按提交值变化的填充件」（进度条 bar、仪表 fill）旁边挂数值读数标签（`n%`、计数、`format` 转换文本）——而且读数随值变化（逐 tick 更新）。
- **必须检查：**
  - [ ] **水位标签的回流**：行布局 `[fill(flex:1 1 auto; min-width:0)] [gap] [label(flex:none)]` 下，标签文本每 tick 变宽（前科：裸浮点 `9.9% → 18.81% → 26.829%` 每 tick 多一位小数）→ track 被压缩 → **bar 百分比没变但像素宽瞬间回落**——增长过程里随时「倒退」一下（用户逮住：「进度条在增长过程中会倒退」）。jsdom 全绿放行，必须真实浏览器看。
  - [ ] 修法三件套：① 驱动值提交取稳定位数（小数 1 位——步长 0.05 噪声换读数恒 ≤「99.9%」）；② 标签占**固定槽**：`min-width: 5ch`（默认读数最宽形态）+ `font-variant-numeric: tabular-nums`（数字等宽，槽内文本不摆）；③ 填条的过渡只对 value 变化生效——标签回流造成的像素骤降不在过渡保护内，槽位稳定才是正解。自定义 `format` 内容宽过槽则回流归来——那是消费方自持的布局面，注释声明即可。
- **为什么**：transition 保护不了父驱动的宽度变化（过渡只动 `width` 声明值，父级回流直接改像素宽）——稳定布局是唯一解法。
