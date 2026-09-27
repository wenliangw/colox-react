/**
 * The width tiers: semantic sm/md/lg map to the design language's
 * `large_size` WIDTH_HEIGHT tokens — 112 (448px) / 160 (640px) /
 * 192 (768px). The classes pin the width to the token variables, so a
 * theme redefinition flows through; the `width` prop overrides inline.
 */
export const modalSizeStyles = {
  sm: 'colox-modal__panel--size-sm',
  md: 'colox-modal__panel--size-md',
  lg: 'colox-modal__panel--size-lg',
} as const;
