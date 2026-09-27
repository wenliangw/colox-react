import type { HTMLAttributes, ReactNode } from 'react';
import type { Placement } from '@floating-ui/dom';

/**
 * The trigger channels. click toggles instantly and hands the focus
 * to the panel (a non-modal dialog); hover rides the delay pair (the
 * out-delay is the pointer bridge into the interactive panel) and
 * never steals focus; manual is the controlled `visible` word.
 */
export type PopoverVisibleOn = 'click' | 'hover' | 'manual';

/**
 * The hover-channel delay pair, an object so a partial override stays
 * honest (`{ out: 200 }` keeps the default open delay). The focus leg
 * is always instant; the click and manual channels carry no timers.
 */
export interface PopoverDelay {
  /** Open delay in ms for the hover channel. @default 300 */
  in?: number;
  /** Close delay in ms for the pointer-leave edge — also the bridge that keeps the panel open while the pointer crosses from the trigger into it. @default 100 */
  out?: number;
}

/**
 * The interactive floating card: a non-modal dialog panel near its
 * trigger, holding rich author content (buttons, forms, lists) — the
 * complementary of the Tooltip hint layer, which stays click-through.
 * Zero container: the trigger is cloned in place (no wrapper
 * element); the panel body comes from the `content` prop or the
 * composed `<Popover.Trigger>`/`<Popover.Title>`/`<Popover.Content>`
 * channels — giving both is a compile error, an empty content means
 * the panel never mounts.
 */
export interface PopoverProps extends Omit<HTMLAttributes<HTMLElement>, 'title' | 'content'> {
  /** The panel header (props mode); falsy values render no header. */
  title?: ReactNode;
  /** The panel body — rich interactive content. Falsy values mean the panel never mounts. */
  content?: ReactNode;
  /**
   * The trigger interaction. `click` toggles instantly and focuses the
   * panel; `hover` rides the delay pair and never steals focus;
   * `manual` is the controlled word. @default 'click'
   */
  visibleOn?: PopoverVisibleOn;
  /** The controlled visibility — only the `manual` channel reads it. */
  visible?: boolean;
  /** The decorative arrow (CSS diamond, follows the resolved placement). @default true */
  showArrow?: boolean;
  /** The floating-ui placement word the popup prefers. @default 'bottom-start' */
  placement?: Placement;
  /** The hover-channel delay pair; partial objects merge into the defaults. */
  delay?: PopoverDelay;
  /**
   * Close on any scroll while open (false = follow the reference).
   * Under `manual` the close lands as `onVisibleChange(false)` — the
   * controlled owner follows. @default false
   */
  closeOnScroll?: boolean;
  /**
   * Close on a pointerdown landing outside the trigger and the panel
   * (default true). When false the panel ignores outside clicks —
   * Escape and the lost window keep dismissing, the trigger toggle
   * stays live. Under `manual` the close lands as
   * `onVisibleChange(false)` rather than a state flip. @default true
   */
  closeOnOutsideClick?: boolean;
  /** The trigger element (the composed parts in composed mode). */
  children?: ReactNode;
  /**
   * Fires whenever the visibility changes (toggle, hover or dismiss);
   * under `manual` it also fires `false` when an opt-in close channel
   * lands (an outside click per `closeOnOutsideClick`, a scroll per
   * `closeOnScroll`) — the controlled owner follows.
   */
  onVisibleChange?: (visible: boolean) => void;
}

/** The forwarded ref points at the trigger element's DOM node. */
export type PopoverRef = HTMLElement;
