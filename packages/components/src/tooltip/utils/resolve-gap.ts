import { TOOLTIP_GAP } from '../constants/position';

/** Picks the floating gap behind the arrow switch: the arrow needs room, the bare panel floats closer. */
export function resolveTooltipGap(showArrow: boolean): number {
  if (showArrow) {
    return TOOLTIP_GAP.WITH_ARROW;
  }
  return TOOLTIP_GAP.WITHOUT_ARROW;
}
