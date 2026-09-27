# Notify 面（消息系统卡片档）

## 职责

**消息系统的带标题卡片档**（antd notification 型）——Notify 是纯方法
命名空间 `Notify.…`，配合消费方挂载的 `<MessageViewport>` 容器工作。
与 Toast 共享同一 scope 注册表：**一个容器同时容纳 toast 与 notify 条目**
（各占自己的槽）。基座（scope 注册表/store 状态机/渲染器注册/容器组件）见
[message.md](message.md)。

## 结构

- **`api.ts`**：`NotifyFactory extends MessageFactory`——构造时
  `registerRenderer('notify', NotifyItem)`；`NOTIFY_DEFAULT_POSITION =
'top-right'`；`NotifyPayload`（title/content/type/action/duration/key）；
  方法 info/success/warning/error(payload, { scope?, position? })/
  custom/update/dismiss。导出 `notifyFactory` 单例。
- **`index.ts`**：`Notify` 命名空间对象（NotifyNamespace 接口，全部转发
  notifyFactory）+ 类型 re-export（NotifyId/NotifyPosition/NotifyPayload/
  NotifyCallOptions）。
- **`notify-item.tsx`**：`NotifyItem`——MessageItemShell + colox-notify 类
  - TONE_ICONS + title/content + 单个 action（Button subtle，点击后自动关）
  - 关闭钮。
- **styles/notify.scss**：卡片——bg-default、radius-lg、drop-shadow、tone
  图标着色。

## 使用

```tsx
<MessageViewport />            {/* root 容器（默认 scope/fixed） */}
<MessageViewport scope="panel" positioning="absolute" />  {/* 容器内 */}

Notify.info({ title: 'Saved', content: 'The file is on disk.' });
Notify.error(
  { title: 'Upload failed', content: 'Too large.', action: { label: 'Retry', onClick } },
  { scope: 'panel' },
);
Notify.dismiss();             // 该 scope 全部
```

## 边界

- 卡片档职责：标题 + 内容 + 单个 action（撤销/重试语义）；多动作是对话框
  职责。action 点击 = 确认完成 → 自动 dismiss。
- 默认槽 `top-right`；六位置相对容器盒。
- 生命周期/退场/共享外壳/scope 路由全部归 cdk/message 基座。
