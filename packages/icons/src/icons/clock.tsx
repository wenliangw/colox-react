import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/**
 * Clock: the circular face plus two hands in the canonical pose — the
 * minute hand on the top vertical, the hour hand on the diagonal — so
 * the glyph reads as a clock rather than a target or an eye. The face
 * is the circle primitive (lens construction, same as search/eye); the
 * r9 face keeps the stroke box inside the [2, 22] optical content box.
 */
export const IconClock = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 6 V12 L16 14" />
  </IconBase>
));
