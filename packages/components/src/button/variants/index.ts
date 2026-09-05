import { cva, type VariantProps } from 'class-variance-authority';
import { buttonIntentStyles } from './intent';
import { buttonSizeStyles } from './size';
import { buttonVariantStyles } from './variant';

export const buttonVariants = cva('colox-button', {
  variants: {
    size: buttonSizeStyles,
    variant: buttonVariantStyles,
    intent: buttonIntentStyles,
    shadow: {
      true: 'colox-button--shadow',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    intent: 'primary',
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
