# Toast 面（消息系统轻量档）

## 职责

**消息系统的轻量单行提示档**（antd message 型）——消息系统重构后的
Toast 不再是组件（无 Provider/Viewport 双子件），而是 **纯方法命名空间**
`Toast.…`，配合消费方挂载的 `<MessageViewport>` 容器工作。基座（scope
注册表/store 状态机/渲染器注册/容器组件）见 [message.md](message.md)。

## 结构

- **`api.ts`**：`ToastFactory extends MessageFactory`——构造时
  `registerRenderer('toast', ToastItem)`；`TOAST_DEFAULT_POSITION =
'top-center'`；方法 info/success/warning/error(content, { scope?,
  position?, duration?, key? })/custom/update/dismiss。导出 `toastFactory`
  单例。
- **`index.ts`**：`Toast` 命名空间对象（ToastNamespace 接口，全部转发
  toastFactory）+ 类型 re-export（ToastId/ToastOptions/ToastPosition）。
- **`toast-item.tsx`**：`ToastItem`——MessageItemShell + colox-toast 类 +
  TONE_ICONS + content + IconButton muted 关闭钮。轻量 pill：无 title 无
  action（那是 Notify 档的活）。
- **styles/toast.scss**：轻量 pill——bg-default、radius-lg、drop-shadow、
  20px 图标、content、close。

## 使用

```tsx
<MessageViewport />            {/* root 容器（默认 scope/fixed） */}
<MessageViewport scope="panel" positioning="absolute" />  {/* 容器内 */}

Toast.info('Saved.');                       // 默认 top-center
Toast.info('In panel.', { scope: 'panel' }); // scope 路由
Toast.custom(<span>任意内容</span>);
Toast.update('key', { content: 'step two' });
Toast.dismiss();                            // 该 scope 全部
```

## 边界

- 轻量档职责：单行提示、无 title/action；带标题卡片走
  [notify.md](notify.md)（同容器另一面）。
- 默认槽 `top-center`；六位置相对容器盒（root = 屏幕）。
- 生命周期/退场/共享外壳/scope 路由全部归 cdk/message 基座。
