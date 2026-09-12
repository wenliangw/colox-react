# 命中测试与视觉让位（装饰元素遮盖可交互元素）

Select clearable × 的「点不到」排查实录沉淀。将来任何组件做「视觉让位切换」（一个可交互元素渐显、另一个装饰元素渐隐，二者空间重叠）都必须对照。

## 装饰元素做 opacity 渐隐让位 → 必须显式 `pointer-events: none`

- **改这里**：任何「hover/focus 状态切换时，装饰性元素（chevron、图标、label 等）用 opacity transition 渐隐、另一可交互元素覆盖上来」的形态。
- **必须检查：**
  - [ ] 渐隐元素 `opacity < 1`（包括过渡中与归零后）**保持层叠上下文**；若它在 DOM 序里位于可交互元素**之后**，同层 z-auto 按 DOM 序绘制——它永远压在可交互元素上面，`elementFromPoint` 永远命中它。
  - [ ] `opacity: 0` 的元素**照常参与命中测试**（只有 `pointer-events`/`visibility` 能退出）。视觉让位 ≠ 命中让位。
  - [ ] 装饰元素（aria-hidden、无行为的图标）一律 `pointer-events: none`——它从不需要命中，命中穿过它落到下层才是期望行为。
- **为什么**：Select 光滑进 chevron、× 渐显后，chevron 的命中面仍盖在 × 上——真实点击永远落在 chevron 的 SVG 上（无 handler），× 看起来可点但「点不到」；面板开着时 mousedown 落在 SVG 上把焦点从 control 拽走。jsdom/vitest 测不出（fireEvent 直接调处理器、不做命中测试）——最终靠 Playwright + `elementFromPoint` 实弹钉死。

## 排查「点不到」类问题 → 先做命中点对拍

- **改这里**：用户报「按钮/图标点了没反应、像没点中」，而单测（jsdom fireEvent）全绿。
- **必须检查：**
  - [ ] 真实浏览器（playwright-core + 已装 chromium，`/home/7c/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`，加 `--no-sandbox --disable-gpu --disable-dev-shm-usage --disable-crash-reporter`；landlock 下完整版 chrome 会 SIGTRAP，必须用 headless shell）。
  - [ ] `document.elementFromPoint(cx, cy)` 对比视觉位置与真实命中元素；再走 `page.mouse.move/down/up` 真序列点击，断「命中谁、谁失焦、值变没变」。
  - [ ] 静态产物探针用 `storybook-static` + `python3 -m http.server`，iframe 地址 `iframe.html?id=<story-id>&viewMode=story`。
- **为什么**：层叠/命中问题是纯浏览器语义，任何 jsdom 级的"测试全绿"都不能代表"真实点得到"。
