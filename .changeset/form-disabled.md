---
'@colox/react': minor
'@colox/wiki': minor
---

Add the form-wide lock to `Form`: `disabled` cascades into every field's
control, and no field can opt back out — the same sticky grammar as the
groups' disabled inheritance (a capability deprivation does not un-deprive
itself per member). While the form is not disabled, an author's own
`disabled` on a control keeps working. Preview story, docs page and wiki
module updated in lockstep.