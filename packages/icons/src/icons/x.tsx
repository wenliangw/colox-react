import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/** Close: two crossing 45° strokes. */
export const IconX = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d="M6 6 L18 18 M18 6 L6 18" />
  </IconBase>
));
