import type { HTMLAttributes, RefObject } from 'react';
import type { Placement } from '@floating-ui/dom';

export interface PopupProps extends HTMLAttributes<HTMLDivElement> {
  /** The element the panel positions against (the trigger control/shell). */
  referenceRef: RefObject<HTMLElement | null>;
  open: boolean;
  placement?: Placement;
  /** Gap between the reference edge and the panel. */
  gap?: number;
  /** Minimum clearance kept to the viewport edges. */
  padding?: number;
  /** Keep the panel at least as wide as its reference (default true). */
  matchWidth?: boolean;
}
