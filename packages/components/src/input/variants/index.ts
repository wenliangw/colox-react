import { cva, type VariantProps } from 'class-variance-authority';
import { inputSizeStyles } from './size';

export const inputVariants = cva('colox-input', {
  variants: {
    size: inputSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type InputVariants = VariantProps<typeof inputVariants>;
