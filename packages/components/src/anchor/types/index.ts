import type { HTMLAttributes } from 'react';

/**
 * The reference frame: a layout-neutral relative box whose own box is what
 * absolutely positioned boxes resolve against. `inline` makes it hug its
 * content, which is what pins an overlay to a control.
 */
export interface AnchorProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Hug the content (`inline-block` + `fit-content`) instead of filling the
   * block flow — the badge wrap shape.
   */
  inline?: boolean;
}

export type AnchorRef = HTMLDivElement;
