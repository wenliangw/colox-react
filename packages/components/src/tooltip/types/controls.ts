import type { CSSProperties, ReactNode, RefObject } from 'react';
import type { Placement } from '@floating-ui/dom';
import type { TooltipSize, TooltipVariant } from './component';

/** The portal panel unit: the resolved surface the two channels share. */
export interface TooltipPanelProps {
  open: boolean;
  /** The panel id (also the trigger's describedby reference). */
  contentId: string;
  referenceRef: RefObject<HTMLElement | null>;
  placement: Placement;
  gap: number;
  fallbackPlacements: Placement[];
  showArrow: boolean;
  variant: TooltipVariant;
  size: TooltipSize;
  /** The content-box escape hatch (the composed Content part's words). */
  contentClassName?: string;
  contentStyle?: CSSProperties;
  children: ReactNode;
}
