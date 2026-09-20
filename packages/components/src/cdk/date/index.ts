/**
 * `@colox/react/cdk/date` — the public date/time toolbelt.
 *
 * One value type, fluent and immutable: `date(source)` normalizes
 * value strings (datetime, date, `YYYY-MM`, bare `YYYY`, and the
 * `…Z` instant word spellings), native `Date` (read at the local
 * wall clock) or the parts format (`{ year, month, day, hour?,
 * minute?, second? }`) into a `ColoxDate`, whose chainable math
 * (`addDays` / `addMonths` / `addYears`) keeps civil coordinates
 * all the way through — the zero-timezone discipline holds.
 * `format` renders the display words, `iso()` the instant word
 * (`new Date().toISOString()` shape — full clock, `T`, `Z`, UTC),
 * `parts()` / the standalone `dateParts` yield the plain-object
 * coordinate, `toDate()` is the bridge to native `Date`, and the
 * standalone `format` shorthand works without the `date()` detour.
 *
 * ```ts
 * import { date, dateParts, format } from '@colox/react/cdk/date';
 *
 * date('2026-03-15T08:30').addDays(2).iso('yyyy-MM-dd'); // '2026-03-17'
 * date('2026-03-15').format('yyyy/MM/dd');               // '2026/03/15'
 * date('2026-03-15T08:30').iso();                        // '2026-03-15T00:30:00.000Z' — instant word, UTC
 * format('2026-03-15', 'yyyy年M月d日');                   // standalone
 *
 * date({ year: 2026, month: 3, day: 2 }).format('MM-dd'); // '03-02'
 * date('2026-03-15T08:30').parts();                       // { year, month, day, hour, minute, second }
 * dateParts('2026/3/2');                                  // parts format, no date() detour
 * ```
 */
export { date, dateParts, format } from './date-time';
export type { ColoxDate, DateSource, DateTimeParts } from './date-time';
