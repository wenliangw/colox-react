import type { InputHTMLAttributes } from 'react';
import type { InputVariants } from '../variants';

export type InputSize = NonNullable<InputVariants['size']>;

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size of the input. @default 'md' */
  size?: InputSize;
  /** Marks the input as invalid. @default false */
  invalid?: boolean;
}

export type InputRef = HTMLInputElement;
