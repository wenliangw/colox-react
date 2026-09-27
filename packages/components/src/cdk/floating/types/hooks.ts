import type { RefObject } from 'react';
import type { Placement } from '@floating-ui/dom';

export interface UseDismissibleOptions {
  open: boolean;
  /** The trigger reference (the combobox control or its shell). */
  triggerRef: RefObject<HTMLElement | null>;
  /** The portal-mounted panel. */
  panelRef: RefObject<HTMLElement | null>;
  /**
   * Dismiss on an outside pointerdown (default true). When false the
   * popup ignores outside clicks — Escape and the lost window keep
   * dismissing, they are not clicks. @default true
   */
  closeOnOutsideClick?: boolean;
  /** Closes the popup: outside pointerdown, Escape or window focus loss. */
  onDismiss: () => void;
  /**
   * The outside-click channel's own callback (falls back to
   * `onDismiss` when absent). The caller splits the channels when one
   * of them must behave differently — the manual mode echoes only the
   * outside click and keeps Escape/window silent, for example.
   */
  onDismissOutsideClick?: () => void;
}

export interface UseFloatingPositionOptions {
  /** The reference element the panel positions against (the combobox control/shell). */
  referenceRef: RefObject<HTMLElement | null>;
  /** The panel element; the resolved position is written into its inline style. */
  floatingRef: RefObject<HTMLElement | null>;
  /** Skip the positioning stream while closed. */
  open: boolean;
  /**
   * The flip fallback chain. Defaults to the picker presets
   * (`top-start` / `bottom-end` / `top-end`); a popup may hand its own
   * chain (the tooltip resolves the opposite side first).
   */
  fallbackPlacements?: Placement[];
  placement?: Placement;
  /** Gap between the reference edge and the panel. */
  gap?: number;
  /** Minimum clearance kept to the viewport edges. */
  padding?: number;
  /** Keep the panel at least as wide as the reference element (default true). */
  matchWidth?: boolean;
}

export interface UseFloatingPositionResult {
  /**
   * Flips true once the first position resolves — the panel paints
   * hidden until then, so it never flashes at the pre-layout origin.
   */
  positioned: boolean;
}
