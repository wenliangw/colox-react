/**
 * Size style maps. The capsule forms (Badge / Badge.Count /
 * Badge.Item) share one pill scale — compact indicator tiers below
 * the form family's control tiers (an indicator, not a control). The
 * Dot is a fixed round footprint on its own scale.
 */
export const badgeSizeStyles = {
  sm: 'colox-badge--sm',
  md: 'colox-badge--md',
  lg: 'colox-badge--lg',
} as const;

export const badgeDotSizeStyles = {
  sm: 'colox-badge-dot--sm',
  md: 'colox-badge-dot--md',
  lg: 'colox-badge-dot--lg',
} as const;
