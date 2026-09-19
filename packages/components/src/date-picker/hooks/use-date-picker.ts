import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FocusEventHandler, KeyboardEvent, KeyboardEventHandler } from 'react';
import type {
  DatePanelLevel,
  DateParts,
  DateViewport,
  UseDatePickerParams,
  UseDatePickerResult,
} from '../types';
import {
  addMonths,
  civilFromDays,
  daysFromCivil,
  granularIsoOf,
  parseGranularIso,
  partsToIso,
  todayIso,
  weekdayOfParts,
} from '../utils/date-core';
import { formatIso, isDraftAllowed, parseDateText } from '../utils/format-date';
import {
  belongsToView,
  viewBeginsAt,
  viewDecadeOf,
  viewOfValue,
  viewportOfCell,
  viewYearOf,
} from '../utils/view';

/** A padded canonical prefix — shared by the grid arithmetic below. */
const pad = (value: number, width: number): string => String(value).padStart(width, '0');

/**
 * The focus anchor for a (view, level) pair: the selection, then
 * today at the level's granularity, then the grid's home — whichever
 * lands inside the grid and the bounds first. The selection and
 * today are granularized to the level first: a full-date value can
 * anchor a month grid only as `YYYY-MM` (the cells' own word).
 */
const anchorOf = (
  view: DateViewport,
  level: DatePanelLevel,
  current: string | null,
  today: string,
  isDisabled: (iso: string) => boolean,
): string | null => {
  const currentAtLevel = current === null ? null : granularIsoOf(current, level);
  const todayAtLevel = granularIsoOf(today, level);
  return (
    [currentAtLevel, todayAtLevel, viewBeginsAt(view, level)].find(
      (candidate) =>
        candidate !== null && belongsToView(candidate, view, level) && !isDisabled(candidate),
    ) ?? null
  );
};

/**
 * The date editor state machine + panel state:
 *
 * - **draft**: every user transition passes the permissive gate
 *   (digits, letters, the pattern's literal characters and the
 *   canonical separators); rejected keystrokes keep the previous
 *   draft. Complete in-bounds values commit immediately as canonical
 *   at the picker granularity (a year, a month or a date); partial
 *   drafts never notify and blur rolls them back — the same
 *   `'' → null` empty terminal as the number editor.
 * - **bounds**: `[min, max]` are editor mechanics, not validation —
 *   cells outside them render disabled and a typed out-of-range
 *   value holds silently until blur rolls it back (dates have no
 *   honest clamp, so rollback is the mechanism). Month/year cells
 *   compare their granularity prefix against the bounds.
 * - **display**: typed text stays verbatim while focused; panel
 *   commits and blur normalization render through `valueFormat`.
 *   The committed value is always canonical at the picker
 *   granularity — the format never touches the payload.
 * - **panel**: open state (controlled or internal), the viewport
 *   (resets to the selection/today on open), the grid LEVEL — the
 *   base level equals the picker and drilling climbs through the
 *   clickable title (day → month → decade grid); cell picks above
 *   the base level descend one level instead of committing, and a
 *   pick at the base level commits. Step navigation (month/year/
 *   decade) and the grid keyboard rotation follow the level. The
 *   consumer's native handlers run after the internal bookkeeping.
 */
