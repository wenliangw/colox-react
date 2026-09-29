import { sizeKeys, type SizeKey } from '@colox/theme';

/** Text line tiers, landed on the font ladder's reader sizes. */
export const skeletonTextSizeStyles = {
  sm: 'colox-skeleton-text--sm',
  md: 'colox-skeleton-text--md',
  lg: 'colox-skeleton-text--lg',
} as const;

/**
 * Raw size-token key classes for the circle: one per emitted scale
 * key, so any token footprint is addressable through the same `size`
 * channel (`size="7"` renders `colox-skeleton-circle--size-7`, pinned
 * to `var(--colox-size-7)` — theme overrides flow through the token).
 */
const skeletonCircleSizeKeyStyles = Object.fromEntries(
  sizeKeys.map((key) => [key, `colox-skeleton-circle--size-${key}`] as const),
) as Record<SizeKey, `colox-skeleton-circle--size-${SizeKey}`>;

/**
 * Circle footprint tiers alias the Avatar footprints (xs 24 / sm 32 /
 * md 40 / lg 48). Raw keys cover everything between and beyond.
 */
export const skeletonCircleSizeStyles = {
  xs: 'colox-skeleton-circle--xs',
  sm: 'colox-skeleton-circle--sm',
  md: 'colox-skeleton-circle--md',
  lg: 'colox-skeleton-circle--lg',
  ...skeletonCircleSizeKeyStyles,
};

/** Button silhouette tiers, mirroring the Button control heights. */
export const skeletonButtonSizeStyles = {
  xs: 'colox-skeleton-button--xs',
  sm: 'colox-skeleton-button--sm',
  md: 'colox-skeleton-button--md',
  lg: 'colox-skeleton-button--lg',
} as const;
