# 文档声称：语义描述必须与实现核对

批 A 审计发现同一模块内三处「文档/注释声称的行为 ≠ 实现行为」，将来写完规范声明后必须逐条核对实现。

## 写实现注释 / wiki 行为描述 → 逐一验证声称真的成立

- **改这里**：在 JSDoc / wiki / docs 里声称任何实现语义——执行顺序、错误路径、硬错误名单、默认行为、api 条目说明。
- **必须检查：**
  - [ ] 「按以下顺序执行」类声明：逐个对实现里的实际执行序（前科：FormValidateProps 说 pattern 在 min 前、实现是 min→max→长度→pattern→validate）。
  - [ ] 「硬错误/禁止」类名单：写进名单的每项在实现里是否真的会被拦（前科：walker 声称 Fragment 硬错误，`Children.forEach` 实际展开 Fragment——单控件 Fragment 被静默接受）。
  - [ ] 「某路径显示在 X 上」类声明：X 是否真的存在/真的渲染（前科：setError JSDoc 说无规则时落在「error slot」，实现 leaf=-1 无处渲染）。
  - [ ] 声明的是**意图**还是**行为**——写行为；若只在描述意图，改成「将来会/暂不」且别写成既定事实。
- **为什么**：批 A 审计一次抓到三处（setError JSDoc、规则执行序、Fragment 硬错误），读代码者被文档误导比没有文档更糟。

## 组件视觉/示例文案随设计轮同步（Tooltip 教训）

- **改这里**：组件的视觉面（阴影/边框/装饰结构/几何/文案）在某一轮定型或变更。
- **必须检查**（grep 旧词面逐处替换，不要只改源码）：
  - [ ] story 文件里的示例 tooltip 文案与 Meta description（前科：Light 例文案「border and seam」在去 border 后存活多轮）。
  - [ ] docs mdx 正文（前科：「cast … steps around the arrow」带方案措辞残留在 Surfaces 段）。
  - [ ] ROADMAP.md 的 shipped 段落、packages/wiki/components.md 表格行、.changeset 描述。
  - [ ] .mesync/wiki/modules/<组件>.md 与 .mesync/tastes/ 对应条目（记忆层陈旧会被后续轮误读——本轮六个文件各残留不同时代的阴影描述）。
- **为什么**：视觉词面（border/seam/cast/零阴影/旋转方块…）是「某一轮的快照」；用户对 UI 的判断来自实时渲染，文案一旦陈旧就与渲染对不上，用户会把陈词当 bug 报。
