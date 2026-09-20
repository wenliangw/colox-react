# 状态 store：异步发布与重置信态

Form store 批 A 修复（2026）拖出的两类状态真值缺陷，将来任何「异步发布」与「重置/清态」实现都要对照检查。

## await 后写状态 → 必须带序号，旧结果永不覆盖新结果

- **改这里**：实现任何「`await` 之后写共享状态」的路径——异步校验结果、自动保存、异步回填、搜索建议、取消后落地。
- **必须检查：**
  - [ ] 同一 subject（字段/查询）并发触发时，旧 run 后 resolve 会不会覆盖新 run 的结果——每个 subject 一个递增序号（epoch），**只有最新序号的 run 可以写**，旧的静默丢弃。
  - [ ] reset/清态路径也要使 in-flight run 失效（reset 时把序号也推进），否则清错后旧 run 后到会把已清的错误写回来。
  - [ ] 写一个「两次 run、逆序 resolve」的测试锁定（旧结果最后落地，断言新结果仍在）。
- **为什么**：`validateField` 无防护时，`validateOn='change'` + 异步规则快速输入下旧 promise 后到，把错误回滚成旧裁决（批 A 缺陷 2，测试 `drops a stale async verdict` 锁定）。

## reset/清态后 → 所见（UI）必须等于所提（store）

- **改这里**：实现 reset/恢复默认值/清态——表单 store、组件内态、任何「UI 种子 + 外置状态」双写结构。
- **必须检查：**
  - [ ] 挂载期写进 store 的种子（defaultValue/defaultChecked/域空值词）在 reset 后是否也回到 store——只回「初始快照」会丢种子：控件回显默认值而 `getValues()` 读到 undefined（所见≠所提，提交/校验口径与显示脱节）。
  - [ ] reset 语义测试必须覆盖**无参路径**（显式传全键会掩盖缺陷——前科就是唯一 reset 测试只测了传全键）。
  - [ ] 初始化值（useForm initialValues）优先于控件种子：reset 只在恢复映射里没有该字段时才回种种子。
- **为什么**：`reset()` 只恢复 useForm 入参快照、不含挂载后写入的 defaultValue 种子（批 A 缺陷 1），修复 = 注册携带 seed + reset 回种。

## 多个同类辅助件 → 一 id 一件、聚合接线

- **改这里**：组件允许多个同类辅助件（hint、错误、描述行）渲染各自 `id`，或用单一 id 生成多个同 id DOM 节点。
- **必须检查：**
  - [ ] 每一件拿自己的 id（首个可保留裸 id、后继 `-<index>` 后缀），`aria-describedby` 聚合全部件 id（空格分隔）——辅助技术读到每一行，HTML 不出现同 id 重复。
- **为什么**：`Form.Hint` 可多声明却共享同一个 `hintId`（批 A 缺陷 3）：同 id 挂多个节点属非法 HTML、仅第一个被读到。
