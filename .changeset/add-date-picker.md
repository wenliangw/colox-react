---
'@colox/react': minor
'@colox/wiki': minor
'@colox/icons': minor
---

Add DatePicker: a single-line date editor on a text input plus a
self-drawn panel riding the cdk popup. The `picker` chooses the
granularity — a Monday-first day grid, a 12-month grid or a 12-year
decade window (`'date' | 'month' | 'year'`, default `'date'`) — and the
canonical value shape follows it (`YYYY-MM-DD` / `YYYY-MM` / `YYYY`,
`null` as the empty state). The panel header title is a drill path
with split segments — the day grid's month segment climbs to the
month grid while its year segment jumps straight to the decade grid,
cell picks descend back down — and single/double chevrons step the
level or its parent granularity, far dates skipping the stepping
entirely. `valueFormat` renders the display
with standard date-pattern tokens (`yyyy`/`yy`, `M`/`MM`, `d`/`dd`,
and weekday `EEE`/`EEEE` — display-only, never parsed; default per
picker)
while the value and change payload stay canonical at the picker
granularity regardless of the format. Typed text commits only when its
precision reaches the picker (finer input truncates, coarser rolls
back): the canonical grammars (`YYYY-MM-DD` / `YYYY/M/D` / `YYYY-M`
/ `YYYY`) stay accepted everywhere. Partial drafts never notify and
roll back on blur, out-of-range typed values hold silently and roll
back to the committed value (dates roll back — they have no honest
clamp); `min`/`max` disable panel cells by granularity-prefix
comparison and gate typed commits. The panel chrome ships in Chinese
(`2026年3月`, `一…日`, decade `2020–2031年`) with a data-only `locale`
prop; the palette six families color the selection semantics only
(selected cell solid, the empty-field current cell wears the subtle
wash); `clearable` follows the Select interaction (the trailing glyph
swaps into the ✕ control on hover/focus); ARIA grid keyboard (arrows /
Home / End / PageUp / PageDown / Enter / Space, Escape closes;
chevrons step months or decades); per-subpath entry
`@colox/react/date-picker`, preview stories and a docs page; wiki
component map updated in lockstep. Adds IconCalendar (stroke calendar
frame) to `@colox/icons` — used as the decorative trailing glyph.