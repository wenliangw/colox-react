# Progress 模块

## 职责

`@colox/react` 的**进度条家族**（M5 展示与反馈件）——纯展示（同 Badge）：**无事件面、无 Form 集成、无交互**，消费方从自己的 store 驱动 value。首个形态 `Progress.Linear`：水平进度条 = 轨道织物 + 填充条，受控长为提交的百分比（0–100）；**不给 value 即 indeterminate**——扫动的滑块块表达「进行中但无数字」。配套 `useProgressStrategy` 策略 hook：路由顶部进度条场景（自动由快到慢增长到 99% 停驻、完成时主动提交 100%）——**策略（调度钟）归 hook、展示归组件**，组件保持纯受控。

## 形态决定：命名空间家族

用户拍板「可以做 `Progress.Linear` 这样的 dot 组件，导出一个 `const Progress = { ... }` 即可」——**Progress 命名空间家族**：

- 容器不渲染，`const Progress = { Linear }` 字面量导出（`src/progress/index.ts`），后续 `Progress.Circular` 挂进同族。
- 否决了 antd 式 `type="line|circle"` 单组件多 type 轴（内部机制完全不同：div 宽度 vs SVG stroke-dasharray，不该伪装成 typeof 分发）和 MUI 式完全独立的 Linear/Circular 两组件（同族入口被拆散）。
- displayName = `Progress.Linear`（反映公开 API 形态）。

## API

```tsx
<Progress.Linear value={40} />                 // 确定态：填充 40% + 尾标签 "40%"
<Progress.Linear />                            // 不确定态：扫动块、无标签（无值可报）
<Progress.Linear value={4} format={(p) => `${p} / 5 files done`} />
<Progress.Linear value={60} palette="success" size="lg" showInfo={false} />
```

- **`value`**（0–100，可选）：数据词（antd/MUI/Mantine 同词）。缺省 = indeterminate。收值时信任契约无需 clamp（0–100 是契约；track `overflow: hidden` 天然裁掉溢出宽度）。
- **`palette`**（六族，默认 primary）：填充条颜色。成功/失败语义色由消费方显式给 `palette="success"/"error"`——**不做「100% 自动变绿」魔法，也不引入 antd 的 status 词**（status 是值之外的第二状态轴，palette 已表达色相）。
- **`size`**（sm/md/lg，默认 md）：条纹粗细——轨道高走 spacing 阶梯 4/6/8px（spacing-1/1-5/2），尾标签字号走字体阶梯 xs/sm/md（Slider 档位配方同构：档类声明私有变量 `--colox-progress-linear-track`）。
- **`showInfo`**（默认 true）：尾标签 `n%`——**只属于确定态**（不确定态无值可报、永不渲染）。`format` 转换词收到原始 percent 可返回任意 ReactNode。
- **转发原生属性**：HTMLAttributes 全透传（className 合并、aria-* 可覆盖）。

## useProgressStrategy：路由进度条策略（用户点名 hook）

用户提出「很多页面顶部有进入路由的进度条：**由快到慢自动增长到 99% 停止，完成时主动设置才到 100%**」，并要求「在 progress 下写一个 hook」——组件层面不动，策略下沉到 hook：

```tsx
const { value, start, done, reset } = useProgressStrategy({ cap: 99 });
<Progress.Linear value={value} />;
```

- **`value`**：当前策略值 0–100，喂给组件。
- **`start()`**：开钟自动增长——**指数逼近** cap（默认 99），每 200ms 走剩余距离的 10%（`TICK_MS`/`APPROACH_RATE` 常量）：离得越近步子越小，天然「由快到慢」；剩 <0.5 粘上 cap 停钟。确定性（无随机抖动）——曲线可测、每次一致。**提交值取 1 位小数**（`9.9 → 18.8 → 26.8…`）：裸浮点每 tick 小数多一位 → 标签变宽回流 track → bar 像素宽骤降读成「倒退」，1 位小数把读数收敛在 ≤「99.9%」的槽位内（bug 轮修复）。
- **`done()`**：提交完成：`doneRef` 置位 + 直设 100 + 停钟（消费方在此淡出）。
- **`reset()`**：停钟 + 清完成旗 + 归 0——**同 tick 内 `reset(); start();` 立即重玩可行**（完成旗用 ref 而非 value 判断，`done` 后 start 是 no-op 直到 reset；见测试「same tick」契约例）。
- **`cap`**：进度上限（默认 99）——**恒为取值天花板**：plan 里超过 cap 的 marker 被钳到 cap（该段时间照走，爬升提前到顶）、plan 终点低于 cap 时停在其末段 marker。
- **`strategy`**（可选，用户点名需求）：**分段自定义增长计划**——升序 `[marker, durationMs]` checkpoint 数组，**marker = 百分比字符串**（`'20%'`、`'40%'`、`'99%'`，内部 trim `%` 解析；TS 模板字面量类型 `` `${number}%` `` 编译期硬约束），与 cap 同一 0–100 刻度心智统一（用户两轮拍板：先否决 0–1 小数、再选定 `%` 字符串字面量）。每段从前一个 checkpoint 到该 marker 在 duration 内**匀速**走完（首段从 0 起）。例：`[['20%', 200], ['60%', 800], ['99%', 1800]]` = 0→20% 按 100%/s 冲刺、20→60% 按 50%/s 匀速、60→99% 按 21.7%/s 爬行——**示例选数时相邻段斜率要拉开**（原 `[['20%',300],['60%',600],['99%',1000]]` 前两段斜率相同 = 读成直线，用户反馈「没看出分段式增长」）；末段 marker 即停驻点（被 cap 钳制时停 cap）。纯函数 `planPercentAt(plan, elapsed, cap)`（值 = 已流逝时间的函数，逐段线性插值 + cap 钳制）——确定性、每拍可断言；到达总时长后在下一拍停钟驻停。速度曲线语义 =「前段短后段长」制造由快到慢的观感。
- **幂等**：running 中二次 `start` no-op；`done` 后 `start` no-op 直到 `reset`。
- 卸载清钟（effect cleanup）；park effect 在 value≥cap 停钟。
- 出处：`@colox/react/progress` 子路径 + 主 barrel（`export * from './progress'`）。

