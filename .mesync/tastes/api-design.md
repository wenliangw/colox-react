# API 设计品味

## size prop 一律表示视觉尺寸

组件库中 `size` prop 的语义固定为「视觉尺寸」，取值 `'sm' | 'md' | 'lg'`：

- `Button` 用 `size` 表示按钮尺寸。
- `Input` 用 `size` 表示输入框尺寸；当与原生 `<input>` 的 `size`（字符宽度 number）冲突时，用 `Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>` 覆盖原生属性，而不是改名或暴露原生语义。

将来做 `Select`、`Textarea` 等表单组件时保持一致：`size` 表示视觉尺寸；遇到原生同名属性冲突，优先用 `Omit` 覆盖。

来源：Input 组件新增时对 `size` 语义的取舍（见决策「Input size prop 语义」）。

## variant 是从设计语言推导的封闭轴

- 轴必须来自 Figma 真实状态；取值集合小且穷举；轴间正交（非法组合用 `compoundVariants` 显式声明）。
- 状态（disabled/loading/hover/focus）永远不进 CVA；色槽不混入形态轴（形态 × 语义色调是两条独立轴）。
- 不提供「用户注册新 variant」的 API：新 variant 走 issue/PR 进库（正向演进）。antd/MUI 同立场。
- 外部定制三层通道：① 主题变量覆盖（主通道）② className 尾部插槽（逃生舱，内部 CSS 永远单类特异性）③ recipe 导出（复用配方）。

## Recipe 双形态导出 + 用户 fork

- 每个组件在 `<component>/variants/recipe.ts` 导出双形态：`<component>Recipe`（**纯数据配置**，可合并/扩展/序列化）+ `<component>Variants`（cva 成品函数）+ `<Component>VariantProps` 类型。
- cva 函数是死的（配置已编译进类名拼接），只有数据对象能合并——所以数据是导出主体，函数是便利副产品。
- 使用方在 app 端 `ui/` 层 fork 官方组件：spread 官方 recipe 换 base/改默认/加自定义变体值；官方组件本体不开放换配方。
- 覆盖层级：L0 主题变量 < L1 官方 recipe < L2 用户 fork < L3 className 尾插。
- 配套 `extendRecipe(base, patch)` 工具（深合并 variants），消灭 fork 时的多层 spread 样板；只随有消费者的组件落地，不提前造。
- recipe config 永远是纯数据对象（无函数/闭包），保证可 spread、可序列化、可测试、可进文档。

## 用户侧主题配置（colox.theme.json，v1 已定案）

- 命名为 `colox.theme.json`（用户从 `colox.palette.json` 改拍为 theme：配置表达的是主题层而非仅是色板）。
- 编译模型走**变量链**（runtime var() 引用，非烘焙）：palette 导出为 CSS 变量、语义层引用 palette；配置编译产物是完整赋值的色板轴文件，双主题自动跟随；被用户认可的点：轻量支持多主题。
- **主题产物三文件布局定案**：palette.css（色板基线，主题无关，永远加载）+ light.css / dark.css（纯主题语义赋值，各自自包含）。演进史：早期为避免三文件把 palette 住进 light.css → 造成「只载 dark 不载 light 则语义全失效」的隐性存在约束 → 用户担忧使用方误解文件职责（把主题文件当可挑着加载的自包含文件），遂推翻早期的两文件否决、把 palette 拆分独立。属性轴选择器带 `:root` 前缀（0,2,0 稳压基线 0,1,0）→ 三文件任意加载顺序 + 打包器 CSS 重排都正确；加载契约收敛为「palette.css 永远在场，主题文件按需叠加」。
- **便利性用拼接产物实现，不用上帝文件**：用户嫌 3~4 行 import 后定案——build 期把四份单一职责文件串联成 `index.css` 聚合入口（同一份声明、零复制），使用方一行引入；颗粒文件仍各管一件事，加便利层不动职责层。拼接的安全前提（命名空间互斥 + `:root` 前缀特异性压基线）必须先论证再产出。
- 语义覆盖值语法定死两种：字面量 hex 或 `{ "palette": "gray/900" }` 引用（用户否决裸字符串自动识别）。
- 主题产物永远是完整赋值；覆盖在编译期合入。语义覆盖只到「语义槽」，派生靠 var 链自动重算。
- **brand = 独立语义组且动态**：编译期由种子生成器产出 brand 阶（写进定制色板轴），语义层 brand.* 是工程侧静态引用链（Figma 不拥有）；ColoxTheme 的 palette 轴切换整体替换 brand 阶变量 → 双主题全链重派生。默认 brand 阶是 indigo 阶的引用链（零视觉漂移）。组件层后续改吃 brand.*（Button primary 从 indigo 换出）。种子生成器保留。
- 多主题 = themes 块的轻量继承（extends + semantic 覆盖），编译成各自完整赋值文件；双轴正交（theme 轴 × palette 轴）。dark 的明暗切换走 attribute 轴。
- **scope: "media" v1 不做**（用户拍板；我的推荐同向）：属性轴已覆盖 JS 驱动的换肤，媒体轴对应「纯静态零 JS 跟随系统」的需求没有真实消费方，属猜测性接口；selector 只是编译期字符串装配，将来加 media 不破坏 v1 配置格式。

## ColoxTheme 运行时：组合式 API，props 不堆 Provider

- 形态：`<ColoxTheme>` 根组件，props 直接承载**单属主轴**（`theme` / `defaultTheme` / `palette`），仅**可选子组件**保留为 dot 形式：`<ColoxTheme.Storage />`、`<ColoxTheme.Breakpoints values={…} />`。
- 演进史：最早四个正交面全做 dot part（用户否掉全量 props API：「属性比较多时非常影响开发时的代码体验以及 props 无法合理的进行分类」）；后用户进一步定案——theme/palette 属性少、无在树中按需挂载的需求，收进根 props；Storage/Breakpoints 表达「可选能力」，保留子组件形态（挂载即启用）。
- 子组件通过 ColoxThemeContext 注册到根（context 直接提供注册能力，不设独立 hook），同类多实例 last-write-wins（和 CSS 源顺序覆盖同一直觉）。
- 回调不设（变化响应 = 订阅 context/store 值）；`'system'` 词汇进主题值域（声明与 setTheme 命令同词），跟随系统的状态机由 context 内部控制，使用方零实现。
- 运行时不做配置文件接线（colox.theme.json 纯编译期）：文件管编译产物、代码管运行接线。palette prop 的值即 output.name 轴名——人肉对齐的漂移风险已知并接受。
- 三轴事实源是 `<html>` 属性，React 层只做写入者+订阅器（模块级单例 store + useSyncExternalStore），不建平行状态。
