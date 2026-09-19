import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FocusEventHandler, KeyboardEventHandler } from 'react';
import type { NumberValue, UseInputNumberParams, UseInputNumberResult } from '../types';
import {
  clampNumber,
  derivePrecision,
  formatDecimal,
  isDecimalDraft,
  parseDecimal,
  roundToPrecision,
} from '../utils/format-input-number';

/**
 * The number editor state machine — single owner of the draft text
 * and the commit stream:
 *
 * - **gate**: every user transition must stay inside the draft
 *   language; a rejected keystroke keeps the previous draft (never
 *   notifies). Mid-IME transitions pass through as display-only.
 * - **commit**: `onChange` fires only for complete values — a parsed
 *   number or the empty terminal (`null`). Partial drafts ("-",
 *   "0.", ".5") commit nothing until they resolve or blur rolls them
 *   back.
 * - **blur**: rolls partial drafts back to the last committed value,
 *   clamps out-of-range values into `[min, max]` (clamping is editor
 *   mechanics, not validation), and shrinks the display to its
 *   canonical form.
 * - **step**: the steppers and Arrow Up/Down move by `step` with the
 *   step's decimal precision, clamped into the bounds. A step off the
 *   bounds is a silent no-op.
 *
 * The consumer's native `onBlur`/`onKeyDown` handlers still run —
 * appended after the internal bookkeeping.
 */
export const useInputNumber = ({
  inputRef,
  value,
  defaultValue,
  min,
  max,
  step,
  onChange,
  onBlur,
  onKeyDown,
}: UseInputNumberParams): UseInputNumberResult => {
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<NumberValue>(defaultValue ?? null);
  // `null` is a real value here (the empty state): only `undefined`
  // means uncontrolled, so the resolution must check `undefined` —
  // never `??`, which would swallow a controlled null.
  const current = isControlled ? value : innerValue;

  const [draft, setDraft] = useState<string>(() =>
    formatDecimal(isControlled ? value : (defaultValue ?? null)),
  );
  // The last value the consumer knows about — same-value transitions
  // skip the commit (no notification noise when e.g. typing "007").
  const lastCommittedRef = useRef<NumberValue>(current);

  const effectiveStep = step > 0 && Number.isFinite(step) ? step : 1;
  const precision = derivePrecision(effectiveStep);

  // An external value move (consumer-controlled update, hydration)
  // resyncs the draft; own commits update the ref first so the echo
  // never clobbers what the user is typing.
  useEffect(() => {
    if (current !== lastCommittedRef.current) {
      lastCommittedRef.current = current;
      setDraft(formatDecimal(current));
    }
  }, [current]);

  const makeChangeEvent = (): ChangeEvent<HTMLInputElement> =>
    ({
      target: inputRef.current,
      currentTarget: inputRef.current,
      type: 'change',
    }) as ChangeEvent<HTMLInputElement>;

  const commit = (
    event: ChangeEvent<HTMLInputElement>,
    nextValue: NumberValue,
    display?: string,
  ) => {
    lastCommittedRef.current = nextValue;
    if (!isControlled) {
      setInnerValue(nextValue);
    }
    if (display !== undefined) {
      setDraft(display);
    }
    onChange?.({ event, value: nextValue });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    const composing = (event.nativeEvent as InputEvent | undefined)?.isComposing === true;
    if (composing) {
      setDraft(next);
      return;
    }
    if (!isDecimalDraft(next)) {
      setDraft(draft);
      return;
    }
    setDraft(next);
    if (next === '') {
      // The empty terminal: committed as `null` right away so the
      // empty state stays expressible.
      if (lastCommittedRef.current !== null) {
        commit(event, null);
      }
      return;
    }
    const parsed = parseDecimal(next);
    if (parsed !== null && parsed !== lastCommittedRef.current) {
      commit(event, parsed);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
    const draftValue = parseDecimal(draft);
    if (draftValue === null) {
      // Partial ("-", "5.", ".") or unparsed — roll back to the last
      // committed value; nothing to notify.
      if (draft !== '') {
        setDraft(formatDecimal(current));
      }
    } else {
      const clamped = clampNumber(draftValue, min, max);
      if (clamped !== lastCommittedRef.current) {
        commit(makeChangeEvent(), clamped, formatDecimal(clamped));
      } else {
        // Normalize the display only ("007" → "7", "5.00" → "5").
        setDraft(formatDecimal(clamped));
      }
    }
    onBlur?.(event);
  };

  const stepBy = (direction: 1 | -1) => {
    const base = current === null ? clampNumber(0, min, max) : current;
    const advanced = roundToPrecision(base + effectiveStep * direction, precision);
    const next = clampNumber(advanced, min, max);
    if (next === base) {
      return;
    }
    commit(makeChangeEvent(), next, formatDecimal(next, precision));
  };

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const direction = event.key === 'ArrowUp' ? 1 : -1;
      event.preventDefault();
      stepBy(direction);
    }
    onKeyDown?.(event);
  };

  return {
    current,
    draft,
    handleChange,
    handleBlur,
    handleKeyDown,
    handleStep: stepBy,
  };
};
