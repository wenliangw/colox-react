import { cva, type VariantProps } from 'class-variance-authority';
import { alertPaletteStyles } from './palette';
import { alertVariantStyles } from './variant';

export const alertVariants = cva('colox-alert', {
  variants: {
    palette: alertPaletteStyles,
    variant: alertVariantStyles,
  },
  defaultVariants: {
    palette: 'info',
    variant: 'subtle',
  },
});

export type AlertVariants = VariantProps<typeof alertVariants>;
