# Loading（M5 增补件，Milestone 尾声追补）

内联忙碌指示器——**不确定进度（indeterminate）的装饰性动效符号**，说「正在进行中」。与邻居划界：**Progress** 管确定进度（百分比有值）、**Skeleton** 管占位（内容布局骨架）、Loading 只画动效不画值与布局。

## API

```ts
export type LoadingAnimation = 'spinner' | 'dots' | 'pulse';
export type LoadingSize = 'sm' | 'md' | 'lg' | number;

export interface LoadingProps extends HTMLAttributes<HTMLSpanElement> {
  animation?: LoadingAnimation; // @default 'spinner'
  size?: LoadingSize; // @default 'md'
  label?: ReactNode;
}
```

- **`animation` 三形态**（用户点名「也要有不同的 loading 动画」）：`spinner` 单弧转圈（虚线圆一段约 2/3 圈的长弧 + 圆线帽、dasharray `38 18.55`，整体匀速旋转）/ `dots` 三点波（缩放+透明度呼吸，逐点 1/3 周期错拍）/ `pulse` 波纹呼吸点（小实心核 + 两圈同心浅色**填充环**（面性，非描边线），无模糊，逐层依次呼吸、波纹向外传导）。**轴词 = `animation` 非 `type`**（用户先提 `animate` 动词形，我荐 `animation` 与 Skeleton 的 animation 轴（pulse/wave/none）同词同轴，用户拍板）——`type` 是家族「语义切换」词（Empty 场景、Alert 状态），动画轴切的是画法，语义不换。
- **`size` 三档 + 数字逃生舱**：sm 16 / md 24 / lg 32（`--colox-size-4/6/8`）+ 数字 = 精确 px。**只动指示器不动 label**——机制 = 指示器容器 font-size（图件全按 `em` 绘制，Empty 插图先例），数字尺寸走内联 fontSize（内联赢过类）。label 保持周边文字尺寸。
- **`label` 槽**：旁置可读文本 + 无障碍名来源（有 label 时根不设 aria-label，名字从内容来；无 label 时默认名「Loading」；显式 `aria-label` 压过两者）。
- **currentColor 继承**（用户拍板）：无 palette 轴——塞进 Button/彩色文本自动随色，改色消费方 CSS color，最小面。
- **a11y**：根 `role="status"` + `aria-live="polite"`（MessageBox 同款）；指示器整体 `aria-hidden="true"`（纯装饰）。
- **reduced-motion 门**（Skeleton 私有门先例同向）：`prefers-reduced-motion: reduce` 下不从死也不照转——spinner 转慢（800→2400ms）、dots 三拍并一级同拍呼吸、pulse 呼吸放慢（1200→2200ms）。指示器必须仍读得出来「还活着」。
- **无 page 无蒙层**（对齐轮用户砍掉）：页面级 fullscreen 形态「意义不大」被自砍（内联件放进任何 flex 容器已能表达块级场景）；antd Spin 式 children 蒙层包装无消费场景不进（DoD「不为猜测修 API」——要蒙层消费方自己组合）。

## 组成

```
src/loading/
├── loading.tsx        # 根：span host、LOADING_FIGURES 映射、size 折算、aria 面
├── types/component.ts # LoadingProps/LoadingAnimation/LoadingSize/LoadingRef
├── indicators/        # 三形态指示图件（词随组件：Loading 用 indicator 词表）
│   ├── spinner.tsx    # 单弧 svg（dasharray 38 18.55 ≈ 2/3 圈，圆线帽，常数转速线性）
│   ├── dots.tsx       # 三 span 圆点（em 尺寸 + nth-child 错拍）
│   └── pulse.tsx      # 三层实心盘堆叠 svg（外 r10 最浅 → 中 r6.5 浅 → 核 r3 实心，无间隙全填充）
├── styles/base.scss   # 根 inline-flex + gap、指示器 em 字号轴、私有时长变量
├── styles/animations.scss # 三 keyframes + reduced-motion 换配方
├── styles/index.scss  # @use 聚合（base + animations）
└── _tests/loading.test.tsx
```

- **`LOADING_FIGURES: Record<LoadingAnimation, () => ReactElement>`**——与 EMPTY_FIGURES 同法；`??` 缺省不适用（animation 必有默认 'spinner'）。
- **私有时长变量** `--colox-loading-duration`：三形态各挂一份（800/900/1200ms），主题可重钉循环节奏不动配方；dots 错拍走 `calc(var(--colox-loading-duration) / 3)`、`/ 3 * 2`。
- **样式细节**：根 `inline-flex + align-items: center + gap: var(--colox-spacing-2)`；指示器 `display: inline-flex + line-height: 1 + font-size: var(--colox-size-6)`（md 基线），sm/lg 类覆盖；dots `gap: 0.25em`、dot `0.25em²` 圆；pulse 三层实心盘堆叠（外最大先画、核最小后画，`fill` + fill-opacity 1/0.45/0.22，无间隙连续同心面），波纹 keyframe 只调 element opacity——均 em/相对单位，字号轴一拖全动。

