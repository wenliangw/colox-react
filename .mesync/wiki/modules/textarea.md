# Textarea 组件

## 职责

带外壳的**多行文本输入框**：外壳（shell）承载全部视觉契约（边框、焦点环、尺寸、invalid/disabled 态，与 Input 同 token 同结构），内部是裸原生 `<textarea>`（ref、原生属性/事件全落于此）。与 Input 的差异：**高度是内容的事**——高度由内容驱动且**默认开**：`rows` 是最小基准、盒子随内容无限增长（打字永不出现滚动条），宽度永远容器驱动；`size` 只管字阶（四档与 Input 同源），无「档高」概念。**尺寸策略由库持有**：原生 `resize` 关闭，手动调高由**自绘 drag handle**（footer 右下角）承担。内置机制：`autoSize`（默认开，antd 词形 `boolean | { minRows?, maxRows? }`，`maxRows` 封顶后内部滚动）、`clearable`（footer 左侧清除钮，家族词表「有清除语义一律 clearable」）、`showCount`（footer 左侧计数）。导出面七符号：`Textarea` / `TextareaSize` / `TextareaRef` / `TextareaProps` / `TextareaAutosize` / `textareaVariants` / `TextareaVariants`。

### 四个世界（autoSize 状态机，用户四轮拍板）

| 配置                          | 打字               | drag handle                                                        | 滚动条                     |
| ----------------------------- | ------------------ | ------------------------------------------------------------------ | -------------------------- |
| **默认 / `true`**             | 无界增长           | footer 右下角常驻：拖拽抬高「最小高度」（地板 = 内容高，只升不降） | 永不（打字）               |
| `{ minRows }`                 | 抬升基准后无界增长 | 同上                                                               | 永不                       |
| `{ maxRows }`（可并 minRows） | 增长到顶           | **无 handle**（滚动条即溢出控制，手动与封顶冲突）                  | 封顶后内部滚动（定制样式） |
| `false`                       | 固定 rows          | 无 handle                                                          | 原生语义                   |

### footer 工具条（chrome 不遮字，全在流内）

无滚动条+无界增长世界里「最后一行永远贴底」，任何右下角悬浮件都会压字（clearable 右下角悬浮版被用户实测否定）。因此内置 chrome 一律住进 **shell 底部独立一行的 footer**：左簇 = **胶囊（pill）**——计数与清除文字同框、细竖线分隔（`count | 清除`），右端 = drag handle（原生角 hatch 图标）。footer 渲染条件 = `showCount || showClear || resizable`——默认世界 footer 常驻（只剩 handle）。count/clear/handle 三者都不开（`autoSize={false}` 且无 count/clear）时无 footer。**footer 节奏（用户三轮拍板）**：无 border-top、无 min-height——上下 `padding-block: spacing-1`（内容顶部距控件 4px、胶囊底部距外壳底 4px），`align-items: flex-end` 让 handle 与胶囊共底 4px 线；**横向**：起始侧 = `calc(档级 padding − spacing-2)`（胶囊内 padding-inline = spacing-2，其首字符与 control 文字列首字对齐——胶囊盒比文字列左探 8px；**xs 档补偿后为 0px：胶囊盒贴到壳边**，这是「8px 胶囊内边距 + 8px 正文缩进 + 严格对齐」的固有代价），末尾侧恒定 spacing-1 让 handle 贴右下角（用户先拍「四边 4px」→ 改判文字列对齐 → 再把胶囊内边距从 4px 放宽回 8px）。

**v1 不带（记为扩展点）**：`filterPattern`（Input 的三车道机制对多行文本是否成立待真实需求再挣——按需追加纪律）、`showCount` formatter（按需追加）、footer 扩展插槽（leading/trailing 被业务需求挣过再开）。**原生候选 `field-sizing: content` 记为演进点**：Chrome 123/Safari 26.2/Firefox 152 才全落地，2023 基线（Chrome 111/FF 113）缺口三年，基线前移后再迁移。

## 目录结构

