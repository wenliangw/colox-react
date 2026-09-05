# 手维 token 文件

## 改这里

新增 `packages/theme/src/styles/tokens/` 下的**手工维护** `*.tokens.json`（Figma 管线不生成、需要人类编辑语义值的文件，如 semantic.derived、semantic.brand、semantic.shadow）。

## 必须检查

1. **`.gitignore` 豁免**：第 18 行 `*.tokens.json` 忽略模式是为生成的 token 设的；新文件必须加 `!` 豁免行，否则静默不入库（本地 build 正常、clone/CI 全新构建会缺 token，主题悄悄退化）。
2. **入库确认**：`git ls-files packages/theme/src/styles/tokens/` 里要能看到新文件；`git status` 对它有跟踪。
3. **全新构建可复现**：在干净 checkout 里 `pnpm --filter @colox/theme build`（或至少确认 sd 源文件全部受版本控制），输出 css 的变量数与预期一致。
4. **管线联动**：如需 CLI 语义集介入（emit-cli-data.mjs）或 sd 源列表（sd*.config.mjs）变更，一并核验。

## 为什么

semantic.shadow(.dark).tokens.json 新增后因 `.gitignore` 的 `*.tokens.json` 模式被静默忽略，两个提交（shadow 主题化、按压凹陷档）只送出了构建产物而未送出源 token；直到审查 `git ls-files` 才发现——仓库在全新环境里无法复现上述功能。
