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
 * How many notify cards a slot shows before folding: MORE than this
 * collapses the slot into the newest card + the count capsule. The
 * folded cards freeze (no auto-dismiss) until the user clears them —
 * the capsule's ✕ empties the slot, closing the visible card pops the
 * stack one by one (LIFO), and the last survivor resumes its countdown
 * under a countdown capsule.
 */
export const FOLD_THRESHOLD = 2;
