# 配置取向

- **配置文件即项目契约**：编译/构建配置是提交在项目里的显式契约文件（`colox.theme.build.json`、`colox.theme.json`），CLI 从 cwd 向上自动发现，不靠全局状态或记忆上次参数。
- **产物落点必须显式**：契约文件里的 `outDir` 是必填——「编译产物去哪」是配置存在的意义之一；**`dist` 不做默认值**（用户明确：dist 在消费项目语境 = 用户自己的构建输出、会被清空；在包语境 = 发布产物，两义打架。默认输出 `./colox`，dist 只在包内构建配置里显式出现）。
- **命名同构**：build 契约文件 `colox.theme.build.json` 与主题定义 `colox.theme.json` 保持同构命名风格（用户要求改掉原来的 `colox-theme.build.json`）。
- **严格 JSON、无注释**：CLI 要直接 `JSON.parse` 的配置文件一律严格 JSON；注释属于文档，不进配置文件。
- **路径相对配置文件解析**：配置文件里声明的相对路径（tokens/theme/outDir/runtime.output）都相对配置文件所在目录，不相对 cwd——契约自包含、在任意 cwd 下语义稳定。
- **配置优先级链**：CLI flag > 契约文件字段 > 内置默认；每级都是显式声明的覆盖，不靠隐式合并猜谜（`-c` > `theme` 字段 > `config/theme.default.json`）。
- **契约字段禁魔法哨兵值**：`tokens` 一律是真实路径（用户复查抓出 `"stock"` 哨兵违背了「tokens 必须指向源目录」的 path-only 语义）；内置设计语言就是包内真实目录（`node_modules/@colox/theme-builder/src/styles/meta`），谁的包谁指向谁，语义同构。字段名与真实输入契约一致，不承诺未实现的广度（用户否决 `sd`：那要求把工程 token 层做成公开输入契约，是预支未建能力）。
- **运行时产物扩展走契约形状**：token 延伸的运行时常量发射由 `runtime: {type, output}` 声明（`type` 为将来格式留位），能力归属编译期包而非运行时包——「哪些 token 值需要运行时使用」是编译期的知识。**output 是目录**：文件名是 builder 的内部决定（聚合入口 tokens/index.ts），用户不感知（运行时变量是组件库默认行为，未来新增常量并入该聚合文件或由 builder 改名重组，不破坏契约）。
