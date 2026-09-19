import { cva, type VariantProps } from 'class-variance-authority';

// The root carries no visual axes: the shell identity belongs to the
// injected host (the Input family owns size/invalid/disabled) and the
// popup rows are fixed at the md tier. The variants layer still owns
// the class contract per family convention, ready for axes to grow
// into.
export const autocompleteVariants = cva('colox-autocomplete', {
  variants: {},
  defaultVariants: {},
});

export type AutoCompleteVariants = VariantProps<typeof autocompleteVariants>;
