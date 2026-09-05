import { forwardRef } from 'react';
import clsx from 'clsx';
import type { ButtonProps, ButtonRef } from './types';
import { buttonVariants } from './variants';

import './styles/index.scss';

export const Button = forwardRef<ButtonRef, ButtonProps>((props, ref) => {
  const { size, variant, intent, shadow, className, type = 'button', ...rest } = props;

  return (
    <button
      ref={ref}
      type={type}
      className={clsx(buttonVariants({ size, variant, intent, shadow }), className)}
      {...rest}
    />
  );
});
