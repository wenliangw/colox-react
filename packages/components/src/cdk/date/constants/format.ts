import type { DateGranularity, ParsePrecision } from '../types';

/**
 * The default display pattern per granularity: the pattern mirrors the
 * value shape (`date` shows the full date, `year` the bare year) —
 * always overridable through `valueFormat`.
 */
export const PICKER_DEFAULT_FORMAT: Record<DateGranularity, string> = {
  date: 'yyyy-MM-dd',
  month: 'yyyy-MM',
  year: 'yyyy',
};

/** The pattern-letter alphabet: `y`/`m`/`d`/`e` (case-insensitive) → token type. */
export const TOKEN_TYPES = { y: 'year', m: 'month', d: 'day', e: 'weekday' } as const;

/** How far a parsed spelling pins the date — the granularity ladder (year / month / date). */
export const GRANULARITY_PRECISION: Record<DateGranularity, ParsePrecision> = {
  year: 0,
  month: 1,
  date: 2,
};

/** The value-word pattern each granularity renders — the canonical ladder. */
export const GRANULARITY_PATTERN: Record<DateGranularity, string> = {
  year: 'yyyy',
  month: 'yyyy-MM',
  date: 'yyyy-MM-dd',
};
