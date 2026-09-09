import { forwardRef } from 'react';
import type { IconProps } from './types';

/**
 * The shared SVG base of every Colox icon. The design-language contract
 * lives in one place: 24 viewBox, 1.5 round stroke (1px effective at
 * 16px — same visual weight as the component borders), currentColor
 * (color follows the host's semantic token) and 1em sizing (size
 * follows the host font size).
 *
 * Props spread after the defaults, so consumers may override any
 * stroke/sizing/a11y attribute — the fork channel stays open.
 */
export const IconBase = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
});
