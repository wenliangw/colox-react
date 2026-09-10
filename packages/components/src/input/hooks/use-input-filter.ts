import { useRef } from 'react';
import type { ChangeEvent, ChangeEventHandler, RefObject } from 'react';

interface UseInputFilterParams {
  inputRef: RefObject<HTMLInputElement | null>;
  /** The restriction pattern; `undefined` disables filtering. */
  filterPattern: RegExp | undefined;
  /** The value to restore after a rejected transition — the current
   *  controlled value when controlled, the initial (defaultValue) DOM
   *  value when uncontrolled. */
  restoreValue: string;
  isControlled: boolean;
  /** The consumer's onChange — the only event notification path. */
  onChange: ChangeEventHandler<HTMLInputElement> | undefined;
}

/**
 * Drives the `filterPattern` contract: every committed value transition a
 * user makes must stay inside the pattern language. Rejections restore the
 * previous value silently (no `onChange`).
 *
 * 1. IME composition passes through unfiltered — the committed transition
 *    arrives as a non-composing change and is checked then. (Mid-composition
 *    values never update the "last accepted" anchor, so a rejected commit
 *    snaps back to the pre-composition value, not to the pinyin.)
 * 2. The clear button notifies the consumer directly (see `handleClear`).
 * 3. Otherwise the new value must satisfy the pattern.
 */
export const useInputFilter = ({
  inputRef,
  filterPattern,
  restoreValue,
  isControlled,
  onChange,
}: UseInputFilterParams) => {
  const composingRef = useRef(false);
  const lastAcceptedRef = useRef(restoreValue);

  const handleCompositionStart = () => {
    composingRef.current = true;
  };

  const handleCompositionEnd = () => {
    composingRef.current = false;
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const next = event.target.value;
    const composing =
      composingRef.current || (event.nativeEvent as InputEvent | undefined)?.isComposing === true;

    if (composing) {
      onChange?.(event);
      return;
    }
    if (filterPattern !== undefined && !filterPattern.test(next)) {
      event.target.value = isControlled ? restoreValue : lastAcceptedRef.current;
      return;
    }
    lastAcceptedRef.current = next;
    onChange?.(event);
  };

  /**
   * Clears through the consumer's onChange without driving the DOM through
   * the native event system — React's change plugin reports stale values
   * for controlled inputs on dispatched events (and swallows them under
   * dedupe), so the reliable path is a direct event-shaped notification:
   * the controlled DOM follows from the consumer's re-render, and the
   * uncontrolled DOM is written here because it has no render owner.
   * The explicit clear always succeeds, even when `filterPattern` would
   * forbid an empty value (`/^\d+$/`).
   */
  const handleClear = () => {
    const input = inputRef.current;
    if (input === null) return;
    // Write the DOM regardless of mode: uncontrolled inputs have no render
    // owner, and controlled inputs need the value in place so the event
    // object reports ''. A consumer that re-renders with `''` consolidates;
    // one that ignores the event keeps the DOM until its next render.
    input.value = '';
    lastAcceptedRef.current = '';
    onChange?.({
      target: input,
      currentTarget: input,
      type: 'change',
    } as ChangeEvent<HTMLInputElement>);
  };

  return { handleChange, handleClear, handleCompositionStart, handleCompositionEnd };
};

export type InputFilterHandle = ReturnType<typeof useInputFilter>;