## 测试

13 例：role=status + aria-live=polite / 默认 spinner + svg 存在 / 三形态切换（dots 三粒、pulse 实心核 + 两环）/ 指示器 aria-hidden / size 键类（默认 md）/ 数字 → 内联 fontSize 40px / label 渲染 / 缺省不渲染 / 无 label 默认名 Loading / 有 label 不设 aria-label / aria-label 压过 / className 合并 + 原生透传 / ref 到 host span。

## 变更

- 2026-11 用户点名「M5 里面再新增一个 Loading 组件」。对齐轮四问答：含 label 槽（拍板）、currentColor（拍板）、页面级「不做，意义不大」（用户自砍）、动画形态「spinner + dots + pulse，type 改 animate？」→ 我荐 `animation`（Skeleton 同轴）拍板。
- 2026-11 用户视觉验收「dots 没问题，spinner 和 pulse 需优化」：① spinner 单弧改**三段均分弧**（「两条边→三条边」，dasharray `13 43`→`13 5.85`）；② pulse 扩散雷达环改**实心柔边呼吸点**（「中间实心、边缘柔和、增加呼吸感」——径向渐变不透明核心 + 边缘淡出，整体缩放 0.85↔1.05 + 渐隐 0.75↔1 呼吸，弃 scale 0.55→1.3 淡出）；dots 不动。（随后被下一轮纠偏——三段弧是误读。）
- 2026-11 用户纠偏两处：① **spinner 我理解错了**——首版单弧没问题，只是弧长太短（用户以为 border 实现才说「三条边」）；回退单弧，dashary `13 5.85`→`38 18.55`（约 2/3 圈）；② **pulse 动画对了**，只微调静态形态——实心更小（核心 0.6→0.35）+ 外围光晕分层渐变（四 stop opacity 0.6/0.3/0.12/0 落下，读作有层次的晕而非单层硬边）。
- 2026-11 用户「spinner 没问题了，pulse 再优化」：**pulse 去模糊改离散三层**——① 不用模糊（弃径向渐变，改同心圆环）；② 实心再小（核 r=3）；③ 外围浅色圆环 + 最外围更浅圆环（内环 stroke-opacity 0.45 / 外环 0.22）；④ **呼吸不做整体呼吸，改逐层波纹**（核心→内环→外环依次错拍 1/3 周期 peak，亮度波向外传导，keyframe 只调 element opacity；静态层级填 fill/stroke-opacity）。spinner/dots 不动。
- 2026-11 用户「外围两层不要线性、要面性」：两圈环从描边线（`stroke` 圆）改**填充环（面性带状）**——evenodd 双圆 path 填实（内环 ro/ri 6.5/5、外环 10/8.5），静态层级从 stroke-opacity 改 fill-opacity（0.45/0.22）；波纹呼吸机制不变（keyframe 只调 element opacity）。核心与 dots/spinner 不动。（仍留了空白间隙，被下一轮修掉。）
- 2026-11 用户「没看到面性，实心到外围之间不该有空白间隙」：**pulse 改三层实心盘堆叠**——弃 evenodd 环带（留有间隙且面感弱），改为**三个实心圆盘从小到大叠放**（外 r10 最浅先画 → 中 r6.5 浅 → 核 r3 实心后画），fill-opacity 1/0.45/0.22，**无间隙连续同心面**（0→3 实心、3→6.5 浅、6.5→10 最浅）；波纹呼吸不变（各盘 opacity 错拍 1/3 周期，波向外传导）。
- 2026-11 用户「示例里只有灰色，多加些其他色值」+「其他动画效果也补颜色示例」：无 API 变更（currentColor 无 palette 轴已定案）——Storybook Colors 分区改为**三形态 × 五色矩阵**（`ANIMATIONS × COLORS` 双 map：spinner/dots/pulse 各配 brand/info/success/warning/error），docs 同步三排彩色示例：给 `<Loading style={{ color: 'var(--colox-color-{brand|blue|green|orange|red}-solid)' }}>` 即换色（currentColor 继承自 span host）。同步修正 story/docs 里 pulse 的旧描述（「呼吸环」「radar ring breathing outward」→ 波纹呼吸点 / solid core + two filled bands rippling）。
- 2026-11 用户「presentations 命名奇怪，Loading 里用的是 indicator」：图件目录 `presentations/` → **`indicators/`**（词随组件自身词表，不搬家族通用词）；仅 import 与文档同步，行为零变化。Empty 的 `presentations/` 当时不动。（后话：Empty 亦按同律改名 `figures/`，见 empty 轮。）

## 详见

- [tastes/api-design.md](../tastes/api-design.md)「指示器：动画轴与最小面」
