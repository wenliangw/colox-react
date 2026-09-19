import type {
  DateFormatPart,
  DateFormatToken,
  DateParts,
  DatePickerPicker,
  IsoPrecision,
} from '../types';
import { isValidDate, parseGranularIso, partsToGranularIso, weekdayOfParts } from './date-core';

export const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const WEEKDAY_FULL = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * The default display pattern per picker: the pattern mirrors the
 * value shape (`date` shows the full date, `year` the bare year) —
 * always overridable through `valueFormat`.
 */
export const PICKER_DEFAULT_FORMAT: Record<DatePickerPicker, string> = {
  date: 'yyyy-MM-dd',
  month: 'yyyy-MM',
  year: 'yyyy',
};

const TOKEN_TYPES = { y: 'year', m: 'month', d: 'day', e: 'weekday' } as const;

const isTokenLetter = (char: string): boolean => char.toLowerCase() in TOKEN_TYPES;

/**
 * Compiles a `valueFormat` pattern into literal/token parts. Letters
 * `y`/`m`/`d`/`e` (case-insensitive) are tokens — consecutive runs of
 * the same letter carry one length (`yyyy` = 4, `MM` = 2); every other
 * character is a literal separator. Weekday tokens are display-only.
 */
export const compilePattern = (pattern: string): DateFormatPart[] => {
  const parts: DateFormatPart[] = [];
  let index = 0;
  while (index < pattern.length) {
    const lower = pattern[index].toLowerCase();
    if (isTokenLetter(pattern[index])) {
      let end = index;
      while (end < pattern.length && pattern[end].toLowerCase() === lower) {
        end += 1;
      }
      parts.push({ type: TOKEN_TYPES[lower as keyof typeof TOKEN_TYPES], length: end - index });
      index = end;
    } else {
      let end = index;
      while (end < pattern.length && !isTokenLetter(pattern[end])) {
        end += 1;
      }
      parts.push({ type: 'literal', text: pattern.slice(index, end) });
      index = end;
    }
  }
  return parts;
};

const renderToken = (part: DateFormatToken, parts: DateParts): string => {
  if (part.type === 'year') {
    const text = String(parts.year);
    return part.length <= 2 ? text.slice(-2).padStart(part.length, '0') : text.padStart(4, '0');
  }
  if (part.type === 'month') {
    const text = String(parts.month);
    return part.length === 1 ? text : text.padStart(2, '0');
  }
  if (part.type === 'day') {
    const text = String(parts.day);
    return part.length === 1 ? text : text.padStart(2, '0');
  }
  const names = part.length >= 4 ? WEEKDAY_FULL : WEEKDAY_SHORT;
  return names[weekdayOfParts(parts)];
};

/** Renders a canonical granularity ISO value through the `valueFormat` pattern. */
export const formatIso = (iso: string | null, pattern: string): string => {
  if (iso === null) {
    return '';
  }
  const parts = parseGranularIso(iso);
  if (parts === null) {
    return '';
  }
  return compilePattern(pattern)
    .map((part) => {
      if (part.type === 'literal') {
        return part.text;
      }
      return renderToken(part, parts);
    })
    .join('');
};

const escapeLiteral = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const tokenParseSource = (part: Extract<DateFormatPart, { type: string }>): string | null => {
  switch (part.type) {
    case 'year':
      return part.length <= 2 ? '(\\d{2})' : '(\\d{4})';
    case 'month':
    case 'day':
      return part.length === 1 ? '(\\d{1,2})' : `(\\d{${part.length}})`;
    case 'weekday':
      return '(?:[A-Za-z]+)';
    default:
      return null;
  }
};

/**
 * Builds a parse source from the pattern: token positions capture
 * their digits, weekday tokens match-and-discard (display-only),
 * literals are escaped. Used to accept the configured `valueFormat`
 * alongside the canonical ISO grammar — never to define valid dates.
 */
export const patternToParseSource = (pattern: string): string => {
  let source = '^';
  const parts = compilePattern(pattern);
  for (const part of parts) {
    source += part.type === 'literal' ? escapeLiteral(part.text) : (tokenParseSource(part) ?? '');
  }
  return `${source}$`;
};

/** A parse hit: day-accurate parts plus the precision the text pinned. */
interface ParsedMatch {
  parts: DateParts;
  precision: IsoPrecision;
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
  const date = { year, month: month ?? 1, day: day ?? 1 };
  if (!isValidDate(date)) {
    return null;
  }
  const precision: IsoPrecision = day !== undefined ? 2 : month !== undefined ? 1 : 0;
  return { parts: date, precision };
};

const ISO_STRICT = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_LENIENT = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/;
// Coarser grammars for the coarser pickers: month and bare year.
const ISO_MONTH = /^(\d{4})[/-](\d{1,2})$/;
const ISO_YEAR = /^(\d{4})$/;

/** The canonical ISO grammars across precisions: full date, year-month, bare year. */
const parseByGrammar = (text: string): ParsedMatch | null => {
  const full = ISO_STRICT.exec(text) ?? ISO_LENIENT.exec(text);
  if (full !== null) {
    const date = { year: Number(full[1]), month: Number(full[2]), day: Number(full[3]) };
    return isValidDate(date) ? { parts: date, precision: 2 as IsoPrecision } : null;
  }
  const monthMatch = ISO_MONTH.exec(text);
  if (monthMatch !== null) {
    const date = { year: Number(monthMatch[1]), month: Number(monthMatch[2]), day: 1 };
    return isValidDate(date) ? { parts: date, precision: 1 as IsoPrecision } : null;
  }
  const yearMatch = ISO_YEAR.exec(text);
  if (yearMatch !== null) {
    const date = { year: Number(yearMatch[1]), month: 1, day: 1 };
    return isValidDate(date) ? { parts: date, precision: 0 as IsoPrecision } : null;
  }
  return null;
};

const PICKER_PRECISION: Record<DatePickerPicker, IsoPrecision> = {
  year: 0,
  month: 1,
  date: 2,
};

/**
 * Parses typed text to a canonical value at the picker granularity
 * (or null): the configured `valueFormat` pattern first, then the
 * canonical ISO grammars (`YYYY-MM-DD`, `YYYY/M/D`, `YYYY-M[M]` and
 * bare `YYYY`). A draft commits only when its precision reaches the
 * picker's granularity — typing more precision is truncated to the
 * picker, typing less does not commit. Invalid calendar dates return
 * null and the editor rolls the draft back.
 */
export const parseDateText = (
  text: string,
  pattern: string,
  picker: DatePickerPicker,
): string | null => {
  const trimmed = text.trim();
  const required = PICKER_PRECISION[picker];
  const fromPattern = parseByPattern(trimmed, pattern);
  if (fromPattern !== null && fromPattern.precision >= required) {
    return partsToGranularIso(fromPattern.parts, picker);
  }
  const fromGrammar = parseByGrammar(trimmed);
  if (fromGrammar !== null && fromGrammar.precision >= required) {
    return partsToGranularIso(fromGrammar.parts, picker);
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
