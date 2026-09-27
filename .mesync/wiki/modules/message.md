# Message 系统（cdk/message 基座 + Toast/Notify 消费面）

## 职责

**消息系统**——以 **scope 注册表**为核心的统一消息容器体系：消费方每容器
挂一个 `<MessageViewport scope="…">`，命令式面（`Toast.…` / `Notify.…`）
把条目路由进对应 scope 的 store，viewport 按 variant 注册的渲染器绘制。
**一个容器可同时容纳 toast 与 notify 条目**（共享 scope 表），双面默认槽位
不同（Toast `top-center` 轻量、Notify `top-right` 卡片）。

与旧架构的本质差异：**容器（MessageViewport）与面（命名空间）分离**——
消费方只挂容器，不挂 Provider/Viewport 双子件；面是纯方法命名空间（非
组件），scope 路由替代「Provider 包 app」的树内接线。

## cdk/message 基座结构

- **`types.ts`**：`MessagePosition`（六位置 top/bottom × left/center/right，
  **相对容器盒**非屏幕——scope 容器内即容器盒内）、`MessageTone`
  （info/success/warning/error palette 词）、`MessageAction`（单个
  `{ label, onClick }`，命令式内容无树可放子组件）、`MessageOptions`
  （content/title/type/duration/action/key/position）、`MessageStatus`
  （shown/exiting）、`MessageVariant`（'toast'|'notify'）、`MessageEntry`
  （store 里的运行时记录：id + variant + 已解析 type/duration + status）、
  `MessageViewportProps`（div 元素 props + `scope?` + `positioning?:
'fixed'|'absolute'`，默认 root/fixed）。
- **`store.ts`**：`createMessageStore()` 工厂 + `MessageStore` 类——队列 +
  shown→exiting→removed 状态机 + duration 计时 + hover pause/resume
  （记录 remaining）+ `DEFAULT_EXIT`=200 退场窗口 + subscribe/getSnapshot/
  add/update/dismiss/dismissAll/pause/resume。**variant 在条目上**
  （`MessageAddOptions` 含 variant）——命令式场景 usePresence 的 open
  翻转不适用，全部 timer 归 store。
- **`factory.ts`**：`MessageFactory` 类 + `messageFactory` 单例。**模块级
  共享 scope 表**（Map<string, MessageStore>）+ **渲染器注册表**
  （Map<MessageVariant, MessageRenderer>）。方法：getOrCreate(scope='root')
  /get/unregister/registerRenderer/getRenderer/clearAll。导出
  `ROOT_SCOPE='root'`、`MessageRendererProps`（entry + store）。
  **继承模式**：消费面 extends MessageFactory 拿 scope 管理，各自在
  构造函数 registerRenderer('toast'/'notify', Item)。scope 表是模块级
  单例——**所有 factory 实例读写同一 scope 空间**，这就是「容器共享」的
  机制。
- **`viewport.tsx`**：`MessageViewport` 组件——useMemo getOrCreate(scope)
  订阅（useSyncExternalStore），按 position 分组渲染六槽（POSITIONS 数组），
  每条目用 messageFactory.getRenderer(entry.variant) 渲染（传 entry + store
  props），useEffect 卸载时 unregister(scope)，spread rest props，
  `import './styles/index.scss'`。容器类 `colox-message-viewport--fixed/
absolute`、data-scope。
- **`item-shell.tsx`**：`MessageItemShell`——role="status" +
  aria-live="polite"、colox-message + colox-message--{tone} + exiting 类、
  hover pause/resume、children 注入。共享外壳。
- **`tone-icons.ts`**：`TONE_ICONS` 映射（info/success/warning/error →
  IconInfo/IconSuccess/IconWarning/IconError）。
- **`cdk/utils/id.ts`**：`createId(prefix)` 通用唯一 ID 生成器（毫秒 +
  同毫秒序号 + 前缀计数）。
- **styles/**：viewport.scss（容器 fixed/absolute + 六槽绝对定位）、
  shell.scss（tone 图标色）、animation.scss（colox-toast-enter/exit +
  colox-notify-enter/exit keyframes）、index.scss barrel。

## Toast 消费面（`src/toast/`）

轻量单行提示（antd message 型）。`ToastFactory extends MessageFactory`
（构造 registerRenderer('toast', ToastItem)），`TOAST_DEFAULT_POSITION=
'top-center'`。`ToastNamespace` 纯方法命名空间：info/success/warning/error
(content, { scope?, position?, duration?, key? })/custom/update/dismiss。
`ToastItem` = MessageItemShell + colox-toast pill（bg-default、radius-lg、
drop-shadow、20px 图标、content、IconButton muted 关闭钮）。无 title 无
action——那是 Notify 档的活。

## Notify 消费面（`src/notify/`）

带标题卡片（antd notification 型）。`NotifyFactory extends MessageFactory`
（构造 registerRenderer('notify', NotifyItem)），`NOTIFY_DEFAULT_POSITION=
'top-right'`。`NotifyPayload`（title/content/type/action/duration/key），
`NotifyNamespace` 纯方法命名空间：info/success/warning/error(payload,
{ scope?, position? })/custom/update/dismiss。`NotifyItem` = MessageItemShell

- colox-notify 卡片（tone 图标 + title/content + 单个 action Button subtle
  点击自动关 + 关闭钮）。

## 入口注册

`src/index.ts` 按字母序 export './toast'、'./notify'（modal 后 notify 前
positioner）+ 文件尾 `export { MessageViewport } from './cdk/message'` +
type MessagePosition/MessageTone/MessageViewportProps。vite 多 entry 加
notify、package.json 加 `./notify` 子路径（modal 后 popover 前）。

## 边界

- **scope 路由**：无 scope = root（屏幕宽 fixed 容器）；`{ scope }` 路由进
  命名容器；`positioning="absolute"` 钉在最近定位祖先（panel/card 内）。
- **一容器双面**：共享 scope 表是机制核心——toast/notify 同容器各占自己的槽。
- **范围外**：嵌套 viewport（scope 名重复归最后挂载者）、可拖拽、多实例
  均为范围外。
