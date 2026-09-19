import type { KeyboardEvent } from 'react';

/**
 * The contract the combobox keyboard model needs from its consumer:
 * the open state, the roamable item count and the two behaviors it
 * forwards (request-open, activate).
 */
export interface UseComboboxKeyboardOptions {
  /**
   * Whether the popup is open (closed controls open on navigation keys).
   */
  open: boolean;
  /**
   * Option count the navigation walks over.
   */
  itemCount: number;
  /**
   * Options that keyboard navigation skips.
   */
  isItemDisabled?: (index: number) => boolean;
  /**
   * Opens the popup (from a closed control's Enter/arrow key).
   */
  onRequestOpen: () => void;
  /**
   * Fires with the active index and the activating key event on Enter.
   */
  onActivate: (index: number, event: KeyboardEvent<HTMLElement>) => void;
}

/**
 * What the keyboard model hands back: the highlighted index, its
 * host-controlled setter and the keydown handler for the combobox
 * control (input or button).
 */
export interface UseComboboxKeyboardResult {
  /**
   * Index of the highlighted option, -1 when none.
   */
  activeIndex: number;
  /**
   * Host-controlled active index (open-to-selected, reset on close).
   */
  setActiveIndex: (index: number) => void;
  /**
   * Keydown handler for the combobox control (input or button).
   */
  onControlKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}