```
textarea/
├── textarea.tsx            # 编排层：接 hooks + 调 resolvers + 组装外壳/footer JSX（无判别/状态逻辑）
├── index.ts                # 出口（七个公开符号，与 Input 同构）
├── hooks/
│   ├── use-textarea-clear.ts   # clearable 行为：写 DOM + 直通消费者 onChange（correction form-inputs 路径）+ onCleared 事后回调
│   ├── use-textarea-autosize.ts # 高度行为：直接测量 scrollHeight + input 监听 + ResizeObserver（按宽度过滤）+ 手动最小高度通道
│   ├── use-textarea-resize.ts  # footer drag handle：指针拖拽（窗口级 move/up）+ 键盘 ↑/↓ 步进一行
│   └── use-textarea-count.ts   # showCount 显示态：受控直取 value；非受控只在 input 监听同步「长度」（DOM 值仍是唯一真相）
├── utils/
│   ├── resolve-textarea-slots.ts   # 纯判别：showClear
│   ├── resolve-textarea-autosize.ts # 纯翻译：autoSize prop → { active, minRows, maxRows, resizable }
│   ├── measure-textarea-height.ts  # 共享测量：computed 指标（行高/padding/边框/box-sizing）+ 清高读 scrollHeight 再复原
│   └── format-textarea-count.ts    # 纯格式化：`n` / `n / max`（UTF-16，与原生 maxlength 同度量）
├── controls/
│   ├── clear-button.tsx      # TextareaClearButton：纯文字按钮「清除」（原生 button reset），胶囊内左簇第二位
│   └── resize-handle.tsx     # TextareaResizeHandle：IconButton 基座换装 IconGrip（原生角 hatch），aria-label="Resize textarea"，ns-resize 光标
├── _tests/                  # 7 个测试文件：state/size/contract/builtins/autosize/resize/footer（37 例）
├── types/                    # 类型契约全部集中（code-style 规范：按能力层分文件 + barrel）
│   ├── component.ts        # 公开契约：TextareaProps / TextareaSize / TextareaAutosize / TextareaRef
│   ├── controls.ts         # 内部控件契约：TextareaClearButtonProps / TextareaResizeHandleProps
│   ├── hooks.ts            # hook 契约：UseTextarea*Params×4 + TextareaValue（引 utils 的 Resolved*）
│   ├── utils.ts            # 工具契约：TextareaMetrics / ResolveTextarea*Params / ResolvedTextarea*
│   └── index.ts            # 内部全量 barrel（公开出口在组件 index.ts 选择性导出，内部名不漏公共面）
├── styles/
│   ├── base.scss              # 外壳契约（focus-within 环/invalid/disabled）+ 裸 textarea reset（resize:none + 定制滚动条）+ footer 行
│   ├── size.scss              # 尺寸档：字阶落外壳、padding-inline 落 control；footer 只有起始侧 calc（补偿胶囊自身 padding，文字对齐正文列）
│   └── index.scss             # @use base + size
└── variants/
    ├── size.ts              # 外壳尺寸类映射
    └── index.ts             # cva('colox-textarea', …) + TextareaVariants
```

组件内不放 stories（在 `apps/preview/src/textarea/textarea.stories.tsx`：sizes/autosize/footer-bar/states 分区）。

## 功能逻辑

### 外壳 DOM 契约

`div.colox-textarea > textarea.colox-textarea-control + div.colox-textarea__footer(> div.colox-textarea__pill(> span.count + span.separator? + button.clear?) + span.spacer + button.resize?)`
块类名 = `colox-textarea`；`className`/`style` 落外壳；`size` 类与 `--invalid`/`--disabled` 落外壳；`aria-invalid` 落内层 textarea。焦点视觉从 `:focus` 上移到外壳 `:focus-within`（焦点落在清除钮/handle 上时环不灭）。

### 裸 control reset（组件私有）

`.colox-textarea-control` 的 reset（无边框/透明底/font:inherit/`width:100%`/`padding-block: var(--colox-spacing-2)` 恒定 8px/`::placeholder` 用 text-subtle/`resize: none`）本组件私有——`cdk/input-control` 的 reset 是 `<input>` 专用（InputHTMLAttributes + webkit search 抑制），textarea 是第一个 textarea 形态消费者（rule of two：第二消费者出现才提权 cdk）。与 input 不同，裸 `<textarea>` 有 UA 首选宽度（~20 cols），必须显式 `width:100%` 填充外壳内容盒。**padding-inline 落在 control 自身**（size 档经后代选择器 `.colox-textarea--md .colox-textarea-control` 下发）而非外壳——这样滚动条贴在外壳边缘：预留式平台 gutter 渲染在元素边框内侧，若 padding 挂外壳，滚动条会「飘在 padding 里」（用户实测视觉丑）。

### 定制滚动条（平台一致，token 主题）

