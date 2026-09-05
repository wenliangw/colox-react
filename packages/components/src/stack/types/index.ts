import type { HTMLAttributes } from 'react';
import type { HStackVariants } from '../variants';

/** Spacing scale keys (the `--colox-spacing-*` theme tokens).
 * Gap/align/justify share the HStack axis tables, so a single anchor
 * types them for both components. */
export type StackGap = NonNullable<HStackVariants['gap']>;
export type StackAlign = NonNullable<HStackVariants['align']>;
export type StackJustify = NonNullable<HStackVariants['justify']>;

export interface HStackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Spacing between children (spacing token key).
   * @default '2'
   */
  gap?: StackGap;
  /**
   * Cross-axis alignment (align-items).
   * @default 'stretch'
   */
  align?: StackAlign;
  /**
   * Main-axis distribution (justify-content).
   * @default 'start'
   */
  justify?: StackJustify;
  /**
   * Allow the row to wrap onto multiple lines.
   * @default false
   */
  wrap?: boolean;
}

export interface VStackProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Spacing between children (spacing token key).
   * @default '4'
   */
  gap?: StackGap;
  /**
   * Cross-axis alignment (align-items).
   * @default 'stretch'
   */
  align?: StackAlign;
  /**
   * Main-axis distribution (justify-content).
   * @default 'start'
   */
  justify?: StackJustify;
}
