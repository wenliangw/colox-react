import { cva, type VariantProps } from 'class-variance-authority';
import { formLabelPlacementStyles } from './label-placement';
import { formLabelWidthStyles } from './label-width';

/**
 * The field container variants: the label placement axis (logical
 * words) and the label column width (size token keys, the same
 * single-sourced list as the rest of the library). The variant classes
 * sit on the field's Stack root, so the field's own class name and the
 * layout skeleton share one element.
 */
export const formFieldVariants = cva('colox-form-field', {
  variants: {
    labelPlacement: formLabelPlacementStyles,
    labelWidth: formLabelWidthStyles,
  },
  defaultVariants: {
    labelPlacement: 'top',
    labelWidth: '24',
  },
});

export type FormFieldVariants = VariantProps<typeof formFieldVariants>;
