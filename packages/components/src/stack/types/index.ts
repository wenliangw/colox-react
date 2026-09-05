import type { HTMLAttributes } from 'react';

/**
 * The spacing scale keys (the `--colox-spacing-*` theme tokens): full
 * 4px steps from 1 through 14 and 16 plus the 2px half steps.
 */
export type StackGap =
  | '0-5'
  | '1'
  | '1-5'
  | '2'
  | '2-5'
  | '3'
  | '3-5'
  | '4'
  | '4-5'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | '11'
  | '12'
  | '13'
  | '14'
  | '16';

export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

interface StackProps extends HTMLAttributes<HTMLDivElement> {
  /** Cross-axis alignment (align-items). Defaults to the CSS-faithful `'stretch'`. */
  align?: StackAlign;
  /** Main-axis distribution (justify-content). Defaults to `'start'`. */
  justify?: StackJustify;
}

export interface HStackProps extends StackProps {
  /** Spacing between children. Defaults to `'2'` (8px), the inline-pairing step. */
  gap?: StackGap;
  /** Allow the row to wrap onto multiple lines. */
  wrap?: boolean;
}

export interface VStackProps extends StackProps {
  /** Spacing between children. Defaults to `'4'` (16px), the block-stacking step. */
  gap?: StackGap;
}
