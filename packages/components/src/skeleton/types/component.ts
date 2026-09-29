import type { AriaAttributes, HTMLAttributes } from 'react';
import type { SkeletonVariants } from '../variants';

/** The host element of the `Skeleton` root (the rect placeholder). */
export type SkeletonRef = HTMLDivElement;

/** The shared animation axis: a pulsing breath, a sweeping wave, or a static face. */
export type SkeletonAnimation = NonNullable<SkeletonVariants['animation']>;

/**
 * The shared axis face of every skeleton shape: the animation and the
 * decorative default. A placeholder is never meaning-bearing content —
 * `aria-hidden` defaults to true so assistive tech skips the fabric
 * (the loading announcement belongs to the caller's live region).
 */
export interface SkeletonAxisBase {
  /**
   * The placeholder motion: pulse breathes the fabric opacity, wave
   * sweeps a translucent highlight across it, none stays still.
   * @default 'pulse'
   */
  animation?: SkeletonAnimation;
  /**
   * Skeletons are decorative. Pass `false` only when wiring an
   * announcement yourself.
   * @default true
   */
  'aria-hidden'?: AriaAttributes['aria-hidden'];
}

/**
 * Skeleton — the loading-placeholder root: a neutral rect block that
 * reserves a slot's real estate until the content arrives, so the page
 * does not jump when it does. Pure display: no events, no state — the
 * `loading ? <Skeleton /> : <Content />` switch belongs to the caller.
 *
 * The block fills its layout cell (Grid/Stack stretch it by default);
 * `width`/`height` px escapes pin exact sizes.
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement>, SkeletonAxisBase {
  /** Host width in px. The block fills its cell by default. */
  width?: number;
  /** Host height in px. The layout stretches the block by default. */
  height?: number;
}
