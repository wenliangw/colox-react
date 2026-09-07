import type { HTMLAttributes } from 'react';
import type { ContainerVariants } from '../variants';

/** Max-width cap key — the breakpoint words, each cap = the band floor. */
export type ContainerSize = NonNullable<ContainerVariants['size']>;
/** Inline gutter sized by the theme spacing scale. */
export type ContainerGutter = NonNullable<ContainerVariants['gutter']>;
/** Horizontal placement of the constrained box. */
export type ContainerAlign = NonNullable<ContainerVariants['align']>;

/**
 * The semantic width shell: caps content to a breakpoint-width ceiling,
 * centers it and pads it inline. Fully static — never touches the theme
 * context.
 */
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Max-width cap. The keys are the breakpoint words and each cap equals
   * the same-named breakpoint floor, so a `sm` container never exceeds
   * the `sm` viewport band.
   * @default 'fluid'
   */
  size?: ContainerSize;
  /**
   * Inline padding (spacing scale key).
   * @default undefined — CSS default padding of 0.
   */
  gutter?: ContainerGutter;
  /**
   * Horizontal placement of the constrained box.
   * @default 'center'
   */
  align?: ContainerAlign;
}