## 可达性

- 根 `role="progressbar"` + `aria-valuemin=0` / `aria-valuemax=100` 恒钉；`aria-valuenow` 只在确定态（不确定态宣布无数字）。
- track/bar 是纯盒子无文本——数字活在 live region 和尾标签里，不在 DOM 词语里。

## 实现结构

```
packages/components/src/progress/
├── linear.tsx               # ProgressLinear（forwardRef + determinate 判别 + 纯编排渲染体）
├── hooks/                   # use-progress-strategy.ts（路由进度条策略钟：默认指数逼近 / strategy 分段插值 + done/reset）
├── constants/               # strategy.ts（TICK_MS/APPROACH_RATE/SNAP_EPSILON/DEFAULT_CAP 魔法值收拢域内单一事实源）
├── index.ts                 # const Progress = { Linear }; + useProgressStrategy + 类型/变体出口
├── types/                   # component.ts（ProgressPalette/Size/Props/Ref）+ hooks.ts（strategy 三型）+ index barrel
├── variants/                # palette.ts / size.ts / index.ts（cva 成品 + VariantProps）
├── styles/                  # base（根行布局 + 私有变量 + track/bar/info 绘制）
│                            # palette（六族映射，Slider 配方：类声明变量、绘制规则读取）
│                            # size（三档轨道高 + 字体梯）/ animation（indeterminate 扫动）/ index
└── _tests/                  # progress-linear.test.tsx（18 例）+ use-progress-strategy.test.tsx（18 例，fake timers）
```

## 样式约定

- **填充条 = 自己的盒子**（corrections 第 12 条 Slider 配方的直系延续）：`--colox-progress-linear-bar` 高度即条纹高度、radius-full 才圆得起来——把填充画成 track 的 background-clip 会平方端。
- **track 职责 = 织物 + 裁剪**：未走段 `bg-muted` + `overflow: hidden`（扫动块与超额宽度都留在条纹里）。
- **palette 类只管私有变量**：`--colox-progress-linear-palette-solid`（六族 solid 映射，primary → brand），base 落 brand fallback——家族配方。
- **值跟随过渡 = 渲染平滑职责**（用户反馈「很卡，transition width 的过渡更丝滑」后补）：determinate bar 宽度加 `transition: width var(--colox-motion-duration-normal) linear`——驱动值常以离散步进到达（策略钟 200ms/tick、消费方 per-event setState），硬跳读成卡顿；过渡把阶梯拉平成连续流动。时长用 motion normal 档（与策略钟 tick 同为 200ms，相邻步无缝交接），easing 用 linear（曲线感来自值的步长收缩，不来自过渡的加/减速）；ride motion token 白得 theme 的 reduced-motion 归零契约（紧贴受控值、无动效）。
- **数值标签占固定槽**（用户逮住「增长过程中会倒退」的根因）：`[track(flex:1;min-width:0)][gap][info]` 行里标签每 tick 变宽 → track 被压缩 → bar 百分比没变、像素宽骤降 → 视觉倒退。修法三件套：策略值 1 位小数 + info `min-width: 5ch`（默认读数最宽形态「99.9%」）+ `font-variant-numeric: tabular-nums`（槽内不摆）。transition 保护不了父级回流造成的宽度变化——稳定槽位是唯一解。详见 corrections/sizing.md。
- **indeterminate 扫动 = 持续装饰动画**：不在换场三档（fast/normal/slow）语义里——动画时长是条自己的私有变量 `--colox-progress-linear-flow-duration: 1.6s`（keyframes `colox-progress-linear-indeterminate` from -100% → to 400% **单向扫过、循环跳回重入**，translateX 百分数相对滑块自身宽 25%——用户反馈「反复滑动的动画有点怪，应该是向一个方向的循环滑块」，单向循环是 classic indeterminate 形态）；因此 reduced-motion 门是**局部**媒体查询（把扫动停成 25% 静态驻点），注释说明为何不走中央 motion token 门（Alert 2393707c 的「组件只写 from/to 形态、机制共享在 theme」精神不变）。

