---
'@colox/react': minor
---

Ship per-component entry points (`@colox/react/button`, `/input`,
`/stack`): consumers importing one component bundle ~2.7 kB instead of
the full ~10.6 kB. CSS stays one full `style.css` (import it once).