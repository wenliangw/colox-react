---
'@colox/react': minor
'@colox/wiki': minor
---

Add Alert: the inline status message — a persistent, in-flow, declarative
status block (the flow-in sibling of the transient Toast/Notify message
system). `type` (info/success/warning/error, default info) picks the
semantic icon and the default palette family; `palette` (six families,
defaulting to the type family) picks the color; `variant`
(plain/subtle/solid/outline, default subtle) picks the surface strength.
`message` is the primary line and `description` the optional secondary
line — both ReactNode, so rich content fits directly (no dot-part).
`showIcon` gates the semantic icon, `action` is the trailing CTA slot, and
`closeable` + `onClose` is the controlled close (the ✕ only fires the
callback). error/warning announce assertively (`role="alert"`), info/success
politely (`role="status"`).