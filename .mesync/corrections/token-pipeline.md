# token 管线（figma → tokens → SD → css）

## 改这里

Figma 变量新增/改名集合组、或动 `scripts/figma-to-tokens.mjs` 的 spec 映射、或动 SD 源列表。

## 必须检查

- **新增/改名 Figma 组 → 先加 spec 映射**：converter 对无映射组只 `console.warn` `[skip] group ...`、**不失败**，组会静默消失（前科：`large_size` 组 25 个条目 80px–1440px 被跳掉，Container 宽度被迫借断点变量凑数，用户复查才揪出）。改动后必跑「产出断言」：编译产物里 grep 对应 `--colox-*` 变量确认已生。
- **大尺寸刻度在哪**：`large_size`（meta top-level，cleanKey 后 `large-size`）→ size spec 映射进 `colox.size.*` → `--colox-size-<key>`（keys 20–360 为 px/4 的刻度：80px…1440px，**无 640**——144→576 直跳 168→672；引用前先查真实键表）。
- **宽度语义不碰断点**：`--colox-breakpoint-*`（light.css 只读副本 + 运行时 JS 面）只归响应式判定；任何「宽度/尺寸」需求用 `--colox-size-*` / `--colox-spacing-*`。Container 已从断点变量改源为 `--colox-size-144/192/256/320`。
- **改完必须重烤全链**：builder build → theme build → react build（style.css 级联 theme index.css，只烤一层会断引用）。

## 为什么

warn-only skip 让「图里有、库里没」的静默漂移只能靠人工比对发现；宽度与断点是两个正交平面，混用会被用户点破。
