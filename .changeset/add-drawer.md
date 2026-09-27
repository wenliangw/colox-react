---
'@colox/react': minor
'@colox/wiki': minor
---

Add Drawer: the edge-anchored sliding panel — the second consumer of
the cdk `overlay` family (Modal's sibling: the same full-screen
carrier, dim backdrop, strict focus trap and scroll lock; the only
difference is the anchored edge — Modal centers, Drawer slides in
from an edge). Purely composed: `<Drawer visible>` holds the overlay
and the body lives in `<Drawer.Content>` with optional
`<Drawer.Title>` / `<Drawer.Footer>` around it; plain children and
duplicated parts are compile errors. Controlled only — no
`defaultVisible`; the corner close button (`showClose` default true),
Escape and a backdrop click (`closeOnMaskClick` default true) all
speak through `onVisibleChange(false)`. The strict focus trap keeps
the keyboard inside (`aria-modal`, Tab never escapes, `initialFocus`
first or container) and closing hands the focus back to whatever had
it before; the body scroll locks while open.

The `direction` axis (left / right / top / bottom, default right)
names the edge the panel slides from — the word stays clear of the
floating family's `placement` (a drawer has no trigger to place
relative to). `size` is the content space: it sizes the panel width
for left/right and the panel height for top/bottom (sm / md / lg —
the design-language 320 / 384 / 448px WIDTH_HEIGHT tokens, symmetric
across directions, never invented numbers), with `width`/`height`
escape hatches that follow the direction. Opaque `bg-default` card,
radius on the free edges only (the anchored edge is square), union
drop-shadow; the entrance slides in from the anchored edge, the exit
slides back out on the overlay's exit window.

Per-subpath entry `@colox/react/drawer`, preview stories, a docs page
and the wiki component map updated in lockstep.
