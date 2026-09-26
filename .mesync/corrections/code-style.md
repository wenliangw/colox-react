# 组件交付 / 改造前：代码习惯对照清单

- 新组件交付或存量件改造收尾 → 必须逐项对照 `.mesync/tastes/code-style.md` 自查（TimePicker 自查轮被指正则项）：props 三处同序（接口 / 解构 / 调用点，属性 → 方法入参 → 事件回调）、无零语义穿透 wrapper（scrollColumn=moveColumn 式）、同构方法合并为族级单实现（isDisabledHour/Minute/Second → isDisabledOption）、无三目链（三路分支走 guard/查表）、pad/mod 类公共工具集中在 utils 不散落各文件、模块头注释 ≤3 行（禁大论文 docblock）。
- 回填 kebab 命名式新 prop（confirmText 类）到既有接口 → 必须同时检查组件解构处与 hook 调用点是否保持同序（字段序约定是「三处」不是「接口一处」）。
- 新组件交付 → 必须注册 form 的**组件身份映射**：`resolve-empty-value`（空值词档）与 `resolve-control-kind`（布尔判定）。TimePicker 交付时漏挂空词档、静默落到默认 text 词 `''`（功能不坏——编辑会立刻写 canonical；但 store/提交载荷的「未选」呈现 `''` 而非时间域的 `null`，与 DatePicker 漂移）——身份映射是「新叶组件交付检查单」的一员。
- 新组件交付 → 组件文档页（`apps/docs/docs/components/*.mdx`）写好还不够，必须**挂进 `apps/docs/sidebars.ts` 的显式分组**——Docusaurus 侧栏不是 auto-generated，未挂 = 站点导航不可达。TimePicker/form 两页此前的交付漏了侧栏注册（文件在、导航没有），Compact 轮顺带补齐。把「sidebar 注册」写进组件交付检查单。
- 覆写件/缝合件写「覆盖成员自带样式」的规则（圆角、边框、几何）→ 必须检查**特异性足以压过成员的自身类**：成员自己的基类（`.colox-input` 等）是 0,1,0，覆写规则写到 0,3,0（类 + 伪类）才与样式表顺序无关——同分平手会按聚合顺序输给后到的成员样式，成员样式「复活」（Compact 首版圆角 bug：`:first-child` 规则补两角但内角依赖会输给成员的重置、中间件全方形失效，用户目视逮住）。
