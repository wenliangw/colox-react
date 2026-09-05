# 新组件建设

## 改这些

在 `packages/components/src/` 下新建任何组件（族）。

## 必须检查

1. **variants/ 层必建**：per-axis `as const` 类映射（gap.ts 等）+ `variants/index.ts` 导出 cva 成品与 VariantProps 类型；组件根类走 `clsx(<cva>({...}), className)`，**不得**以 clsx + 模板串直拼修饰类（复杂度低不是豁免理由——Stack 首版以此被用户纠回）。
2. **类型单一事实源**：axis 联合类型从 VariantProps `NonNullable` 派生，`types/index.ts` 不手写联合。
3. **出口三件**：组件文件自身引用 `styles/index.scss`；组件 `index.ts` 导出组件 + variants + 类型；`src/index.ts` barrel 加 `export * from './<name>'`。
4. **测试**：`_tests/` 覆盖默认修饰组、各轴映射、透传/className 合并。
5. **外围放行**：`apps/docs/docs/components/<name>.mdx`（sidebar_position 递增）引用组件前先 import（Button 漏 import 的前科）；`apps/preview/src/<name>/` 故事；eslint/prettier/组件与 app 构建全绿。
6. **mesync 落盘**：[wiki/modules/<name>.md](wiki/modules/stack.md) + overview 模块索引 + 决策/品味节点（涉 API 取舍时）。
7. **组合式组件走组合规范**（含 dot-part 子件时）：`children/<part>/index.tsx` 逐件文件夹、`context/index.ts` 建 context（默认 no-op 值 + 关联工具方法）、`hooks/use-<name>-context.ts` 受保护出口；子件**不得**裸调 useContext、工具**不得**散落平铺文件（resolve.ts 前科）——开工前对照 tastes/composition.md 六条与 ColoxTheme/Stack 参考实现。

## 为什么

Stack 首版交付时跳过 variants 层，被用户指出偏离惯例：惯例一致性、用户 fork 通道、类型单源在单轴组件上同样成立。
