import { cva, type VariantProps } from 'class-variance-authority';
import { anchorInlineStyles } from './inline';

export const anchorVariants = cva('colox-anchor', {
  variants: {
    inline: anchorInlineStyles,
  },
});

export type AnchorVariants = VariantProps<typeof anchorVariants>;
