---
'@colox/react': minor
'@colox/wiki': minor
---

Add InputNumber: a single-line number editor on a text input
(`inputmode="decimal"` for the numeric mobile keyboard) with spinbutton
semantics, a built-in chevron stepper (up/down) cutting by `step` with
step-derived decimal precision, Arrow Up/Down stepping, `min`/`max` span
bounds (steppers stop at them, blur clamps into them), partial-draft blur
rollback, and a `{ event, value }` change payload with the committed
number parsed (`null` as the empty state); per-subpath entry
`@colox/react/input-number`, preview stories and a docs page; wiki
component map updated in lockstep.