# Message 系统（cdk/message 基座 + Toast/Notify 消费面）

## 职责

**消息系统**——以 **scope 注册表**为核心的统一消息容器体系：消费方每容器
挂一个 `<MessageViewport scope="…">`，命令式面（`Toast.…` / `Notify.…`）
把条目路由进对应 scope 的 store，viewport 按 type 注册的渲染器绘制。
**一个容器可同时容纳 toast 与 notify 条目**（共享 scope 表），双面默认槽位
不同（Toast `top-center` 轻量、Notify `top-right` 卡片）。

与旧架构的本质差异：**容器（MessageViewport）与面（命名空间）分离**——
消费方只挂容器，不挂 Provider/Viewport 双子件；面是纯方法命名空间（非
组件），scope 路由替代「Provider 包 app」的树内接线。

**防视口污染两阀**（用户拍板）：① Toast 默认 `strategy: 'single'`——轻量
居中提示一位置一条，新 toast **原地替换**旧 toast（同一 DOM 节点、**即时
落位 + zoom 进场**——新词落位即以 contentVersion 重挂内容结点播放 zoom，
update 与替换同款（用户拍板「替换前也直接进行 update，然后 zoom 进场」）、
**容器上没有任何透明度过渡**（无下潜、无浅谷、无 keyframe 相位）、
重置计时；无重新挂载/位置跳变；不区分 palette/variant）；可选 `'stack'`
堆叠。② Notify 默认 `'stack'`，但**同槽超过 3 条折叠成 deck**——最新卡全显、
后两张 peek 条、其余折叠进 `+N` 计数 chip，点卡面/计数展开收起。

**Round 11 命名与目录重整**（用户拍板）：注册判别词 `face` → **`type`**、
语义轴 `type`（tone）→ **`mode`**、`MessageTone` → **`MessageMode`**、
共享外壳 `MessageItemShell` → **`MessageBox`**；cdk/message 基座目录按
仓库惯例整理为 **`types/`、`stores/`、`constants/`** + `box.tsx`。

## cdk/message 基座结构

- **`types/message.ts`**（+ `types/index.ts` barrel，类型按能力层归位）：
  `MessagePosition`（六位置 top/bottom × left/center/right，
  **相对容器盒**非屏幕——scope 容器内即容器盒内）、`MessageMode`
  （info/success/warning/error，**驱动图标字形**，旧名 MessageTone）、
  `MessagePalette`
  （gray/primary/info/success/warning/error 六族，**驱动图标色 + variant 面料**，
  默认随 mode）、`MessageVariant`（plain/subtle/solid/outline 面料，
  默认 plain）、`MessageStrategy`（single/stack，见上）、
  `MessageClosePayload`（`{ id, data }`）+
  `MessageCloseHandler`（关闭回调——随载荷终结发一次）、`MessageOptions`（content/title/mode/
  palette/variant/strategy/duration/showIcon/closeable/key/
  position/data/onClose——showIcon/closeable 为渲染器 chrome 门（默认 true，
  Toast/Notify 两 renderer 都读）；data 是不透明透传值，onClose 在载荷
  终结时以 `{ id, data }` 原样交还；**已无 action 字段**——round 14
  `MessageAction` 类型与 action 槽随两消费面整体退役，消息系统纯报告、
  不索求决策）、`MessageStatus`
  （shown/exiting）、`MessageType`（'toast'|'notify'，**kind 判别词——
  旧名 MessageFace，再旧名 MessageVariant 已让位给视觉 variant 轴**）、
  `MessageEntry`（store 运行时
  记录：id + type + 已解析 mode/palette/variant/
  showIcon/closeable/duration + **contentVersion（可见载荷代数：每份新
  载荷落位 +1——update/替换/复活都已即时落位，item 以它为 key 重挂
  内容结点触发 zoom 进场；初始 0——首挂靠面进场动画不 zoom）** + status。
  （**已无** swap/pending/MessagePending/swapped 字段——透明度换场机制
  整体退役，见下条））、`MessageAddOptions`（= MessageOptions + 必填
  `type`）、`MessageRenderer`/`MessageRendererProps`（渲染器契约：
  entry + store）、
  `MessageViewportProps`（div 元素 props + `scope?` + `positioning?:
'fixed'|'absolute'`，默认 root/fixed）。

