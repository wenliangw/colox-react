import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/** Info: the ring with a dot over a stem — the "i" inside a circle. */
export const IconInfo = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8 L12 8" />
    <path d="M12 12 V16" />
  </IconBase>
));
