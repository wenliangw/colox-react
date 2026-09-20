/**
 * `@colox/react/cdk/date` — the public date/time toolbelt.
 *
 * One value type, fluent and immutable: `date(source)` normalizes
 * `string` (datetime, date, `YYYY-MM`, bare `YYYY`, and the `…Z`
 * instant word spellings) or native `Date` (read at the local wall
 * clock) into a `ColoxDate`, whose chainable math (`addDays` /
 * `addMonths` / `addYears`) keeps civil coordinates all the way
 * through — the zero-timezone discipline holds. `format` renders the
 * display words, `iso()` the instant word (`new Date().toISOString()`
 * shape — full clock, `T`, `Z`, UTC), `toDate()` is the bridge to
 * native `Date`, and the standalone `format` shorthand works without
 * the `date()` detour.
 *
 * ```ts
 * import { date, format } from '@colox/react/cdk/date';
 *
 * date('2026-03-15T08:30').addDays(2).iso('yyyy-MM-dd'); // '2026-03-17'
 * date('2026-03-15').format('yyyy/MM/dd');               // '2026/03/15'
 * date('2026-03-15T08:30').iso();                        // '2026-03-15T00:30:00.000Z' — instant word, UTC
 * format('2026-03-15', 'yyyy年M月d日');                   // standalone
 * ```
 */
export { date, format } from './date-time';
export type { ColoxDate, DateSource } from './date-time';
