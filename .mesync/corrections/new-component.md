# 新组件建设

## 改这些

在 `packages/components/src/` 下新建任何组件（族）。

## 必须检查

1. **variants/ 层必建**：per-axis `as const` 类映射（gap.ts 等）+ `variants/index.ts` 导出 cva 成品与 VariantProps 类型；组件根类走 `clsx(<cva>({...}), className)`，**不得**以 clsx + 模板串直拼修饰类（复杂度低不是豁免理由——Stack 首版以此被用户纠回）。
2. **类型单一事实源**：axis 联合类型从 VariantProps `NonNullable` 派生，`types/index.ts` 不手写联合。
3. **出口三件**：组件文件自身引用 `styles/index.scss`（且 index.scss 只 @use 聚合 base/各轴 partial，平铺类名——前科：Container/Stack 曾把各轴挤进单文件 index.scss，用户指出应与 Button 一致）；组件 `index.ts` 导出组件 + variants + 类型；`src/index.ts` barrel 加 `export * from './<name>'`。
4. **测试**：`_tests/` 覆盖默认修饰组、各轴映射、透传/className 合并。
5. **外围放行**：`apps/docs/docs/components/<name>.mdx`（sidebar_position 递增）引用组件前先 import（Button 漏 import 的前科）；`apps/preview/src/<name>/` 故事；eslint/prettier/组件与 app 构建全绿。
6. **mesync 落盘**：[wiki/modules/<name>.md](wiki/modules/stack.md) + overview 模块索引 + 决策/品味节点（涉 API 取舍时）。
7. **组合式组件走组合规范**（含 dot-part 子件时）：`children/<part>/index.tsx` 逐件文件夹、`context/index.ts` 建 context（默认 no-op 值 + 关联工具方法）、`hooks/use-<name>-context.ts` 受保护出口；子件**不得**裸调 useContext、工具**不得**散落平铺文件（resolve.ts 前科）——开工前对照 tastes/composition.md 六条与 ColoxTheme/Stack 参考实现。子件**禁止**拍平写在 `<component>.tsx` 里（Grid.Item 前科：写成单文件被用户纠回，「读过 Stack 先例」不豁免——须对照参考实现的完整目录树，不只抄 Object.assign 挂载写法）。
8. **渲染体只编排**：判别/翻译/样式装配下沉 utils 纯函数（`splitGap`/`withColumnsVariable` 形态），组件体内不堆 typeof 判别、三目装配、类型断言（`as CSSProperties`）——GridRoot 前科：gap 两段判别 + CSS 变量内联装配全在渲染体，被用户纠回。派生结果以**结果语义**命名，不强调行为来源（`resolvedColumns` → `columns`；入参要区分时用来源词 `columnsProp`/`styleProp`）；多余卫语句照 trust 契约删（resolver 对 null/标量本就直通，外面再裹 undefined 卫 = 没吃透工具契约）。Select 首版前科（第二例）：`isMultiple ? tags+input : hasControl ? input : button` 三目链、button 显示内容嵌套三目、隐藏 input 三目、optionRender 三目共四处全在渲染体——正确形态是拆 `children/{control,tags,clear-button,hidden-inputs,panel,option}/` 功能单元，主 JSX 只留 `{isMultiple && <SelectTags/>}` + `<SelectControl/>` + `<SelectPanel/>` 的纯组装（单元内部用 if/else 早退分支）。尤指 Select/DatePicker 这类「一个 shell 多形态器官」组件，形态判别会天然堆积——先拆单元再写渲染体。Select 二轮前科（同条目第三例）：单元拆完后渲染体仍堆三条「let + else-if 回退链」（inputValue/controlLabel/buttonDisplay）——多分支派生值同样下沉 resolver，用「单 if + return」逐级早退（`resolveControlLabel` 形态），组件体内只剩一次函数调用；`===` 横幅注释与 else 链一并清除。
9. **hook 住 `hooks/`，utils/ 只放纯函数**：拆出的状态/行为逻辑一律 `hooks/use-<behavior>.ts`（受保护出口 `use<Name>Context` 同住），`utils/` 只放无状态纯 TS 函数（判别/翻译/装配）——Input 初版把 `use-input-filter.ts` 放 `utils/` 被用户指正：「hooks 是 React 的独有应该单独维护」。因此拆 hook 后 utils/ 可能只剩一个 resolver（如 `resolve-input-slots.tsx`），不要为迁就旧路径把 hook 留在 utils/。DOM 子结构拆内部子组件（Input 的 `controls/` 内置按钮），根组件保持「接 hooks + 调 resolver + 组装 JSX」的纯编排形态（用户指正初版 Input：「让组件保持干净，语义清晰」）。export 前对照 tastes/composition.md 第 4–6 条。**参数类型命名**：组件参数 `Props`、函数/hook/resolver 参数 `Params`，禁 `...Args`（Input 首版三处 Args 被用户指正）。
10. **props 顺序三处同序**（接口 / 组件解构 / 调用点 `useXxx({...})`）：**属性块在前、事件回调最后**，事件块内部保持接口声明相对序（tastes/code-style.md）。Switch 交付时 onChange 夹在 checked/defaultChecked 与 disabled 之间被用户指正「onChange 事件应该写在属性之后，不要混着写」——Checkbox/Radio/Textarea/Input/两 Group 存量同病 + CheckboxGroupProps/RadioGroupProps 接口层一并归一；**新组件首版即三处同序，不得以「现有组件也这么写」为由照抄反例**。
11. **绝对定位子元素不撑容器高度**：定位层容器（刻度行、悬浮行这类「流内占位 + 子项绝对定位」的结构）必须显式给高度，否则容器零高、子项悬出布局流压盖后续内容——Slider marks 首版零高（刻度点/标签全绝对定位）被浏览器像素探针抓出标签盖住下一节；修复 = 按档显式高度（点 + 间距 + 标签行高）。自查：给「position: absolute 子项」当爹的容器，看它有没有非 auto 高度。
12. **radius 只裁 border 边，裁不到 content-box**：`background-clip: content-box` 的渐变永远方角——想画圆头条纹（滑杆轨道、进度条）就把渐变换到自己的伪元素/盒子上（4px 高 + radius-full = 胶囊头），不要指望 input 背景 + clip 组合出圆角（Slider 首版两端尖被用户指正）。disabled 等状态复写用 `background: <color>` 简写时，clip 会被重置为 border-box，会把整个盒涂成大胶囊——状态复写要么不用简写、要么紧接着再声明 clip。
13. **null 是数字控件的真实值——判定受控禁用 `??`**：`value: number | null` 词形下 `current = value ?? inner` 会把受控 null 当「未受控」吞掉（?? 对 null 穿透），空态显示残留旧值；判定与解析必须 `value !== undefined ? value : inner`（InputNumber 首版被测试抓出）。自查：数字/可空词形组件里所有 `??` 出现在 value 上的位置——受控空值是否被误吞。
14. **动手前通读 tastes/code-style.md 的控制流条目**：`if` 必带 `{}`（绝不 `if (x) return;`）+ 同类分支用单 if 折叠（if/else if 复制公共逻辑一律单 if + ||/方向三元消解）是**已记录品味**，InputNumber 首版仍写了 13 处单行 if + handleKeyDown if/else 重复（preventDefault + stepBy 双写），被用户指正「不认真」。自查：新组件写完 grep 一遍 `^if.*[^;{]$` 单行 if、若 if/else if 两个分支共享公共语句就折叠。

## 为什么

Stack 首版交付时跳过 variants 层，被用户指出偏离惯例：惯例一致性、用户 fork 通道、类型单源在单轴组件上同样成立。
