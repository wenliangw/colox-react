import { forwardRef } from 'react';
import type { IconProps } from './types';

/**
 * The internal SVG base of every Colox icon — the single home of the
 * design-language contract: 24 viewBox, 1.5 round stroke (1px
 * effective at 16px — the component border weight), currentColor
 * (color follows the host's semantic token, unless `color` pins an
 * explicit one) and 1em sizing unless `size` pins an explicit px size.
 *
 * Not part of the public API: consumers take finished icons
 * (`IconEye`, `IconChevronDown`, ...). Props spread after the
 * defaults, so icon-level overrides still apply — the base obeys, it
 * does not decide.
 */
export const IconBase = forwardRef<SVGSVGElement, IconProps>((props, ref) => {
  const { children, size, color, style, ...rest } = props;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size ?? '1em'}
      height={size ?? '1em'}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
      style={{ color, ...style }}
      {...rest}
    >
      {children}
    </svg>
  );
});
