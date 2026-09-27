---
'@colox/react': minor
'@colox/wiki': minor
---

Add Popover: the interactive floating card — the Tooltip's interactive
sibling, a non-modal dialog holding real controls instead of a
click-through hint. Zero container: the trigger is cloned in place,
the panel mounts from a portal (cdk Popup). Two channels — the
`title`/`content` prop form and the composed `Popover.Trigger` +
`Popover.Title` + `Popover.Content` form; giving a word in both is a
compile error, an empty content never opens. Three visibility
channels: click (default) toggles instantly and focuses the panel
(the keyboard cycle stays trapped, Escape closes and returns the
focus to the trigger, an outside close never steals it), hover rides
`{ in: 300, out: 100 }` where the out-delay doubles as the pointer
bridge into the interactive panel and never steals focus, manual is
the controlled word. The surface is an opaque `bg-default` card
(borderless, radius-lg) with a union drop-shadow cast at the
Tooltip's calibration whose direction follows the arrow, the rotated
diamond arrow recipe without clip-path, and content-owned width (no
size axis). Entrance fade+scale, exit fade.

The cdk `Popup` gains an additive `exitDuration` window (default 0 =
the old same-commit unmount, pickers unchanged): on close the panel
stays mounted with the exiting class so the consumer can play its
fade-out. Tooltip adopts the channel and its fade-out in the same
batch. Per-subpath entry `@colox/react/popover`, preview stories, a
docs page and the wiki component map updated in lockstep.