import { POPOVER_GAP } from '../constants/position';

/** Picks the floating gap behind the arrow switch: the arrow needs room, the bare panel floats closer. */
export function resolvePopoverGap(showArrow: boolean): number {
  if (showArrow) {
    return POPOVER_GAP.WITH_ARROW;
  }
  return POPOVER_GAP.WITHOUT_ARROW;
}
