import { forwardRef } from 'react';
import clsx from 'clsx';
import type { ButtonProps, ButtonRef } from './types';
import { buttonVariants } from './variants';
import { useCompactContext } from '@colox/cdk/compact-context';

import './styles/index.scss';

export const Button = forwardRef<ButtonRef, ButtonProps>((props, ref) => {
  const { size, variant, palette, shadow, className, type = 'button', ...rest } = props;
  const compact = useCompactContext();

  return (
    <button
      ref={ref}
      type={type}
      className={clsx(
        buttonVariants({
          size: size ?? compact?.size,
          variant,
          palette: palette ?? compact?.palette,
          shadow,
        }),
        className,
      )}
      {...rest}
    />
  );
});
