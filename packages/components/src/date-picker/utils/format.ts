import { isValidDate } from '@colox/cdk/date/calendar';
import { date } from '@colox/cdk/date';
import { compilePattern, patternToParseSource } from '@colox/cdk/date/format';
import type { ParsePrecision } from '@colox/cdk/date/types';
import type { DatePanelLevel } from '../types';

/**
 * The default display pattern per granularity: the pattern mirrors the
 * value shape (`date` shows the full date, `year` the bare year) —
 * always overridable through `valueFormat`.
 */
export const PICKER_DEFAULT_FORMAT: Record<DatePanelLevel, string> = {
  date: 'yyyy-MM-dd',
  month: 'yyyy-MM',
  year: 'yyyy',
};

/** The value-word pattern each granularity renders — the canonical ladder. */
export const GRANULARITY_PATTERN: Record<DatePanelLevel, string> = {
  year: 'yyyy',
  month: 'yyyy-MM',
  date: 'yyyy-MM-dd',
};

/** How far a parsed spelling pins the date — the granularity ladder (year / month / date). */
export const GRANULARITY_PRECISION: Record<DatePanelLevel, ParsePrecision> = {
  year: 0,
  month: 1,
  date: 2,
};

const ISO_STRICT = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_LENIENT = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
// Coarser grammars for the coarser granularities: month and bare year.
const ISO_MONTH = /^(\d{4})[/-](\d{1,2})$/;
const ISO_YEAR = /^(\d{4})$/;

/** A parse hit: day-accurate parts plus the precision the text pinned. */
interface ParsedMatch {
  parts: { year: number; month: number; day: number };
  precision: ParsePrecision;
}

const parseByPattern = (text: string, pattern: string): ParsedMatch | null => {
  const parts = compilePattern(pattern);
  const regex = new RegExp(patternToParseSource(pattern));
  const match = regex.exec(text);
  if (match === null) {
    return null;
  }
  let year: number | undefined;
  let month: number | undefined;
  let day: number | undefined;
  let group = 1;
  for (const part of parts) {
    if (part.type === 'literal' || part.type === 'weekday') {
      continue;
    }
    const value = Number(match[group]);
    group += 1;
    if (part.type === 'year') {
      year = part.length <= 2 ? 2000 + value : value;
    } else if (part.type === 'month') {
      month = value;
    } else {
      day = value;
    }
  }
  if (year === undefined) {
    return null;
  }
  const partsDate = { year, month: month ?? 1, day: day ?? 1 };
  if (!isValidDate(partsDate)) {
    return null;
  }
  const precision: ParsePrecision = day !== undefined ? 2 : month !== undefined ? 1 : 0;
  return { parts: partsDate, precision };
};

/** The canonical ISO grammars across precisions: full date, year-month, bare year. */
const parseByGrammar = (text: string): ParsedMatch | null => {
  const full = ISO_STRICT.exec(text) ?? ISO_LENIENT.exec(text);
  if (full !== null) {
    const parts = { year: Number(full[1]), month: Number(full[2]), day: Number(full[3]) };
    return isValidDate(parts) ? { parts, precision: 2 as ParsePrecision } : null;
  }
  const monthMatch = ISO_MONTH.exec(text);
  if (monthMatch !== null) {
    const parts = { year: Number(monthMatch[1]), month: Number(monthMatch[2]), day: 1 };
    return isValidDate(parts) ? { parts, precision: 1 as ParsePrecision } : null;
  }
  const yearMatch = ISO_YEAR.exec(text);
  if (yearMatch !== null) {
    const parts = { year: Number(yearMatch[1]), month: 1, day: 1 };
    return isValidDate(parts) ? { parts, precision: 0 as ParsePrecision } : null;
  }
  return null;
};

/**
 * Parses typed text to a canonical value at the field granularity
 * (or null): the configured `valueFormat` pattern first, then the
 * canonical ISO grammars (`YYYY-MM-DD`, `YYYY/M/D`, `YYYY-M[M]` and
 * bare `YYYY`). A draft commits only when its precision reaches the
 * granularity — typing more precision is truncated to the granularity,
 * typing less does not commit. Invalid calendar dates return null and
 * the editor rolls the draft back.
 */
export const parseDateText = (
  text: string,
  pattern: string,
  granularity: DatePanelLevel = 'date',
): string | null => {
  const trimmed = text.trim();
  const required = GRANULARITY_PRECISION[granularity];
  const fromPattern = parseByPattern(trimmed, pattern);
  if (fromPattern !== null && fromPattern.precision >= required) {
    return date(fromPattern.parts).format(GRANULARITY_PATTERN[granularity]);
  }
  const fromGrammar = parseByGrammar(trimmed);
  if (fromGrammar !== null && fromGrammar.precision >= required) {
    return date(fromGrammar.parts).format(GRANULARITY_PATTERN[granularity]);
  }
  return null;
};

/**
 * The permissive draft gate: digits, spaces, letters (weekday token
 * prefixes) and the pattern's literal characters plus the canonical
 * separators — so `2026/3/2` types through even when the pattern is
 * `yyyy-MM-dd`. Rejected keystrokes keep the previous draft; the
 * strict parse happens at commit/blur.
 */
export const isDraftAllowed = (text: string, pattern: string): boolean => {
  const allowed = new Set('0123456789 /-.');
  for (const part of compilePattern(pattern)) {
    if (part.type === 'literal') {
      for (const char of part.text) {
        allowed.add(char);
      }
    }
  }
  for (const char of 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    allowed.add(char);
  }
  return [...text].every((char) => allowed.has(char));
};
