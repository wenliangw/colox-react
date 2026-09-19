# 焦点指示归属：原生环与设计环

给组件加键盘可达性、或用户报「Tab 时出现黑边 / 奇怪描边」时，逐条对照。

## 委托焦点给外壳的控件 → 必须抑制引擎默认 outline

- **改这里**：组件的聚焦元素是裸原生控件（`<input>` / `<button>`），而视觉焦点环画在外层壳（`:focus-within` 的 border + box-shadow）。
- **必须检查：**
  - [ ] 引擎 UA 默认环（Chrome `outline: auto 1px rgb(16,16,16)` ≈ 黑边）会与外壳环**叠加**：一圈黑边 + 一圈 brand 环（Select 触发钮实测；家族其它控件 `input-control`/checkbox/radio/switch/slider/button/input-number 都已 `outline: none`，Select 的按钮形态是唯一漏网）。
  - [ ] 抑制只加在**委托给外壳的那个控件**上，别动自带设计环的独立件（Button/IconButton）。
  - [ ] 抑制前后都要实测「焦点仍可见」：`matches(':focus-within')` 为 true **不代表**样式已应用——量 computed `border-color` / `box-shadow`，且量之前先 `click` 让文档真正获得焦点（探针首轮就因文档失焦误判「外壳环没生效」）。
- **为什么**：Select 2026 修复实测 UA 环 `auto 1px rgb(16,16,16)`（近黑，与 brand 环重复）。

## 全局 `outline: none` 是错误答案

- **改这里**：想「一键消掉所有轮廓」时。
- **必须检查：**
  - [ ] 全局抑制会连带抹掉**自带焦点指示**的独立件（Button/IconButton/textarea resize handle…）的键盘可见性 → WCAG 2.4.7 失败。
  - [ ] 正确模型 = 分层归属：① 委托外壳的裸控件 → 抑制原生环（外壳画环）；② 自带焦点的独立件 → 保留设计环；兜底靠本清单，不靠全局规则。
- **为什么**：用户提议全局 `outline: none`，实测评估后否决。

## 焦点环配色：跟随控件自身 palette + 必须过 3:1 对比

- **改这里**：给「环色跟随 palette」的组件定环色，或想「统一成品牌色」时。
- **必须检查：**
  - [ ] 环色 = 控件自身的 `palette-solid`：中性钮中性环、语义档自身色。给中性钮套品牌环会被读作外来涂装（用户先以「黑边」描述中性深灰环，换 brand 后仍否决——「gray 的 outline 用 brand 有点怪」——最终回到跟随 palette）。
  - [ ] 候选色必须过非文本对比 3:1（WCAG 1.4.11）再谈观感：实测 gray-700 4.95:1 ✓ / brand-500 6.29:1 ✓ / brand-muted 1.99:1 ✗ / gray-600 ~2.8:1 ✗——「柔和的淡色环」基本都不过关，可用的中性档实际只有 gray-700 一档。
  - [ ] 不要为「将来可能分歧」预置环变量：曾把环与涂装解耦为 `--colox-icon-button-focus-ring`，环色政策回退后该变量即成空转，一并撤回——环与涂装同源就是契约。
- **为什么**：IconButton 环色两轮收敛（用户先后否决中性深灰与品牌色，最终定「跟随 palette」）。
