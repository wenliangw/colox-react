import type { HTMLAttributes, ReactNode } from 'react';
import type { Placement } from '@floating-ui/dom';
import type { TooltipVariants } from '../variants';

/** The surface families, derived from the cva recipe (single source). */
export type TooltipPalette = NonNullable<TooltipVariants['palette']>;
/** The content tiers, derived from the cva recipe (single source). */
export type TooltipSize = NonNullable<TooltipVariants['size']>;

/** The trigger channel: hover+focus, click, or the controlled word (manual). */
export type TooltipVisibleOn = 'hover' | 'click' | 'manual';

/**
 * The hover-channel delay pair, an object so a partial override stays
 * honest (`{ out: 200 }` keeps the default open delay). The focus
 * channel is always instant; `in`/`out` speak the visibility lexicon.
 */
export interface TooltipDelay {
  /** Open delay in ms for the hover channel. @default 300 */
  in?: number;
  /** Close delay in ms for the pointer-leave channel. @default 0 */
  out?: number;
}

/**
 * The hint layer, zero container: it clones its trigger in place (no
 * wrapping element — the DOM structure the author wrote stays intact)
 * and injects the interaction surfaces plus the `aria-describedby`
 * wiring. The body comes from the `content` prop or the composed
 * `<Tooltip.Trigger>` + `<Tooltip.Content>` channels — both given is
 * a compile-time error, an empty `content` renders no tooltip.
 */
export interface TooltipProps extends Omit<HTMLAttributes<HTMLElement>, 'content'> {
  /** The hint body (props mode); falsy values render no tooltip. */
  content?: ReactNode;
  /** The trigger interaction: hover+focus, click or the controlled word. @default 'hover' */
  visibleOn?: TooltipVisibleOn;
  /** The controlled visibility — only the `manual` channel reads it. */
  visible?: boolean;
  /** The decorative arrow (CSS square, follows the resolved placement). @default true */
  showArrow?: boolean;
  /** The floating-ui placement word the popup prefers. @default 'top' */
  placement?: Placement;
  /** The surface family — one of the seven design-language families (six palettes plus the white inverse); gray is the neutral dark default. @default 'gray' */
  palette?: TooltipPalette;
  /** The hover-channel delay pair; partial objects merge into the defaults. */
  delay?: TooltipDelay;
  /**
   * Close on any scroll while open (false = follow the reference).
   * Under `manual` the close lands as `onVisibleChange(false)` — the
   * controlled owner follows. @default false
   */
  closeOnScroll?: boolean;
  /**
   * Close on a pointerdown landing outside the trigger and the panel
   * (default true). When false the hint ignores outside clicks —
   * Escape and the lost window keep dismissing, they are not clicks.
   * Under `manual` the close lands as `onVisibleChange(false)` rather
   * than a state flip. @default true
   */
  closeOnOutsideClick?: boolean;
  /** The content typography/padding tier (the hint offset ladder). @default 'md' */
  size?: TooltipSize;
  /** The trigger element (the composed parts in composed mode). */
  children?: ReactNode;
  /**
   * Fires whenever the visibility changes (auto policy or click);
   * under `manual` it also fires `false` when an opt-in close channel
   * lands (an outside click per `closeOnOutsideClick`, a scroll per
   * `closeOnScroll`) — the controlled owner follows.
   */
  onVisibleChange?: (visible: boolean) => void;
}

/** The forwarded ref points at the trigger element's DOM node. */
export type TooltipRef = HTMLElement;
