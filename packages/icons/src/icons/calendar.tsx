import { forwardRef } from 'react';
import { IconBase } from '../components/icon-base';
import type { IconProps } from '../components/icon-base/types';
import { calendarPath } from './geometry/calendar';

/** Date-picker calendar glyph: frame, header rule and binding stubs. */
export const IconCalendar = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <IconBase ref={ref} {...props}>
    <path d={calendarPath} />
  </IconBase>
));
