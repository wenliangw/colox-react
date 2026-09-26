import { cva, type VariantProps } from 'class-variance-authority';
import { timePickerPaletteStyles } from './palette';
import { timePickerSizeStyles } from './size';

// The variants target the shell (the visual contract, shared with the
// Input family); the palette axis paints only the panel's selection
// semantics — the field shell itself stays neutral like every form
// control.
export const timePickerVariants = cva('colox-time-picker', {
  variants: {
    size: timePickerSizeStyles,
    palette: timePickerPaletteStyles,
  },
  defaultVariants: {
    size: 'md',
    palette: 'primary',
  },
});

export type TimePickerVariants = VariantProps<typeof timePickerVariants>;
