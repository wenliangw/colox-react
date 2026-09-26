# Colox React 项目速览

## 项目简介

Colox React 是一个模块化、可访问的 React 组件库 monorepo。目标是提供一套可主题化、可 tree-shaking 的 React UI 组件，配套 Storybook 预览和 Docusaurus 官方文档。

## 技术栈

| 领域              | 选型                                                               |
| ----------------- | ------------------------------------------------------------------ |
| 包管理 / monorepo | pnpm workspaces                                                    |
| 构建              | Vite（library mode）+ vite-plugin-dts（ESM/CJS + 类型 + CSS 打包） |
| 框架              | React 19 + TypeScript 5                                            |
| 样式              | SCSS + CSS（设计 token、组件级 `.scss`）                           |
| 组件预览          | Storybook 8（`@storybook/react-vite`）                             |
| 文档              | Docusaurus 3（MDX 内嵌组件示例）                                   |
| 测试              | Vitest + Testing Library                                           |
| 代码质量          | ESLint 9（flat config）+ Prettier + EditorConfig                   |
| 提交规范          | Commitlint + Husky + lint-staged                                   |
| 版本管理          | Changesets                                                         |

## 模块索引

- **`@colox/theme`**（`packages/theme/`）：主题运行时 + 自带打包 css——ColoxTheme 组合式 React 运行时（`<ColoxTheme>` + `.Theme/.Palette/.Breakpoints/.Storage` + `useColoxTheme`）、默认断点常量（`defaultBreakpoints`，由 builder 按 build 契约的 `runtime` 字段从 token 工作区发射到 output 目录 `src/styles/tokens/`，文件名 builder 定）、vite 产 ES/CJS+dts；`dist/index.css` 聚合样式与 `dist/themes/*.css` 由构建期调 theme-builder 的内置设计语言管线产出。**不再持有** token 管线/CLI/Schema。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/theme-builder`**（`packages/theme-builder/`）：编译期工具包（bin `colox`）——Figma token 管线（token 源→tokens→Style Dictionary→css 套件 + `cli-data.json` 编译数据）、token 发射（`scripts/emit-runtime.mjs`：断点/键表 → TS 常量 + SCSS 面产物）、主题编译 CLI（`colox theme build`，由项目内 `colox.theme.build.json` 驱动：`tokens` = token 源目录 / `theme` = 主题覆盖配置 / `runtime` = 产物发射；无该文件时 `-c colox.theme.json` 走旧行为）、JSON Schema、`config/theme.default.json`。内置设计语言源随包发布（`src/styles/meta`）。零 JS 运行时依赖（style-dictionary 是构建期 dependency）。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/react`**（`packages/components/`）：组件库本体，组件按目录组织；构建按组件切入口（`index`/`anchor`/`autocomplete`/`button`/`checkbox`/`compact`/`container`/`date-picker`/`grid`/`icon-button`/`input`/`input-number`/`positioner`/`radio`/`select`/`slider`/`stack`/`switch`/`textarea`/`time-picker`/`cdk/date` 多 entry + `exports` 子路径 `@colox/react/button`、`@colox/react/time-picker`、`@colox/react/compact`、`@colox/react/cdk/date` 等）做 JS 级树摇；`@import '@colox/theme/index.css'` 级联进单一 `style.css`（`cssCodeSplit: false`），保持一行引入。内部 cdk 层（`src/cdk/`，alias `@colox/cdk/*`）：floating 纯弹层基建（定位包 @floating-ui/dom、portal Popup、dismiss，按功能文件夹组织 popup/ + hooks/，不进公共面）+ combobox 建议行为完整内核（词形 `ComboboxOption` + 筛选纯函数 + `useComboboxKeyboard` 键盘巡行 + `walkComboboxLeaves` 通用走查，Select search 与 AutoComplete 共享）+ input-control 裸控件单元（colox-input-control reset，Input/Select 共享）+ utils（`debounce` trailing 经典 + `throttle` leading 门锁——首击即发、滑窗内调用全吸收；TimePicker 步进滑行据 throttle 拦截重复点击并同窗置灰步进钮）+ date 纯日期时间核心（公开纯函数套件 + 分层内部：`calendar` 公历数学（Hinnant 零时区 days/civil 互转 + shiftSeconds/addYears/startOf/endOf/diffOf）+ `parse` 归一化（string|Date|parts→坐标，instant 词先校验后算）+ `format` 词表引擎（pattern 编译/渲染一体）；`@colox/react/cdk/date` 公开面=纯函数能力套件：dateParts(source, fallback?) 吐七字段坐标（六字段+周一开头 weekday，datetime/date/年月/裸年/Z 即时串与 Date/parts 双收，兜底参数=值词门）、dateFormat(source, pattern) 唯一 pattern 标准（y/M/d/E/H/h/m/s 大小写载义+单字母不补零双补零）且显示出口不抛（null/垃圾渲染 null，组件 ?? ''）、add×7 全族（年/月日历真值 clamp + 周/日/时/分/秒进位）返回纯坐标、dateDiff(end,start,unit) 日历真值 {count,remainder}（年/月→天、天→时、时→分、分→秒降维余数，end<start 翻负）、today() 本地当天零点原生 Date、dateStartOf/dateEndOf(source,粒度) 周一起周、dateTimestamp 本地壁钟毫秒、DATEID() 17 位纯数字唯一 ID（13 位毫秒+4 位同毫秒序号）、secondsTo* 裸换算不取整；链式值对象与 iso() 即时词随纯函数化退场（链式作为上层糖待基座稳定再包）；时区/本地化是点名缺口；网格 builder 不公开；DatePicker 已改从 cdk 公开面读）。**表单族事件面统一自造 `{ event, value }` 载荷**（13 叶子无豁免：Input/Textarea/Checkbox/Radio/Switch 单件与 Checkbox/Radio.Group、Select、InputNumber、DatePicker、TimePicker、Slider、AutoComplete 同形——`event` 恒原生 change 事件，载荷 `value` = 组件自己的下一值，语义随组件：文本/boolean/数字/日期串/数组；prop `value`（表单 token/组键）与载荷 `value` 分层同名）。**Form 前补强**：Slider 补 `invalid`、Checkbox/Radio.Group 补组级 `invalid`（组继承：能力剥夺类 disabled/readOnly 不可退出、状态类 size/invalid 本人优先）、AutoComplete 根把控件词（id/name/invalid/disabled/readOnly + aria 通道）转发给宿主 input、Select 把 aria 通道转发给控制件。**readOnly 家族面补齐**：Input/Textarea/InputNumber/DatePicker/TimePicker 走原生；Checkbox/Radio/Switch/Slider/Select 与两 Group 自造（拦截跃迁回滚 + `aria-readonly` + `cursor: default`，不灰化、仍可聚焦/可读/可提交）。**Form 层（M3 首件，已交付）**：`Form` + `Form.Field`/`Form.Label`/`Form.Hint`/`Form.Validate` + `useForm`——原生 `<form noValidate>` 持有值/校验策略/提交生命周期，字段列走 `Stack`（token 键 `gap`），`Form.Field` 按组件身份拆成员与唯一控件、按域注入 `checked`/`value` 与家族载荷的 onChange、经 `aria-labelledby`/`htmlFor` 接线 label，规则叶子声明规则并渲染自己拥有的错误行（首个失败者拥有错误）；`labelAlign`（start/end/justify，默认 start，form 级+字段级覆盖）管 start 形态 label 列内文字对齐（两至四字中文 label 排版场景，槽为舞台、label 整体对齐）；`requiredMarkPosition`（start/end，默认 start）+ 规则派生的必填星号（Form.Label 可 `showRequiredMark={false}` 单隐藏，控件同步注入 `aria-required`；星号永远贴文字随对齐整体移动）。批 B 补四能力：form 级 `disabled` 锁定（sticky 不可退出、Group 同语法）+ 字段级 `validateOn` 覆盖 + `useFormWatch`/`useFormWatchError` 公开订阅 hook + 失败提交聚焦首个错误（`focusOnInvalid` 默认开）。批 C 数据面三件：`Form initialValues`（喂自持 store，外 store 忽略）+ `setValues(partial)` 回填（静默 merge、不校验、不报告）+ `onValuesChange({ name, value, values })`（只报用户编辑，自动保存通道）。批 C 装饰轴：form 级 `size`（状态类，控件自声优先）+ `colon`（默认 false，星号同款机械不污染文本面）。批 C 结构：字段名即点串路径（`'user.name'`，内部扁平点键、`getValues`/`getErrors`/规则入参/提交载荷重建嵌套树，入口两种拼法均收）+ `unregister(name)` 动态表单显式清理（验收+5 form 单测）。**基础能力收官**（用户拍板）；`Compact` 视觉缝合基座封口 M3（零词组件、替代预留的 InputGroup，见 [modules/compact.md](wiki/modules/compact.md)）；动态列表表单（增删行、FieldArray 形态）延后，设计思路重开独立对齐轮再动工。详见 [modules/form.md](wiki/modules/form.md)、[modules/autocomplete.md](wiki/modules/autocomplete.md)、[modules/button.md](wiki/modules/button.md)、[modules/input.md](wiki/modules/input.md)、[modules/input-number.md](wiki/modules/input-number.md)、[modules/date-picker.md](wiki/modules/date-picker.md)、[modules/textarea.md](wiki/modules/textarea.md)、[modules/time-picker.md](wiki/modules/time-picker.md)、[modules/checkbox.md](wiki/modules/checkbox.md)、[modules/compact.md](wiki/modules/compact.md)、[modules/radio.md](wiki/modules/radio.md)、[modules/select.md](wiki/modules/select.md)、[modules/slider.md](wiki/modules/slider.md)、[modules/stack.md](wiki/modules/stack.md)、[modules/switch.md](wiki/modules/switch.md)、[modules/container.md](wiki/modules/container.md)、[modules/grid.md](wiki/modules/grid.md)、[modules/positioner.md](wiki/modules/positioner.md)、[modules/icon-button.md](wiki/modules/icon-button.md)
- **`@colox/icons`**（`packages/icons/`）：第一方基础图标包——stroke 风格（24 viewBox / 1.5 round stroke / currentColor / 1em 默认、`size` 数字 px 覆盖），`IconXxx` 前缀命名的 React 组件（前缀防碰撞，per-icon 命名导出保树摇），`IconBase` 为内部契约基座（不进公共面）；图标设计规范八条由 spec lint（test/icon-spec.test.tsx）机器门禁：几何锁（渲染必须等于设计的 d）、整数网格、[2,22] 光学内容框、成对同源（chevron 四向单几何旋转、eye-off 由 eye 派生）。零运行时依赖。批次一：chevron×4、x、check、plus、eye、eye-off、search 十枚样板，扩至十一枚（calendar，DatePicker 批）；批次二追加：clock（TimePicker 批 2，十二枚——表盘圆 + 4:30 位姿指针折线）。详见 [modules/icons.md](wiki/modules/icons.md)
- **`@colox/wiki`**（`packages/wiki/`）：AI 使用心法数据包——`AGENTS.md`（各家 harness 自动读的用法总纲）+ `components.md`（组件地图：职责+状态）+ `skills/<name>/` 主题 bundle（`SKILL.md` 配方本体 + `references/` 按需读：`rules.md` 条件规则、`component.md` API 参考；doctrine bundle 载全局规则、style bundle 讲样式接线；SKILL.md 为 Claude/Codex/dsh 三方自动发现格式）；纯 markdown、无构建，版本纪律：前两位（major.minor）与 `@colox/react` 一致、patch 位留给组件 bugfix、API 变更才随版本更新。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/mcp`**（`packages/mcp/`）：官方 MCP server（本地 stdio、官方 `@modelcontextprotocol/sdk`，tsc 构建产 `dist`，bin 即包名——各家一行 `npx -y @colox/mcp` 注册）；读 `@colox/wiki` 依赖（workspace symlink 开发态 / npm 安装态）提供四工具：`search_doctrine`（全文搜索+评分+摘要+读指引，覆盖 bundle 与 references）/ `get_rule`（`global` 别名）/ `get_skill`（`reference` 参数读参考件）/ `get_component`（无参读组件地图）；离线、零网络、版本=wiki 依赖版本。详见 [wiki/architecture.md](wiki/architecture.md)
- **`@colox/preview`**（`apps/preview/`）：组件预览环境（Storybook），组件示例按组件分类存于 `apps/preview/src/<Component>/<component>.stories.tsx`——一组件一 Overview story，按状态轴用 `Section` 分区、以自家布局组件（Container/Stack/Grid）作陈列骨架（示例归应用、不混入组件包源码）
- **`@colox/docs`**（`apps/docs/`）：Docusaurus 官方文档站点，MDX 内嵌组件示例

## 目录结构

```
colox-react/
├── packages/theme/         # @colox/theme — 主题运行时 + 打包 css
├── packages/theme-builder/ # @colox/theme-builder — token 管线 + 主题编译 CLI（bin colox）
├── packages/components/    # @colox/react — 组件库
├── packages/icons/         # @colox/icons — 第一方基础图标（stroke 风格，spec lint 门禁）
├── packages/wiki/          # @colox/wiki — AI 使用心法数据包（AGENTS.md + skills/rules/components）
├── packages/mcp/           # @colox/mcp — 本地 stdio MCP server（四工具读 wiki 数据）
├── apps/preview/           # 组件预览环境（Storybook）
├── apps/docs/              # Docusaurus 文档站点
├── .changeset/             # 版本管理配置（react/wiki linked 同版本）
└── 根目录配置              # eslint / prettier / commitlint / tsconfig
```
