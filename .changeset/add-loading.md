---
'@colox/react': minor
'@colox/wiki': minor
---

Add the `Loading` component: the inline busy indicator — a decorative
motion figure that says "work in progress" (determinism: Progress;
placeholding: Skeleton). `animation` (`spinner`/`dots`/`pulse`,
`spinner` by default) picks the figure, `size` (`sm` 16 / `md` 24 /
`lg` 32 riding the theme size scale, or a number pinning the exact px
footprint) moves the indicator only, `label` rides beside it and
doubles as the accessible name (default "Loading", `aria-label`
overrides). The figure inherits `currentColor`; the root announces
with `role="status"`; `prefers-reduced-motion: reduce` calms the
motion instead of freezing. A leaf: it never wraps or masks children.