- **`stores/store.ts`**：`createMessageStore()` 工厂 + `MessageStore` 类——队列 +
  shown→exiting→removed 状态机 + duration 计时 + hover pause/resume
  （记录 remaining）+ `DEFAULT_EXIT`=200 退场窗口（**已无 DEFAULT_SWAP**——
  透明度换场机制整体退役）+ subscribe/getSnapshot/
  add/update/dismiss/dismissAll/pause/resume。**type 在条目上**
  （`MessageAddOptions` 含 type）——命令式场景 usePresence 的 open
  翻转不适用，全部 timer 归 store。**默认解析集中**：`resolveMessageDefaults`
  把 mode（缺省 info）、palette（缺省随 mode）、variant（缺省 plain）、
  showIcon/closeable（缺省均 true）一次解析——条目上 chrome 永不为
  undefined；**single 策略在 add 时执行**——同 type + 同 position 已有条目时
  走 `replaceInPlace`（保留条目 id 与 DOM 节点不重新挂载、不区分 palette/
  variant；**即时落位**：shown 态先 `notifyClose(existing)`（旧载荷终结）、
  直接 commit `{...next, contentVersion + 1}`（内容结点重挂 + zoom
  进场）+ startCountdown 计时重置；退场态复活同样即时换载荷——不再重发
  onClose（该载荷已在退场发过））。**chrome 是结构态不是载荷**：
  showIcon/closeable 不进 pending（现在也没有 pending）——update 里即时
  并入 next。`update(key, patch)` 可见载荷变化
  （content/title/mode/palette/variant 引用比较、shown 态）
  **即时落位 + `contentVersion + 1`**（重挂 + zoom 进场）+ 倒计时重启；
  隐形 patch（duration/key/position/chrome/data/onClose）即时应用不重挂。
  **onClose 生命周期**：随「载荷终结」发一次——dismiss（✕/api）、
  自动超时、dismissAll、原地被替换（替换落位的同一刻发）；update
  延续同一载荷不触发；无 mid-swap 状态，故也不需要防重发护栏。
  **fire 序 = 先 commit 后 fire**（决策 ae16bee7，round 12 修复）：
  onClose 恒在 entries 提交成终态（exiting / 已替换）之后才 fire——
  回调重入 add 看到的已是 committed 状态（exiting 条目 single 替换时
  revive 不再重发、新载荷占新槽）；旧序（先 fire 后改 status）会让
  demo 式 onClose（`() => Toast.info(...)` 同槽 single）命中仍是 shown
  的旧条目再 replaceInPlace 再 fire、无限递归。
  同槽 stack 残留的其它 shown 条目一并 transitionToExiting（存活者位置
  不动、无回流），无既有条目才新加。

- **`constants/defaults.ts`**：`DEFAULT_DURATION`=3000（默认自动关窗）、
  `DEFAULT_EXIT`=200（退场窗口，CSS 时长镜像）、`ROOT_SCOPE`='root'。
  **`constants/viewport.ts`**：`POSITIONS` 六槽数组、`DECK_THRESHOLD`=3。
  **`constants/icons.ts`**：`MODE_ICONS` 映射（info/success/warning/error →
  IconInfo/IconSuccess/IconWarning/IconError，旧名 TONE_ICONS）。
  —— 常量按主题文件归 constants/，直接路径引用无 barrel（TimePicker 先例）。

