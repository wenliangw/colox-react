---
'@colox/react': minor
'@colox/wiki': minor
---

Add the `Skeleton` family: the loading-placeholder shapes — a neutral rect
root (`Skeleton`) that fills its layout cell, plus `Skeleton.Text` (a
full-width line capsule on the font ladder), `Skeleton.Circle` (round
footprints mirroring the Avatar tiers and accepting any raw size-token key)
and `Skeleton.Button` (a control silhouette on the Button height ladder).
The shared `animation` axis picks pulse (default breathing opacity), wave
(sweeping highlight) or none. Every shape is decorative (`aria-hidden` by
default) and stateless — the `loading ? <Skeleton /> : <Content />` switch
belongs to the caller.