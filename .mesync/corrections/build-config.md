# 组件包构建配置改动检查（vite + rollup）

改 `packages/components/vite.config.ts` 或产物布局时，先把下面几条对着检查一遍；每条都是实测踩实的硬约束，不是建议。

## 改任何 rollup/vite 输出选项 → 必须检查 preserveModules 兼容性

- **改这里**：动 `rollupOptions` 输入/输出选项前，先确认 `preserveModules: true` 依然成立（当前架构依赖它：文件级产物、零 hash、CJS 全 `.cjs`）。
- **必须检查那里**：`rollupOptions` 顶层必须显式 `preserveEntrySignatures: 'exports-only'`。硬事实：vite 应用构建（无 `build.lib`）会在 **input 层**强注入 `preserveEntrySignatures: false`（注入点在用户配置展开之前），而 rollup 的 preserveModules 校验读的正是 **input 层的该值**——output 层设置无效（实测确认）。丢掉这行会崩在 options 校验：`Invalid value for option "preserveEntrySignatures" - setting this option to false is not supported for "output.preserveModules"`。
- 为什么：vite 把该选项当 input 级默认值下发，rollup 在 output 归一化时按 input 层值做 preserveModules 准入判断。

## 动 CSS 落点 / assetFileNames → 必须检查相对路径限制

- **改这里**：任何 assetFileNames 改动（css 落点、未来分包 css）。
- **必须检查那里**：pattern 里不能出现 `../`——rollup 报 `Invalid pattern ... patterns can be neither absolute nor relative paths`，资产逃不出 output dir。
- 当前正解：双 format 共用根 `dir: 'dist'`，子目录职责全部交给 `entryFileNames` 前缀（`es/`、`cjs/`）；`style.css` 落在根靠根级 `assetFileNames: 'style[extname]'`。
- 为什么：资产名相对 output dir 解析；相对逃逸在 rollup 内部是语法错误而非警告。

## 改动任何命名模式 → 必须检查 CJS 扩展名

- **改这里**：entryFileNames / chunkFileNames / 任何命名模式，或把 package.json 的 `"type": "module"` 改掉。
- **必须检查那里**：构建后 `find dist/cjs -type f ! -name "*.cjs"` 必须为空。硬事实：type: module 下 cjs 内容 + `.js` 后缀会被 Node/webpack 误当 ESM，CJS 消费链直接崩。
- 为什么：多格式各自的扩展名只能靠 output 数组每格式各配各的 entryFileNames；单一字符串模式对所有格式生效，必然有一个是错的。

## external 名单改动 → 必须检查包名与依赖位

- **改这里**：增删 external（未来加依赖时）。
- **必须检查那里**：包名用真实 npm 名（`class-variance-authority`，不是 `cva`——写错 rollup 不报错、静默打成内联，preserveModules 会把它按路径铺进 dist）；外部化 ≠ 升 peer，`dependencies` 位置不动（npm 自动带装，一行安装契约不破）。
- 为什么：external 匹配不到只是「不生效」，没有任何告警，坏在产物形态上。

## 组件新增运行时依赖 → 必须检查「能否内联」

- **改这里**：给组件源码加 `import ... from '<某包>'` 时，先判断这个包能不能内联。
- **必须检查那里**：包提供 **React context / 全局单例 / 跨包共享状态**（现例：`@colox/theme` 的 `useColoxTheme` + `<ColoxTheme>` 靠 context 对象身份匹配）→ **必须 external + 放 `dependencies`**，让消费者 npm 自动装、身份唯一。内联的后果：包里一份 context 对象、消费者手里一份，两条链路不相交——消费者用 `<ColoxTheme>` 包应用时，我们产物里的 hook 读不到定制，换肤/断点**静默失效**，不会报错。纯函数库（如 clsx）才可以内联。
- 为什么：React context 的 provider/consumer 靠对象身份匹配，两份拷贝 = 两个不相交的 context；这是语义正确性，不是包体积取舍，体积让位。
- 升级场景（另一方向）：凡「消费者可能自己也安装/使用」的运行时包，一律 external；内联会造成多实例、状态不一致。

## 每次构建改动后的三件套验证

- [ ] node 冒烟：`/tmp/colox-resolve` 里 ESM `import('@colox/react/button')` + CJS `require('@colox/react')` + `require.resolve('@colox/react/style.css')` 全通
- [ ] 摇树实验：`pnpm --filter @colox/react exec vite build --config /tmp/colox-shake/vite.config.mjs`，Button-only 无 Input/Stack 残留、体积与基线比无回退（当前基线 2.5KB / 全量 10.3KB）
- [ ] 结构断言：dist 根只有 `es/ cjs/ types/ style.css`；上面那条 `.cjs` 后缀断言为空
