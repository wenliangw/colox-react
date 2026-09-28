import { sizeKeys, type SizeKey } from '@colox/theme';

/**
 * Raw size-token key classes: one per emitted scale key, so any token
 * footprint is addressable through the same `size` prop channel
 * (`size="7"` renders `colox-avatar--size-7`, pinned to
 * `var(--colox-size-7)` — theme overrides flow through the token).
 */
const sizeKeyStyles = Object.fromEntries(
  sizeKeys.map((key) => [key, `colox-avatar--size-${key}`] as const),
) as Record<SizeKey, `colox-avatar--size-${SizeKey}`>;

/**
 * Preset tiers alias the form-family footprints (Button/Input/Select
 * keep same-name same-block): xs 24 / sm 32 / md 40 / lg 48. Raw keys
 * cover everything between and beyond.
 */
export const avatarSizeStyles = {
  xs: 'colox-avatar--xs',
  sm: 'colox-avatar--sm',
  md: 'colox-avatar--md',
  lg: 'colox-avatar--lg',
  ...sizeKeyStyles,
};