`.colox-textarea-control` 双引擎：`scrollbar-width: thin` + `scrollbar-color: var(--colox-color-border-muted) transparent`（Chrome 121+/Firefox）+ `::-webkit-scrollbar-*` 伪元素族（Safari 及老 Chrome）：thumb 8px、border-muted token 色、radius-lg 全圆、track 透明。Windows 原生（预留式粗灰 gutter）与 macOS overlay 统一成「细圆条、贴边、不吃 padding」；仅封顶世界（maxRows）出现，增长期 overflowY hidden 无闪动。

### autoSize（自定义 JS 实现，直接测量）

契约：高度随内容自动增长、`rows` 即最小基准（`minRows` 可显式抬升）、`maxRows` 封顶后内部滚动、宽度永不自适应。实现要点（`hooks/use-textarea-autosize.ts` + `utils/measure-textarea-height.ts` 共享测量）：

- **测量循环**：先把 inline height 清空恢复 rows 自然高 → 读 `scrollHeight`（含 padding、不含 border；border-box 目标高 = scrollHeight + 边框，content-box 加 padding+边框）→ 用实时 `line-height` 算 min/max（×rows + padding + border）→ 钳制写回。行高取 computed style，解析失败（样式未载）跳过钳制降级无界增长。
- **四个触发源覆盖全部写路径**：① 原生 `input` 监听（非受控打字与 IME）；② layout effect 挂 `value` 依赖（受控外部喂值）；③ ResizeObserver **只对宽度变化重测**（换行重排；高度变化可能是自己的写入或 grip 拖拽，全量回调会与拖拽互殴成环）；④ `adjust` 显式返回给程序化写路径（非受控清除走 `onCleared`）。
- **手动最小高度通道**：handle 拖拽直写内层 inline height；adjust 每次先比对 `el.style.height`——不是自己上次写入的值就判为「外部派遣」（grip 落笔）→ 记入 `manualMin` ref，从此 `base = max(内容, rows 基准, manualMin)`——显式用户尺寸永不被内容抹掉，打字持续在拖拽高度之上增长。
- **overflowY 状态**：增长期 `hidden`（无滚动条闪动）、封顶后 `auto`（内部滚动）。
- 关闭 autoSize 时清理 inline 痕迹（cleanup 复位 style）；默认开——不传 prop 即 active。

### drag handle（自绘，常用可访问）

`controls/resize-handle.tsx` + `hooks/use-textarea-resize.ts`。为何自绘：原生 grip 无法进 footer 行（UA 件位置由浏览器定）、不可主题化、焦点/键盘行为各家不一。实现：IconButton 基座（size="4" muted + IconGrip + `aria-label="Resize textarea"` + `ns-resize` 光标）；指针路径 pointerdown 记录起点 → 窗口级 pointermove 直写高度（`next = max(起点 + dy, 地板)`，地板 = 内容高——无滚动条世界内容必须完整可见，拖拽只抬不降）→ pointerup 收尾；`event.preventDefault` 压掉兼容鼠标事件防抢焦点；键盘路径 ↑/↓ 按实时行高步进（Tab 可达，箭头键可调）。拖拽高度经「手动最小高度通道」（见上）无缝进入 autosize 的最小值流。`disabled` 时按钮失能。**可用域**：resolver 的 `resizable` = `active && maxRows === undefined`——封顶/关闭世界不渲染（用户裁决：设了 maxRows 不支持 drag，仅默认/true/minRows 支持）。**图标心智**：IconGrip 用原生角 hatch（`M10 21 L21 10 M14 21 L21 14 M18 21 L21 18`，三条 45° 斜线向角收拢）——识别优先于语义精确，即使交互只调高度也沿用原生把手长相（用户拍板「和原生保持一致、降低心智」；上一版 ≡ 三横线被否）。

### 胶囊（pill）形态

footer 左簇是一个胶囊容器（`bg-muted` 浅底 + `border-muted` 1px 描边 + radius-999px；padding-block spacing-1、padding-inline spacing-2、**内部 gap spacing-2（分隔线两侧间隙与左右 padding 同值、均匀 8px 节奏）**、xs 字阶）——可辨认性两要素齐：描边给边缘定义、**胶囊内文字定档 gray-700（`--colox-color-gray-solid`，#707070，浅底上 ~4.5:1 AA）**；用户三轮诊断：先「不明显」→ 加描边，再「浅色背景和默认文字颜色太相近」→ 文字提 text-default，后「text-default 有点抢 textarea 的文字」→ 回落到 700 档（700 > 600 muted > 500 disabled > 400 subtle；900 正文 / 700 胶囊 / 600 以下不占浅底）。内部 = 计数 + 细竖线（border-muted 1px×12px，仅 count 与 clear 同开时）+ 清除文字钮。count 继承 pill 的 700；clear 是原生 button reset 的纯文字「清除」——静止继承（700）、hover 升 **text-error 破坏红**（red-600 #D21E30，浅底上 ~4.8:1——清除是破坏性动作，悬停警示；品牌色留给主操作与焦点环）、focus-visible 品牌焦点环、`onMouseDown` preventDefault 防抢焦点；**清除不用图标（IconX）**，clearIcon prop 撤销（未发布窗口内，无破坏性）——同一胶囊承担「元信息 + 动作」，分隔线是胶囊内语义边界。

