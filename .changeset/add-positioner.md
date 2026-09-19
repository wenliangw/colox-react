---
'@colox/react': minor
'@colox/wiki': minor
---

Add the positioning mechanism, as two components with one role each — the third
layout mechanism beside Stack (flexbox) and Grid (tracks). `Anchor` is the
reference frame:
a relative box whose own box is what nested boxes resolve against, with `inline`
hugging its content so an overlay can pin to a control. `Positioner` is the
positioned box: it leaves the flow, shrink-wraps its children and pins itself to an
anchor of its reference box — the nearest positioned ancestor for `absolute` (the
default), the viewport for `fixed` (page-level layers, full-viewport scrims).
`placement` offers the nine anchors (block words `top`/`bottom` never mirror, inline
words `start`/`end` do), `offset` spaces the pinned edges with spacing token keys
only (a bare key spaces the pinned edges, an object states each edge and pins what
it names), and `fill` covers the whole reference box. A positioned box is itself a
reference, so frames compose without extra wrappers and nothing extra appears in the
DOM beyond the positioned box. Everything is pure CSS: no measurement, no portal, no
observers — following an anchor, flipping and collision handling stay with the
floating layer, and DOM order is never rearranged. Per-subpath entries
`@colox/react/anchor` and `@colox/react/positioner`, preview stories, docs pages
and the wiki component map updated in lockstep.
