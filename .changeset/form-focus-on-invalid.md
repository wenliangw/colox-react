---
'@colox/react': minor
'@colox/wiki': minor
---

A failed submit now lands the eye on the trouble: `Form` moves the viewport
to the first invalid field and focuses its control (a group scrolls only)
before firing `onInvalid` — `focusOnInvalid` defaults to `true`, the
form-level escape hatch turns it off. The store gains `focusFirstInvalid()`
for imperative use, and every field registers its focus handle with the
store. Docs page and wiki module updated in lockstep.