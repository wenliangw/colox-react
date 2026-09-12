import { sizeKeys, type SizeKey } from '@colox/theme';

/**
 * Raw size-token key classes: one per emitted scale key, so any token
 * footprint is addressable through the same `size` prop channel
 * (`size="7"` renders `colox-icon-button--size-7`, pinned to
 * `var(--colox-size-7)` — theme overrides flow through the token).
 */
const sizeKeyStyles = Object.fromEntries(
  sizeKeys.map((key) => [key, `colox-icon-button--size-${key}`] as const),
) as Record<SizeKey, `colox-icon-button--size-${SizeKey}`>;

/**
 * Preset tiers alias the form-family heights (Button/Input/Select keep
 * same-name same-block): xs 24 / sm 32 / md 40 / lg 48. Raw keys cover
 * everything between and beyond (e.g. the field-internal clear/toggle
 * buttons pin `size="4"`).
 */
export const iconButtonSizeStyles = {
  xs: 'colox-icon-button--xs',
  sm: 'colox-icon-button--sm',
  md: 'colox-icon-button--md',
  lg: 'colox-icon-button--lg',
  ...sizeKeyStyles,
};