- **`factory.ts`**：`MessageFactory` 类 + `messageFactory` 单例。**模块级
  共享 scope 表**（Map<string, MessageStore>）+ **渲染器注册表**
  （Map<MessageType, MessageRenderer>）。方法：getOrCreate(scope='root')
  /get/unregister/registerRenderer(type, renderer)/getRenderer(type)
  /clearAll。重导出 `ROOT_SCOPE`。**继承模式**：消费面 extends
  MessageFactory 拿 scope 管理，各自在构造函数 registerRenderer(
  'toast'/'notify', Item)。scope 表是模块级单例——**所有 factory 实例
  读写同一 scope 空间**，这就是「容器共享」的机制。

- **`viewport.tsx`**：`MessageViewport` 组件——useMemo getOrCreate(scope)
  订阅（useSyncExternalStore），按 position 分组渲染六槽（POSITIONS 数组），
  每条目用 messageFactory.getRenderer(entry.type) 渲染（传 entry + store
  props），useEffect 卸载时 unregister(scope)，spread rest props，
  `import './styles/index.scss'`。容器类 `colox-message-viewport--fixed/
absolute`、data-scope。**deck 折叠在这里**：同槽 notify 条目 > DECK_THRESHOLD(3)
  时，notify 条目交给 `MessageDeck` 组件（最新在前 + 后两张 peek 条 + `+N`
  chip，点面/计数展开收起，展开后 newest-first 全列表 + chevron-up 收起
  chip）；非 notify 条目照常渲染。**peek 条 = 每张旧卡真渲染 + 限高裁切
  包装**（`.colox-message-deck__peek-card` max-height = size-10 40px +
  overflow hidden——只露上缘细条；首版 colox-message-deck__peek 只有
  overflow hidden 无高度且带 opacity 0.6，裁切从未发生、peek 以半透明
  整卡罗列——用户报「没有堆叠、多个像设置了透明度」后修复：去透明度、
  每卡包限高裁切 wrapper）。

- **`box.tsx`**：`MessageBox`（旧名 MessageItemShell）——role="status" +
  aria-live="polite"、colox-message + colox-message--{mode} +
  colox-message--palette-{palette} + colox-message--variant-{variant} +
  exiting 类、hover pause/resume、children 注入。共享外壳。（**已无**
  swap-out / was-swapped 类——透明度换场退役。）

- **`cdk/utils/id.ts`**：`createId(prefix)` 通用唯一 ID 生成器（毫秒 +
  同毫秒序号 + 前缀计数）。

