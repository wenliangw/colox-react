import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChangeEvent,
  FocusEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  KeyboardEventHandler,
} from 'react';
import type { TimeColumnUnit, UseTimePickerParams, UseTimePickerResult } from '../types';
import {
  COLUMN_STEP,
  COLUMN_VISIBLE,
  HOUR_COUNT,
  MINUTE_COUNT,
  anchorAround,
  canonicalBoundOf,
  formatTimeValue,
  isTimeDraftAllowed,
  parseTimeText,
  timePartsOf,
} from '../utils/format';

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * The time editor state machine + panel state:
 *
 * - **draft**: every user transition passes the permissive gate
 *   (digits, the colon, the pattern's literals); rejected keystrokes
 *   keep the previous draft. Complete in-bounds words commit
 *   immediately as canonical `HH:mm`; partial drafts never notify and
 *   blur rolls them back — the same `'' → null` empty terminal as the
 *   date editor.
 * - **bounds**: `[min, max]` are editor mechanics, not validation —
 *   options outside them render disabled and a typed out-of-range word
 *   holds silently until blur rolls it back. An option's enablement
 *   equals its merge result: an hour enables iff the merge with the
 *   committed minute stays in bounds (and a minute against the
 *   committed hour), so a pick can never commit an out-of-range word.
 * - **display**: typed text stays verbatim while focused; panel
 *   commits and blur normalization render through `valueFormat`. The
 *   committed value is always the canonical `HH:mm` — the format
 *   never touches the payload.
 * - **panel**: open state (controlled or internal) and the two cyclic
 *   column windows — an unwrapped anchor plus an unwrapped keyboard
 *   cursor per column, invariant `anchor ≤ cursor ≤ anchor + visible
 *   - 1`. Opening seats the committed component (or the system clock
 *   hour/minute when empty) at the anchor slot (three options above,
 *   four below). The step buttons shift a window by the 7-option
 *   step; ↑/↓ walk the cursor one option (the window slides by one
 *   to follow it at the edges), PgUp/PgDn ride the step, Home/End
 *   land the column's bounds, ←/→ swap columns, Enter/Space select.
 *   The consumer's native handlers run after the internal
 *   bookkeeping.
 */
export const useTimePicker = ({
  inputRef,
  panelRef,
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
}: UseTimePickerParams): UseTimePickerResult => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string | null>(defaultValue ?? null);
  // `null` is the real empty state — resolve on `undefined`, never
  // with `??` (which would swallow a controlled null).
  const current = isControlled ? value : innerValue;

  const [draft, setDraft] = useState<string>(() =>
    formatTimeValue(isControlled ? (value ?? null) : (defaultValue ?? null), valueFormat),
  );
  const lastCommittedRef = useRef<string | null>(current);

  const openControlled = open !== undefined;
  const [innerOpen, setInnerOpen] = useState<boolean>(defaultOpen ?? false);
  const isOpen = openControlled ? open : innerOpen;

  // The column windows: an unwrapped anchor (window start) plus an
  // unwrapped keyboard cursor per column. Options wrap at render, the
  // unwrapped numbers keep the anchor/cursor maths seam-free.
  const [hourAnchor, setHourAnchor] = useState(0);
  const [minuteAnchor, setMinuteAnchor] = useState(0);
  const [hourCursor, setHourCursor] = useState(0);
  const [minuteCursor, setMinuteCursor] = useState(0);
  // Cross-column keyboard hops re-render the target cursor slot before
  // the programmatic focus can land (the date grid's pattern).
  const pendingFocusRef = useRef<{ unit: TimeColumnUnit; value: number } | null>(null);

  // External value moves resync the draft; own commits update the ref
  // first so the echo never clobbers what the user is typing.
  useEffect(() => {
    if (current !== lastCommittedRef.current) {
      lastCommittedRef.current = current;
      setDraft(formatTimeValue(current ?? null, valueFormat));
    }
  }, [current, valueFormat]);

  const minBound = canonicalBoundOf(min);
  const maxBound = canonicalBoundOf(max);

  const isDisabled = useCallback(
    (word: string): boolean => {
      if (minBound !== null && word < minBound) {
        return true;
      }
      if (maxBound !== null && word > maxBound) {
        return true;
      }
      return false;
    },
    [minBound, maxBound],
  );

  const committedParts = timePartsOf(current) ?? { hour: 0, minute: 0 };

  const isDisabledHour = useCallback(
    (hour: number): boolean => isDisabled(`${pad(hour)}:${pad(committedParts.minute)}`),
    [isDisabled, committedParts.minute],
  );

  const isDisabledMinute = useCallback(
    (minute: number): boolean => isDisabled(`${pad(committedParts.hour)}:${pad(minute)}`),
    [isDisabled, committedParts.hour],
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
    if (!isTimeDraftAllowed(next, valueFormat)) {
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
    const parsed = parseTimeText(next, valueFormat);
    if (parsed !== null && !isDisabled(parsed) && parsed !== lastCommittedRef.current) {
      commit(event, parsed);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    const parsed = parseTimeText(draft, valueFormat);
    if (parsed === null || isDisabled(parsed)) {
      // Partial or out-of-range: roll back to the last committed value.
      if (draft !== '') {
        setDraft(formatTimeValue(current ?? null, valueFormat));
      }
    } else if (parsed !== lastCommittedRef.current) {
      commit(makeChangeEvent(), parsed, formatTimeValue(parsed, valueFormat));
    } else {
      setDraft(formatTimeValue(parsed, valueFormat));
    }
    onBlur?.(event);
  };

  const openPanel = () => {
    if (isOpen) {
      return;
    }
    // The anchor seats the committed component (or the system clock's
    // when the value is empty) at the fixed anchor slot.
    const now = new Date();
    const parts = timePartsOf(current) ?? { hour: now.getHours(), minute: now.getMinutes() };
    setHourAnchor(anchorAround(parts.hour));
    setMinuteAnchor(anchorAround(parts.minute));
    setHourCursor(parts.hour);
    setMinuteCursor(parts.minute);
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

  const columnState = (unit: TimeColumnUnit) =>
    unit === 'hour'
      ? {
          anchor: hourAnchor,
          cursor: hourCursor,
          setAnchor: setHourAnchor,
          setCursor: setHourCursor,
          count: HOUR_COUNT,
        }
      : {
          anchor: minuteAnchor,
          cursor: minuteCursor,
          setAnchor: setMinuteAnchor,
          setCursor: setMinuteCursor,
          count: MINUTE_COUNT,
        };

  /** One cursor step: the window slides by one only at the visible edges. */
  const moveCursor = (unit: TimeColumnUnit, delta: number) => {
    const { anchor, cursor, setAnchor, setCursor } = columnState(unit);
    const next = cursor + delta;
    if (next < anchor) {
      setAnchor(next);
      setCursor(next);
    } else if (next > anchor + COLUMN_VISIBLE - 1) {
      setAnchor(next - (COLUMN_VISIBLE - 1));
      setCursor(next);
    } else {
      setCursor(next);
    }
  };

  const scrollColumn = (unit: TimeColumnUnit, delta: number) => {
    // Window and cursor ride the same step — the cursor keeps its slot.
    const { setAnchor, setCursor } = columnState(unit);
    setAnchor((anchor) => anchor + delta * COLUMN_STEP);
    setCursor((cursor) => cursor + delta * COLUMN_STEP);
  };

  const handleSelectOption = (unit: TimeColumnUnit, option: number) => {
    const next =
      unit === 'hour'
        ? `${pad(option)}:${pad(committedParts.minute)}`
        : `${pad(committedParts.hour)}:${pad(option)}`;
    if (isDisabled(next)) {
      return;
    }
    commit(makeChangeEvent(), next, formatTimeValue(next, valueFormat));
    closePanel();
    inputRef.current?.focus();
  };

  const focusOption = (unit: TimeColumnUnit, value: number) => {
    const column = panelRef.current?.querySelector<HTMLDivElement>(`[data-unit="${unit}"]`);
    column?.querySelector<HTMLButtonElement>(`[data-time="${value}"]`)?.focus();
  };

  useEffect(() => {
    if (pendingFocusRef.current !== null) {
      const target = pendingFocusRef.current;
      pendingFocusRef.current = null;
      focusOption(target.unit, target.value);
    }
  });

  const handleColumnKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    unit: TimeColumnUnit,
    value: number,
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelectOption(unit, value);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveCursor(unit, -1);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveCursor(unit, 1);
      return;
    }
    if (event.key === 'PageUp') {
      event.preventDefault();
      scrollColumn(unit, -1);
      return;
    }
    if (event.key === 'PageDown') {
      event.preventDefault();
      scrollColumn(unit, 1);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const { cursor, setAnchor, setCursor, count } = columnState(unit);
      // Land the column's bound (hour/minute 0 or 23/59), at the
      // nearest unwrapped occurrence to the cursor, then seat it at
      // the anchor slot — the window follows the bound, not the lap.
      const bound = event.key === 'Home' ? 0 : count - 1;
      const lap = cursor - (((cursor % count) + count) % count);
      const first = lap + bound;
      const second = first + count;
      const seat = Math.abs(first - cursor) <= Math.abs(second - cursor) ? first : second;
      setAnchor(anchorAround(seat));
      setCursor(seat);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const other = columnState(unit === 'hour' ? 'minute' : 'hour');
      pendingFocusRef.current = {
        unit: unit === 'hour' ? 'minute' : 'hour',
        value: ((other.cursor % other.count) + other.count) % other.count,
      };
    }
  };

  return {
    current,
    draft,
    open: isOpen,
    hourAnchor,
    minuteAnchor,
    hourCursor,
    minuteCursor,
    hourSelected: committedParts.hour,
    minuteSelected: committedParts.minute,
    handleChange,
    handleBlur,
    handleKeyDown,
    openPanel,
    closePanel,
    handleClear: () => {
      if (lastCommittedRef.current !== null) {
        commit(makeChangeEvent(), null, '');
      }
      closePanel();
      inputRef.current?.focus();
    },
    handleSelectOption,
    handleColumnKeyDown,
    scrollColumn,
    isDisabled,
    isDisabledHour,
    isDisabledMinute,
  };
};
