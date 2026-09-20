import { cva, type VariantProps } from 'class-variance-authority';
import { formLabelAlignStyles } from './label-align';
import { formLabelPlacementStyles } from './label-placement';
import { formLabelWidthStyles } from './label-width';

/**
 * The field container variants: the label placement axis (logical
 * words), the label text alignment (start / end / justify) and the
 * label column width (size token keys, the same single-sourced list as
 * the rest of the library). The variant classes sit on the field's
 * Stack root, so the field's own class name and the layout skeleton
 * share one element.
 */
export const formFieldVariants = cva('colox-form-field', {
  variants: {
    labelPlacement: formLabelPlacementStyles,
    labelAlign: formLabelAlignStyles,
    labelWidth: formLabelWidthStyles,
  },
  defaultVariants: {
    labelPlacement: 'top',
    labelAlign: 'start',
    labelWidth: '24',
  },
});

export type FormFieldVariants = VariantProps<typeof formFieldVariants>;
