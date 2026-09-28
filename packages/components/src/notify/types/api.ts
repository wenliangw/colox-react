import type { ReactNode } from 'react';
import type {
  MessageCloseHandler,
  MessageId,
  MessageOptions,
  MessagePalette,
  MessagePosition,
  MessageStrategy,
  MessageVariant,
} from '../../cdk/message';

/**
 * The notify payload: the titled card's own shape — what goes ON the
 * card (a heading, the body words), in contrast to the lightweight
 * Toast kind whose content is a bare ReactNode. The mode/palette/variant
 * axes are shared with every message, and `key` targets `Notify.update`.
 */
export interface NotifyPayload {
  /** The heading above the content. */
  title?: MessageOptions['title'];
  /** The body words. */
  content?: MessageOptions['content'];
  /** The semantic mode; drives the icon glyph and defaults the palette. */
  mode?: MessageOptions['mode'];
  /** The color family; defaults to the mode. */
  palette?: MessagePalette;
  /** The surface strength; defaults to 'plain'. */
  variant?: MessageVariant;
  /** How long (ms) before auto-dismissing; 0 = sticky. */
  duration?: number;
  /** The update key for `Notify.update`. */
  key?: string;
}

/**
 * The notify kind's call options: scope routing + strategy override +
 * the renderer chrome and lifecycle axes shared with every message.
 */
export interface NotifyOptions {
  /** The container to route into; defaults to `'root'` (screen-wide). */
  scope?: string;
  /** Which slot inside the container; defaults to `top-right`. */
  position?: MessagePosition;
  /**
   * How the slot fills; defaults to `'stack'` (the viewport decks a
   * burst). Pass `'single'` to replace in place instead.
   */
  strategy?: MessageStrategy;
  /**
   * Whether the mode icon shows; defaults to `true`. `false` gives a
   * text-only card. A renderer-owned chrome flag (same axis as Toast).
   */
  showIcon?: boolean;
  /**
   * Whether the corner close button shows; defaults to `true`. `false`
   * removes it — duration and `Notify.dismiss` still close the card.
   * A renderer-owned chrome flag (same axis as Toast).
   */
  closeable?: boolean;
  /**
   * An opaque pass-through value: handed back untouched inside
   * `onClose`'s payload (`{ id, data }`) — the caller's own context.
   */
  data?: unknown;
  /**
   * Fires once when this card's payload ends — dismissed (corner ✕ /
   * `Notify.dismiss`), auto-expired, cleared, or replaced in place.
   * `Notify.update` continues the same payload and does not fire it.
   * The payload is `{ id, data }`.
   */
  onClose?: MessageCloseHandler;
}

/** The callable method surface of the Notify kind. */
export interface NotifyActions {
  info(payload: NotifyPayload, options?: NotifyOptions): MessageId;
  success(payload: NotifyPayload, options?: NotifyOptions): MessageId;
  warning(payload: NotifyPayload, options?: NotifyOptions): MessageId;
  error(payload: NotifyPayload, options?: NotifyOptions): MessageId;
  custom(content: ReactNode, options?: NotifyOptions): MessageId;
  update(key: string, patch: NotifyPayload, options?: { scope?: string }): void;
  dismiss(key?: string, options?: { scope?: string }): void;
}
