# 交付节奏

- **一个组件一个组件交付**：多组件需求（如 Layout 三件）不要一批并行实现/汇报，按单个组件（族）小步交付，每步可独立评审与感受（2025 实现 Layout 组件时的明确指示）。
- **组件示例一组件一 Overview**：storybook 每个组件只保留一个 Overview story，按状态轴用共享 `Section` 分区（形→交互→态），以自家布局组件（Container/Stack/Grid）作陈列骨架、fullscreen + Container 定宽——不为单个状态单开 story，散拆形态是反例（2025 整理预览时用户定调「有一个 overview 就可以了，用布局的形式展示，有条理、简洁」）。
