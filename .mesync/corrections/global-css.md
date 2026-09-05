# 全局行为 CSS

## 改这些

theme 行为层 / 库级全局样式（`*` 通配、`:root *`、属性轴通配选择器、`!important`、媒体查询级联影响整页的规则）。

## 必须检查

1. **作用域收敛**：选择器是否会命中用户自己的 DOM / 私有样式（用户元素、用户自写 transition/animation）；库只应通过自有契约（token、`colox-*` 命名空间、`data-colox-*` 轴）生效。
2. **`!important` 边界**：一旦使用会压过用户内联样式与更高特异性——除非锁死在库自有作用域内，否则不写。
3. **无挂载时的越权**：媒体查询型规则在用户没挂运行时的千人千面场景下也会生效（如 `prefers-reduced-motion` 对全站通杀）——判断这是库职责还是宿主职责。
4. **特异性与顺序**：全局基线 `:root`（0,1,0）之上的轴规则用 `:root[attr]`（0,2,0）压基线，保加载顺序无关。

## 为什么

motion.css 首版用 `[data-colox-motion='off'] *` + `!important` 全站静默动效，经用户稽查发现会停掉用户自己写的全部 transition/animation（未挂 ColoxTheme 时媒体查询块同样全站通杀）；改正为 token 级门控——只归零 `--colox-motion-duration-*`，管库内动效、不碰用户主权。
