---
'@colox/react': minor
'@colox/wiki': minor
---

Add Badge: the pure-display badge family — the standalone capsule (`Badge`,
children carry the label/pill form, absorbing the planned Tag), the status
point (`Badge.Dot`), the count capsule (`Badge.Count`, truncated at
`overflowCount` with "99+", hides at zero unless `showZero`) and the
seamless multi-segment badge (`Badge.Group` of `Badge.Item`s — shields.io
style, each segment paints its own palette/size/variant; the group's outer
corners default to a light rounding, with `rounded` opting into the full
capsule form). Anchoring is not
built in — `Anchor` (inline) + `Positioner` pin a badge to a host corner.
`palette` (six design-language families, default gray), `size`
(sm/md/lg compact capsule tiers) and `variant`
(solid/subtle/outline/plain, where the surface has a strength — the Dot
is always a solid point, the Count always a solid pill).
