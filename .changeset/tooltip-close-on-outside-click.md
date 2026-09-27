---
'@colox/react': minor
---

Add Tooltip `closeOnOutsideClick` (default `true`): set it `false` to
keep the hint open against outside clicks — Escape and the lost window
are not clicks and keep dismissing. The manual channel (Popover and
Tooltip alike) now hands the special close moments back: an outside
click (per `closeOnOutsideClick`) and a scroll (per `closeOnScroll`)
echo `onVisibleChange(false)` instead of closing, so the controlled
owner follows without hand-rolling scroll or document-pointerdown
listeners. Escape and the window loss stay silent under `manual`.