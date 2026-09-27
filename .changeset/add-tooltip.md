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
the default autoUpdate follow. dark/light variants, sm/md/lg tiers —
both surfaces frosted (translucent color-mix fill + backdrop blur,
borderless, a drop-shadow cast), the arrow (a clip-path triangle on
the same fill and lens) sitting outside the bubble, and
the decorative arrow pinning to the resolved placement the cdk popup
now publishes as `data-placement`, staying aimed at the trigger under
boundary flip/shift.