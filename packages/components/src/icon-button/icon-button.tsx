import { forwardRef } from 'react';
import clsx from 'clsx';
import type { IconButtonProps, IconButtonRef } from './types';
import { iconButtonVariants } from './variants';

import './styles/index.scss';

export const IconButton = forwardRef<IconButtonRef, IconButtonProps>((props, ref) => {
  const { size, variant, palette, rounded, className, type = 'button', ...rest } = props;

  return (
    <button
      ref={ref}
      type={type}
      className={clsx(iconButtonVariants({ size, variant, palette, rounded }), className)}
      {...rest}
    />
  );
});
