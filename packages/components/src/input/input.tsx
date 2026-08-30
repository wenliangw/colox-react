import { forwardRef } from 'react';
import clsx from 'clsx';
import type { InputProps, InputRef } from './types';
import { inputVariants } from './variants';

import './styles/index.scss';

export const Input = forwardRef<InputRef, InputProps>((props, ref) => {
  const { size, invalid = false, className, ...rest } = props;

  return (
    <input
      ref={ref}
      className={clsx(inputVariants({ size }), { 'colox-input--invalid': invalid }, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
});
