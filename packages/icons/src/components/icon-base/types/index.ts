import type { SVGProps } from 'react';

/**
 * Props accepted by every Colox icon.
 *
 * `size` is the rendered size in px; unset icons follow the host font
 * size (1em), so an icon placed in a component inherits its typography.
 */
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'size'> {
  /** Rendered size in px. Defaults to 1em (follows the host font size). */
  size?: number;
}