- **styles/**：viewport.scss（容器 fixed/absolute + 六槽绝对定位 +
  deck 堆叠/计数 chip/收起 chip）、shell.scss（palette→私有变量映射 +
  variant 面料 + 图标色）、animation.scss（colox-toast-enter/exit +
  colox-notify-enter/exit keyframes + **`colox-message-zoom-in` zoom
  进场 keyframes（scale 0.92 + fade，motion-normal/ease-out，
  挂载触发）** + 触发类 `.colox-toast__content--zoom` /
  `.colox-notify__body--zoom`（内容结点以 contentVersion 为 key，每份
  新载荷落位即重挂重播——update 与替换全部换字反馈；挂载触发无相位类
  无定时器，reduced motion 由令牌门控）。
  **容器上不再有任何 opacity 过渡**（was-swapped/swap-out 规则已删）——
  zoom 进场是换字的唯一反馈，没有「旧词呼吸着退场」的余地）、
  index.scss barrel。消息 pill/card 的**深度走设计语言 `--colox-shadow-md`
  token**（浮层 md 档，Select/DatePicker popup 同档——两面的纵深本来
  同款）在各自 kind 的 styles/toast.scss 与 styles/notify.scss。

## Toast 消费面（`src/toast/`）

轻量单行提示（antd message 型）。`ToastFactory extends MessageFactory`
（构造 registerRenderer('toast', ToastItem)），面常量归 `constants/`
（`TOAST_DEFAULT_POSITION='top-center'`、`TOAST_DEFAULT_STRATEGY='single'`、
`TOAST_DEFAULT_VARIANT='plain'`），类型归 `types/`（`ToastOptions` +
`ToastActions`——**用户拍板改名**：call options 由 `ToastCallOptions`
改为 `ToastOptions`、方法面由 `ToastNamespace` 改为 `ToastActions`），
工厂模块 **`api.ts` → `factory.ts`**（用户拍板，命名随内容——该文件
就是 ToastFactory）。`ToastActions` 纯方法命名空间：info/success/warning/error(content,
{ scope?, position?, palette?, variant?, strategy?, showIcon?, closeable?,
duration?, key?, data?, onClose? })/custom/update/dismiss。
`ToastItem` =
MessageBox + colox-toast pill（bg-default、radius-lg、**深度 =
`box-shadow: var(--colox-shadow-md)` 设计语言浮层档**（用户拍板
「shadow 样式走设计语言」，弃 kind 私有 rgba + filter drop-shadow）、
20px 图标（`showIcon` 门控，MODE_ICONS[entry.mode]）、content（**以 contentVersion 为 key +
zoom 进场类**——update/替换落位重挂重播）、`closeable` 门控的 IconButton muted 关闭钮；图标带共享
`colox-message__icon` 类让外壳调色）。无 title、**无 action**——round 14 起
Notify 也不持有 action 槽（消息系统两档都只报告不索求决策），自造交互走
content/`Toast.custom`（任意 ReactNode）。

## Notify 消费面（`src/notify/`）

带标题卡片（antd notification 型）。`NotifyFactory extends MessageFactory`
（构造 registerRenderer('notify', NotifyItem)），`NOTIFY_DEFAULT_POSITION=
'top-right'`、`NOTIFY_DEFAULT_STRATEGY='stack'`、`NOTIFY_DEFAULT_VARIANT=
'plain'`。`NotifyPayload`（title/content/mode/palette/variant/duration/key——
**mode 旧名 type**），`NotifyActions` 纯方法命名空间：
info/success/warning/error
(payload, { scope?, position?, strategy?, showIcon?, closeable?, data?,
onClose? })/custom/update/dismiss——**call options 与 Toast 全对齐**
（chrome 两门 + 生命周期两轴，round 14 对齐）。
`NotifyItem` = MessageBox + colox-notify 卡片（`showIcon` 门控的 mode
图标 + title/content（contentVersion 重挂 + zoom 进场）+ `closeable`
门控的关闭钮；图标带共享
`colox-message__icon` 类；**无 action 槽**——round 14 随整体移除，卡片也
只报告不索求决策；**卡片深度同 Toast 走 `--colox-shadow-md`
设计语言档**——两面的纵深本来同款）。

## 入口注册

`src/index.ts` 按字母序 export './toast'、'./notify'（modal 后 notify 前
positioner）+ 文件尾 `export { MessageViewport } from './cdk/message'` +
type MessagePosition/MessageMode/MessageViewportProps。vite 多 entry 加
notify、package.json 加 `./notify` 子路径（modal 后 popover 前）。

## 边界

- **scope 路由**：无 scope = root（屏幕宽 fixed 容器）；`{ scope }` 路由进
  命名容器；`positioning="absolute"` 钉在最近定位祖先（panel/card 内）。
- **一容器双面**：共享 scope 表是机制核心——toast/notify 同容器各占自己的槽。
- **single 作用域**：按槽位（position）+ kind 类型——同槽新 toast 替换旧 toast，
  不同 position / 不同 type 互不干扰。
- **deck 只折叠 notify**：同槽 notify > 3 才折叠；toast（默认 single）天然
  一槽一条，stack 时照常堆叠不折叠。
- **范围外**：嵌套 viewport（scope 名重复归最后挂载者）、可拖拽、多实例
  均为范围外。
