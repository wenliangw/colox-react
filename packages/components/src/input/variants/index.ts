import { cva, type VariantProps } from 'class-variance-authority';
import { inputSizeStyles } from './size';

// The variants target the group shell (the visual contract); the inner
// control stays class-free beyond its structural hook.
export const inputVariants = cva('colox-input-group', {
  variants: {
    size: inputSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type InputVariants = VariantProps<typeof inputVariants>;
