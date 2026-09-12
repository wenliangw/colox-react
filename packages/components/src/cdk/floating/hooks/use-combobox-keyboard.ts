import { useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';

export interface UseComboboxKeyboardOptions {
  /** Whether the popup is open (closed controls open on navigation keys). */
  open: boolean;
  /** Option count the navigation walks over. */
  itemCount: number;
  /** Options that keyboard navigation skips. */
  isItemDisabled?: (index: number) => boolean;
  /** Opens the popup (from a closed control's Enter/arrow key). */
  onRequestOpen: () => void;
  /** Fires with the active index and the activating key event on Enter. */
  onActivate: (index: number, event: KeyboardEvent<HTMLElement>) => void;
}

export interface UseComboboxKeyboardResult {
  /** Index of the highlighted option, -1 when none. */
  activeIndex: number;
  /** Host-controlled active index (open-to-selected, reset on close). */
  setActiveIndex: (index: number) => void;
  /** Keydown handler for the combobox control (input or button). */
  onControlKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const nextEnabledIndex = (
  start: number,
  direction: 1 | -1,
  itemCount: number,
  isItemDisabled: (index: number) => boolean,
): number => {
  if (itemCount === 0) {
    return -1;
  }
  // From "no active option", ArrowDown starts before the first item and
  // ArrowUp after the last, so each direction reaches the expected end.
  let index = start === -1 ? (direction === 1 ? -1 : 0) : start;
  for (let step = 0; step < itemCount; step += 1) {
    index = (index + direction + itemCount) % itemCount;
    if (!isItemDisabled(index)) {
      return index;
    }
  }
  return -1;
};

/**
 * The ARIA 1.2 editable-combobox keyboard model: focus stays in the
 * control, arrows move a highlighted option via aria-activedescendant,
 * Enter activates it. Closed controls open on Enter/arrow keys; Space
 * opens a button control but keeps typing through an input control.
 * Walk wraps and skips disabled options.
 */
export function useComboboxKeyboard({
  open,
  itemCount,
  isItemDisabled,
  onRequestOpen,
  onActivate,
}: UseComboboxKeyboardOptions): UseComboboxKeyboardResult {
  const disabledAt = useCallback(
    (index: number) => isItemDisabled?.(index) ?? false,
    [isItemDisabled],
  );

  const [activeIndex, setActiveIndex] = useState(-1);

  const onControlKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open) {
          onRequestOpen();
        }
        // Close+arrow = open and move in the pressed direction (first
        // on down, last on up); open+arrow = walk from the highlight.
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex((current) => nextEnabledIndex(current, direction, itemCount, disabledAt));
        return;
      }

      if (open && event.key === 'Home') {
        event.preventDefault();
        setActiveIndex(nextEnabledIndex(-1, 1, itemCount, disabledAt));
        return;
      }
      if (open && event.key === 'End') {
        event.preventDefault();
        setActiveIndex(nextEnabledIndex(-1, -1, itemCount, disabledAt));
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (!open) {
          onRequestOpen();
        } else if (activeIndex >= 0 && !disabledAt(activeIndex)) {
          onActivate(activeIndex, event);
        }
        return;
      }

      if (event.key === ' ') {
        const isInputControl = event.currentTarget instanceof HTMLInputElement;
        if (!isInputControl) {
          // Suppress the native button activation so Space never toggles
          // the popup shut behind the keyboard model's back.
          event.preventDefault();
          if (!open) {
            onRequestOpen();
          }
        }
      }
    },
    [open, itemCount, disabledAt, activeIndex, onActivate, onRequestOpen],
  );

  return { activeIndex, setActiveIndex, onControlKeyDown };
}
