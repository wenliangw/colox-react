---
'@colox/react': minor
'@colox/wiki': minor
---

The cdk date core becomes a public toolbelt: `@colox/react/cdk/date`
ships one immutable value type with a fluent surface — the `date`
factory normalizes strings (datetime, date, `YYYY-MM`, bare `YYYY`
and the `…Z` instant word) or native `Date` (read at the local wall
clock) into a `ColoxDate`, whose `addDays` / `addMonths` / `addYears`
chain through civil coordinates (zero-timezone discipline intact).
`format` renders the display word through a combined token grammar
(`yyyy`/`yy`, `M` padded vs bare, `d`, `EEE`/`EEEE` weekdays,
`H`/`h` 24/12-hour, `m` minutes, `s` seconds — case carries `M`
month vs `m` minute), `iso()` emits the instant word in
`toISOString()` shape (full clock, `T`, `Z`, UTC) and round-trips
into the factory, and `toDate()` bridges to native `Date`. A
standalone `format(value, pattern)` works without the `date()`
detour. The date picker keeps reading the core from the cdk
submodules (zero visual change); its util files move along with
their tests, joined by the new value-object module.