### count（无滚动世界里的字数展示）

`showCount` + 原生 `maxLength`：有 maxLength 显示 `n / max`、无显示 `n`，UTF-16 码元（与原生 maxlength 截断同度量，永不打架）。受控直取 value 派生；非受控在原生 input 监听只同步「长度」（值本身不进 state——DOM 值仍是唯一真相），清除路径经 `onCleared` → `refresh` 重读。占 footer 左簇第一位，muted 色 + xs 字阶。

### clearable（胶囊内文字钮）

- 形态：纯文字按钮「清除」住在 footer 胶囊内计数右邻（细竖线分隔）——不悬浮（悬浮版被否：无界世界里末行贴底，右下角必定压字）、不用图标（用户拍板文字形式）、不走 IconButton 基座（纯文字，按钮 reset + 本站样式；胶囊承担容器视觉）。
- 交互：静止 text-muted / hover text-default / focus-visible 品牌环；`onMouseDown` preventDefault 防抢焦点；`disabled`/`readOnly` 下不渲染（resolver 判别下沉）。
- **清除行为 = correction form-inputs 路径**：受控时直构造事件形对象（`{ target, currentTarget, type:'change' }`）调用消费者 onChange，DOM 由 re-render 跟进；非受控先直写 DOM 再通知。不向 DOM 派发事件（React value tracker 对受控输入报旧值/吞事件，vitest 实测过的配方矩阵）。
- **事后联动**：清除是唯一不产生 input 事件、非受控也不产生 re-render 的静默写路径——`onCleared` 回调在组件层复合 `adjust()` + `count.refresh()`，DOM 写空后立刻重测高度、刷新计数。

### size 语义（家族契约延伸的第一个差异点）

四档与 Input 同字阶同 padding-inline（xs 12/16+spacing-2、sm 14/18+spacing-3、md 16/22+spacing-4、lg 18/24+spacing-6），**无 height 档**（`--colox-size-6/8/10/12` 不参与）——多行控件高度是内容函数，文档明说与 Input「同档同高」的字面差异；家族不变式是「同档同字阶同 padding-inline」。footer 起始侧随档 = `calc(档 padding − spacing-2)`：胶囊首字符与正文首字对齐（胶囊盒比文字列左探 8px，xs 档探满到壳边）；handle 端恒定 4px 贴右下角。

### 受控/非受控对称

`value !== undefined` 判受控（React 惯例）；与 Input 同构——清除统一走消费者 onChange 单一事件流，无内部 value 状态（计数只镜像长度，不镜像值）。

## 调用关系

- 依赖：`@colox/icons`（IconGrip，运行时依赖、vite 打包 external 保树摇）、`clsx`、`class-variance-authority`、`./styles/index.scss`、内部 `icon-button`（IconButton 基座）、全局 token 层。
- 被依赖：`@colox/react` barrel、preview 应用 stories、docs 页面。
- 新增 `IconGrip` 由本组件挣得（按需追加纪律）：原生角 hatch 三条 45° 斜线向角收拢（`M10 21 L21 10 M14 21 L21 14 M18 21 L21 18`，整数网格、尖角恰到 [2,22] 内容框边）；注册 spec lint（BOUNDS [9.25,21.75,9.25,21.75]）。

## 对外接口

- 导出 `Textarea`、`TextareaSize`、`TextareaRef`、`TextareaProps`、`TextareaAutosize`、`textareaVariants`、`TextareaVariants`。
- `TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>`（原生 textarea 无 `size` 属性、无 Omit 需要），新增：`size?`（'xs'|'sm'|'md'|'lg'，默认 'md'）、`invalid?`、`clearable?`、`showCount?`（默认 false）、`autoSize?: boolean | { minRows?, maxRows? }`（**默认 true**，false 关闭）。
- 保留扩展点（未建）：`filterPattern`、showCount formatter、footer 扩展插槽；原生 CSS `field-sizing: content` 记为演进点。
