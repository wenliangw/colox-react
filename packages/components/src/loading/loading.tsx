import { forwardRef } from 'react';
import type { ReactElement } from 'react';
import clsx from 'clsx';
import type { LoadingAnimation, LoadingProps, LoadingRef } from './types';
import { LoadingDotsFigure, LoadingPulseFigure, LoadingSpinnerFigure } from './indicators';

import './styles/index.scss';

/** The animation word maps to its indicator figure. */
const LOADING_FIGURES: Record<LoadingAnimation, () => ReactElement> = {
  spinner: LoadingSpinnerFigure,
  dots: LoadingDotsFigure,
  pulse: LoadingPulseFigure,
};

/**
 * Loading — the inline busy indicator: a decorative motion figure
 * that says "work in progress" without painting a value (Progress) or
 * a layout (Skeleton). The figure inherits `currentColor`; the size
 * axis moves the indicator footprint only. `label` rides beside the
 * indicator and doubles as the accessible name — with neither `label`
 * nor `aria-label`, the default name is "Loading". The root is a
 * `role="status"` live region; `Loading` never wraps or masks
 * children.
 */
export const Loading = forwardRef<LoadingRef, LoadingProps>((props, ref) => {
  const {
    animation = 'spinner',
    size = 'md',
    label,
    'aria-label': ariaLabel,
    className,
    style,
    ...rest
  } = props;

  const Indicator = LOADING_FIGURES[animation];
  const numberSize = typeof size === 'number';
  const sizeClass = numberSize ? 'md' : size;

  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? (label ? undefined : 'Loading')}
      className={clsx(
        'colox-loading',
        `colox-loading--${animation}`,
        `colox-loading--${sizeClass}`,
        className,
      )}
      style={style}
      {...rest}
    >
      <span
        className="colox-loading__indicator"
        aria-hidden="true"
        style={numberSize ? { fontSize: size } : undefined}
      >
        <Indicator />
      </span>
      {label && <span className="colox-loading__label">{label}</span>}
    </span>
  );
});

Loading.displayName = 'Loading';
