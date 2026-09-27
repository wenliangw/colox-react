import type { CSSProperties, ReactNode, RefObject } from 'react';
import type { Placement } from '@floating-ui/dom';
import type { TooltipPalette, TooltipSize } from './component';

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
  palette: TooltipPalette;
  size: TooltipSize;
  /** The content-box escape hatch (the composed Content part's words). */
  contentClassName?: string;
  contentStyle?: CSSProperties;
  children: ReactNode;
}
