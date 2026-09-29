import type { HTMLAttributes, ReactNode } from 'react';
import type { ProgressLinearVariants } from '../variants';

export type ProgressSize = NonNullable<ProgressLinearVariants['size']>;
export type ProgressPalette = NonNullable<ProgressLinearVariants['palette']>;

/** The host element of `Progress.Linear`. */
export type ProgressLinearRef = HTMLDivElement;

/**
 * The horizontal progress bar, reached as `Progress.Linear`.
 *
 * It is a pure-display status piece: a track fabric with a filled bar
 * grown to the committed percent. Without a `value` the bar turns
 * indeterminate — a sweeping block that signals in-flight work without
 * a number. Axes: `palette` (six design-language families, brand by
 * default) and `size` (sm/md/lg stripe thickness).
 */
export interface ProgressLinearProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The progress value (0–100). Without it the bar is indeterminate:
   * a flowing block that signals activity without a committed number
   * (the live region then omits `aria-valuenow`).
   */
  value?: number;
  /**
   * Semantic palette family for the filled bar.
   * @default 'primary'
   */
  palette?: ProgressPalette;
  /**
   * Stripe thickness (sm/md/lg → 4/6/8px via the spacing ladder).
   * @default 'md'
   */
  size?: ProgressSize;
  /**
   * Show the trailing `n%` label. Only determinate: without a `value`
   * the label has nothing to report and never renders.
   * @default true
   */
  showInfo?: boolean;
  /**
   * Custom label formatter — receives the committed percent and may
   * return any node. Only consulted while the label shows.
   */
  format?: (percent: number) => ReactNode;
}
