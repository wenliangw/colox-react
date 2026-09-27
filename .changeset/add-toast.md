---
'@colox/react': minor
'@colox/wiki': minor
'@colox/icons': minor
---

Add Toast: the transient notification stack — the M4 overlay family
closer. The content comes from an **imperative call** (any code
position — a module store), not the tree, so the "content must be in
the tree" rule does not apply — but the host must be in the tree:
`<Toast.Provider>` wraps the app and `<Toast.Viewport position>` (six
slots: top/bottom × left/center/right) declares the stack slot.
Unified two-tier payloads: `toast(content)` lightweight single-line
and `toast({ title, content })` titled notification — one component,
one mental model (no message/notification split). Tone shortcuts
`toast.info/success/warning/error`, `toast.update(key, patch)`
same-key in-place updates, `toast.dismiss(id?)`. Opaque `bg-default`
cards (the Popover surface) with palette semantic icons, one
`action: { label, onClick }` slot that auto-closes on click, duration
auto-dismiss (default 3s, 0 = sticky) with hover pause, per-item exit
animation on the shared motion tier, `role="status"` (polite).

The icons package gains the semantic batch three: `IconInfo`,
`IconSuccess`, `IconWarning`, `IconError` — the palette tone glyphs
Toast (and the coming Alert) share, all passing the geometry lock.
Per-subpath entry `@colox/react/toast`, preview stories, a docs page
and the wiki component map updated in lockstep.
