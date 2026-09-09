import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';
import { chevronPath } from './geometry/chevron';

/** Up-pointing chevron: the shared geometry rotated 270° around the canvas center. */
export const ChevronUp = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d={chevronPath} transform="rotate(270 12 12)" />
  </IconBase>
));
