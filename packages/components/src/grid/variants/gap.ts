import { spacingKeys, type SpacingKey } from '@colox/theme';

/**
 * Gap axes: the spacing scale keys, single-sourced from the design
 * language via the theme's emitted token constants (`spacingKeys` — the
 * key list lives in the pipeline, not in the component). `gap` covers
 * both axes at once; `rowGap`/`columnGap` carry the per-axis object
 * form ({ row, column } — CSS row-gap / column-gap order).
 */
export const gridGapStyles = Object.fromEntries(
  spacingKeys.map((key) => [key, `colox-grid--gap-${key}`] as const),
) as Record<SpacingKey, `colox-grid--gap-${SpacingKey}`>;

export const gridRowGapStyles = Object.fromEntries(
  spacingKeys.map((key) => [key, `colox-grid--row-gap-${key}`] as const),
) as Record<SpacingKey, `colox-grid--row-gap-${SpacingKey}`>;

export const gridColumnGapStyles = Object.fromEntries(
  spacingKeys.map((key) => [key, `colox-grid--column-gap-${key}`] as const),
) as Record<SpacingKey, `colox-grid--column-gap-${SpacingKey}`>;
