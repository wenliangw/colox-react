import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from 'react';

import type { MessageStore } from '../store';

/**
 * The six stack slots inside a scope container: vertical (top/bottom) ×
 * horizontal (left/center/right). The position is **relative to the
 * scope container** — the MessageViewport's own box, not the screen.
 * New messages push the stack away from the container edge (a top slot
 * stacks downward, a bottom slot stacks upward); the slot owns the
 * alignment (left = start, center = centered, right = end).
 */
export type MessagePosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * The message kind the entry belongs to — routes the entry to the
 * renderer registered for that kind (Toast registers `'toast'`,
 * Notify `'notify'`). Formerly called the message "face".
 */
export type MessageType = 'toast' | 'notify';

/**
 * The message's semantic mode. Names the semantic icon glyph (which
 * icon the message shows) — the four-mode set (info/success/warning/
 * error). The mode is the default palette: a message's color family
 * follows its mode unless an explicit `palette` overrides it.
 * Formerly called the palette tone.
 */
export type MessageMode = 'info' | 'success' | 'warning' | 'error';

/**
 * The color family of the message surface and icon — the design
 * language's six-family axis (Button/IconButton share the words). A
 * message defaults its palette to its mode, so `Toast.info()` reads
 * info; `{ palette: 'primary' }` or `{ palette: 'gray' }` override the
 * family while the mode still picks the icon glyph.
 */
export type MessagePalette = 'gray' | 'primary' | 'info' | 'success' | 'warning' | 'error';

/**
 * The surface strength of the message — how much paint the family
 * carries. `plain` is the neutral bg-default card with the palette
 * icon (the default look); `subtle` tints the card with the family
 * subtle fill; `solid` paints the family solid with inverse ink;
 * `outline` draws a 1px family border on the neutral bg-default card.
 */
export type MessageVariant = 'plain' | 'subtle' | 'solid' | 'outline';

/**
 * The payload of a message's `onClose` callback: the id of the closed
 * message plus the caller's opaque pass-through `data` (the exact
 * value handed to the same add call).
 */
export interface MessageClosePayload {
  /** The id of the message that closed. */
  id: MessageId;
  /** The opaque pass-through `data` of that add call. */
  data?: unknown;
}

/**
 * The close callback of one message — fires once, when the payload of
 * the add call ends: auto-dismiss, `dismiss` (api / close button),
 * `dismissAll` / a scope teardown, or an in-place replacement
 * (the slot takes a new payload and this one's job ends). An `update`
 * continues the same payload, so it does not fire.
 */
export type MessageCloseHandler = (payload: MessageClosePayload) => void;

/**
 * The imperative options of one message. The consumer kinds (Toast /
 * Notify) narrow this shape to their own semantics — Toast keeps it
 * light (content only), Notify promotes the titled tier (title +
 * content).
 */
export interface MessageOptions {
  /** The body words (the lightweight tier, or the body of the titled tier). */
  content?: ReactNode;
  /** The titled tier: a heading above the content. */
  title?: ReactNode;
  /** The semantic mode; drives the icon glyph and defaults the palette. */
  mode?: MessageMode;
  /** The color family; defaults to the mode (see MessagePalette). */
  palette?: MessagePalette;
  /** The surface strength; defaults to 'plain' (see MessageVariant). */
  variant?: MessageVariant;
  /**
   * How a slot fills with this kind's entries. `'single'` (the Toast
   * default) keeps exactly one entry of the kind in a slot: a new entry
   * replaces the current one in place (same node, no re-mount, no
   * shift — the new payload lands instantly and the content zooms in),
   * whatever its palette/variant. `'stack'` (the Notify default)
   * piles them up. Per-call override.
   */
  strategy?: MessageStrategy;
  /**
   * How long (ms) the message stays before auto-dismissing. 0 = sticky
   * (only the close button dismisses). Hovering pauses the countdown.
   * Defaults to the factory's duration (3s).
   */
  duration?: number;
  /**
   * Whether the renderer shows the mode icon. `false` gives a
   * text-only pill. A renderer-owned chrome flag: the Toast renderer
   * reads it (defaults to `true`); any kind may honor it or not.
   */
  showIcon?: boolean;
  /**
   * Whether the renderer shows the corner close button. `false`
   * removes it — the duration and the dismiss API still close the
   * message. A renderer-owned chrome flag: the Toast renderer reads it
   * (defaults to `true`); any kind may honor it or not.
   */
  closeable?: boolean;
  /**
   * The update key: `update(key, patch)` finds the message by this key
   * instead of its auto id.
   */
  key?: string;
  /**
   * Which slot inside the scope container. Defaults to the kind's
   * default (Toast: top-center, Notify: top-right).
   */
  position?: MessagePosition;
  /**
   * An opaque pass-through the caller may attach to its call — the
   * store hands it back untouched in `onClose`'s payload, so a close
   * can be traced back to the call that opened it (an id, a record…).
   */
  data?: unknown;
  /**
   * Fires once when the payload of this call ends (auto-dismiss,
   * dismiss, dismissAll / scope teardown, or an in-place replacement).
   * Its payload is `{ id, data }` — the message's id and this call's
   * `data`. An `update` continues the same payload, so it does not
   * fire.
   */
  onClose?: MessageCloseHandler;
}

