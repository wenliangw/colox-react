# 命中测试与视觉让位（装饰元素遮盖可交互元素）

Select clearable × 的「点不到」排查实录沉淀。将来任何组件做「视觉让位切换」（一个可交互元素渐显、另一个装饰元素渐隐，二者空间重叠）都必须对照。

## 装饰元素做 opacity 渐隐让位 → 必须显式 `pointer-events: none`

- **改这里**：任何「hover/focus 状态切换时，装饰性元素（chevron、图标、label 等）用 opacity transition 渐隐、另一可交互元素覆盖上来」的形态。
- **必须检查：**
  - [ ] 渐隐元素 `opacity < 1`（包括过渡中与归零后）**保持层叠上下文**；若它在 DOM 序里位于可交互元素**之后**，同层 z-auto 按 DOM 序绘制——它永远压在可交互元素上面，`elementFromPoint` 永远命中它。
  - [ ] `opacity: 0` 的元素**照常参与命中测试**（只有 `pointer-events`/`visibility` 能退出）。视觉让位 ≠ 命中让位。
  - [ ] 装饰元素（aria-hidden、无行为的图标）一律 `pointer-events: none`——它从不需要命中，命中穿过它落到下层才是期望行为。
  - [ ] **@colox/icons 的图标不用再处理**：IconBase 已默认 `pointer-events="none"` 表现属性（spec §9），消费方经 className CSS / style / pointerEvents prop 三通道显式恢复。组件里若用非 icons 包的自备 svg/字符做渐隐装饰件，仍照本条目显式处理。
- **为什么**：Select 光滑进 chevron、× 渐显后，chevron 的命中面仍盖在 × 上——真实点击永远落在 chevron 的 SVG 上（无 handler），× 看起来可点但「点不到」；面板开着时 mousedown 落在 SVG 上把焦点从 control 拽走。jsdom/vitest 测不出（fireEvent 直接调处理器、不做命中测试）——最终靠 Playwright + `elementFromPoint` 实弹钉死。首版修复在组件 scss 里给 chevron 显式加规则，后按「契约收进基座」缩编：IconBase 默认承载（决策 d9d62f07），组件侧规则撤回。

## 全屏透传容器（pointer-events: none）内的交互后代 → 每个可交互族显式 re-enable

- **改这里**：任何「固定全屏覆盖层打 `pointer-events: none` 让页面照常交互，其内部浮出的卡片/胶囊承载按钮」的形态（消息 viewport、toast/notify 槽、通知泡容器）。
- **必须检查：**
  - [ ] 容器 none 之下，**每一族**含交互元素的后代（`.colox-message` 卡片、`.colox-message-count` 胶囊……）都要各自的 `pointer-events: auto`——漏一族 = 那一族的 hover/cursor/点击全部穿到下层，视觉可点而点不到。
  - [ ] `cursor: pointer` 规则写在按钮上不够——祖先 none 时 hover 根本不到达后代，cursor 不会触发；re-enable 后 cursor 才会生效。
  - [ ] 新增「浮在容器里的小件」（计数胶囊、倒计时、积压指示器）时，把它加进 re-enable 清单——它是新的一族，不会自动跟着旧选择器走。
- **为什么**：Notify fold 的计数胶囊在 `.colox-message` 之外（slot 直属子元素），而 viewport 容器的 none-drop 只给卡片族配了 re-enable——胶囊 ✕ 死点 + 无手型光标。jsdom 测不出（fireEvent 绕过 CSS 命中），用户真浏览器一眼报「图标无法点击、没有 pointer 样式」；CSS 属性层修复，测试只能保结构、肉眼/Playwright 保行为。

## 排查「点不到」类问题 → 先做命中点对拍

- **改这里**：用户报「按钮/图标点了没反应、像没点中」，而单测（jsdom fireEvent）全绿。
- **必须检查：**
  - [ ] 真实浏览器（playwright-core + 已装 chromium，`/home/7c/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`，加 `--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-crash-reporter`；landlock 下完整版 chrome 会 SIGTRAP，必须用 headless shell）。
  - [ ] `document.elementFromPoint(cx, cy)` 对比视觉位置与真实命中元素；再走 `page.mouse.move/down/up` 真序列点击，断「命中谁、谁失焦、值变没变」。
  - [ ] 静态产物探针用 `storybook-static` + `python3 -m http.server`，iframe 地址 `iframe.html?id=<story-id>&viewMode=story`。
  - [ ] 命中不了也可能不是命中问题而是**盒型问题**（空内容控件塌成 0 尺寸、抱紧失效被拉满）——先量 rect，见 corrections/sizing.md。
- **为什么**：层叠/命中问题是纯浏览器语义，任何 jsdom 级的"测试全绿"都不能代表"真实点得到"。
