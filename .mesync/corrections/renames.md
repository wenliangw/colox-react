# 改名类重构

## 改这些

token 名、CSS 变量名、属性名、文件名（theme tokens / 组件 styles 引用 / SD 配置）。

## 必须检查

1. **消费侧同步替换**：全仓 grep 新/旧名双向确认；右侧 `var(--colox-*)` 引用同样算消费侧，sed 不要只替换一侧。
2. **产物抽检**：CSS 变量断裂对 jsdom/vite 构建/tsc 全部不可见（`var()` 运行时解析、未定义静默判无效）→ 重建后 grep dist：新名存在、旧名计数为 0。
3. **联动重建链**：theme build → demo 资产重编译（`pnpm --filter @colox/preview themes:demo`）→ react build → 三处产物抽检。

## 为什么

曾因双连字符回退时 sed 只替换局部变量左值、`var()` 右值挂旧名，全部按钮 hover/active 白掉一块。
