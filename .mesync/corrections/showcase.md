# Storybook 布局 demo 呈现

## 现状

- 布局组件（Container/Stack）本身不可见，demo 的「见证物」是它产生的宽度/空隙——没有可见参考系时，demo 就只剩一堆灰块或巨条，看不出来在演示什么。
- 前科：把 Container demo 嵌套进不可见外层 + 行全宽拉伸（Stack 默认 align=stretch）：① Container 页 lg/xl/no-size 三行全宽视觉重复、封顶对比丢失；② Stack 页行宽 1248px 装两个小盒、stretch 例变成两根 600px 巨条。用户反馈「示例有点奇怪，不能很好的表现组件」。

## 改这里

- 给布局/结构类组件（Container/Stack/Grid…以及未来任何靠宽度差分说话的无边框壳组件）写 storybook Overview demo。

## 必须检查

- [ ] 每个 demo 有**可见参考框**：用 showcase 的 `track`（虚线框）画出「可用宽度」，容器封顶/居中/对齐靠框与内容盒的差分说话；没有差分就让 demo 变刺眼（拉伸巨条）或失明（不可见壳全宽行）。
- [ ] 行宽绑到阅读宽度：`bound()` = `min(480px, 100%)`；不要依赖 flex 拉伸把内容铺满大画布。
- [ ] 视口/流式带级 demo（Stack.Responsive、媒体查询）：**必须位于封顶列之外的全宽区域**，否则观测宽度永远够不到 md/lg 带，demo 死档。
- [ ] Container 封顶 demo 的对齐演示要用比轨道窄的 cap（sm 640 在 ≥1044 轨道里），cap ≥ 轨道时 center/start/end 全部同形。

## 为什么

布局组件的示例 = 让消费者看见「宽度决策」，参考框就是坐标系；坐标系隐形或标尺被拉伸污染，示例就从「演示」退化成「装饰」。
