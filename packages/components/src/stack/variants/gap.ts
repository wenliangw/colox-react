import { spacingKeys, type SpacingKey } from '@colox/theme';

/**
 * Gap axis: the spacing scale keys, single-sourced from the design
 * language via the theme's emitted token constants (`spacingKeys` — the
 * key list lives in the pipeline, not in the component).
 */
export const stackGapStyles = Object.fromEntries(
  spacingKeys.map((key) => [key, `colox-stack--gap-${key}`] as const),
) as Record<SpacingKey, `colox-stack--gap-${SpacingKey}`>;
