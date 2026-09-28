# Notify 面（消息系统卡片档）

## 职责

**消息系统的带标题卡片档**（antd notification 型）——Notify 是纯方法
命名空间 `Notify.…`，配合消费方挂载的 `<MessageViewport>` 容器工作。
与 Toast 共享同一 scope 注册表：**一个容器同时容纳 toast 与 notify 条目**
（各占自己的槽）。基座（scope 注册表/store 状态机/渲染器注册/容器组件）见
[message.md](message.md)。

**默认 `strategy: 'stack'`**——通知卡片可以多条并存；防视口污染靠
**fold 折叠**（用户四轮拍板，deck/牌堆两代退役）：同槽 notify 显示 > 2 条
折叠——最新卡可见 + **计数胶囊**（总数 + 清空✕）；积压卡停止渲染且**冻结**
计时（不自动删）；关可见卡 = **即时同位置 pop**（被关卡无退出动画立即
消失、次新卡原地补位 + 词面 zoom 进场——用户拍板「直接同位置更新，不要
再走退出动画」；**退出动画只属于最后一张**）；**折叠期间的新到卡同样
zoom 露出**（胶囊出现后的露出统一 zoom 语言），计数递减；剩最后 1 张时
恢复定时关闭、胶囊切换为**倒计时胶囊**（读秒）。可选
`{ strategy: 'single' }`
替换在槽内（同一 DOM 节点、**即时落位 + zoom 进场**——与 Toast 同机制，
无任何透明度过渡，见 [message.md](message.md)）。

## 结构

- **`factory.ts`**（用户拍板 `api.ts` 改名——命名随内容，该文件就是
  `NotifyFactory`）：`NotifyFactory extends MessageFactory`——构造时
  `registerRenderer('notify', NotifyItem)`；方法 info/success/warning/error
  (payload, { scope?, position?, strategy? })/custom/update/dismiss。
  导出 `notifyFactory` 单例。默认值全部来自 `constants/`。
- **`constants/defaults.ts`**：kind 常量——`NOTIFY_DEFAULT_POSITION =
'top-right'`、`NOTIFY_DEFAULT_STRATEGY = 'stack'`、`NOTIFY_DEFAULT_VARIANT
= 'plain'`（factory.ts 只消费不定义；主题命名文件随 TimePicker 先例）。
- **`types/api.ts` + `types/index.ts`**：`NotifyPayload`（title/content/mode/
  palette/variant/duration/key——**mode 旧名 type**，卡片档自带
  的「堆什么上卡」形状；Toast 无 payload 类型因其 content 是裸 ReactNode；
  **已无 action**——round 14 随 Toast 的移除一起退场，消息系统纯报告）、
  `NotifyOptions`（scope 路由 + position/strategy + **showIcon/closeable/
  data/onClose——round 14 与 Toast 的 call options 全对齐**，chrome 两门
  - 生命周期两轴；**由 `NotifyCallOptions` 改名，随 Toast 的「call
    options → options」同款**）与 `NotifyActions`（纯方法面接口——
    **由 `NotifyNamespace` 改名，随 Toast 的 `ToastActions` 同款**）；
    index 为 barrel re-export。显式类型目录按仓库惯例。
- **`index.ts`**：`Notify` 命名空间对象（NotifyActions 接口，全部转发
  notifyFactory）+ 类型 re-export（NotifyOptions + NotifyPayload + NotifyId/
  NotifyPosition/NotifyPayload/NotifyPalette/NotifyVariant/NotifyStrategy
  别名——**NotifyActions 不进公共面**，同 Toast 的 ToastActions）。
- **`notify-item.tsx`**：`NotifyItem`——MessageBox + colox-notify 类
  - MODE_ICONS（`entry.showIcon` 门控，`MODE_ICONS[entry.mode]`）+ title/content（contentVersion 为 key + zoom 进场）
  - `entry.closeable` 门控的 IconButton muted 关闭钮。图标带共享 `colox-message__icon` 类。
    （round 14 与 Toast 的 chrome 门控同构；已无 action 渲染块。）
- **styles/notify.scss**：卡片——bg-default、radius-lg、**深度 =
  `box-shadow: var(--colox-shadow-md)` 设计语言浮层档（与 Toast 同档）**、
  mode 图标（几何）。图标色/palette/variant 面料归共享 shell.scss。

## 使用

```tsx
<MessageViewport />            {/* root 容器（默认 scope/fixed） */}
<MessageViewport scope="panel" positioning="absolute" />  {/* 容器内 */}

Notify.info({ title: 'Saved', content: 'The file is on disk.' });
Notify.info({ title: 'Trace me', content: 'Done.' }, {
  data: { file: 'a.md' },
  onClose: ({ id, data }) => cleanup(id, data),   // 关闭时发一次 { id, data }
});
Notify.info({ title: 'Text-only', content: 'No icon.' }, { showIcon: false });
Notify.error(
  { title: 'Upload failed', content: 'Too large.' },
  { scope: 'panel' },
);
Notify.dismiss();             // 该 scope 全部
```

## 边界

- 卡片档职责：标题 + 内容报告件（round 14 起无 action 槽——撤销/重试
  等决定型交互是对话框职责，自造交互走 `Notify.custom`）。
- 默认槽 `top-right`；六位置相对容器盒。
- **palette 默认随 mode**；variant 四档默认 plain。
- **fold 阈值 = 2**（FOLD_THRESHOLD）：同槽 notify 显示 > 2 才折叠；最新卡
  可见 + 计数胶囊（总数，折叠态持续到清空——不进不出的积压冻结计时），
  关闭即刻同位置 pop（无退场动画、晋升卡 zoom；退场只属最后一张）、
  最后一卡恢复计时 + 倒计时胶囊。fold 只折叠 notify 类目，
  toast 不折叠。
- 生命周期/退场/共享外壳/scope 路由全部归 cdk/message 基座。
