# 交付节奏

- **一个组件一个组件交付**：多组件需求（如 Layout 三件）不要一批并行实现/汇报，按单个组件（族）小步交付，每步可独立评审与感受（2025 实现 Layout 组件时的明确指示）。
- **组件示例一组件一 Overview**：storybook 每个组件只保留一个 Overview story，按状态轴用共享 `Section` 分区（形→交互→态），以自家布局组件（Container/Stack/Grid）作陈列骨架、fullscreen + Container 定宽——不为单个状态单开 story，散拆形态是反例（2025 整理预览时用户定调「有一个 overview 就可以了，用布局的形式展示，有条理、简洁」）。
- **组件与 docs 同步更新**：新增/变更组件时 docs 的 `sidebars.ts`、wiki/components.md 组件地图、`.mesync/wiki/modules/<name>.md` 与 overview 模块索引一并落盘，缺一视为未完成。
- **Dot 组件语义化回顾欠账**：既有 dot-part 组件（Select.Template/Select.Option、ColoxTheme.Storage/Breakpoints、Stack.Item/Stack.Responsive、Radio.Group/Checkbox.Group）命名与结构在 AutoComplete 交付后**专项回顾**——本轮确立的语义化审视（区域容器命名对区域语义负责、叶子词同名同义、两层点号上限）将至下应用。
- **cdk combobox 内核收齐（已清偿）**：① **Select 回溯**——`select/utils` 的 `defaultSelectFilter`/`filterSelectOptions`/`walkSelectLeaves` 删除，过滤走 cdk `filterComboboxOptions`（记录型 `SelectFilterFn` 经 `adaptComboboxFilter` 单点桥接），编译走 cdk `walkComboboxLeaves`（谓词 + 回调通用走查）；② **`useComboboxKeyboard` 迁入 `cdk/combobox`**——`hooks/use-combobox-keyboard.ts` 落位，combobox = 建议行为完整内核（词形 + 筛选 + 键盘 + 走查），`cdk/floating` 回归纯弹层基建（Popup/定位/dismiss）。523/523 测试零回归。
