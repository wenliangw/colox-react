import type { HTMLAttributes } from 'react';
import type { ContainerVariants } from '../variants';

/** Max-width cap key — each cap IS a large-dimension design token. */
export type ContainerSize = NonNullable<ContainerVariants['size']>;
/** Inline gutter sized by the theme spacing scale. */
export type ContainerGutter = NonNullable<ContainerVariants['gutter']>;
/** Horizontal placement of the constrained box. */
export type ContainerAlign = NonNullable<ContainerVariants['align']>;

/**
 * The semantic width shell: caps content to a design-token width
 * ceiling, centers it and pads it inline. Fully static — never touches
 * the theme context.
 */
export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Max-width cap. Each cap is a large-dimension design token
   * (`--colox-size-*`): sm/md/lg/xl = 640/768/1024/1280px.
   * @default undefined — no cap, the CSS-faithful default.
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
