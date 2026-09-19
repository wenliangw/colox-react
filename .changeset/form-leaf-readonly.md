---
'@colox/react': minor
'@colox/wiki': minor
---

Give the form family a read-only face. Input / Textarea / InputNumber /
DatePicker already used the native `readonly`; the leaves whose native
elements have no read-only semantics — Checkbox, Radio, Switch, Slider,
Select and both groups — now implement it themselves: the control
reverts a user-driven change and publishes nothing (a checkbox/radio/
switch flips the DOM back, the indeterminate bar included; a slider
writes the rendered value back; a select never opens its panel and a
searchable one hands the native `readOnly` to its input), announces
`aria-readonly` and keeps the normal fabric with a `default` pointer —
focusable, readable and submitted, because dimming is the disabled
language. Group `readOnly` is sticky like `disabled` (a restricted group
cannot be opted out of); `size` / `invalid` stay member-first. Preview
stories, docs pages and the wiki notes updated in lockstep.
