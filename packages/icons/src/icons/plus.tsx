import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/** Plus: two 45°-aligned strokes on the canvas axes. */
export const IconPlus = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d="M12 6 V18 M6 12 H18" />
  </IconBase>
));
