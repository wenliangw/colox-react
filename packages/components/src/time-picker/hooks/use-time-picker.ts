import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ChangeEvent,
  FocusEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  KeyboardEventHandler,
} from 'react';
import type { TimeColumnUnit, TimeParts, UseTimePickerParams, UseTimePickerResult } from '../types';
import {
  COLUMN_STEP,
  HOUR_COUNT,
  MINUTE_COUNT,
  SECOND_COUNT,
  canonicalBoundOf,
  formatTimeValue,
  isTimeDraftAllowed,
  mod,
  pad,
  parseTimeText,
  timePartsOf,
} from '../utils/format';

/** The current local wall-clock coordinates. */
const systemParts = (): TimeParts => {
  const now = new Date();
  return { hour: now.getHours(), minute: now.getMinutes(), second: now.getSeconds() };
};

/** The full canonical word of three column offsets (each trimmed to its cycle). */
const wordOf = (hour: number, minute: number, second: number): string =>
  `${pad(mod(hour, HOUR_COUNT))}:${pad(mod(minute, MINUTE_COUNT))}:${pad(mod(second, SECOND_COUNT))}`;

/** The clockwise neighbor of each column (ArrowRight hops). */
const UNIT_NEXT: Record<TimeColumnUnit, TimeColumnUnit> = {
  hour: 'minute',
  minute: 'second',
  second: 'hour',
};

/** The counter-clockwise neighbor of each column (ArrowLeft hops). */
const UNIT_PREV: Record<TimeColumnUnit, TimeColumnUnit> = {
  hour: 'second',
  minute: 'hour',
  second: 'minute',
};

