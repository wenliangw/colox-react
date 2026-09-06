---
'@colox/react': minor
---

Ship per-component entry points (`@colox/react/button`, `/input`,
`/stack`): consumers importing one component bundle ~2.5 kB instead of
the full ~10.3 kB. Output is built with rollup `preserveModules` (one
file per source module, no hashed chunks); `clsx`, `class-variance-
authority` and `@colox/theme` are now external dependencies (installed
automatically, no manual setup). The theme runtime is no longer
bundled, so `<ColoxTheme>` overrides reach the components.