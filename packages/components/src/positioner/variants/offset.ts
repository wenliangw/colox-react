import { spacingKeys } from '@colox/theme';
import type { SpacingKey } from '@colox/theme';

/**
 * The offset axes: one class family per logical edge, keyed by the
 * spacing scale (single-sourced from the design language via the
 * theme's emitted token constants — the key list lives in the
 * pipeline, not in the component).
 */
const offsetStyles = (edge: 'top' | 'bottom' | 'start' | 'end') =>
  Object.fromEntries(
    spacingKeys.map((key) => [key, `colox-positioner--offset-${edge}-${key}`] as const),
  ) as Record<SpacingKey, string>;

export const positionerTopStyles = offsetStyles('top');
export const positionerBottomStyles = offsetStyles('bottom');
export const positionerStartStyles = offsetStyles('start');
export const positionerEndStyles = offsetStyles('end');
