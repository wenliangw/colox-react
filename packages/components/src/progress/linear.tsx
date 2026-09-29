import { forwardRef } from 'react';
import clsx from 'clsx';
import type { ProgressLinearProps, ProgressLinearRef } from './types';
import { progressLinearVariants } from './variants';

import './styles/index.scss';

/**
 * `Progress.Linear` — the horizontal progress bar: a track fabric with
 * a filled bar grown to the committed percent, or an indeterminate
 * sweeping block when no value is committed. Pure display: no events,
 * no form integration — consumers drive the value from their store.
 *
 * The live region is the family contract: `role="progressbar"` with
 * `aria-valuemin/max` pinned to 0–100 and `aria-valuenow` only while
 * determinate (an indeterminate bar announces no number).
 */
const ProgressLinear = forwardRef<ProgressLinearRef, ProgressLinearProps>((props, ref) => {
  const { value, palette, size, showInfo = true, className, format, ...rest } = props;
  const determinate = typeof value === 'number';

  return (
    <div
      ref={ref}
      className={clsx(progressLinearVariants({ palette, size }), className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={determinate ? value : undefined}
      {...rest}
    >
      <div className="colox-progress-linear__track">
        <div
          className={clsx('colox-progress-linear__bar', {
            'colox-progress-linear__bar--indeterminate': !determinate,
          })}
          style={determinate ? { width: `${value}%` } : undefined}
        />
      </div>
      {determinate && showInfo && (
        <span className="colox-progress-linear__info">{format ? format(value) : `${value}%`}</span>
      )}
    </div>
  );
});

ProgressLinear.displayName = 'Progress.Linear';

export { ProgressLinear };
