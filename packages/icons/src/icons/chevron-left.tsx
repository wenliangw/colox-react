import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';
import { chevronPath } from './geometry/chevron';

/** Left-pointing chevron: the shared geometry rotated 180° around the canvas center. */
export const ChevronLeft = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d={chevronPath} transform="rotate(180 12 12)" />
  </IconBase>
));
