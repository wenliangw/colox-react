/**
 * The content-space tiers: the panel's main-axis dimension, sized by
 * the design language's `large_size` WIDTH_HEIGHT tokens — 80 (320px)
 * / 96 (384px) / 112 (448px). The same tier value serves as the width
 * for `left`/`right` panels and the height for `top`/`bottom` ones
 * (the direction axis decides which) — one token set, both axes. The
 * `width`/`height` props override inline and beat the tier.
 */
export const drawerSizeStyles = {
  sm: 'colox-drawer__panel--size-sm',
  md: 'colox-drawer__panel--size-md',
  lg: 'colox-drawer__panel--size-lg',
} as const;
