# @colox/icons

Colox 第一方基础图标包，`packages/icons/`。**图标库选择**：既非「自制全量图标库」（独立产品线规模）也非「开源库依赖」（视觉外包 + semver 耦合）——**SVG 组件源的第一方基础集**：图标是设计语言看得到的那张脸，库必须自己拥有（用户定调「组件库最少需要提供基础图标」）；源形式先由度量决定：stroke 1.5 在字体引擎里无法存在（font 只能 fill 轮廓），图标字体出局。

## 形态

- **SVG 组件源**：每图标一个 React 组件（箭头函数 forwardRef），**公共名 = `IconXxx` 前缀命名**（IconEye/IconChevronDown/IconX——碰撞成本定调：X/Eye/Search 与开源图标库及业务命名必撞，前缀让双生态共存零别名；「语义显性进名字」+ 「per-icon 命名导出」同时保住树摇，解掉「摇树 vs 语义」两难），文件平铺于 `src/icons/`（能力文件夹，文件名仍 kebab），成族几何住 `src/icons/geometry/`（chevron 单几何、eye 轮廓/斜线）——源与产物同构（将来 Figma 管线发射的也是 SVG 几何，链条后置、不推翻现有形态）
- **`IconBase` 内部契约基座**（`src/components/icon-base/`，**不进公共 barrel**）：24 viewBox / fill none / stroke currentColor / 1.5 round cap+join / 1em 默认尺寸（`size?: number` 显式 px 覆盖）/ focusable false + aria-hidden 装饰性默认——**设计语言契约集中一处**；props 展开在默认值之后（公共透传：size/className/a11y/原生 svg 属性全部经图标组件直下）
- **公共面单轨**：只出 `IconXxx` 命名导出——无 `Icon.Eye` 命名空间件（Object.assign 全量静态引用 = 失树摇）、无 `name` 字符串索引（同）、无双名出口；`IconBase` 不对外（自绘通道关闭：业务图形消费方全自备，插槽收 ReactNode）
- **树摇**：单 barrel entry + preserveModules 产物 + `sideEffects: false`——per-icon 模块输出（dist/es/icons/x.js + .d.ts），`import { IconEye }` 消费一枚进一枚（lucide barrel 同款机制），无子路径导出
- **零运行时依赖**：peer react/react-dom（>=18），无 theme 依赖（currentColor 继承宿主色——组件里即语义 token）
- 构建镜像 components：vite ES/CJS 双产物 + vite-plugin-dts → dist/types + exports "."

## 设计规范八条（README.md 公开成文 + spec lint 机器门禁）

1. **画纸**：24×24 viewBox，所有节点落整数网格（no half-pixel）
2. **笔画**：stroke 1.5、round cap/join——**几何换算锚**：1.5@24 在 16px 渲染时恰等效 1px，与组件边框观感同频
3. **拐角**：直角弯 r=2（= radii.xs token）、大弧 r=4（= radii.sm）——形语言直接挂设计语言半径族，不是口头承诺
4. **光学框**：所有笔画（含 bleed ±0.75）必须在 [2,22] 内容框内，与文字并排行高不打架
5. **角度**：斜线统一 45°/30° 系，杜绝孤儿角
6. **成对同源**：状态对/反向族由一张图派生——chevron 四向 = 单 d + rotate(0/90/180/270) 绕画布中心；eye-off = eye 轮廓 + 斜线换瞳孔。不画第二张脸
7. **命名**：文件小写连字符、公共导出 `Icon*` 前缀 PascalCase（IconEye；前缀承载「语义显性 + 防碰撞」，不是缩写）；方向后缀 -up/-down/-left/-right、状态后缀 -off
8. **变体**：基础集全 stroke；filled 有语义需求才进，不预筑

**机器门禁（spec lint，test/icon-spec.test.tsx，renderToStaticMarkup 断言，节点环境无需 jsdom，73 例）**：基座属性契约逐条断言 + 公共透传契约（size 默认 1em→显式 px、className/a11y 覆盖直下）；**几何锁**——渲染的 d 必须等于设计的 d（改图必挂测试 = 强制 specs 复核）；整数网格（d/cx/cy/r/transform 的数值 token 全整数）；显式节点 + 圆范围 ∈ [2,22]；每 icon 文档化光边界常量 ∈ 内容框（手推自设计，非测量）；成对同源断言（chevron 四向同 d 异 rotate、eye-off 含轮廓+斜线无瞳孔）。规范是契约、测试是门禁——挂 CI。

## 批次一（十枚样板）

chevron-right（族基准，r2 尖端）/down（rotate 90）/left（rotate 180）/up（rotate 270）、x（45° 双交线）、check（两段 45° 圆肘）、plus（轴正交）、eye（透镜 rx8 ry7 + 瞳孔 r3）、eye-off（派生 + 45° 斜线）、search（r7 镜 + 45° 柄埋入笔画）。

## 边界

- **份额与插槽**：Input/Button 的图标 prop 仍收 ReactNode（业务图形/品牌是消费方自备）；`@colox/icons` 提供基础成形容貌——《保持一致》的路径 = 消费方用本包
- **全量清单待批**：行为必然集 ~16 + 高频消费集 ~20 待用户裁剪；涉及输入框全部内置态（clear/eye/chevron/search 已在批次一）
- **视觉终审**：批次一已过用户肉眼评审（渲染 PNG + 与 16/24px 文字并排对照页，通过后删除）；后续批次同流程
- **版本**：进发布矩阵，前两位随 @colox/react（设计语言同频），patch 独立
- **发布前**：@colox/react 依赖它时（Input 批），icons 先于 react 发布；components 构建将其 external

## 文件

`src/components/icon-base/{index.tsx, types/index.ts}`（内部基座 + IconProps 含 size）、`src/icons/*.tsx`（10 图标平铺，导出 IconXxx）+ `src/icons/geometry/{chevron,eye}.ts` + `src/icons/index.ts`（barrel）+ `src/index.ts`（公共出口：全图标，无 IconBase）、`test/icon-spec.test.tsx`、`README.md`（规范公开成文 + 公共形态说明）、`vite.config.ts`（单 entry preserveModules 双产物 + dts）、`vitest.config.ts`（node env）、`tsconfig.json`（typecheck 含 test）/`tsconfig.build.json`（dts 仅 src）。
