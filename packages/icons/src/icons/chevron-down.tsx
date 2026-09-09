import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';
import { chevronPath } from './geometry/chevron';

/** Down-pointing chevron: the shared geometry rotated 90° around the canvas center. */
export const ChevronDown = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d={chevronPath} transform="rotate(90 12 12)" />
  </IconBase>
));
