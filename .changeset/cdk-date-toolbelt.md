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
detour, `date` accepts the parts format (`{ year, month, day,
hour?, minute?, second? }`), and `parts()` / the standalone
`dateParts(value)` yield the full six-field coordinate back. An
optional fallback argument shifts the honest TypeError into a
caller-owned safety net: `dateParts(value, null)` returns null for
unparsable sources (the value-word gate the picker engine reads
through), `dateParts(value, parts)` returns the given coordinate
untouched. The display outlet never throws either: `format` renders
null for null sources and unparsable strings/Dates, so UIs map
their own empty text with a plain `?? ''`, and loudness (warn /
throw) stays the caller's policy.
`ColoxDate` exposes its method set as the public type only —
construction is sealed behind the factory, no internal entries leak
into the dts. The date picker keeps reading the core from the cdk
submodules (zero visual change); its util files move along with
their tests, joined by the new value-object module.