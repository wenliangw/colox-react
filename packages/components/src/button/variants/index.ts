import { cva, type VariantProps } from 'class-variance-authority';
import { buttonIntentStyles } from './intent';
import { buttonSizeStyles } from './size';
import { buttonVariantStyles } from './variant';

export const buttonVariants = cva('colox-button', {
  variants: {
    size: buttonSizeStyles,
    variant: buttonVariantStyles,
    intent: buttonIntentStyles,
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    intent: 'brand',
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
