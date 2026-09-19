import type { DatePanelLevel, DatePickerGridCell, DatePickerPicker, DateViewport } from '../types';
import {
  buildMonthGrid,
  buildMonthViewCells,
  buildYearViewCells,
  decadeOf,
  parseGranularIso,
  partsToIso,
  todayIso,
} from './date-core';

/** A padded canonical prefix — shared by the view helpers below. */
const pad = (value: number, width: number): string => String(value).padStart(width, '0');

/**
 * The panel viewport discarded by picker. All three variants orbit
 * a year: a calendar month `{year, month}`, a year, or a decade
 * window. Unparsable seeds always land on 1970-built views.
 */
export const fallbackViewOf = (picker: DatePickerPicker): DateViewport => {
  if (picker === 'month') {
    return { picker, year: 1970 };
  }
  if (picker === 'year') {
    return { picker, decadeStart: 1970 };
  }
  return { picker, year: 1970, month: 1 };
};

/**
 * The viewport seeded from a value — or today when empty — resolved
 * at the picker's granularity (a calendar month, a year, a decade
 * window). Unparsable seeds fall back to 1970-built views.
 */
export const viewOfValue = (value: string | null, picker: DatePickerPicker): DateViewport => {
  const parts = parseGranularIso(value === null ? todayIso() : value);
  if (parts === null) {
    return fallbackViewOf(picker);
  }
  if (picker === 'month') {
    return { picker, year: parts.year };
  }
  if (picker === 'year') {
    return { picker, decadeStart: decadeOf(parts.year) };
  }
  return { picker, year: parts.year, month: parts.month };
};

/** The year the viewport orbits (a decade view orbits its start). */
export const viewYearOf = (view: DateViewport): number =>
  view.picker === 'year' ? view.decadeStart : view.year;

/** The viewport's decade window start. */
export const viewDecadeOf = (view: DateViewport): number =>
  view.picker === 'year' ? view.decadeStart : decadeOf(view.year);

/**
 * The grid's first cell within the view for the given level (the
 * focus fallback): the month's 1st, January — or the decade start.
 */
export const viewBeginsAt = (view: DateViewport, level: DatePanelLevel): string => {
  if (level === 'month') {
    return `${pad(viewYearOf(view), 4)}-01`;
  }
  if (level === 'year') {
    return pad(viewDecadeOf(view), 4);
  }
  return partsToIso({
    year: viewYearOf(view),
    month: view.picker === 'date' ? view.month : 1,
    day: 1,
  });
};

/** Whether a granularity iso belongs to the level's grid. */
export const belongsToView = (iso: string, view: DateViewport, level: DatePanelLevel): boolean => {
  const parts = parseGranularIso(iso);
  if (parts === null) {
    return false;
  }
  if (level === 'month') {
    return parts.year === viewYearOf(view);
  }
  if (level === 'year') {
    return decadeOf(parts.year) === viewDecadeOf(view);
  }
  return view.picker === 'date' && parts.year === view.year && parts.month === view.month;
};

/**
 * The viewport whose level-grid contains the canonical iso, keeping
 * the current viewport's variant and (for the month variant) its
 * month — a year hop at a coarser level leaves the day view intact.
 */
export const viewportOfCell = (
  iso: string,
  view: DateViewport,
  level: DatePanelLevel,
): DateViewport => {
  const parts = parseGranularIso(iso);
  if (parts === null) {
    return fallbackViewOf(view.picker);
  }
  if (level === 'year') {
    if (view.picker === 'year') {
      return { picker: 'year', decadeStart: decadeOf(parts.year) };
    }
    if (view.picker === 'month') {
      return { picker: 'month', year: parts.year };
    }
    return { picker: 'date', year: parts.year, month: view.month };
  }
  if (level === 'month') {
    if (view.picker === 'month') {
      return { picker: 'month', year: parts.year };
    }
    if (view.picker === 'date') {
      return { picker: 'date', year: parts.year, month: view.month };
    }
    return fallbackViewOf(view.picker);
  }
  return { picker: 'date', year: parts.year, month: parts.month };
};

/**
 * The level's grid cells ready for paint: day cells carry the
 * adjacent-month dim flag, month cells the month label, year cells
 * the year digits. `null` when the level cannot paint the viewport
 * (a day level over a month/year picker viewport — unreachable in
 * practice, guarding the discriminated union).
 */
export const gridCellsOf = (
  view: DateViewport,
  months: string[],
  level: DatePanelLevel,
): DatePickerGridCell[] | null => {
  if (level === 'date') {
    if (view.picker !== 'date') {
      return null;
    }
    return buildMonthGrid(view.year, view.month).map((cell) => ({
      iso: cell.iso,
      label: String(cell.day),
      inView: cell.inMonth,
    }));
  }
  if (level === 'year') {
    return buildYearViewCells(viewDecadeOf(view)).map((cell) => ({
      iso: cell.iso,
      label: String(cell.year),
    }));
  }
  return buildMonthViewCells(viewYearOf(view)).map((cell) => ({
    iso: cell.iso,
    label: months[cell.month - 1],
  }));
};
