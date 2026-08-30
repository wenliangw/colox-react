import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

import './button.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. @default 'primary' */
  variant?: ButtonVariant;
  /** Size of the button. @default 'md' */
  size?: ButtonSize;
  /** Shows a spinner and disables interaction. @default false */
  loading?: boolean;
}

/**
 * A versatile button component with variants, sizes and a loading state.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    className,
    disabled,
    children,
    ...rest
  } = props;

  const classes = clsx('colox-btn', `colox-btn--${variant}`, `colox-btn--${size}`, className);

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="colox-btn__spinner" aria-hidden="true" /> : null}
      <span className="colox-btn__content">{children}</span>
    </button>
  );
});
