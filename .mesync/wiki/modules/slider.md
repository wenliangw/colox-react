# @colox/react · Slider 组件

## 模块身份

单键数字值选择控件：真 `<input type="range">` 即控件本体，样式绘制在原生控件上（appearance:none + 引擎伪元素），刻度行（marks）为流内显示层。表单语义（值/键盘/焦点/FormData）零成本原生。

## 文件结构

```
src/slider/
├── index.ts                          # 公共面：Slider + 类型 + variants
├── slider.tsx                        # 组件实现（原生 input + 进度变量 + marks 层）
├── types/
│   ├── component.ts                  # SliderProps（继承原生属性，收窄 value 类契约）+ SliderChangePayload + SliderRef
│   ├── utils.ts                      # ResolveSliderMarksParams + SliderMarkItem
│   └── index.ts
├── utils/
│   └── resolve-slider-marks.ts       # marks 记录 → 定位条目（值排序、百分比、edge 吸附提示）
├── variants/
│   ├── palette.ts                    # 六族 palette 类映射
│   ├── size.ts                       # 四档 size 类映射
│   └── index.ts                      # sliderVariants（cva）
├── styles/
│   ├── base.scss                     # 条纹渐变 + 引擎伪元素 + marks 层 + disabled
│   ├── palette.scss                  # 私有变量模板接线（--colox-slider-palette-{solid,muted} 六族）
│   ├── size.scss                     # 四档级高度/尺寸
│   └── index.scss
└── _tests/
    └── slider.test.tsx               # 22 个测试（见下）
```

## 公共 API

- **`Slider`**（forwardRef；`SliderRef = HTMLInputElement`，ref 指向原生 input）。
- **`SliderProps`**：继承 `InputHTMLAttributes<HTMLInputElement>`，`Omit<'size'|'type'|'value'|'defaultValue'|'onChange'>` 后自有面：
  - `size?: 'xs'|'sm'|'md'|'lg'`（md 默认）：同源家族四档（Token 行高 24/32/40/48）。
  - `palette?`（primary 默认）：六族 —— primary=brand / gray / info=blue / error=red / warning=orange / success=green。
  - `value`/`defaultValue?: number`：受控 / 未受控数字值。与原生 `string|number` 语义不同：**滑块值契约收窄为 number**。
  - `min`/`max`/`step?: number`：原生 span 边界/步进，**也收窄为 number**（原生 `string|number` 不符合数字值契约）。
  - `marks?: Record<number, ReactNode>`：刻度行。键 = 刻度值（沿线定位），值 = 标签（`null`/`false` 只画点）。**纯显示层**：step 语义未被 marks 触碰（不抄 antd 隐式吸附）。edge 规则：第一/最后刻度向内吸附对齐（首条左对齐、末条右对齐）。
  - `onChange?: ({ event, value }) => void`：**自造事件面**。event = 原生 `ChangeEvent<HTMLInputElement>`（propagation/焦点面真实性），value = 已提交数字（库替消费方解析）。
  - 其余原生属性（aria-label、aria-valuetext、id 等）经由 `...rest` 落到 input。
- **`SliderRef = HTMLInputElement`**。

## 形态与渲染（重要）

- **基底 = 真 `<input type="range">`**：用户经中文与自定义能力讨论后确认。原生 range 的值为 **string**（`'42'`）——这就是自造事件面的动因：数字值契约的消费方不该背 `valueAsNumber` 的啰嗦。InputNumber 将来同构同一模板（事件面先例）。
- **进度条绘制**：WebKit 路径 —— input 自身不绘图、只承 hit 区（padding-block 撑满行高 + `background: transparent`），条纹渐变画在 **`::-webkit-slider-runnable-track` 伪元素**上（档高 + radius-full = 正圆胶囊头，progress 变量 inline 注入 input、伪元素继承自定义属性）。**条纹不能画在 input 背景 + background-clip: content-box**：radius 只裁 border 边，content-box 是方角——首版两端是尖的（用户指正），改到 track 伪元素后胶囊头成立。Firefox 路径 —— `@supports (-moz-appearance: none)` 走 `::-moz-range-progress` 伪元素（自带已走填充，track 未走段 + progress 已走段各带 radius-full 胶囊头）。禁用/跨引擎注意：禁用态统一把条纹拍平为 `bg-disabled`、thumb 圈换 `border-disabled`（FF 下 progress 清空 transparent，免得残色）。disabled 复写只给 track 伪元素背景色，input 本身保持透明。
- **thumb = 白底 + palette solid 描边圈 + shadow-sm**（圆角满圆；xs=12/sm=16/md=20/lg=24 取自 --colox-size-3/4/5/6）；**focus-visible = palette muted 2px 环**（叠加 thumb 影——焦点指示不是动作反馈，控件默认 outline 移除，焦点指示唯一落到 thumb 环）。
- **轨道几何**：竖条纹随档走 spacing 阶梯 **4/6/8/10**（spacing-1/1-5/2/2-5，改档定案见决策「track 高度随档阶梯」——初稿 4px 恒定被用户目视否定：「size 只调了 thumb 没调 track」+「高度保持整体一致」）。实现形态：档类声明私有变量 `--colox-slider-track`，**padding/thumb 居中/条纹高/FF track+progress 高全由该变量推导**（padding-block = (行高−track)/2 即 10/13/16/19，margin-top = (track−thumb)/2 即 −4/−5/−6/−7），改档高一处声明其余自动对齐。padding-block inset 让 hit 区整行为点击区域（padding 是盒子的一部分），条纹只画在 track 伪元素上（input 背景透明）。**marks 层按档显式高度**（点 2px + 间距 2px + 档行高 = 各档 line-height token + 2×spacing-0-5）：刻度/标签全绝对定位，绝对定位子项不撑容器——首版零高被浏览器探针抓出标签悬出布局流压盖下一节（correction new-component #11 的前科来源）。**labels 不自动避让**：相邻文字刻度的间距由消费方留出，密集标签会相撞（首版演示 16/26/30°C 标签互相压住被用户指正）——文档示例改两端标签 + 中间裸点的形态。
- **六族 palette 私有变量模板**：与 Switch 同一接线 —— 类声明 `--colox-slider-palette-solid`/`-muted`，base 绘制读变量，品牌 fallback 在 `.colox-slider` 根（class-level vars）。只染**已走条纹**，未走段/刻度/禁用保持中性面料（家族常态）。
- **disabled**：根修饰类 `.colox-slider--disabled` + 原生 disabled；条纹失去进度分割（单平底 bg-disabled，值的位置只有 thumb 可读——同 Button/Checkbox 面板语义）。

