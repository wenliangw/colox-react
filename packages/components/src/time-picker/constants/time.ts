/**
 * Time-domain constants: the cycle sizes of the three columns and the
 * canonical word shape. The hook, the panel and the format utils all
 * read them from here — one source, imported by name.
 */

/** The default display pattern — the canonical word shape (`HH:mm:ss`). */
export const TIME_DEFAULT_FORMAT = 'HH:mm:ss';

/** The hour/minute/second cycle sizes (all three columns wrap). */
export const HOUR_COUNT = 24;
export const MINUTE_COUNT = 60;
export const SECOND_COUNT = 60;
