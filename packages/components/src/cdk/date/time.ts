import type { TimeFormatPart, TimeParts } from './types';

/** The default display pattern: mirrors the canonical `HH:mm` shape. */
export const TIME_DEFAULT_FORMAT = 'HH:mm';

const pad = (value: number): string => String(value).padStart(2, '0');

export const isValidTime = ({ hour, minute }: TimeParts): boolean =>
  Number.isInteger(hour) &&
  hour >= 0 &&
  hour <= 23 &&
  Number.isInteger(minute) &&
  minute >= 0 &&
  minute <= 59;

/** Renders clock parts as the canonical time (`HH:mm`, zero-padded). */
export const partsToTimeIso = ({ hour, minute }: TimeParts): string =>
  `${pad(hour)}:${pad(minute)}`;

const TIME_STRICT = /^(\d{2}):(\d{2})$/;
const TIME_LENIENT = /^(\d{1,2}):(\d{1,2})$/;

/**
 * Parses typed text to a canonical `HH:mm` value (or null): the
 * strict zero-padded grammar first, then the lenient `H:m` spelling.
 * Clock-invalid values (hour > 23, minute > 59) return null — like
 * the date editor, the rollback is the verdict.
 */
export const parseTimeText = (text: string): string | null => {
  const trimmed = text.trim();
  const match = TIME_STRICT.exec(trimmed) ?? TIME_LENIENT.exec(trimmed);
  if (match === null) {
    return null;
  }
  const parts = { hour: Number(match[1]), minute: Number(match[2]) };
  return isValidTime(parts) ? partsToTimeIso(parts) : null;
};

const isTokenLetter = (char: string): boolean =>
  char === 'H' || char === 'h' || char === 'm' || char === 'M';

/**
 * Compiles a time pattern into literal/token parts. Unlike the date
 * compiler, the case carries the word: `H` is the 24-hour clock,
 * `h` wraps to 12 hours (AM/PM assumptions stay out of v1), `m`/`M`
 * are minutes — consecutive runs of one letter give the length
 * (`HH` = padded, `H` = bare).
 */
export const compileTimePattern = (pattern: string): TimeFormatPart[] => {
  const parts: TimeFormatPart[] = [];
  let index = 0;
  while (index < pattern.length) {
    const char = pattern[index];
    if (isTokenLetter(char)) {
      let end = index;
      while (end < pattern.length && pattern[end] === char) {
        end += 1;
      }
      const length = end - index;
      parts.push({
        type: char === 'H' ? 'hour24' : char === 'h' ? 'hour12' : 'minute',
        length,
      });
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

const renderPart = (part: TimeFormatPart, time: TimeParts): string => {
  if (part.type === 'literal') {
    return part.text;
  }
  if (part.type === 'minute') {
    return part.length === 1 ? String(time.minute) : pad(time.minute);
  }
  const hour12 = part.type === 'hour12' ? time.hour % 12 || 12 : time.hour;
  return part.length === 1 ? String(hour12) : pad(hour12);
};

/**
 * Renders a canonical `HH:mm` value through the pattern (default
 * `HH:mm`). Null, syntactically broken or clock-invalid values render
 * the empty string — the display never invents digits.
 */
export const formatTime = (iso: string | null, pattern: string = TIME_DEFAULT_FORMAT): string => {
  if (iso === null) {
    return '';
  }
  const match = TIME_STRICT.exec(iso);
  if (match === null) {
    return '';
  }
  const time = { hour: Number(match[1]), minute: Number(match[2]) };
  if (!isValidTime(time)) {
    return '';
  }
  return compileTimePattern(pattern)
    .map((part) => renderPart(part, time))
    .join('');
};

/**
 * The column options of the roll picker: zero-padded strings, `00`…
 * `23` for hours, `00`…`59` for minutes. Pure data — the panel paints
 * it, nothing else.
 */
export const buildTimeOptions = (kind: 'hour' | 'minute'): string[] =>
  Array.from({ length: kind === 'hour' ? 24 : 60 }, (_, index) => pad(index));
