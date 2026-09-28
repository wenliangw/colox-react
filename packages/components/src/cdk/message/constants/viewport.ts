import type { MessagePosition } from '../types';

/** The six slots a scope container can mount messages in. */
export const POSITIONS: readonly MessagePosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/**
 * How many notify cards a slot shows before collapsing into a deck.
 * The front (newest) card stays fully visible, the two behind it peek
 * as clipped strips, and the rest fold into the "+N" count chip.
 */
export const DECK_THRESHOLD = 3;
