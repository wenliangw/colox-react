# 交付节奏

- **一个组件一个组件交付**：多组件需求（如 Layout 三件）不要一批并行实现/汇报，按单个组件（族）小步交付，每步可独立评审与感受（2025 实现 Layout 组件时的明确指示）。
- **组件示例一组件一 Overview**：storybook 每个组件只保留一个 Overview story，按状态轴用共享 `Section` 分区（形→交互→态），以自家布局组件（Container/Stack/Grid）作陈列骨架、fullscreen + Container 定宽——不为单个状态单开 story，散拆形态是反例（2025 整理预览时用户定调「有一个 overview 就可以了，用布局的形式展示，有条理、简洁」）。
- **组件与 docs 同步更新**：新增/变更组件时 docs 的 `sidebars.ts`、wiki/components.md 组件地图、`.mesync/wiki/modules/<name>.md` 与 overview 模块索引一并落盘，缺一视为未完成。
- **Dot 组件语义化回顾欠账**：既有 dot-part 组件（Select.Template/Select.Option、ColoxTheme.Storage/Breakpoints、Stack.Item/Stack.Responsive、Radio.Group/Checkbox.Group）命名与结构在 AutoComplete 交付后**专项回顾**——本轮确立的语义化审视（区域容器命名对区域语义负责、叶子词同名同义、两层点号上限）将至下应用。
- **结构边界（Positioner 轮确立）**：`children/` 只装 **dot part**（以 `Parent.Child` 挂载的单元，如 `Select.Option`/`Radio.Group`）；**平级的搭档件（可独立导出/独立使用的组件）走自己的组件槽位**（独立目录 + 入口 + story + docs + 组件地图行）——`Anchor` 起初放在 `positioner/children/` 是错位，用户指正后独立成组件（决策 2982693a 同轮）。
- **ScrollView 组件 + 吸顶归属欠账**（用户预告的下一批）：滚动容器组件待开发；**吸顶/吸底（sticky）属「相对滚动视口」的关系，Positioner 已按语义排除**（absolute 脱流无吸附；sticky 的 inset 落在元素自身，与 `placement`/`offset` 的「离参照盒所钉边距离」是两套语义，硬塞会「同一 prop 两种含义」+ `placement`/`fill` 变死 prop）。归属候选：① **ScrollView 拥有**（`ScrollView.Sticky` 或 `stickyHeader`，推荐——滚动件最清楚自己的 scrollport）② 独立 `Sticky` 机制件 ③ Positioner 加模式（已排除）。两机制可组合：sticky 元素非 static → 本身是 containing block，可当 Positioner 的参照盒。另记两条现状事实：滚动容器里的 **overlay 要钉在容器可见边缘，Item 必须放在滚动子树之外**（放里面会随内容滚走，语义正确）；`position: fixed` 不受滚动影响（库自身浮层走 cdk Popup 的 fixed）。
