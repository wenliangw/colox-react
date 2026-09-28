# Avatar

`packages/components/src/avatar/` —— 头像原语：**圆形足迹**的肖像件，承载三态内容（图/字/富内容）。M5「Display and feedback」第一件。

## 定位

- **圆形默认**（生态惯例：antd/MUI/Chakra 全默认圆——头像天然读作圆脸），`shape` 轴显式切方。**打破**家族「方形默认 + rounded 显式」惯例（IconButton/Button 同款），是有意的例外——头像是肖像不是控件（决策 Avatar 形状默认值）。
- **尺寸双通道**：`size?: 'xs'|'sm'|'md'|'lg' | SizeKey`——预设档与表单家族同源（24/32/40/48，默认 md），裸键任意 size token 可寻址（`size="4"` = 16px）。文字档字号 = 块尺寸 45% 比例跟随（任何裸键都有可读首字，无每档字表）。
- **内容三态优先级**：`children`（富内容槽，恒赢）> `src`（图片头像，加载失败回退）> `name`（自动派生首字/首字母）> 空。
- **name 自动派生**（Chakra 词形）：CJK 名取首字符（「张伟」→「张」）、拉丁名取前两词首字母大写（"john doe" → "JD"）。消费方零样板；`children` 保留为富内容插槽。
- **失败回退内置**（antd 词形收窄，用户二轮拍板 B）：`src` 加载失败 → `onError` 回调一次 + 自动回退 `fallback` 逃生舱 > `name` 首字 > `alt` 首字。**fallback 只管图片失败**——无 `src` 时不咨询 fallback（直接走 name/空）；name 与 alt 首字是常驻文字回退（alt 兜底 name 的缺席）。`imgProps.onError` 通道被组件接管（内置检测是机制、顶层 `onError` prop 是监听口）。
- **palette/variant 轴（二轮补，用户点名）**：`variant`（plain/subtle/solid/outline，默认 plain）+ `palette`（六族同源，默认 gray）——作用于**文字头像**的面料；plain = muted 中性面（palette 不参与，同 IconButton muted 档先例）、subtle = palette-subtle 浅底 + palette 字、solid = palette-solid 实底 + inverse 字、outline = palette 描边环 + 透明底（inset box-shadow，不 shift 盒子尺寸）+ palette 字。图片头像忽略两轴。

## 可达性契约

- 图片模式：内层 `<img alt>` 作者必传——缺失 `console.warn` 一次（模块级标志防刷屏）+ 渲染空 alt。
- 文字模式：`role="img"` + `aria-label` = 显式 `aria-label` ?? `name`。
- `children`/`fallback` 是作者内容，命名由作者自持（库不强行加 role）。

## 实现

- `avatar.tsx`（forwardRef span + `resolveAvatarContent` 一次调用 + img onError 状态机）、`utils/get-initials.ts`（CJK/拉丁派生纯函数）、`utils/resolve-avatar-content.ts`（四态判别联合 resolver：image/text/node/empty）、`variants/{index,size,shape,variant,palette}.ts`（cva + sizeKeys 键类 + 三形状类 + 四面料类 + 六族类）、`styles/{base,size,shape,variant,palette,index}.scss`（足迹/内容居中/`--colox-avatar-block` 变量、比例字号、private palette 变量族 base 落 brand fallback、四档面料、六族色）。
- **失败状态机**：`useState(imageFailed)` + `useEffect` 依赖 `src` 重置——`src` 变化即新加载，新图胜旧回退（测试覆盖：失败 → 换 src → 图回来）。
- 结构类 `colox-avatar__img`（cover 裁剪进足迹）+ `imgProps` 逃生舱（srcSet/sizes/loading/className 合并）；`draggable={false}` 默认（头像图不拖走）。

## 门禁与文件

`_tests/avatar.test.tsx` 43 例（四档/裸键/默认 md、三形状 + circle 默认、内容优先级 4 例、失败回退 4 例含换 src 恢复与 imgProps.onError 不越权、palette/variant 13 例含回退着色、可达性 3 例、透传 2 例、getInitials 纯函数 3 例）。构建入口 `vite.config.ts` + `exports["./avatar"]` 子路径（`@colox/react/avatar` 树摇）。preview `apps/preview/src/avatar/avatar.stories.tsx`（Overview：Content/Shapes/Sizes/Variants/Palettes/Failure fallback 六节，示例图 = 本地 data URI 零网络依赖）。docs `avatar.mdx`（sidebar_position 22，含 Variant and palette 节）。

## 边界

- **palette/variant 只作用于文字头像**：`variant`（plain/subtle/solid/outline）定文字头像的面料强度、`palette`（六族）定 subtle/solid/outline 的色族；**plain 不参与 palette**（muted 中性面，同 IconButton muted 档先例——要语义色就显式选彩色档，不留给语境猜）。图片头像忽略两轴（图片是内容）。此轴是首版「无 palette 轴」定案的**反转**：用户交付后点名「我觉得可以支持 palette 和 variant」——展示件在语义色场景（角色/分组/状态着色）有真实需求，随需求立项。
- **无 Badge 集成**：Avatar + Badge（在线状态/计数）是常见组合，但 Badge 是 M5 独立组件，组合能力等 Badge 落地后自然形成（不预埋插槽）。
- **不做图片裁剪/上传**：Avatar 只管展示，`src` 即外部图片；裁剪/压缩是上传场景的事。
