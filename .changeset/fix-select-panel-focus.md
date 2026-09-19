---
'@colox/react': patch
---

Fix the Select control shape and its panel open/close model. A multiple select
without `showSearch` is select-only: the control is the plain trigger button
(the shape selector reads the search capability, not the mode), so it focuses,
opens and picks but never accepts typing. The panel opens on focus (Tab) and on
click; the trigger button toggles shut on a second click — pointer focus defers
to the click, so the two can never race — while the searchable input's click
places the caret and keeps the panel open. Blur closes it, including when the
page runs inside an iframe and only the window loses focus (clicking the
Storybook sidebar used to leave the panel open); Escape and picking still close.
The option rows, the panel padding, the chip remove buttons and the clear button
keep focus (mousedown prevented) so in-panel clicks never dismiss the panel
before they act. The trigger no longer paints the engine's default outline — a
black edge duplicating the shell's ring — and the chips row gives the empty
trigger a definite box (it collapsed to zero height once the chips held the
selection).
