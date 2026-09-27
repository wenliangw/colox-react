import type { RefObject } from 'react';
import type { FocusEventHandler, MouseEventHandler, PointerEventHandler } from 'react';
import type { PopoverDelay, PopoverVisibleOn } from './component';

/** The interaction surfaces injected into the trigger, per channel. */
export interface PopoverTriggerHandlers {
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}

/** The hover region's panel half: the bridge the panel mounts so the pointer crossing keeps it open. */
export interface PopoverBridgeHandlers {
  onPointerEnter?: PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: PointerEventHandler<HTMLDivElement>;
}

export interface UsePopoverParams {
  visibleOn: PopoverVisibleOn;
  /** The controlled word — only the manual channel reads it. */
  visible?: boolean;
  delay: PopoverDelay;
  closeOnScroll: boolean;
  /** Outside-pointerdown dismissal (defaults true at the component edge). */
  closeOnOutsideClick: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /**
   * The compiled content word: a popover without content must never
   * open — the machine no-ops the open edge (no state flip, no echo)
   * so the aria surface never claims a panel that cannot mount.
   */
  hasContent: boolean;
}

export interface UsePopoverResult {
  visible: boolean;
  /** The trigger element DOM — positions the panel and scopes dismissal. */
  triggerRef: RefObject<HTMLElement | null>;
  /** The portal panel root (dismiss containment, focus trap and open-focus target). */
  panelRef: RefObject<HTMLDivElement | null>;
  /** The per-channel interaction surfaces (empty for manual). */
  handlers: PopoverTriggerHandlers;
  /** The hover region's panel half (the pointer bridge over the trigger-panel crossing). */
  bridgeHandlers: PopoverBridgeHandlers;
  /**
   * The panel ref callback: assigns the node AND performs the
   * appointed open-focus once the portal node actually arrives (the
   * panel mounts one tick after the open edge — a passive effect
   * would look at a null ref and the focus would be dropped).
   */
  setPanelRef: (node: HTMLDivElement | null) => void;
}
