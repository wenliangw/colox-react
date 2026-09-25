---
'@colox/react': minor
'@colox/wiki': minor
---

The cdk date core becomes a public pure-function toolbelt:
`@colox/react/cdk/date` exports one capability suite over a single
immutable notion of a date — no chained instance, the functions are
the surface.

- **Normalize**: `dateParts(value, fallback?)` — accepts strings
  (datetime `YYYY-MM-DD[T ]H:mm[:ss]`, date `YYYY[/-]M[/-]D`,
  `YYYY-M[M]`, bare `YYYY` and the `…Z` instant word, which
  round-trips through the local wall clock), native `Date` (read
  at the local wall clock) or the parts formats — and emits the
  full coordinate: `{ year, month, day, hour, minute, second,
  weekday }` with the Monday-first weekday index (0 = Monday). An
  optional fallback turns the honest `TypeError` into a
  caller-owned safety net (`dateParts(value, null)` — the value-word
  gate).
- **Render**: `dateFormat(value, pattern)` — the single pattern
  grammar (`y`/`M`/`d`/`E`/`H`/`h`/`m`/`s`; case carries `M` month
  vs `m` minute, `H` 24-hour vs `h` 12-hour; letter length drives
  zero-padding). The display outlet never throws — null sources and
  garbage render `null`, so UIs map their own empty text with `?? ''`.
- **Shift**: the whole `add*` family returns plain coordinates —
  `addYears` / `addMonths` (calendar-true clamps: Feb 29 → Feb 28,
  day 31 → month end) / `addWeeks` / `addDays` / `addHours` /
  `addMinutes` / `addSeconds` — the clock rides along on day-level
  shifts.
- **Measure**: `dateDiff(end, start, unit)` with units
  `year | month | day | hour | minute | second` returns the
  calendar-truth `{ count, remainder }`: the max whole units pushed
  from `start` without crossing `end`, and the honest residue in the
  next-lower unit (year/month → days, day → hours, hour → minutes,
  minute → seconds; seconds are the floor). An `end` before `start`
  flips negative.
- **Boundaries**: `dateStartOf` / `dateEndOf(value, granularity)`
  with `year | month | week | day | hour | minute | second` —
  Monday starts the week, Sunday 23:59:59 ends it.
- **Bridges and ids**: `today()` — native `Date` at the local today
  midnight; `dateTimestamp(value)` — local wall-clock epoch
  milliseconds; `DATEID()` — a 17-digit numeric unique id (13-digit
  epoch millisecond + 4-digit same-millisecond sequence, no
  separators); `secondsToMinutes` / `secondsToHours` /
  `secondsToDays` / `secondsToWeeks` — raw conversions, no rounding
  (the caller's rounding policy).

The `date()` chained value object, `format`, `iso()` and the
`ColoxDate` type are superseded and removed: chaining may return as
an upper sugar layer once the pure base settles. Timezone support
and localization are named gaps the same base will host later. The
date picker consumes only the public face; its private parse helpers
live in its own utils.

The `@colox/wiki` component map and the date-picker skill documents
follow the new surface.