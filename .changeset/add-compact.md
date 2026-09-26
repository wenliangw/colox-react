---
'@colox/react': minor
'@colox/wiki': minor
---

Add the `Compact` visual joining base — the seam primitive that closes M3. It
joins adjacent members into one unit: borders collapse into a single line at
each junction, radii live only at the group's two ends, and a state member
(`:focus-within` / `aria-invalid="true"`) rises to paint the seam it sits at.
Logical properties throughout, so the seam is RTL-safe.

`Compact` is wordless by design — no gap, alignment or direction words; layout
and spacing stay with `Stack`/`Container`/`Grid` around it. Members are the
author's own elements (no wrappers, no cloning) and keep their value, state
and `{ event, value }` payload — in a form each member keeps its own
`Form.Field`. Non-control addons (¥ prefix, unit suffix) ride the
`colox-compact__addon` class, which produces no value.

This base supersedes the reserved `InputGroup` slot: the same visual layer is
what a future `ButtonGroup` / `IconGroup` will stand on. Docs page, preview
stories, the wiki doctrine quick rules and the component map updated in
lockstep.