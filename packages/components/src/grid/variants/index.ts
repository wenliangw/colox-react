import { cva, type VariantProps } from 'class-variance-authority';
import { gridAlignStyles } from './align';
import { gridColumnGapStyles, gridGapStyles, gridRowGapStyles } from './gap';
import { gridJustifyStyles } from './justify';

export const gridVariants = cva('colox-grid', {
  variants: {
    gap: gridGapStyles,
    rowGap: gridRowGapStyles,
    columnGap: gridColumnGapStyles,
    align: gridAlignStyles,
    justify: gridJustifyStyles,
  },
});

export type GridVariants = VariantProps<typeof gridVariants>;
