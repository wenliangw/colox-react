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
the default autoUpdate follow. dark/light variants, sm/md/lg tiers,
the decorative arrow and the directional shadow pin to the resolved
placement the cdk popup now publishes as `data-placement`.