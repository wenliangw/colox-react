import type { MouseEvent, RefObject } from 'react';
import type { AutoCompleteOptionRecord } from './utils';

/**
 * The suggestion listbox the hook state renders through.
 */
export interface AutoCompletePanelProps {
  open: boolean;
  listboxId: string;
  /**
   * The anchor element Popup positions against (the root shell).
   */
  referenceRef: RefObject<HTMLElement | null>;
  options: readonly AutoCompleteOptionRecord[];
  activeIndex: number;
  /**
   * Fires on a row click (keyboard picks flow through the hook directly).
   */
  onOptionClick: (option: AutoCompleteOptionRecord, event: MouseEvent<HTMLElement>) => void;
}
