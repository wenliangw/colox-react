# 组合式组件规范

组合式组件 = 一个根组件 + dot-part 子组件（`Object.assign` 挂载；参考 ColoxTheme 的 `.Storage/.Breakpoints`、Stack 的 `.Item/.Responsive`）。本卷单独维护——组合式组件在后续组件开发中使用非常频繁。

## 目录结构（强制）

```
<component>/                         # 组件目录
├── <component>.tsx                  # 根组件（Provider + 主渲染 + Object.assign 挂载）
├── children/                        # 全部 dot-part 子组件
│   └── <part>/index.tsx             # 每子件一文件夹，入口 index.tsx
├── context/index.ts                 # createContext + 默认值(no-op) + 关联工具方法
├── hooks/use-<component>-context.ts # 受保护出口 hook
├── types/  variants/  styles/  _tests/
└── index.ts                         # barrel
```

参考实现：`theme-context/`（ColoxTheme）与 `stack/`（Stack）。

## 硬规则

1. **子组件禁止直接 `useContext`**：一律走 `use<Name>Context` 受保护出口；无根挂载时 `console.warn` 一次（副本 `useColoxTheme` 文案形态）+ 服务静态默认值（注册命令变 no-op）。
2. **context 建在 `context/index.ts`**：导出 `default<Name>ContextValue`（no-op 命令）+ `<Name>Context`；**context 对象不进公共 barrel**，只有受保护 hook 进 barrel。
3. **工具方法住 context，不散落**：与组件直接相关的少数工具（解析/映射等）作为模块级导出放 `context/index.ts`；组合式组件工具少且都围绕组件本身，不建平铺 `resolve.ts` 之类的散文件，也不轻易建 utils/（当工具膨胀出多个独立职责时再拆 utils/）。
4. **dot-part 挂载**：根文件末尾 `Object.assign(Root, { PartA, PartB })` + `type Component = typeof Root & { PartA: typeof PartA; ... }`；parts 导出名与实现文件名一致。
5. **注册管道**：根组件 `useCallback` 注册命令 + `useMemo` context value 下发；parts 经受保护 hook 拿命令；同类多实例 **LWW**，卸载必须还原（cleanup 里注册回 undefined/初始值）。
6. **静态面纯净**：根组件不因「可能存在的能力挂载」而订阅 theme context 等；只有挂载件（parts）在需要时订阅。

## 演进史

- ColoxTheme 初版四轴全 dot-part → 用户收口：props 主轴承重、可选能力留 dot-part（挂载即启用）。
- Stack 首版散落结构（`context.ts`/`item.tsx`/`responsive.tsx`/`resolve.ts` 平铺、子件裸调 useContext）被用户纠回，本卷定稿；此后新组合式组件开工前先核对本卷六条。
