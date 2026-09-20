import { parseGranularIso, partsToIso } from './civil';

/**
 * A canonical granularity ISO value as a native `Date`, read at the
 * browser's local calendar wall clock — `'2026-03'` becomes local
 * midnight of the 1st (the implicit day the granularity carries).
 * Calendar-invalid or null input returns null. This is the one-way
 * hatch consumers use when they need a `Date`: the value contract
 * itself stays the ISO string.
 */
export const toLocalDate = (iso: string | null): Date | null => {
  if (iso === null) {
    return null;
  }
  const parts = parseGranularIso(iso);
  if (parts === null) {
    return null;
  }
  return new Date(parts.year, parts.month - 1, parts.day);
};

/**
 * A native `Date` as its browser-local calendar date string
 * (`getFullYear`/`getMonth`/`getDate` — the wall clock the author
 * sees, never the UTC instant). The reverse hatch for bounds and
 * seeds that arrive as `Date` objects.
 */
export const fromLocalDate = (date: Date): string =>
  partsToIso({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() });
