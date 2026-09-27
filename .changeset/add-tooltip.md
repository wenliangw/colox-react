---
'@colox/react': minor
'@colox/wiki': minor
---

Add Tooltip: the hint layer on the cdk popup — a zero-container
component that clones its trigger in place (no wrapper element) and
renders the panel out of a portal. Two channels: the props form
(`content` plus a single trigger child) and the composed
`Tooltip.Trigger` + `Tooltip.Content` form; giving both is a compile
error. hover+focus (delay as `{ in, out }`), click and manual
(`visible`) trigger modes; `closeOnScroll` as an explicit opt-out of
the default autoUpdate follow. The surface is a design-language
`palette` — gray (the neutral default, the black-900 translucency
rung) plus primary/info/error/warning/success (family solids mixed at
the matching 0.9 alpha), all frosted (translucent fill + backdrop
blur, borderless, drop-shadow casts). The arrow is a rotated frosted
diamond half buried behind the bubble — a rounded tip, no clip-path —
and it pins to the resolved placement the cdk popup publishes as
`data-placement`, staying aimed at the trigger under boundary
flip/shift. sm/md/lg tiers, the sm tier sizing the arrow one ladder
step down.