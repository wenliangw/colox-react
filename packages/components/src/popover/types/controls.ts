import type { CSSProperties, ReactNode, RefObject } from 'react';
import type { Placement } from '@floating-ui/dom';
import type { PopoverTitleResolved } from './context';
import type { PopoverBridgeHandlers } from './hooks';

/** The portal panel unit: the resolved surface both channels share. */
export interface PopoverPanelProps {
  open: boolean;
  /** The panel id (also the trigger's aria-controls reference). */
  panelId: string;
  referenceRef: RefObject<HTMLElement | null>;
  placement: Placement;
  gap: number;
  fallbackPlacements: Placement[];
  showArrow: boolean;
  /** The resolved header (undefined = no header row). */
  title?: PopoverTitleResolved;
  /** The hover region's panel half (the pointer bridge handers). */
  bridgeHandlers: PopoverBridgeHandlers;
  /** The content-box escape hatch (the composed Content part's words). */
  contentClassName?: string;
  contentStyle?: CSSProperties;
  children: ReactNode;
}
