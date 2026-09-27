import type { HTMLAttributes } from 'react';

export interface OverlayProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the overlay should be on screen. */
  open: boolean;
  /**
   * The exit window in milliseconds: after `open` flips false the
   * overlay stays mounted — carrying the `colox-overlay--exiting`
   * class — for this long before unmounting, so a consumer can play
   * its exit animation. Default 0 = instant unmount. The consumer's
   * CSS animation duration must mirror this number.
   * @default 0
   */
  exitDuration?: number;
}
