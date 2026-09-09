import type { HTMLAttributes } from 'react';
import type { ResponsiveValue } from '@colox/theme';
import type { GridVariants } from '../variants';

/** Spacing scale keys — the grid gap vocabulary (theme token grid). */
export type GridGap = NonNullable<GridVariants['gap']>;
/** Block-axis track distribution words (align-content). */
export type GridAlign = NonNullable<GridVariants['align']>;
/** Inline-axis track distribution words (justify-content). */
export type GridJustify = NonNullable<GridVariants['justify']>;

/**
 * Column count: a static number everywhere, or per-breakpoint keys
 * (sm/md/lg/xl, activation-point semantics — see `resolveResponsiveValue`).
 */
export type GridColumns = ResponsiveValue<number>;

/**
 * Track spacing: one key sets both axes; an object sets each axis
 * (`row` / `column`, in CSS row-gap / column-gap order).
 */
export type GridGapValue = GridGap | { row?: GridGap; column?: GridGap };

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Equal column count, static or per-breakpoint. Columns are equal-width
   * (repeat + minmax(0, 1fr)) and may shrink.
   * @default 1
   */
  columns?: GridColumns;
  /**
   * Spacing between tracks: one spacing key sets both axes, an object
   * `{ row, column }` sets each. No gap unless set (CSS default).
   */
  gap?: GridGapValue;
  /**
   * Distributes the grid tracks on the block axis (align-content).
   * No class unless set — the CSS-faithful `stretch` default.
   */
  align?: GridAlign;
  /**
   * Distributes the grid tracks on the inline axis (justify-content).
   * No class unless set — the CSS-faithful `start` default.
   */
  justify?: GridJustify;
}

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Column span of this item (emitted as `grid-column: span N`).
   * @default 1
   */
  span?: number;
}
