---
'@colox/react': minor
'@colox/wiki': minor
'@colox/icons': minor
---

Rework the transient notification stack into the **message system**: a
shared **scope-registry base** (cdk/message) with two imperative faces.
The consumer mounts one `<MessageViewport>` per container (default
`root`, screen-wide `fixed`; `positioning="absolute"` pins a scoped
container inside a `position: relative` parent). `Toast.…` is the
lightweight hint face — a slim single-line pill, default slot
`top-center`, no title/action; `Notify.…` is the titled card face —
title + content + one `action: { label, onClick }` slot (subtle
Button, auto-closes on click), default slot `top-right`. Both faces
are global imperative namespaces (callable from any code position —
the content comes from a call, not the tree) routing into the scope
named by `{ scope }`; the base scope table is shared, so **one
container holds toast and notify entries side by side**, each in its
own slot. Tone shortcuts on both faces (info/success/warning/error),
`custom` renders arbitrary content, `update(key, patch)` same-key
in-place updates, `dismiss(key?)`, duration auto-dismiss (default 3s,
0 = sticky) with hover pause, per-item exit animation, `role="status"`
(polite). The message store is a shown→exiting→removed state machine
(all timers in the store — duration, hover pause/resume,
`DEFAULT_EXIT`=200 window).

The old `<Toast.Provider>` / `<Toast.Viewport>` twin-component
architecture is replaced by the scope container model. New per-subpath
entry `@colox/react/notify` (plus `@colox/react/toast`), preview
stories, a docs page and the wiki component map updated in lockstep.
