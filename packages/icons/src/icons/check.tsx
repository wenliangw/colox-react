import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/** Check: two 45° strokes meeting in the round elbow. */
export const Check = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d="M20 6 L9 17 L4 12" />
  </IconBase>
));
