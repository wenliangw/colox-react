import type { KeyboardEvent } from 'react';
import type { ResolvedDatePickerLocale } from './component';
import type { DatePanelLevel, DateViewport } from './utils';

/**
 * The calendar panel: header (single/double chevron groups + the
 * drilling title slot) over the level's grid.
 */
export interface DatePickerPanelProps {
  /** The grid level to render (base = the picker; drilling climbs). */
  level: DatePanelLevel;
  /** The displayed grid (viewport, discriminated by the picker). */
  view: DateViewport;
  /** The resolved panel chrome locale (defaults filled). */
  locale: ResolvedDatePickerLocale;
  /** The committed selection (canonical at the granularity), if any. */
  selected: string | null;
  /** Today's ISO date (current-cell highlight derives from it). */
  today: string;
  /** The keyboard focus anchor (selection, current, or the grid's home). */
  activeIso: string | null;
  /** Shifts the grid by the single-chevron step (month/year per level). */
  onShiftView: (delta: number) => void;
  /** Shifts the grid by the double-chevron step (year/decade per level). */
  onShiftDoubleView: (delta: number) => void;
  /** Picks a cell: commits at the base level, descends a level above it. */
  onSelectCell: (iso: string) => void;
  /** Drills to a target level via the header (day grid → month/year). */
  onTitleClick: (target: DatePanelLevel) => void;
  /** Grid key navigation for a cell. */
  onGridKeyDown: (event: KeyboardEvent<HTMLButtonElement>, iso: string) => void;
  /** Whether a cell value is outside `[min, max]`. */
  isDisabled: (iso: string) => boolean;
}

/** The level's grid body: day grid, 12-month grid or decade window. */
export interface DatePickerGridProps {
  /** The grid level to render. */
  level: DatePanelLevel;
  /** The displayed viewport (discriminated by the picker). */
  view: DateViewport;
  /** The resolved panel chrome locale (weekday row, month labels). */
  locale: ResolvedDatePickerLocale;
  /** The committed selection (canonical at the granularity), if any. */
  selected: string | null;
  /** Today's ISO date (current-cell highlight derives from it). */
  today: string;
  /** The keyboard focus anchor (selection, current, or the grid's home). */
  activeIso: string | null;
  /** Picks a cell: commits at the base level, descends a level above it. */
  onSelectCell: (iso: string) => void;
  /** Grid key navigation for a cell. */
  onGridKeyDown: (event: KeyboardEvent<HTMLButtonElement>, iso: string) => void;
  /** Whether a cell value is outside `[min, max]`. */
  isDisabled: (iso: string) => boolean;
}

/** One chevron group: the double arrow plus the single (year panel: double only). */
export interface DatePickerNavGroupProps {
  /** Which edge of the header the group sits on (start = previous, end = next). */
  side: 'start' | 'end';
  /** The grid level — the arrows' step sizes follow it. */
  level: DatePanelLevel;
  /** Shifts the grid by the single-chevron step (month/year per level). */
  onShiftView: (delta: number) => void;
  /** Shifts the grid by the double-chevron step (year/decade per level). */
  onShiftDoubleView: (delta: number) => void;
}

/** The header title slot: drilling path, split into its segments. */
export interface DatePickerTitleSlotProps {
  /** The grid level the title speaks for. */
  level: DatePanelLevel;
  /** The displayed viewport (discriminated by the picker). */
  view: DateViewport;
  /** The resolved panel chrome locale (title composition). */
  locale: ResolvedDatePickerLocale;
  /** Drills to a target level via the header (day grid → month/year). */
  onTitleClick: (target: DatePanelLevel) => void;
}
