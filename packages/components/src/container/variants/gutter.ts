import { spacingKeys, type SpacingKey } from '@colox/theme';

/**
 * Inline gutters: the spacing scale keys, single-sourced from the
 * design language via the theme's emitted token constants (`spacingKeys`
 * — the key list lives in the pipeline, not in the component). Same
 * vocabulary as Stack's `gap`. No gutter prop renders no modifier —
 * the CSS-default padding of 0.
 */
export const containerGutterStyles = Object.fromEntries(
  spacingKeys.map((key) => [key, `colox-container--gutter-${key}`] as const),
) as Record<SpacingKey, `colox-container--gutter-${SpacingKey}`>;
