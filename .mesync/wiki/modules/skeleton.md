# Skeleton 模块

## 定位

loading-placeholder 家族（M5 五件）——内容未就绪时占住布局格位的灰织物形状，内容抵达时零 CLS 跳变。四点家族纪律：

- **纯展示零状态**：无事件、无 `loading` 交换壳（antd 形态被否决）——「谁加载谁切换」是消费方的三目（`loading ? <Skeleton/> : <Content/>`），组件只画灰块。
- **装饰性诚实**：每件 `aria-hidden` 默认 true（不向读屏器撒谎——占位不是内容；加载播报归消费方 live region），`aria-hidden={false}` 显式逃生。
- **布局画盒子**：root 块**不设宽高**——放进 Grid/Stack 默认 stretch 填满格位（宽高都交给布局），`width`/`height` px 逃生舱管精确；Text 满宽胶囊、Circle/Button 自带成形（不吃布局宽度）。
- **持续装饰动画走私有变量 + 局部 reduced-motion 门**（Progress 同批 taste）：`--colox-skeleton-animation-duration: 1.5s` 私有、不走换场 motion token 三档——占位动效不是「状态间换场」而是连续装饰。

## API

```tsx
<Skeleton />                      // rect 根块：fill 格位 + width/height px 逃生舱
<Skeleton.Text />                 // 文本行：满宽胶囊，size sm/md/lg → 字号梯（xs/sm/md 读者档）
<Skeleton.Circle />               // 圆：size 档镜像 Avatar（xs 24/sm 32/md 40/lg 48）+ 任意裸 token 键（size="7" → 28px）
<Skeleton.Button />               // 按钮形：高度镜像 Button 四档（24/32/40/48），宽默认 size-16(64px) + width px
```

- `animation?: 'pulse' | 'wave' | 'none'`（默认 pulse）——共享轴：pulse 呼吸透明度、wave 掠过一条白抬升高光带、none 静止。三件同款。
- 尺寸面：Text/Button/Circle 各自档 + 逃生舱（Circle=裸键、Text/Button=width px、root=width/height px）。
- 不做：palette 轴（骨架是中性面）、rows 参数面（段落 = Stack 堆几行）、事件/Form。

## 实现结构

```
packages/components/src/skeleton/
├── skeleton.tsx             # SkeletonRoot（rect 块）+ Object.assign 挂 Text/Circle/Button（Badge 组合同构）
├── children/
│   ├── text/index.tsx       # SkeletonText（满宽胶囊行）
│   ├── circle/index.tsx     # SkeletonCircle（avatar 同源圆形足迹）
│   └── button/index.tsx     # SkeletonButton（控件轮廓）
├── types/                   # component.ts（SkeletonRef/Animation/AxisBase/Props）+ children.ts（三件 Props/Size）+ barrel
├── variants/                # animation.ts（共享轴类：colox-skeleton--pulse/wave/none）+ size.ts（三角档 + circle 裸键 @each 同源）+ index.ts（四 cva 成品 + VariantProps）
├── styles/                  # base（四块共享织物变量 + 各自几何）/ animation（keyframes + 共享修饰类 + 局部门）/ size（档位变量映射）/ index
└── _tests/                  # skeleton.test.tsx（17 例）
```

## 样式约定

- **共享修饰类骑根块通道**（Badge.Count 骑 `colox-badge--sm` 同例）：`--pulse/--wave/--none` 三档一套类全族共享——动画规则只写一次（animation.scss 群组选择器），部件的 size 类才走部件块（`colox-skeleton-circle--md`）。
- **织物共享变量群组作用域**：四块选择器在一组声明 `--colox-skeleton-surface: var(--colox-color-bg-muted)`（深浅主题都给「坐在真实内容之下」的织物）+ 私有时长变量（呼吸 1.5s、波 2s 各骑各的）；wave 高光带 = 白抬升双档 `color-mix(in srgb, white-900 45%/18%, transparent)`（亮核 + 软肩）——亮暗两主题同向更亮，无模式翻面。
- **wave = 柔光流动配方**（用户「扫光动效有点生硬，能否做成流动的那种效果」后柔化）：`::after` absolute inset:0 + **软钟形渐变**（transparent 0% → white-18% 30% → white-45% 50% → white-18% 70% → transparent 100%——两侧渐隐无硬停），`translateX(-100%→100%)` 关键帧配 **ease-in-out** 缓动、时长专属 `--colox-skeleton-wave-duration: 2s`（呼吸留在 1.5s）——硬边等速条带读成「行进的条纹」，软肩 + 缓动才读成「光从织物上流过」（起收都在盒外看不见，循环接缝隐形）；父需 `position: relative + overflow: hidden`（局部裁剪为了内带，容器高度不塌——块自带高度/布局拉伸）。
- **radius 直接给块**：rect 用 radius-md（卡片位）、Text/Circle radius-full（胶囊/圆）、Button radius-lg（控件自己的圆角）——不是 background-clip 伪圆角（Skeleton 无此历史包袱，Slider/Progress 配方精神不变）。
- **Circle 裸键通道与 Avatar 完全同源**：variants 里 `Object.fromEntries(sizeKeys.map(...))` 生成 `colox-skeleton-circle--size-<key>` 类、styles 里 `@each $key in tokens.$colox-size-keys` 映射 `--colox-skeleton-circle-block: var(--colox-size-#{$key})`——主题覆盖穿 token 流进来；档位 xs/sm/md/lg 别名字面同 Avatar。

## 测试

17 例（`skeleton.test.tsx`）：root（div 块/aria-hidden 默认 true 与显式 false/默认 pulse 与 wave/none 类/width+height px 内联/逃生舱压过消费方 inline style/className 合并 + 原生透传）；Text（默认 md+pulse/sm/lg 档/width px）；Circle（默认 md/三档/裸键 `size="7"` → `--size-7` 类/wave 轴）；Button（默认 md/三档/width px）。类名断言走 querySelector 选择器 + toHaveClass（Progress 同款测试面）。

## 变更

- 2026-11 Skeleton 首版交付（M5 五件）。用户四连拍：①家族含 `Skeleton.Button`；②否决 antd loading 交换壳（「是什么」澄清后按提案不做——纯展示纪律）；③`animation` 三档 pulse/wave/none（默认 pulse）；④root 默认 block 满宽（免宽 + px 逃生舱）。
- 2026-11 用户报「Animation 示例里面我没有看到示例」——demo 接线事故：root 免宽块裸塞 flex row，空盒 `flex-basis: auto` 宽度坍缩为零、三条 bar 全隐形（组件契约「布局画盒子」无误，demo 没给盒子）。Animation 区三条改 `Stack.Item grow` 等分列宽（story/docs 同改）；corrections/showcase.md 落第五前科「免宽占位件裸塞 flex row = 零宽空盒」。
- 2026-11 用户评「扫光动效有点生硬，能否做成流动的那种效果」——wave 配方柔化：硬边等速条带（35/50/65% 三停 + linear 1.5s）→ 软钟形渐变（白 45% 亮核 + 18% 软肩、两端零渐隐）+ ease-in-out + 专属时长 2s。流动感的两个来源：边缘硬度（软肩渐隐）与速度曲线（缓动），缺一即「行进条纹」。
