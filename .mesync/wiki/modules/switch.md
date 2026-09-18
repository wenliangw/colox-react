# Switch 模块

单行布尔开关——Checkbox 行契约的「toggle 兄弟」：**真 `<input type="checkbox" role="switch">` 即控件本体**（ref/name/value/键盘/焦点/事件全落原生，零 hand-roll、零 a11y 补偿），轨道与滑块是纯视觉外衣；`children` 即文案标签。

## 结构

```
switch/
├── switch.tsx            # label 根 > box（input 即轨道 + thumb overlay）+ 标签文案
├── index.ts              # 出口六符号：Switch / SwitchProps / SwitchSize / SwitchRef / switchVariants / SwitchVariants
├── types/
│   ├── component.ts      # SwitchProps（Omit 'size'|'type'）+ SwitchSize + SwitchRef——仅一层，无 hooks/controls/utils 层（单叶组件）
│   └── index.ts          # barrel
├── variants/
│   ├── size.ts           # 四档类映射
│   └── index.ts          # cva('colox-switch') + SwitchVariants
├── styles/
│   ├── base.scss         # 行契约 + 轨道面料（关/开/invalid/disabled/focus）+ thumb overlay + motion
│   ├── size.scss         # 行高 size-6/8/10/12 + 轨道几何律 2h−4 + 各档行程
│   └── index.scss        # @use base + size
└── _tests/switch.test.tsx  # 17 例：size / label / states / native contract
```

## 词形与语义（六问对齐）

- `checked` / `defaultChecked`（受控/非受控，Checkbox 同词形）；`onChange` 原生事件透传，新值在 `event.target.checked`——用户拍板词形时对 defaultChecked 有保留（「没有必要吧」），**保留**：原生属性 + 非受控初始开唯一通道 + Checkbox/Radio 同构 + Form 集成要它；若仍要砍一句话可移除。
- **真 input + role="switch"**（否决 antd button 路）：表单值零成本进 formdata，键盘/焦点/点击全原生。
- `children` = 标签文案（Checkbox 同构），无 children 不渲染 label span。
- 轨道内不带 ON/OFF 文字（xs 档装不下；扩展点 `checkedText/uncheckedText`）；loading 不带（扩展点）。
- `invalid`（aria-invalid + 红通道）；`disabled` 原生 + 灰通道；`name/value` 直通表单。

## 视觉

- **轨道即输入控件**（appearance:none 涂在 input 上——「控件即它自己」家族不变式），thumb 是 box 内 overlay。
- 关态 = `bg-muted` + 1px `border-muted`（浅底加描边——白壳上可见性课，同胶囊课）；开态 = `brand-solid`；invalid 未开红描边/红环、开了品牌回填（同 Checkbox 优先级顺序）；disabled 换 `bg-disabled`/`border-disabled`（开了也被灰掉）；focus-visible 品牌边 + 2px `brand-muted` 环。
- thumb：`bg-default` 白 + `shadow-sm`，inset `spacing-0-5`（2px），满圆角，`pointer-events: none`；:checked `translateX(行程)`。
- motion：`duration-normal` + `easing-out`（轨道 border/bg/shadow 三属性 + thumb transform）。
- **轨道几何律 2h−4**（h/w/thumb/行程全落 size token，无魔法值）：xs 28×16·thumb 12·行程 12（size 7/4/3/3）→ sm 36×20·16·16（9/5/4/4）→ md 44×24·20·20（11/6/5/5）→ lg 52×28·24·24（13/7/6/6）；行高 24/32/40/48（size-6/8/10/12）与 Button/Input/Checkbox 同源——switch 行与同档控件齐平。

## 测试

17 例：size 四档类 + md 默认；label 文案可访问名 + 无 children 无 label span；states（defaultChecked 原生透传、默认未开、invalid aria/修饰类、缺省非 invalid、disabled 原生 + 修饰类）；native contract（type=checkbox + role=switch、ref 指向内层 input、change 事件透传原样、name/value 表单转发、className/style 合并到根 label）。

## 出口

桶面六符号 + `@colox/react/switch` 子路径；css 并入单一 `dist/style.css`（cssCodeSplit: false）。无新图标——未动 @colox/icons。

## 待用户目视

轨道比例（2h−4）与四档尺寸观感、thumb shadow 力度、invalid-on 红色焦点环——storybook Sizes/States/Interaction 三区。
