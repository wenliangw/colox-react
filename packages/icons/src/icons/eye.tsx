import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';
import { eyeOutlinePath } from './geometry/eye';

/** Eye: the shared lens outline plus the pupil. */
export const IconEye = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d={eyeOutlinePath} />
    <circle cx="12" cy="12" r="3" />
  </IconBase>
));
