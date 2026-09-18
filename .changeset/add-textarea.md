---
'@colox/icons': minor
'@colox/react': minor
'@colox/wiki': minor
---

Add Textarea: multi-line text input on the Input shell contract (size
tiers, invalid/disabled states, focus ring) around a bare native
`<textarea>` with content-driven height. `autoSize` is on by default
(unbounded growth, no scrollbar while typing; `{ minRows }` raises the
baseline, `{ maxRows }` caps it with a themed hugging-the-edge scrollbar,
`false` returns fixed rows); the unbounded worlds carry a footer drag
handle (manual minimum, keyboard stepped). A footer bar hosts the chrome
in the flow — the leading pill capsule packs the character count
(`showCount`, `n / max` with `maxLength`) and the `clearable` text button
(`清除`) with a hairline divider when both are on, the drag handle
sits at the trailing end — so nothing floats over the text. Ships the
`IconGrip` glyph (native corner-hatch shape), the per-subpath entry
`@colox/react/textarea`, preview stories and a docs page; wiki component
map updated in lockstep.