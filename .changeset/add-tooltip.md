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
the matching 0.9 alpha) and white (the white-900 rung with dark ink),
all translucent and borderless with no backdrop blur. The depth is
one union drop-shadow on the panel itself — the offset follows the
arrow direction, colored by the design language's master shadow
alpha. The arrow is a rotated translucent diamond half
buried behind the bubble — its protruding tip corner only rounded, no
clip-path — and it pins to the resolved placement the cdk popup publishes as
`data-placement`, staying aimed at the trigger under boundary
flip/shift. sm/md/lg tiers, the sm tier sizing the arrow one ladder
step down.