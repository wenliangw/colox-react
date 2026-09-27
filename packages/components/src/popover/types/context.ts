import type { CSSProperties, ReactNode, RefObject } from 'react';
import type { Placement } from '@floating-ui/dom';
import type { PopoverBridgeHandlers } from './hooks';

/** The resolved header surface (title words captured from either channel). */
export interface PopoverTitleResolved {
  node: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** The root surface the composed parts read through the protected outlet. */
export interface PopoverContextValue {
  /** Marks the no-op default — a part outside any root reads it and warns. */
  isDefault: boolean;
  visible: boolean;
  /** The panel id; the trigger's injected aria-controls references it (and the dialog itself carries it). */
  panelId: string;
  /** The trigger element: positioning reference and the dismiss scope. */
  triggerRef: RefObject<HTMLElement | null>;
  /** The portal panel root (dismiss containment and the focus trap scope). */
  panelRef: RefObject<HTMLDivElement | null>;
  /** the resolved title (header) — undefined when no title was given. */
  title: PopoverTitleResolved | undefined;
  placement: Placement;
  gap: number;
  fallbackPlacements: Placement[];
  showArrow: boolean;
  /** The panel ref callback: assigns the node and performs the appointed open-focus. */
  setPanelRef: (node: HTMLDivElement | null) => void;
  /** The hover region's panel half (the bridge over the trigger-to-panel crossing). */
  bridgeHandlers: PopoverBridgeHandlers;
}
