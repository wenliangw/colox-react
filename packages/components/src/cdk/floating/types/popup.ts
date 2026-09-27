import type { HTMLAttributes, RefObject } from 'react';
import type { Placement } from '@floating-ui/dom';

export interface PopupProps extends HTMLAttributes<HTMLDivElement> {
  /** The element the panel positions against (the trigger control/shell). */
  referenceRef: RefObject<HTMLElement | null>;
  open: boolean;
  /** The flip fallback chain (see useFloatingPosition). */
  fallbackPlacements?: Placement[];
  placement?: Placement;
  /** Gap between the reference edge and the panel. */
  gap?: number;
  /** Minimum clearance kept to the viewport edges. */
  padding?: number;
  /** Keep the panel at least as wide as its reference (default true). */
  matchWidth?: boolean;
  /**
   * The exit window in milliseconds: after `open` flips false the panel
   * stays mounted — carrying the `colox-popup--exiting` class — for
   * this long before unmounting, so a consumer can play its exit
   * animation. Default 0 = the panel unmounts immediately (the
   * historical behavior — pickers and every existing consumer stay
   * untouched). The consumer's CSS animation duration must mirror
   * this number (they share the motion token).
   */
  exitDuration?: number;
}