## 测试

36 例。**组件 18 例**：value（填充宽度/aria-valuenow/默认标签）；indeterminate（无 value → 扫动类、无内联宽度、无 aria-valuenow、无标签）；live region（role + min/max 恒钉）；info（showInfo=false 省略/format 转换）；palette（六族映射 + primary 默认）；size（三档映射 + md 默认）；passthrough（className 合并 + 原生属性透传）。**hook 18 例**（fake timers 确定性步进）：初值 0；start 后增长且步长衰减（由快到慢）；恰停在 cap 不过头；自定义 cap；done 跳 100 停钟；reset 归 0 清钟；done 后 start no-op 直到 reset；**reset+start 同 tick 立即重玩**（doneRef 契约）；start 幂等单钟（timer count = 1）；卸载清钟；**永不走回头路**（50 tick 全链单调）；**分段计划 7 例**（逐段 marker 推进 / 到总时长停驻停钟 / **超 cap 钳到 cap 且时长照走** / **plan 终点低于 cap 停末 marker** / 全计划单调 / plan 中途 done 跳 100 / reset 重跑 plan）。

## 变更

- 2026-11 Progress.Linear 首版交付（M5 四件）。形态对齐一轮：用户拍板 Progress 命名空间家族（`Progress.Linear` dot，容器不渲染），否决 type 轴单组件（机制差异不伪装分发）与完全独立拆分；值面 value/palette/size/showInfo/format 按生态词直落，无 status 轴、无自动变色、无条纹诉求。
- 2026-11 用户提路由进度条场景（由快到慢自动增长到 99% 停、完成时主动 100%）并点名「在 progress 下写一个 hook」——交付 `useProgressStrategy`（策略归 hook、组件保持纯受控）；story 加 RouteLoading 交互例，docs 加 Route progress 小节 + 自动播放 demo。
- 2026-11 用户看 demo 反馈「进度条很卡，不如 transition width 过渡效果更丝滑」——determinate bar 加 width 过渡（motion normal 200ms + linear，与策略钟 tick 对齐无缝交接；reduced-motion 归零契约自得）。
- 2026-11 bug 轮：用户逮住「增长过程中会倒退」——根因 = 标签裸浮点每 tick 变宽回流 track 使 bar 像素宽骤降。修法三件套：策略值提交取 1 位小数 + info 固定槽（min-width 5ch + tabular-nums）+ 补「永不走回头路」单调性回归测试（29 例）。corrections/sizing.md 落条目。
- 2026-11 用户问「增长速率能否自定义」，给 `strategy` 分段计划形式并拍板实现：每段 checkpoint 在规定时长内匀速走完、末段终点即停驻点；hook 默认曲线不动，计划走纯函数插值（值 = f(已流逝时间)）保持确定性。测试 35 例（+6 分段），story/docs 补 segmented 示例。
- 2026-11 用户修 API（两轮连拍，至此 36 例）：① 单位统一——plan 的 percent 弃 0–1 小数，改与 cap 同刻度的整数 %，并最终拍板 **`'20%'` 字符串 marker**（内部 trim `%`，TS 模板字面量类型 `` `${number}%` `` 编译期硬约束）；② **cap 恒为天花板**——推翻「有 plan 就忽略 cap」：marker 超 cap 钳到 cap（该段时间照走）、plan 终点低于 cap 停末 marker，新增钳制/低于 cap 两用例。语义更直观：cap 是常量主词、plan 只说路径。
- 2026-11 用户逮住演示反效果：「segmented strategy 示例没看出分段式增长，反而稳定线性」——能力无误（测试逐段断言绿），是示例数撞平：`[['20%',300],['60%',600],['99%',1000]]` 前两段斜率相同（20/300 = 40/600 都是 66.7%/s）读成直线。换 `[['20%',200],['60%',800],['99%',1800]]`（100/50/21.7%/s 三段拉开），story/docs/roadmap/changeset 同步。corrections/showcase.md 落「示例数据掩盖能力（第四前科）」。
- 2026-11 交付前品味自查（用户「check 一下是否有违反品味规范的地方」）：① types/ 从单 index.ts 按层拆 component.ts + hooks.ts + barrel（规范「按能力层分文件」）；② forwardRef ref 显式具名 `ProgressLinearRef = HTMLDivElement`（BadgeRef 同例）；③ 策略魔法值（TICK_MS/APPROACH_RATE/SNAP_EPSILON/默认 cap 99）收 `constants/strategy.ts`（域内单一事实源）；④ `configRef` 渲染期写入改 effect 写入（React 惯例：ref 写入是副作用）；⑤ 组件解构 className 提到 format 前（普通属性先于方法型入参）；⑥ hook 模块头注释收敛 ≤3 行；⑦ index.ts 出口面补 `ProgressComponent` / `ProgressLinearRef`（Badge 出口同构）。测试 36/36、三构建、dist 类名 17 枚全在（三处同字符串核对）。
