# Toast 面（消息系统轻量档）

## 职责

**消息系统的轻量单行提示档**（antd message 型）——消息系统重构后的
Toast 不再是组件（无 Provider/Viewport 双子件），而是 **纯方法命名空间**
`Toast.…`，配合消费方挂载的 `<MessageViewport>` 容器工作。基座（scope
注册表/store 状态机/渲染器注册/容器组件）见 [message.md](message.md)。

**默认 `strategy: 'single'`**（用户拍板）：toast 是轻量居中提示，频繁触发
堆叠会污染视口——同槽新 toast **原地替换**旧 toast（同一 DOM 节点、**即时
落位 + zoom 进场**——用户拍板「替换前的浅谷透明度过渡也移除，直接进行
update，然后 zoom 进场即可」：新词落位即以 contentVersion 重挂内容结点
播放 zoom（scale 0.92 + fade，motion-normal/ease-out，挂载触发），
**update 与替换同款、容器上没有任何透明度过渡**——无下潜、无浅谷、
不淡回），无重新挂载/位置跳变，一位置一条，且不区分 palette/variant；
`{ strategy: 'stack' }` 显式堆叠。隐形 patch（duration 等）即时应用不闪烁。

**渲染器 chrome 两门（用户拍板）**：`showIcon`（默认 true，false=纯文字
pill）+ `closeable`（默认 true，false=去角落 ✕，duration/dismiss 仍可关）。
**无 action 槽**（round 12 用户重估后移除）：3 秒自动消失的瞬时提示不应索要
决策——撤消/重试这类单决策是 Notify 档的存在理由（action 槽归它）；自造交互
走 `content`/`Toast.custom`（任意 ReactNode，自带样式与 `Toast.dismiss`
接线）。chrome 是**结构态非载荷**：
add/update/replace 一律即时切换——不骑换场、不重挂，只有文字走 zoom。

**data 透传 + onClose（用户指示）**：`data` 是不透明透传值（unknown），
store 原样保留；`onClose({ id, data })` 随「载荷终结」发**一次**——关闭
（✕/`Toast.dismiss`）、自动超时、dismissAll、原地被替换
（替换落位的同一刻发旧载荷的）；`Toast.update` 延续同一载荷不触发。场景：调用方
挂业务上下文（`Toast.error('Upload failed', { data: { file }, onClose })
`→ 关闭时知会「哪个 toast 没了」）。

## 结构

- **`factory.ts`**（用户拍板：`api.ts` 改名——命名随内容，该文件就是
  `ToastFactory`）：`ToastFactory extends MessageFactory`——构造时
  `registerRenderer('toast', ToastItem)`；方法 info/success/warning/error
  (content, { scope?, position?, palette?, variant?, strategy?, showIcon?,
  closeable?, duration?, key?, data?, onClose? })/custom/update/
  dismiss。导出 `toastFactory` 单例。默认值全部来自 `constants/`。
- **`constants/defaults.ts`**：面常量——`TOAST_DEFAULT_POSITION =
'top-center'`、`TOAST_DEFAULT_STRATEGY = 'single'`、`TOAST_DEFAULT_VARIANT
= 'plain'`（factory.ts 只消费不定义；主题命名文件随 TimePicker 先例）。
- **`types/api.ts` + `types/index.ts`**：`ToastOptions`（scope 路由 +
  位置/palette/variant/strategy/chrome(showIcon/closeable)/
  duration/key/data(透传)/onClose(终结回调)——**用户拍板从
  `ToastCallOptions` 改名**）与 `ToastActions`（纯方法面接口——**用户拍板
  从 `ToastNamespace` 改名**）；index 为 barrel re-export。显式类型目录
  按仓库惯例（input/time-picker/date-picker 同构）。
- **`index.ts`**：`Toast` 命名空间对象（ToastActions 接口，全部转发
  toastFactory）+ 类型 re-export（ToastOptions + ToastId/ToastPosition/
  ToastPalette/ToastVariant/ToastStrategy 别名——**已无**
  `MessageOptions as ToastOptions` 旧别名，update patch 直接用
  MessageOptions）。
- **`toast-item.tsx`**：`ToastItem`——MessageBox + colox-toast 类 +
  MODE_ICONS（`entry.showIcon` 门控，`MODE_ICONS[entry.mode]`）+ content（**contentVersion 为 key +
  zoom 进场类**——update/替换落位重挂重播）+ `entry.closeable`
  门控的 IconButton muted 关闭钮。图标带共享
  `colox-message__icon` 类（外壳调色）。轻量 pill：无 title 无 action
  （round 14 起 Notify 也移除 action——消息系统两档都只报告不索求决策，
  自造交互走 content/custom）。
- **styles/toast.scss**：轻量 pill——bg-default、radius-lg、**深度 =
  `box-shadow: var(--colox-shadow-md)` 设计语言浮层档（用户拍板
  「shadow 样式走设计语言」——弃 kind 私有 rgba 25,25,25,0.1 +
  filter drop-shadow，md 档与 Select/DatePicker popup 同档）**、
  20px 图标（几何）、content、close。**图标色/palette/variant
  面料归共享 shell.scss**，此文件只留面几何。

## 使用

```tsx
<MessageViewport />            {/* root 容器（默认 scope/fixed） */}
<MessageViewport scope="panel" positioning="absolute" />  {/* 容器内 */}

Toast.info('Saved.');                       // 默认 top-center、single、plain
Toast.info('Brand.', { palette: 'primary', variant: 'solid' });
Toast.info('Stacked.', { strategy: 'stack' });
Toast.info('Text-only.', { showIcon: false });       // 去图标
Toast.info('No ✕.', { closeable: false });           // 去关闭钮
Toast.info('Trace me.', {
  data: { file: 'a.md' },
  onClose: ({ id, data }) => cleanup(id, data),      // 关闭时发一次 { id, data }
});
Toast.info('In panel.', { scope: 'panel' }); // scope 路由
Toast.custom(<span>任意内容</span>);
Toast.update('key', { content: 'step two' }); // 即时落位 + zoom 进场
Toast.dismiss();                            // 该 scope 全部
```

## 边界

- 轻量档职责：单行提示、无 title **无 action**（3 秒瞬时提示不索要决策，
  自造交互走 content/custom）；带标题卡片走 [notify.md](notify.md)（同容器
  另一面——**round 14 起同样不含 action**，消息系统纯报告）。
- 默认槽 `top-center`；六位置相对容器盒（root = 屏幕）。
- **palette 默认随 mode**（info/success/warning/error），可覆盖到
  gray/primary；variant 四档 plain/subtle/solid/outline 默认 plain。
- **single 作用域 = 槽位 + kind 类型**：同 position 的 toast 互相替换，不同
  position / notify 不受影响。
- 生命周期/退场/共享外壳/scope 路由全部归 cdk/message 基座。
