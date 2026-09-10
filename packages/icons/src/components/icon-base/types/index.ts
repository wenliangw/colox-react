import type { SVGProps } from 'react';

/**
 * Props accepted by every Colox icon.
 *
 * `size` and `color` are the two first-class appearance axes: `size`
 * pins a px size (unset icons follow the host font size via 1em);
 * `color` pins an explicit CSS color (unset icons inherit the host's
 * `color` via currentColor, so semantic tokens flow through).
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'size' | 'color'> {
  /** Rendered size in px. Defaults to 1em (follows the host font size). */
  size?: number;
  /**
   * Explicit CSS color. Defaults to the inherited `color` (currentColor),
   * so a host component's status color reaches the icon for free. Merges
   * beneath an explicit `style.color`.
   */
  color?: string;
}
