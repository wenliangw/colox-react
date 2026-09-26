import type { RefObject } from 'react';
import type { FocusEventHandler, MouseEventHandler, PointerEventHandler } from 'react';
import type { TooltipDelay, TooltipVisibleOn } from './component';

/** The interaction surfaces injected into the trigger, per channel. */
export interface TooltipTriggerHandlers {
  onPointerEnter?: PointerEventHandler<HTMLElement>;
  onPointerLeave?: PointerEventHandler<HTMLElement>;
  onFocus?: FocusEventHandler<HTMLElement>;
  onBlur?: FocusEventHandler<HTMLElement>;
  onClick?: MouseEventHandler<HTMLElement>;
}

export interface UseTooltipParams {
  visibleOn: TooltipVisibleOn;
  /** The controlled word — only the manual channel reads it. */
  visible?: boolean;
  delay: TooltipDelay;
  closeOnScroll: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export interface UseTooltipResult {
  visible: boolean;
  /** The trigger element DOM — positions the panel and scopes dismissal. */
  triggerRef: RefObject<HTMLElement | null>;
  /** The portal panel root. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** The per-channel interaction surfaces (empty for manual). */
  handlers: TooltipTriggerHandlers;
}
