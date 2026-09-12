import { useCallback, useState } from 'react';
import type { KeyboardEvent } from 'react';

export interface UseComboboxKeyboardOptions {
  /** Whether the popup is open (closed organs open on navigation keys). */
  open: boolean;
  /** Option count the navigation walks over. */
  itemCount: number;
  /** Options that keyboard navigation skips. */
  isItemDisabled?: (index: number) => boolean;
  /** Opens the popup (from a closed organ's Enter/arrow key). */
  onRequestOpen: () => void;
  /** Fires with the active index when Enter activates it. */
  onActivate: (index: number) => void;
}

export interface UseComboboxKeyboardResult {
  /** Index of the highlighted option, -1 when none. */
  activeIndex: number;
  /** Host-controlled active index (open-to-selected, reset on close). */
  setActiveIndex: (index: number) => void;
  /** Keydown handler for the combobox organ (input or button). */
  onOrganKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
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
 * organ, arrows move a highlighted option via aria-activedescendant,
 * Enter activates it. Closed organs open on Enter/arrow keys; Space
 * opens a button organ but keeps typing through an input organ.
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

  const onOrganKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!open) {
          onRequestOpen();
        } else {
          const direction = event.key === 'ArrowDown' ? 1 : -1;
          setActiveIndex((current) => nextEnabledIndex(current, direction, itemCount, disabledAt));
        }
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
          onActivate(activeIndex);
        }
        return;
      }

      if (event.key === ' ') {
        const isInputOrgan = event.currentTarget instanceof HTMLInputElement;
        if (!isInputOrgan) {
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

  return { activeIndex, setActiveIndex, onOrganKeyDown };
}
