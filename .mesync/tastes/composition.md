# 组合式组件规范

组合式组件 = 一个根组件 + dot-part 子组件（`Object.assign` 挂载；参考 ColoxTheme 的 `.Storage/.Breakpoints`、Stack 的 `.Item/.Responsive`）。本卷单独维护——组合式组件在后续组件开发中使用非常频繁。

## 目录结构（强制）

```
<component>/                         # 组件目录
├── <component>.tsx                  # 根组件（Provider + 主渲染 + Object.assign 挂载）
├── children/                        # 全部 dot-part 子组件
│   └── <part>/index.tsx             # 每子件一文件夹，入口 index.tsx
├── context/index.ts                 # createContext + 默认值(no-op)（类型住 types/，工具按三分层）
├── hooks/use-<component>-context.ts # 受保护出口 hook
├── types/                           # 轴类型 + Props + <Name>ContextValue 类型
├── utils/                           # 组件私有纯函数工具（职责分离）
├── variants/  styles/  _tests/
└── index.ts                         # barrel
```

参考实现：`theme-context/`（ColoxTheme）与 `stack/`（Stack）。

## 硬规则

1. **子组件禁止直接 `useContext`**：一律走 `use<Name>Context` 受保护出口；无根挂载时 `console.warn` 一次（副本 `useColoxTheme` 文案形态）+ 服务静态默认值（注册命令变 no-op）。
2. **context 建在 `context/index.ts` 且保持干净**：只放 createContext + `default<Name>ContextValue`（no-op 命令）；`<Name>ContextValue` 类型住 `types/`；**context 对象不进公共 barrel**，只有受保护 hook 进 barrel。
3. **工具方法按宿主三分层**：(a) 断点/响应式解析等**主题语义词**由 `@colox/theme` 公共出口提供（跨组件复用的契约执行器，组件不重复持有——Stack 首版自持 `resolveResponsiveGap` 已上提为 theme 的 `resolveResponsiveValue`）；(b) 组件私有的**纯函数工具住 `utils/`**（职责分离，context 文件只负责 context）；(c) 平铺散放（`resolve.ts` 之类）禁止。
4. **dot-part 挂载**：根文件末尾 `Object.assign(Root, { PartA, PartB })` + `type Component = typeof Root & { PartA: typeof PartA; ... }`；parts 导出名与实现文件名一致。
5. **注册管道**：根组件 `useCallback` 注册命令 + `useMemo` context value 下发；parts 经受保护 hook 拿命令；同类多实例 **LWW**，卸载必须还原（cleanup 里注册回 undefined/初始值）。
6. **静态面纯净**：根组件不因「可能存在的能力挂载」而订阅 theme context 等；只有挂载件（parts）在需要时订阅。

## 用法约定

- **示例统一以子件宿主为 div 替身**：文档/故事中需要 div 形子项的，一律 `<Component.Item>` 代裸 div（同 DOM 层级、原生属性/事件/ref/className 全透传）；用户可基于 Item 封装自定义块（组合基底）。组件型子项（Button 等）直接放，不再裹 Item；裸 div 始终合法，但示例只展示 Item 形态。

## 演进史

- ColoxTheme 初版四轴全 dot-part → 用户收口：props 主轴承重、可选能力留 dot-part（挂载即启用）。
- Stack 首版散落结构（`context.ts`/`item.tsx`/`responsive.tsx`/`resolve.ts` 平铺、子件裸调 useContext）被用户纠回，本卷定稿；后再经一轮用户审查细化为「context 保持干净（类型进 types/）+ 纯函数归 utils/ + 主题语义词归 @colox/theme」三分层。此后新组合式组件开工前先核对本卷六条。