## 状态与测试

`_tests/slider.test.tsx` 共 22 个测试覆盖：4 档 size 类与 md 默认、6 族 palette 类与 primary 默认、input type=range / 原生 min/max/step 默认值 / ref 指向 input / aria-label 透传 / 样式与类名挂根 / 禁用（原生 disabled + 根修饰类）、受控 value → input.value + 进度变量 60%、未受控 defaultValue + 初始进度变量 30%、onChange 载荷 `{ event, value }`、工具场景（min==max 空 span 时进度为 0%）、marks（位置着色 style left %/空标签裸 tick/edge 吸附类/单 mark 无吸附/无 marks prop 零 marks 层）。

## 构建·门禁

- 组件多入口 `@colox/react/slider` → `dist/es/slider.js` + `dist/cjs/slider.cjs` + `dist/types/slider/index.d.ts`；package.json `./slider` 子路径。
- 组件级 gate：全部 348/348 测试、`pnpm typecheck`、eslint、`pnpm build`（dist/style.css 含滑块样式）。docs/preview 独立构建（theme 构建先行）。

## 已知边界与扩展点（v1 留白）

- **marks 是显示层**：不提供 antd 式隐式吸附（step=null 反按 marks 走位）；将来若用户裁决再加。
- **双键 Range、垂直 slider、拖尾 onCommit、invalid** 均不在 v1；invalid 由用户拍板不带——将来若支持，extension point 为 aria-invalid + 家族红通道，走 Switch 级补齐。
- **RTL 方向梯度**：WebKit 梯度画线未做方向感知（离轴平移需反算做镜像；v1 不特殊处理）。
- **Firefox 分支未机器验证**：本机 playwright 只装 Chromium（无 Firefox），`::-moz-range-*` 分支留用户目视（FF 天然有 progress 伪元素 + thumb 自居中，风险低）。

## 浏览器探针收据（Chromium headless + 像素采样）

- thumb 垂直居中：xs 中心 12=24/2、md 19.5≈20、lg 24=48/2——分毫不差。（此收据为 4px 恒定时所测；改档阶梯后居中公式不变——margin-top = (track−thumb)/2 对每档成立，已按产物 CSS 核对 padding 10/13/16/19 与 margin −4/−5/−6/−7。）
- thumb 横位：值 40% → 中心 ≈144-145px/360px，品牌描边环 2px 可见。
- 条纹渐变：已走段品牌色 / 未走段 bg-muted，分界线 = progress 变量位置。
- disabled：条纹拍平 bg-disabled，thumb 白底 + border-disabled 环 @60%。
- marks：8 个刻度点 x 坐标与 16%/18%…30% 理论位置误差 ≤1px；容器高度 26px（md）。
- 教训：`getComputedStyle(el, '::-webkit-slider-thumb')` 在此环境不可靠（返回 input 本体尺寸），几何验收必须像素采样。

## 所属决策链

- Slider 六问对齐（词形 value/defaultValue + min/max/step 原生 / onChange {event, value} / v1 marks / invalid 不带 / palette 六族 / 几何草案）→ `Slider API 定案` 决策节点。
- track 高度 4px 恒定 → **随档 4/6/8/10**（用户目视否定后三候选选 A）→ `track 高度随档阶梯` 决策节点（supersedes 上一节点）。
- 事件面边界变化：**叶子组件首次出现非透传自造事件面**（此前规则 「叶子 onChange = 原生透传槽」对数字值控件失效，用户拍板「自造 { event, value }」）。Checkbox.Group 的组级先例在「自造面」侧；现在数字值叶子也有了这个面。InputNumber 预期同构。**（后续收敛：该例外已作废——Input/Textarea/Checkbox/Radio/Switch 单件也统一为 `{ event, value }`，全家族无透传槽，见 api-design 总则）**

## 当前状态

v1 已交付：组件 + 22 测试 + Storybook（Overview = Sizes/Palettes/Marks/Interaction/States 五区）+ docs 页 `docs/components/slider.mdx`（sidebar_position 9，Form 分类）+ wiki 组件地图行 + changeset。

接下来：InputNumber（与 Slider 共用事件面模板 + 数字值契约收窄的先例）。
