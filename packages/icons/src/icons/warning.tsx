import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';

/** Warning: the triangle with an exclamation — the caution glyph. */
export const IconWarning = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d="M12 5 L21 19 L3 19 Z" />
    <path d="M12 10 V15 M12 17 V17" />
  </IconBase>
));
