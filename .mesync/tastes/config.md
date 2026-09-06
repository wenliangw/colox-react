# 配置取向

- **配置文件即项目契约**：编译/构建配置是提交在项目里的显式契约文件（`colox.theme.build.json`、`colox.theme.json`），CLI 从 cwd 向上自动发现，不靠全局状态或记忆上次参数。
- **产物落点必须显式**：契约文件里的 `outDir` 是必填——「编译产物去哪」是配置存在的意义之一；**`dist` 不做默认值**（用户明确：dist 在消费项目语境 = 用户自己的构建输出、会被清空；在包语境 = 发布产物，两义打架。默认输出 `./colox`，dist 只在包内构建配置里显式出现）。
- **命名同构**：build 契约文件 `colox.theme.build.json` 与主题定义 `colox.theme.json` 保持同构命名风格（用户要求改掉原来的 `colox-theme.build.json`）。
- **严格 JSON、无注释**：CLI 要直接 `JSON.parse` 的配置文件一律严格 JSON；注释属于文档，不进配置文件。
- **路径相对配置文件解析**：配置文件里声明的相对路径（meta/theme/outDir）都相对配置文件所在目录，不相对 cwd——契约自包含、在任意 cwd 下语义稳定。
- **配置优先级链**：CLI flag > 契约文件字段 > 内置默认；每级都是显式声明的覆盖，不靠隐式合并猜谜（`-c` > `theme` 字段 > `config/theme.default.json`）。
