import { cva, type VariantProps } from 'class-variance-authority';
import { textareaSizeStyles } from './size';

// The variants target the shell (the visual contract); the inner control
// stays class-free beyond its structural hook. Same shape as Input.
export const textareaVariants = cva('colox-textarea', {
  variants: {
    size: textareaSizeStyles,
  },
  defaultVariants: {
    size: 'md',
  },
});

export type TextareaVariants = VariantProps<typeof textareaVariants>;
