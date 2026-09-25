/**
 * The word grammars the value surface accepts — the single home of
 * every date/time regex in the cdk date core.
 */

/** Value word with a time part: `YYYY-MM-DD[T ]H:mm[:ss]`. */
export const DATETIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/;
/** Lenient full date: `YYYY[/-]M[/-]D` (canonical or slashed, unpadded month/day accepted). */
export const DATE = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
/** Year-month word: `YYYY[/-]M`. */
export const YEAR_MONTH = /^(\d{4})[/-](\d{1,2})$/;
/** Bare year word: `YYYY`. */
export const YEAR = /^(\d{4})$/;
/** The instant word `iso()` emits: full clock, milliseconds, `Z`. Offsets stay an extension point. */
export const INSTANT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/;

/** The canonical ISO grammar ladder for typed text: strict padded full date first, then lenient spellings. */
export const ISO_STRICT = /^(\d{4})-(\d{2})-(\d{2})$/;
export const ISO_LENIENT = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
/** Coarser grammars for the coarser granularities: month and bare year. */
export const ISO_MONTH = /^(\d{4})[/-](\d{1,2})$/;
export const ISO_YEAR = /^(\d{4})$/;