/** What the imperative API returns: the message's id. */
export type MessageId = string;

/**
 * The mounted message's runtime record inside the store. `shown` is
 * live (duration counting), `exiting` is in the exit window (the CSS
 * plays the out-animation, then the store removes it).
 */
export type MessageStatus = 'shown' | 'exiting';

/**
 * How a slot fills with one kind's entries — `'single'` replaces the
 * current entry of that kind in the slot in place (Toast's default),
 * `'stack'` piles them up (Notify's default). See
 * MessageOptions.strategy.
 */
export type MessageStrategy = 'single' | 'stack';

/** One live message as the store holds it. */
export interface MessageEntry extends MessageOptions {
  /** The unique auto id (also the React key). */
  id: MessageId;
  /** The message kind this entry belongs to (routes to its renderer). */
  type: MessageType;
  /** Resolved mode (never undefined in the store). */
  mode: MessageMode;
  /** Resolved palette (never undefined in the store; defaults to mode). */
  palette: MessagePalette;
  /** Resolved surface variant (never undefined in the store). */
  variant: MessageVariant;
  /**
   * Resolved chrome flag (never undefined in the store): the renderer
   * shows the mode icon unless `false` at add/update.
   */
  showIcon: boolean;
  /**
   * Resolved chrome flag (never undefined in the store): the renderer
   * shows the corner close button unless `false` at add/update.
   */
  closeable: boolean;
  /** Resolved duration (never undefined in the store). */
  duration: number;
  /**
   * The visible-payload generation: bumps every time a new payload
   * lands (an update, an in-place replacement, a revive, a fold-pop
   * promotion). The item's content node keys itself by the entry id +
   * this number, so a new payload or a different entry re-mounts the
   * words and plays the zoom entrance — a mount-triggered animation,
   * no phase classes. Starts at 0 (the first mount never zooms — the
   * card's own enter animation plays); a card revealed into an active
   * fold display slot starts at 1, because its reveal is an update.
   */
  contentVersion: number;
  /** The live status driving the animation. */
  status: MessageStatus;
}

/** The `<MessageViewport>` props — a div element, plus the container config. */
export interface MessageViewportProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * The named container this viewport registers. `toast(msg, { scope })`
   * / `notify(..., { scope })` route into the matching scope's store.
   * Defaults to `'root'` — the screen-wide container.
   */
  scope?: string;
  /**
   * How the container anchors itself: `'fixed'` pins it to the viewport
   * (the root screen container), `'absolute'` pins it to its nearest
   * positioned ancestor (a scoped container inside a panel). Defaults to
   * `'fixed'`.
   */
  positioning?: 'fixed' | 'absolute';
}

/** The renderer contract: how a message kind draws its entries in the viewport. */
export interface MessageRendererProps {
  /** The live entry to render. */
  entry: MessageEntry;
  /** The store the entry lives in (pause/resume/dismiss). */
  store: MessageStore;
}

/** What a message kind registers: a component drawing one entry's box. */
export type MessageRenderer = ComponentType<MessageRendererProps>;

/** The add shape: the generic options plus the message kind of the entry. */
export interface MessageAddOptions extends MessageOptions {
  type: MessageType;
}