/**
 * The time editor state machine: typed words commit through the
 * permissive draft gate, the panel's pending word commits via the
 * Confirm button (an empty open pre-selects the system clock).
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

  // The three column values — the pending components of the pending
  // word. The columns scroll natively to follow them (click/chevron/
  // keyboard moves glide the value onto the focus slot; the wheel
  // never changes them). Plus the dirty flag — false while the panel
  // shows the commit seed (untouched), true after the first move,
  // when the columns' values become the pending word.
  const [hourValue, setHourValue] = useState(0);
  const [minuteValue, setMinuteValue] = useState(0);
  const [secondValue, setSecondValue] = useState(0);
  const [dirty, setDirty] = useState(false);
  // Cross-column keyboard hops re-render the target column's focus
  // slot before the programmatic focus can land (the date grid's
  // pattern).
  const pendingFocusRef = useRef<TimeColumnUnit | null>(null);

  const pendingWord = dirty ? wordOf(hourValue, minuteValue, secondValue) : null;
  // What the columns currently show: the pending word once touched,
  // else the committed word (the seed).
  const anchorWord = dirty ? pendingWord : current;
  const anchorParts: TimeParts = timePartsOf(anchorWord) ?? { hour: 0, minute: 0, second: 0 };

  // Panel moves echo into the field as the pending draft — the gray
  // preview. The effect keys on the pending word, so typing (which
  // sets the draft directly) is never clobbered.
  useEffect(() => {
    if (isOpen && dirty && pendingWord !== null) {
      setDraft(formatTimeValue(pendingWord, valueFormat));
    }
  }, [pendingWord, isOpen, dirty, valueFormat]);

  // External value moves resync the draft and reseat the columns;
  // own commits update the ref first so the echo never clobbers what
  // the user is typing.
  useEffect(() => {
    if (current !== lastCommittedRef.current) {
      lastCommittedRef.current = current;
      setDraft(formatTimeValue(current ?? null, valueFormat));
      resettle(current);
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

  // An option's enablement equals its merge with the pending anchor —
  // every pick path is blocked from landing an out-of-range word. The
  // three columns share the one implementation: the unit's axis swaps
  // into the anchor parts, the merge word reads the whole clock.
  const isDisabledOption = (unit: TimeColumnUnit, value: number): boolean => {
    const parts = { ...anchorParts, [unit]: value };
    return isDisabled(wordOf(parts.hour, parts.minute, parts.second));
  };

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

  /** Seats the columns on a word's components (or the system clock) and clears the pending. */
  function resettle(word: string | null) {
    const parts = timePartsOf(word) ?? systemParts();
    setHourValue(parts.hour);
    setMinuteValue(parts.minute);
    setSecondValue(parts.second);
    setDirty(false);
  }

  function openPanel() {
    if (isOpen) {
      return;
    }
    resettle(current);
    // The empty open pre-selects the system clock: the columns show
    // it, the pending word becomes it and Confirm commits it. The
    // seed is captured once here — a long-open panel keeps the
    // open-time, it never re-reads the clock at confirm.
    setDirty(current === null);
    setOpenPanel(true);
  }

  function closePanel() {
    setOpenPanel(false);
    // Dismissing discards the pending word — the field falls back to
    // the last committed display (the ref is already synced when a
    // confirm commit preceded the close).
    setDraft(formatTimeValue(lastCommittedRef.current ?? null, valueFormat));
  }

  const columnState = (unit: TimeColumnUnit) => {
    if (unit === 'hour') {
      return { value: hourValue, setValue: setHourValue, count: HOUR_COUNT };
    }
    if (unit === 'minute') {
      return { value: minuteValue, setValue: setMinuteValue, count: MINUTE_COUNT };
    }
    return { value: secondValue, setValue: setSecondValue, count: SECOND_COUNT };
  };

  /** A relative step (chevrons ±7, keyboard ±1/±7): the column's value moves, pending comes alive. */
  const moveColumn = (unit: TimeColumnUnit, delta: number) => {
    const { setValue, count } = columnState(unit);
    setDirty(true);
    setValue((value) => mod(value + delta, count));
  };

  /** Lands the column on an option value (click, keyboard bounds). */
  const landColumn = (unit: TimeColumnUnit, value: number) => {
    const { setValue } = columnState(unit);
    setDirty(true);
    setValue(value);
  };

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
      resettle(parsed);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    if (!isOpen) {
      const parsed = parseTimeText(draft, valueFormat);
      if (parsed === null || isDisabled(parsed)) {
        // Partial or out-of-range: roll back to the last committed display.
        if (draft !== '') {
          setDraft(formatTimeValue(current ?? null, valueFormat));
        }
      } else if (parsed !== lastCommittedRef.current) {
        commit(makeChangeEvent(), parsed, formatTimeValue(parsed, valueFormat));
      } else {
        setDraft(formatTimeValue(parsed, valueFormat));
      }
    }
    // While the panel is open the blur is a normal hop into it — the
    // preview keeps showing: no normalization runs.
    onBlur?.(event);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (!isOpen && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      event.preventDefault();
      openPanel();
    }
    onKeyDown?.(event);
  };

  /** Clicking an option lands it — but only merges that stay in bounds. */
  const handleSelectOption = (unit: TimeColumnUnit, value: number) => {
    if (isDisabledOption(unit, value)) {
      return;
    }
    landColumn(unit, value);
  };

  /** The Confirm button program: commit the pending word, close, refocus the field. */
  function handleConfirm() {
    if (!isOpen) {
      return;
    }
    if (dirty && pendingWord !== null && pendingWord !== current && !isDisabled(pendingWord)) {
      commit(makeChangeEvent(), pendingWord, formatTimeValue(pendingWord, valueFormat));
    }
    closePanel();
    inputRef.current?.focus();
  }

  function handleClear() {
    if (lastCommittedRef.current !== null) {
      commit(makeChangeEvent(), null, '');
    }
    resettle(null);
    closePanel();
    inputRef.current?.focus();
  }

  const handleColumnKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    unit: TimeColumnUnit,
  ) => {
    const { count } = columnState(unit);
    if (event.key === 'Enter' || event.key === ' ') {
      // Consume: the option already IS the pending value — committing
      // is the Confirm button's (or the field's Enter) job.
      event.preventDefault();
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveColumn(unit, -1);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveColumn(unit, 1);
      return;
    }
    if (event.key === 'PageUp') {
      event.preventDefault();
      moveColumn(unit, -COLUMN_STEP);
      return;
    }
    if (event.key === 'PageDown') {
      event.preventDefault();
      moveColumn(unit, COLUMN_STEP);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      landColumn(unit, event.key === 'Home' ? 0 : count - 1);
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      // The horizontal hop re-renders the target column's focus slot
      // before the programmatic focus can land (the date grid's pattern).
      pendingFocusRef.current = UNIT_NEXT[unit];
      if (event.key === 'ArrowLeft') {
        pendingFocusRef.current = UNIT_PREV[unit];
      }
    }
  };

  // Cross-column hops land focus on the target column's focus-slot
  // option after its re-render (the tabIndex-0 node).
  useEffect(() => {
    if (pendingFocusRef.current !== null) {
      const target = pendingFocusRef.current;
      pendingFocusRef.current = null;
      const column = panelRef.current?.querySelector<HTMLElement>(`[data-unit="${target}"]`);
      column?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
    }
  });

  // The field shows the tentative word (gray) whenever the panel
  // previews an uncommitted pick. The draft itself carries the
  // preview text (panel moves sync it through the pending effect).
  const preview = isOpen && dirty && pendingWord !== null && pendingWord !== current;

  return {
    current,
    currentText: formatTimeValue(current ?? null, valueFormat),
    open: isOpen,
    hourValue,
    minuteValue,
    secondValue,
    hourSelected: timePartsOf(anchorWord)?.hour ?? null,
    minuteSelected: timePartsOf(anchorWord)?.minute ?? null,
    secondSelected: timePartsOf(anchorWord)?.second ?? null,
    display: draft,
    preview,
    confirmBlocked: dirty && pendingWord !== null && isDisabled(pendingWord),
    handleChange,
    handleBlur,
    handleKeyDown,
    openPanel,
    closePanel,
    handleConfirm,
    handleClear,
    handleSelectOption,
    handleColumnKeyDown,
    moveColumn,
    isDisabled,
    isDisabledOption,
  };
};
