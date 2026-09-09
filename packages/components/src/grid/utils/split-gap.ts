import type { GridGapValue } from '../types';
import type { GridVariants } from '../variants';

/**
 * Translates the public gap shape into the CVA gap axes: one key covers
 * both axes, an object (`{ row, column }`) feeds each axis, in CSS
 * row-gap / column-gap order. Mirrors the theme resolver's scalar guard
 * (null / non-object → pass through as the single key).
 */
export function splitGap(
  gap: GridGapValue | undefined,
): Pick<GridVariants, 'gap' | 'rowGap' | 'columnGap'> {
  if (gap === null || typeof gap !== 'object') {
    return { gap, rowGap: undefined, columnGap: undefined };
  }
  return { gap: undefined, rowGap: gap.row, columnGap: gap.column };
}