export const useDatePicker = ({
  inputRef,
  panelRef,
  picker,
  value,
  defaultValue,
  min,
  max,
  valueFormat,
  open,
  defaultOpen,
  onChange,
  onOpenChange,
  onBlur,
  onKeyDown,
}: UseDatePickerParams): UseDatePickerResult => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue ?? null);
  // `null` is the real empty state — resolve on `undefined`, never
  // with `??` (which would swallow a controlled null).
  const current = isControlled ? value : innerValue;

  const [draft, setDraft] = useState<string>(() =>
    formatIso(isControlled ? (value ?? null) : (defaultValue ?? null), valueFormat),
  );
  const lastCommittedRef = useRef<string | null>(current);
  // Cross-view keyboard hops change the view — the target cell only
  // exists after the re-render, so the focus lands via the effect
  // below instead of synchronously.
  const pendingFocusRef = useRef<string | null>(null);

  const openControlled = open !== undefined;
  const [innerOpen, setInnerOpen] = useState<boolean>(defaultOpen ?? false);
  const isOpen = openControlled ? open : innerOpen;

  const [view, setView] = useState<DateViewport>(() => viewOfValue(current, picker));
  // The grid level: the base level equals the picker; drilling climbs
  // to coarser grids and cell picks descend back down.
  const [level, setLevel] = useState<DatePanelLevel>(picker);

  // External value moves resync the draft; own commits update the ref
  // first so the echo never clobbers what the user is typing.
  useEffect(() => {
    if (current !== lastCommittedRef.current) {
      lastCommittedRef.current = current;
      setDraft(formatIso(current, valueFormat));
    }
  }, [current, valueFormat]);

  // A picker switch changes the value shape and the panel grid — the
  // view and level re-seed from the committed value. The ref guard
  // keeps plain value echoes from snapping the view while the user
  // navigates.
  const pickerRef = useRef(picker);
  useEffect(() => {
    if (pickerRef.current !== picker) {
      pickerRef.current = picker;
      setView(viewOfValue(current, picker));
      setLevel(picker);
    }
  }, [picker, current]);

  const isDisabled = useCallback(
    (iso: string): boolean => {
      // Bounds are canonical date strings; a coarser granularity iso
      // compares its prefix against the same-length bound prefix.
      if (min !== undefined && iso < min.slice(0, iso.length)) {
        return true;
      }
      if (max !== undefined && iso > max.slice(0, iso.length)) {
        return true;
      }
      return false;
    },
    [min, max],
  );

  const makeChangeEvent = (): ChangeEvent<HTMLInputElement> =>
    ({
      target: inputRef.current,
      currentTarget: inputRef.current,
      type: 'change',
    }) as ChangeEvent<HTMLInputElement>;

  const commit = useCallback(
    (event: ChangeEvent<HTMLInputElement>, nextValue: string | null, display?: string) => {
      lastCommittedRef.current = nextValue;
      if (!isControlled) {
        setInnerValue(nextValue);
      }
      if (display !== undefined) {
        setDraft(display);
      }
      onChange?.({ event, value: nextValue });
    },
    [isControlled, onChange],
  );

  const setOpenPanel = useCallback(
    (next: boolean) => {
      if (!openControlled) {
        setInnerOpen(next);
      }
      onOpenChange?.(next);
    },
    [openControlled, onOpenChange],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    const composing = (event.nativeEvent as InputEvent | undefined)?.isComposing === true;
    if (composing) {
      setDraft(next);
      return;
    }
    if (!isDraftAllowed(next, valueFormat)) {
      setDraft(draft);
      return;
    }
    setDraft(next);
    if (next.trim() === '') {
      // The empty terminal commits null right away (empty is expressible).
      if (lastCommittedRef.current !== null) {
        commit(event, null);
      }
      return;
    }
    const parsed = parseDateText(next, valueFormat, picker);
    if (parsed !== null && !isDisabled(parsed) && parsed !== lastCommittedRef.current) {
      commit(event, parsed);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    const parsed = parseDateText(draft, valueFormat, picker);
    if (parsed === null || isDisabled(parsed)) {
      // Partial or out-of-range: roll back to the last committed value.
      if (draft !== '') {
        setDraft(formatIso(current, valueFormat));
      }
    } else if (parsed !== lastCommittedRef.current) {
      commit(makeChangeEvent(), parsed, formatIso(parsed, valueFormat));
    } else {
      setDraft(formatIso(parsed, valueFormat));
    }
    onBlur?.(event);
  };

  const openPanel = () => {
    if (isOpen) {
      return;
    }
    setView(viewOfValue(current, picker));
    setLevel(picker);
    setOpenPanel(true);
  };

  const closePanel = () => {
    setOpenPanel(false);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault();
      openPanel();
    }
    onKeyDown?.(event);
  };

  /**
   * One chevron step: the single arrow takes the level's own step
   * (month / year / decade) while the double arrow jumps by the
   * parent granularity (year / decade / decade).
   */
  const shiftViewport = (previous: DateViewport, delta: number, big: boolean): DateViewport => {
    if (big) {
      if (previous.picker === 'year') {
        return { picker: 'year', decadeStart: previous.decadeStart + delta * 10 };
      }
      if (previous.picker === 'month') {
        return { picker: 'month', year: previous.year + delta * 10 };
      }
      // A drilled day picker keeps the date variant — the big step
      // follows the level: a year at the day grid, a decade above it.
      if (level === 'date') {
        return { picker: 'date', year: previous.year + delta, month: previous.month };
      }
      return { picker: 'date', year: previous.year + delta * 10, month: previous.month };
    }
    if (level === 'year') {
      if (previous.picker === 'year') {
        return { picker: 'year', decadeStart: previous.decadeStart + delta * 10 };
      }
      if (previous.picker === 'month') {
        return { picker: 'month', year: previous.year + delta * 10 };
      }
      return { picker: 'date', year: previous.year + delta * 10, month: previous.month };
    }
    if (level === 'month') {
      if (previous.picker === 'month') {
        return { picker: 'month', year: previous.year + delta };
      }
      if (previous.picker === 'date') {
        return { picker: 'date', year: previous.year + delta, month: previous.month };
      }
      return previous;
    }
    if (previous.picker === 'date') {
      const shifted = addMonths({ year: previous.year, month: previous.month, day: 1 }, delta);
      return { picker: 'date', year: shifted.year, month: shifted.month };
    }
    return previous;
  };

  const shiftView = (delta: number) => {
    setView((previous) => shiftViewport(previous, delta, false));
  };

  const shiftDoubleView = (delta: number) => {
    setView((previous) => shiftViewport(previous, delta, true));
  };

  /**
   * A pick on a drilled level descends one level instead of
   * committing — the next grid (and its focus anchor) renders from
   * the picked cell's year/month.
   */
  const descendFrom = (iso: string): { view: DateViewport; level: DatePanelLevel } | null => {
    const parts = parseGranularIso(iso);
    if (parts === null) {
      return null;
    }
    if (level === 'month') {
      return { view: { picker: 'date', year: parts.year, month: parts.month }, level: 'date' };
    }
    if (picker === 'month') {
      return { view: { picker: 'month', year: parts.year }, level: 'month' };
    }
    return {
      view: {
        picker: 'date',
        year: parts.year,
        month: view.picker === 'date' ? view.month : 1,
      },
      level: 'month',
    };
  };

  const handleSelectCell = (iso: string) => {
    if (isDisabled(iso)) {
      return;
    }
    if (level !== picker) {
      const next = descendFrom(iso);
      if (next === null) {
        return;
      }
      pendingFocusRef.current = anchorOf(next.view, next.level, current, todayIso(), isDisabled);
      setView(next.view);
      setLevel(next.level);
      return;
    }
    commit(makeChangeEvent(), iso, formatIso(iso, valueFormat));
    closePanel();
    inputRef.current?.focus();
  };

  /**
   * Drills to a target level via the header: the day grid's month
   * segment climbs one level while its year segment jumps straight
   * to the decade grid — the climb always moves upward.
   */
  const handleTitleClick = (target: DatePanelLevel) => {
    if (target === level || target === 'date') {
      return;
    }
    pendingFocusRef.current = anchorOf(view, target, current, todayIso(), isDisabled);
    setLevel(target);
  };

  const handleClear = () => {
    if (lastCommittedRef.current !== null) {
      commit(makeChangeEvent(), null, '');
    }
    closePanel();
    inputRef.current?.focus();
  };

  const focusCell = (iso: string) => {
    const cell = panelRef.current?.querySelector<HTMLButtonElement>(`[data-iso="${iso}"]`);
    cell?.focus();
  };

  useEffect(() => {
    if (pendingFocusRef.current !== null) {
      const target = pendingFocusRef.current;
      pendingFocusRef.current = null;
      focusCell(target);
    }
  });

  /** One grid rotation step at the level's granularity (null = off-map). */
  const moveCell = (iso: string, key: string): string | null => {
    const parts = parseGranularIso(iso);
    if (parts === null) {
      return null;
    }
    if (level === 'date') {
      let next: DateParts | null = null;
      if (key === 'ArrowLeft') {
        next = civilFromDays(daysFromCivil(parts) - 1);
      } else if (key === 'ArrowRight') {
        next = civilFromDays(daysFromCivil(parts) + 1);
      } else if (key === 'ArrowUp') {
        next = civilFromDays(daysFromCivil(parts) - 7);
      } else if (key === 'ArrowDown') {
        next = civilFromDays(daysFromCivil(parts) + 7);
      } else if (key === 'Home') {
        next = civilFromDays(daysFromCivil(parts) - weekdayOfParts(parts));
      } else if (key === 'End') {
        next = civilFromDays(daysFromCivil(parts) + (6 - weekdayOfParts(parts)));
      } else if (key === 'PageUp') {
        next = addMonths(parts, -1);
      } else if (key === 'PageDown') {
        next = addMonths(parts, 1);
      }
      return next === null ? null : partsToIso(next);
    }
    if (level === 'month') {
      // The 3×4 grid: Left/Right ±1 month, Up/Down ±3, PageUp/Down
      // ±1 year; Home/End land on the viewed year's edges.
      if (key === 'Home') {
        return `${pad(viewYearOf(view), 4)}-01`;
      }
      if (key === 'End') {
        return `${pad(viewYearOf(view), 4)}-12`;
      }
      let delta: number | null = null;
      if (key === 'ArrowLeft') {
        delta = -1;
      } else if (key === 'ArrowRight') {
        delta = 1;
      } else if (key === 'ArrowUp') {
        delta = -3;
      } else if (key === 'ArrowDown') {
        delta = 3;
      } else if (key === 'PageUp') {
        delta = -12;
      } else if (key === 'PageDown') {
        delta = 12;
      }
      if (delta === null) {
        return null;
      }
      const next = parts.year * 12 + (parts.month - 1) + delta;
      const year = Math.floor(next / 12);
      if (year < 1 || year > 9999) {
        return null;
      }
      return `${pad(year, 4)}-${pad(next - year * 12 + 1, 2)}`;
    }
    // The decade grid: Left/Right ±1, Up/Down ±3, PageUp/Down ±10
    // (decade); Home/End land on the window edges.
    if (key === 'Home') {
      return pad(viewDecadeOf(view), 4);
    }
    if (key === 'End') {
      return String(viewDecadeOf(view) + 11);
    }
    let delta: number | null = null;
    if (key === 'ArrowLeft') {
      delta = -1;
    } else if (key === 'ArrowRight') {
      delta = 1;
    } else if (key === 'ArrowUp') {
      delta = -3;
    } else if (key === 'ArrowDown') {
      delta = 3;
    } else if (key === 'PageUp') {
      delta = -10;
    } else if (key === 'PageDown') {
      delta = 10;
    }
    if (delta === null) {
      return null;
    }
    const nextYear = parts.year + delta;
    if (nextYear < 1 || nextYear > 9999) {
      return null;
    }
    return String(nextYear);
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLButtonElement>, iso: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelectCell(iso);
      return;
    }
    const nextIso = moveCell(iso, event.key);
    if (nextIso === null || nextIso === iso || isDisabled(nextIso)) {
      return;
    }
    event.preventDefault();
    if (!belongsToView(nextIso, view, level)) {
      pendingFocusRef.current = nextIso;
      setView(viewportOfCell(nextIso, view, level));
      return;
    }
    focusCell(nextIso);
  };

  // The focus anchor: selection first, then today at the level's
  // granularity, then the grid's home — whichever lands inside the
  // view and bounds.
  const activeIso = anchorOf(view, level, current, todayIso(), isDisabled);

  return {
    current,
    draft,
    open: isOpen,
    view,
    level,
    activeIso,
    handleChange,
    handleBlur,
    handleKeyDown,
    openPanel,
    closePanel,
    handleGridKeyDown,
    handleSelectCell,
    handleTitleClick,
    handleClear,
    shiftView,
    shiftDoubleView,
    isDisabled,
  };
};
