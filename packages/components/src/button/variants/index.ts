import { cva, type VariantProps } from 'class-variance-authority';
import { buttonPaletteStyles } from './palette';
import { buttonSizeStyles } from './size';
import { buttonVariantStyles } from './variant';

export const buttonVariants = cva('colox-button', {
  variants: {
    size: buttonSizeStyles,
    variant: buttonVariantStyles,
    palette: buttonPaletteStyles,
    shadow: {
      true: 'colox-button--shadow',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
    palette: 'gray',
  },
});

export type ButtonVariants = VariantProps<typeof buttonVariants>;
