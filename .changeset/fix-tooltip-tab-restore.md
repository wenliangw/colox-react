---
'@colox/react': patch
---

Fix the Tooltip hover channel across a browser tab roundtrip. A click focuses
the trigger and the focus leg opens the panel instantly; switching the tab
away and back re-plants that focus — a non-gesture that re-opened the panel
with no pointer around and no further blur to close it, so it stuck open
forever. The hover channel now swallows the restored focus once: element and
window blur (plus visibilitychange-hidden) arm the swallow, any real pointer
or keyboard input re-arms the leg, so clicking or Tab into the trigger still
opens instantly. A lost window also cancels both pending delay timers, so a
hover interrupted by a tab switch can no longer open the panel from the
background.