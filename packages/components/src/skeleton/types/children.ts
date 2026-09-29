import type { HTMLAttributes } from 'react';
import type { SkeletonAxisBase } from './component';
import type {
  SkeletonButtonVariants,
  SkeletonCircleVariants,
  SkeletonTextVariants,
} from '../variants';

/** The host element of the shape parts (`Skeleton.Text` and friends). */
export type SkeletonPartRef = HTMLSpanElement;

export type SkeletonTextSize = NonNullable<SkeletonTextVariants['size']>;
export type SkeletonCircleSize = NonNullable<SkeletonCircleVariants['size']>;
export type SkeletonButtonSize = NonNullable<SkeletonButtonVariants['size']>;

/** The shared face of the three shape parts. */
interface SkeletonPartPropsBase extends HTMLAttributes<HTMLSpanElement>, SkeletonAxisBase {}

/**
 * Skeleton.Text — one line of placeholder text: a full-width capsule
 * whose height follows the font ladder (`size` sm/md/lg). Stack a few
 * in a `Stack` for a paragraph silhouette.
 */
export interface SkeletonTextProps extends SkeletonPartPropsBase {
  /**
   * The line tier, landed on the font ladder's reader sizes.
   * @default 'md'
   */
  size?: SkeletonTextSize;
  /** Line width in px. Full width by default. */
  width?: number;
}

/**
 * Skeleton.Circle — a round placeholder for avatars, icons and any
 * round media. The size tiers mirror the Avatar footprints (xs 24 /
 * sm 32 / md 40 / lg 48) and any theme size-token key is addressable —
 * `size="7"` renders a 28px circle.
 */
export interface SkeletonCircleProps extends SkeletonPartPropsBase {
  /**
   * The footprint: an Avatar tier or a raw size-token key.
   * @default 'md'
   */
  size?: SkeletonCircleSize;
}

/**
 * Skeleton.Button — a button-shaped placeholder whose height mirrors
 * the Button control ladder (xs/sm/md/lg). It reserves the button slot
 * in forms and toolbars while the action loads.
 */
export interface SkeletonButtonProps extends SkeletonPartPropsBase {
  /**
   * The control tier of the mirrored Button height.
   * @default 'md'
   */
  size?: SkeletonButtonSize;
  /** Button width in px. A modest default width serves otherwise. */
  width?: number;
}
