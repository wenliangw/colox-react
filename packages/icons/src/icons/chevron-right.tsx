import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';
import { chevronPath } from './geometry/chevron';

/**
 * The family's base rotation: right-pointing, tip at (13,12) with the
 * r2 corner. Other directions rotate this exact stroke.
 */
export const ChevronRight = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d={chevronPath} />
  </IconBase>
));
