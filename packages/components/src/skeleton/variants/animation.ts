/**
 * The shared animation axis classes — one map for every shape. Parts
 * ride the same root-block modifier channel Badge.Count rides
 * `colox-badge--sm`, so the motion rules live once in animation.scss
 * and the static face (`none`) is an explicit class, not a dangling
 * cva state.
 */
export const skeletonAnimationStyles = {
  pulse: 'colox-skeleton--pulse',
  wave: 'colox-skeleton--wave',
  none: 'colox-skeleton--none',
} as const;
