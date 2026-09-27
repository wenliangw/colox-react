import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/** Success: the ring with a check — the affirmative confirmation glyph. */
export const IconSuccess = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 13 L11 16 L16 10" />
  </IconBase>
));
