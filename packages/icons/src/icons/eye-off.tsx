import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';
import { eyeOutlinePath, eyeSlashPath } from './geometry/eye';

/** Eye off: the shared outline, no pupil, plus the 45° slash. */
export const IconEyeOff = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d={eyeOutlinePath} />
    <path d={eyeSlashPath} />
  </IconBase>
));
