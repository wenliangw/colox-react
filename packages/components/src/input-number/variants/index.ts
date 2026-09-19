import { cva, type VariantProps } from 'class-variance-authority';
import { inputNumberSizeStyles } from './size';

// The variants target the shell (the visual contract, shared with the
// Input family); the inner control stays a bare native input with the
// structural hook only.
export const inputNumberVariants = cva('colox-input-number', {
  variants: {
    size: inputNumberSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type InputNumberVariants = VariantProps<typeof inputNumberVariants>;
