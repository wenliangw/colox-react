import type { RefObject } from 'react';
import type { Placement } from '@floating-ui/dom';
import type { TooltipSize, TooltipVariant } from './component';

/** The root surface the composed parts read through the protected outlet. */
export interface TooltipContextValue {
  /** Marks the no-op default — a part outside any root reads it and warns. */
  isDefault: boolean;
  visible: boolean;
  /** The panel id; the trigger's injected aria-describedby references it. */
  contentId: string;
  /** The trigger element: positioning reference and the dismiss scope. */
  triggerRef: RefObject<HTMLElement | null>;
  /** The portal panel root (dismiss containment). */
  panelRef: RefObject<HTMLDivElement | null>;
  placement: Placement;
  gap: number;
  fallbackPlacements: Placement[];
  showArrow: boolean;
  variant: TooltipVariant;
  size: TooltipSize;
}
