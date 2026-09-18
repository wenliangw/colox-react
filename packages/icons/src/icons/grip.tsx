import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/**
 * Grip: three 45° strokes hatching the corner — the native resize
 * affordance shape. The interaction resizes vertically only, but the
 * glyph keeps the familiar native corner look (recognition over literal
 * direction).
 */
export const IconGrip = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d="M10 21 L21 10 M14 21 L21 14 M18 21 L21 18" />
  </IconBase>
));
