---
'@colox/react': minor
'@colox/wiki': minor
'@colox/icons': minor
---

Add TimePicker: a single-line time editor on a text input plus a
self-drawn panel riding the cdk popup. The panel holds two pure-number
cyclic columns — hours 00–23 and minutes 00–59 — each an 8-option
window scrolled by the up/down chevron buttons in 7-option steps (no
scrollbar). Picking an option merges it into the value, commits and
closes (the date-picker pick-and-commit family semantic); the
committed option wears the palette solid, the window seats a
committed value at slot 4 (3 above / 4 below) and the system clock
when empty. The canonical value is the fixed-width `HH:mm` word
(`null` as the empty state) and the change payload stays the family
`{ event, value }` shape; `valueFormat` renders the display with the
standard clock-pattern tokens (`H`/`HH`, `h`/`hh`, `m`/`mm` —
display-only, never parsed; default `'HH:mm'`) while the value and
payload stay canonical. Typed text commits complete in-bounds words
immediately through the canonical/literal grammars; partial drafts
never notify and roll back on blur, out-of-range typed values hold
silently and roll back to the committed value (times roll back — they
have no honest clamp); `min`/`max` (string or Date, compared at local
wall-clock time) disable panel options by their merge result — a pick
can never commit an out-of-bounds word — and gate typed commits.
Column keyboard: ↑/↓ single steps (the window slides at the edges),
PgUp/PgDn ride the 7-option step, Home/End land the column bounds,
←/→ swap columns, Enter/Space select, Escape closes; the field opens
the panel on ArrowDown/Enter. Per-subpath entry `@colox/react/time-picker`,
preview stories, a docs page, the wiki component map and module doc
updated in lockstep. Adds IconClock (stroke clock face with the 4:30 hands pose)
to `@colox/icons` — used as the decorative trailing glyph.