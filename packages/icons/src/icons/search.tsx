import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/** Search: lens circle plus the 45° handle, tip buried in the stroke so the joint reads rounded. */
export const Search = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16 16 L20 20" />
  </IconBase>
));
