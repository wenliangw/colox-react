import { cva, type VariantProps } from 'class-variance-authority';
import { datePickerPaletteStyles } from './palette';
import { datePickerSizeStyles } from './size';

// The variants target the shell (the visual contract, shared with the
// Input family); the palette axis paints only the panel's selection
// semantics — the field shell itself stays neutral like every form
// control.
export const datePickerVariants = cva('colox-date-picker', {
  variants: {
    size: datePickerSizeStyles,
    palette: datePickerPaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    palette: 'primary',
  },
});

export type DatePickerVariants = VariantProps<typeof datePickerVariants>;
