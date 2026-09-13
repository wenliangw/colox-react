# 设计语言 token 改动清单

条目主干 = 「改这里 → 必须检查哪里」；每次动 token 源都过一遍。

## 改某一套件（light/dark）的某一档 → 六族 × 全档逐档对账

- **改这里**：`packages/theme-builder/src/styles/meta/semantic-colors.{light,dark}.tokens.json` 的任一档（或品牌族的 `src/styles/tokens/semantic.brand*.tokens.json`）。
- **必须检查那里**：**逐族逐档**对照两套件的取值，确认每一档都真的换过。实测踩坑：暗色套件把 `subtle` 换成了 `.900`、`gray.muted` 换成了 `.800`，但**五族（indigo/red/green/orange/blue）的 `muted` 仍是浅色的 `.200`** → 暗色下 `surface` 描边变成亮粉圈、`subtle/surface` hover 闪成浅底、焦点环发白（见下一节消费点）。
- 镜像规律：浅色 `subtle=.50 / muted=.200` ↔ 暗色 `subtle=.900 / muted=.800`（50↔900、200↔800 的镜像步）；`solid` / `inverse` 有意两套同名，属正常。
- 为什么：`-muted` 不显眼但**承重**，漏改一处会在暗色下同时坏掉三处观感。

## `-muted` 的三个隐性消费点 → 改动后必须逐一看

- **焦点环**：`packages/components/src/button/styles/base.scss`（`box-shadow: 0 0 0 2px var(--colox-button-palette-muted)`）
- **有底换档 hover**：`packages/components/src/button/styles/variant.scss`（`background-color: var(--colox-button-palette-muted)`）——浅色下是「加深」、暗色下必须也是「更靠背景」而不是跳成亮色
- **surface 描边**：同文件 `border-color` 走 muted
- 推而广之：任何用 family `-muted` 的描边/环/悬浮底都要在暗色下复验一遍。

## token 生成物 vs 真源 → 别改错文件

- `packages/theme-builder/src/styles/tokens/*.tokens.json` 是 **gitignore 的生成物**（每次 `colox theme build` 会从 `src/styles/meta/` 重新生成，见 `scripts/build.mjs` 步骤 1）——改它下次构建即被覆盖。
- **真源** = `src/styles/meta/semantic-colors.{light,dark}.tokens.json`。
- **例外**：品牌族与 derived/shadow 是**手维护覆盖文件**（`src/styles/tokens/semantic.brand*.tokens.json` 等，tracked），改品牌档要直接改它。
- 验证：改完跑 `pnpm --filter @colox/theme build`（会重生成 tokens）→ 读 `packages/theme/dist/index.css` 里两套件的取值 → 再重建 react + docs，浏览器实测 hover / 描边 / 焦点环。

## 已知残留（待 Figma 侧补齐）

- 调色板缺 `green/850` 档 → 暗色 `green.muted` 只能取 `.800`，与其 `solid`（也是 `.800`）重合，green 的 muted 档在暗色下失去区分度。补齐 850 档即可恢复阶梯。
