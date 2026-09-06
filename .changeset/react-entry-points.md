---
'@colox/react': minor
---

Ship per-component entry points (`@colox/react/button`, `/input`,
`/stack`): consumers importing one component bundle ~2.5 kB instead of
the full ~9.9 kB. Output is built with rollup `preserveModules` (one
file per source module, no hashed chunks) and `clsx`/`class-variance-
authority` are now external (kept as regular dependencies, so a single
install still works). CSS stays one full `style.css` (import it once).