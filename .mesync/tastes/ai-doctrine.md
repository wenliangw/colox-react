# AI 心法设计取向

来源：与用户关于「AI 如何更好使用组件库」的系列讨论。

## 已定原则

1. **心法与文档分轨**：给人读的 docs 与给 AI 读的心法是两种媒介——心法是条件式规则（触发条件 + 动作 + 原因），因为 AI 按成本遍历信息通道，行为等价的捷径（裸 div vs Stack.Item 类）需要显式立法才会走预期路线。
2. **内容形态 = skill + rule + wiki 三分类**（借鉴 mesync 的注入逻辑，不把 mesync 本身搬给用户）：skill 过程式怎么做、rule 条件式必须/禁止、wiki 参考面；纯 markdown、与 harness 无关。
3. **内容单一事实源、分发逐 harness 适配**：官方单独维护与迭代，版本化，用户可升级；各 harness 的自动注入载体（AGENTS.md/CLAUDE.md/.mcp.json 等）只是指向同一事实源的适配器。
4. **MCP 仅本地 stdio，不做云端**：AI 编码循环不引入网络依赖；server 内嵌 wiki 数据快照、默认离线，钉版本可复现。
5. **wiki 物理形态 = monorepo 内独立包**（packages/wiki）：组件更新与知识更新同 PR 原子化；版本纪律 = 与 `@colox/react` 前两位（major.minor）一致——react/theme 改代码必评估 wiki，API 变更才随版本更 wiki，patch 位专归组件 bugfix（linked 全位强制同版已废弃）。
6. **优先零配置自动发现通道**（调研结论）：AGENTS.md（dsh/Codex/Cursor 自动读）、SKILL.md（dsh/Claude/Codex 三方识别的跨 harness 格式）、.agents 共享根；MCP 充当按需查询与官方版本升级通道。
7. **每条心法必须带「为什么」**：AI 泛化靠原因，不靠死记规则。

## 落地决定（已实现）

- MCP 直上（用户定调：成本不高），官方 `@modelcontextprotocol/sdk`（v1.30，McpServer.registerTool + StdioServerTransport + InMemoryTransport 测试）。
- **结构 = 主题 bundle**（用户定调）：`skills/<name>/SKILL.md` 配方本体精简（决策序 + 菜谱）+ `references/` 按需读（`rules.md` 条件规则、`component.md` API 参考）；`doctrine` bundle 载全局规则（读名 `global`）、`style` bundle 讲样式接线；根 `components.md` 为组件地图（职责+状态）。顶层平铺 rules/、components/ 目录撤除——一个主题一个包，拷走即全。
- 四工具面：search_doctrine（词频评分 + 命中文摘 + 读指引，覆盖 bundle 本体与 references）/ get_rule（`global` 别名读 doctrine bundle 规则、其余读同名 bundle）/ get_skill（`name` + `reference` 参数读参考件）/ get_component（无参读组件地图、有参读 bundle 参考件）；工具描述里写「何时调用」。
- 命名 = 目录名即 frontmatter name（stack/doctrine/style，无前缀；撞名警察等生态成熟再上）；`references/` 用复数（dsh 与 Claude 的共同拼写，dsh watcher 视其为 bundle 资源、按需加载）。
- 测试纪律：doctrine 测试直接打真实 `@colox/wiki` 内容（内容坏了测试红）；server 测试走 InMemoryTransport 全链路；构建后以真实 stdio JSON-RPC 握手冒烟。
- 版本机制（用户定调）：changesets 移除 linked——改为纪律型「前两位一致」；react 有 pending minor 时（如 Input、心法首版）wiki 以 minor 顺位同发。
- mcp 随 wiki 发版自动 patch（用户确认：mcp 依赖的 wiki 版本变了就该跟着发）——机制即 `updateInternalDependencies: patch`，无需手工开 changeset，也不收紧。
