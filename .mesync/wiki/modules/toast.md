# Toast 组件

## 职责

**瞬态通知栈**——M4 overlay 家族收官件。与 Modal/Drawer 的本质差异：
**内容来自命令式调用（任意代码位置触发）而非树内声明**——「内容必须在树中」
判据不适用，但**宿主（Provider）必须在树中**。全局模块级 store 单例
（`store.ts`），命令式 `toast()`（`api.ts`）操作它，`<Toast.Viewport>`
订阅它渲染。

## 结构

- **`api.ts`**：命令式 `toast(payload)`——两档合一：`toast(content)` 轻量
  单行（antd message 型）+ `toast({ title, content })` 带标题通知（antd
  notification 型），一个组件一个心智模型；tone 快捷方法
  `toast.info/success/warning/error`（palette 四色）+ `toast.update(key,
patch)`（同 key 原地更新）+ `toast.dismiss(id?)`（无参 = 全部）。返回
  toast id。
- **`store.ts`**：模块级单例 `ToastStore`——**命令式场景的 usePresence
  「open 翻转」语义不适用**（组件不在树里受控），改为 **store 状态机**
  （`shown` → `exiting` → removed）+ 纯 CSS 动画 + store 层 setTimeout
  管全部生命周期：duration 自动关闭（默认 3s、0 = 不自动关）、hover
  暂停/恢复（pause/resume 记录 remaining）、退场窗口（`TOAST_EXIT`=200
  后移除）。`getSnapshot()` 返回稳定引用（不可变 entries 数组），
  Viewport 用 `useSyncExternalStore` 订阅。
- **`provider.tsx`**：`<Toast.Provider>`——透传宿主（组合根，消费方包裹
  app；未来放配置）。Viewport 分离（Radix 模式，用户拍板）：
  `<Toast.Viewport position="top-right">` 消费方声明栈槽位置/样式。
- **`viewport.tsx`**：订阅 store 渲染队列，六位置栈（top/bottom ×
  left/center/right）——top 槽向下堆、bottom 槽向上堆（column-reverse）；
  槽本身 `pointer-events: none`（卡片 re-enable，间隙点击穿透）；
  z-index `--colox-z-overlay`。
- **`toast-item.tsx`**：实底卡片（Popover 配方，非半透明——半透明是
  hover 提示层 Tooltip 专用，toast 不 hover 定位）+ palette 语义图标
  （`--colox-color-text-info/success/warning/error` 着色）+ title/content
  两档 + 单个 action（Button subtle，点击后自动关）+ 关闭钮（IconButton
  muted）。`role="status"` + `aria-live="polite"`；hover 暂停计时。
- **icons 批次三**：`IconInfo`/`IconSuccess`/`IconWarning`/`IconError`
  四枚（circle r=9 或三角 + 内部笔画，全整数坐标过 spec 几何锁）。

## 目录结构

```
src/toast/
├── api.ts            # 命令式 toast() + 快捷方法 + update/dismiss
├── store.ts          # 模块级单例 store（状态机 + 全部 timer）
├── provider.tsx      # <Toast.Provider> 透传宿主（组合根）
├── viewport.tsx      # <Toast.Viewport> 订阅 store + 六位置栈
├── toast-item.tsx    # 单卡片（实底 + palette 图标 + action + close）
├── toast.tsx         # Object.assign(Provider, { Provider, Viewport })
├── types/            # component.ts（ToastEntry/Options/Tone/Position…）
├── styles/           # base（卡片面）/viewport（六位置栈）/animation（进出场）
└── _tests/           # 13 例：api 两档/tone 快捷/dismiss id/store 生命周期（duration/sticky/update/dismissAll）/交互（close/action 自动关/hover 暂停）/viewport（position 类/className）
```

## 边界

- **命令式 + 宿主分离**：内容任意位置触发（模块 store）、宿主必须在树
  （Provider + Viewport）。多实例 Provider 范围外（单例 store）。
- **action = 单个 + 自动关**：`{ label, onClick }` 对象（命令式下无法是
  子组件）；点击后 dismiss（动作确认 = 使命结束）；多动作是对话框职责。
- **两档合一**：轻量 + 带标题是一个组件的两种载荷，不做 message/
  notification 双组件（antd 历史分裂）。
- **实底卡片**：Popover 同款表面（可读性优先）；半透明 = hover 提示层
  专用配方（Tooltip），toast 无 hover 定位需求。
- **退场 = store 管**：dismiss → status='exiting'（CSS 播退场）→
  TOAST_EXIT 后 store 移除。不用 usePresence（那是组件挂载生命周期，
  命令式 store 场景由 setTimeout 承担退出窗口）。
