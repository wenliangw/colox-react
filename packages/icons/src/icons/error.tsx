import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/** Error: the ring with a cross — the failure glyph. */
export const IconError = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9 L15 15 M15 9 L9 15" />
  </IconBase>
));
