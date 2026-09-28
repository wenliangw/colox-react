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

## store 里同步触发用户回调 → 先提交状态变更，再 fire

- **改这里**：在 store/状态机的任何 mutation 里**同步**触发用户回调（onClose、onChange、提交钩子——订阅者除外）——消息关闭、表单提交生命周期、picker 变更回调。
- **必须检查：**
  - [ ] fire 用户回调**之前**，状态数组/entries 已经提交成「载荷已结束」的终态（exiting / 已替换）——回调若重入同一 store（再 add/dismiss），必须看到的是已 commit 的条目，而不是仍是 shown 的中间态。
  - [ ] 每个会「终止一条载荷」的路径（dismiss 单条、dismissAll、single 原地替换）都配一个「重入回调恰好触发一次」的回归测试；计数守卫（`calls === 1` 才重入）让回归失败时是干净断言而非无限递归/栈溢出。
  - [ ] 替换/复活路径在 fire 前 clearCountdown 清掉退出计时器，避免条目复活后再被旧的退出定时器移除。
- **为什么**：message store 的 `transitionToExiting`/`replaceInPlace`/`dismissAll` 都在 `notifyClose`（fire onClose）之后才改 status/替换 entries——demo 的 `onClose: () => Toast.info(...)` 同槽 single 重入，命中仍是 shown 的旧条目再 replaceInPlace 再 fire，无限递归（用户报「循环引用」）。教训 = 用户回调是 re-entrancy 门，先 commit 再 fire 是唯一安全序（决策 ae16bee7）。

## 暂停/冻结计时 → 多持有者计数，不能单例布尔

- **改这里**：给计时器加「暂停」语义时有两个以上触发源（hover 暂停 + 折叠/积压冻结、隐藏冻结 + 外部 pause API）。
- **必须检查：**
  - [ ] 暂停状态是 **holder 计数**（每触发源 +1、归零才 restart）而不是单例布尔/单例 remaining——否则第二个源 pause 时被第一个源「已在暂停」吞掉，或第一个源 resume 时把第二个源的冻结解除（hover 离开解锁折叠冻结 = 积压卡自动删，用户报告场景必现）。
  - [ ] 幂等性靠调用侧记录（heldIds ref）而不是 store 里猜——组件 effect 每次渲染重复 pause 会让计数虚增、resume 一次解不掉。
  - [ ] 补「双 holder、逆序释放」测试：pause A + freeze B → A 释放仍冻结 → B 释放恢复计时。
- **为什么**：fold 冻结改造时的选型——单例 pause/resume 会让 hover 离开箱体时把视口持有的冻结一并解除（box 的 onMouseLeave 永远 resume），折叠中的通知恢复自动删除，正好毁掉「出现堆叠后不再自动关闭」的语义；计数 + 视口 heldIds 幂等是两处各司其职。
