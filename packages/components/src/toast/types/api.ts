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

/** The toast kind's call options: scope routing + message axes. */
export interface ToastOptions {
  /** The container to route into; defaults to `'root'` (screen-wide). */
  scope?: string;
  /** Which slot inside the container; defaults to `top-center`. */
  position?: MessagePosition;
  /**
   * The color family; defaults to the mode (Toast.info → info, etc.).
   * Override to gray/primary for a neutral or brand toast.
   */
  palette?: MessagePalette;
  /**
   * The surface strength; defaults to `'plain'`. See MessageVariant.
   */
  variant?: MessageVariant;
  /**
   * How the slot fills; defaults to `'single'` (replace in place).
   * Pass `'stack'` to pile toasts up instead.
   */
  strategy?: MessageStrategy;
  /**
   * Whether the mode icon shows; defaults to `true`. `false` gives a
   * text-only pill.
   */
  showIcon?: boolean;
  /**
   * Whether the corner close button shows; defaults to `true`.
   * `false` removes it — the duration and `Toast.dismiss` still close
   * the toast.
   */
  closeable?: boolean;
  /** How long (ms) before auto-dismissing; 0 = sticky. */
  duration?: number;
  /** The update key for `Toast.update`. */
  key?: string;
  /**
   * An opaque pass-through value: handed back untouched inside
   * `onClose`'s payload (`{ id, data }`) — the caller's own context (a
   * request id, a record…).
   */
  data?: unknown;
  /**
   * Fires once when this toast's payload ends — dismissed (corner ✕ /
   * `Toast.dismiss`), auto-expired, cleared, or replaced in place by a
   * newer toast. `Toast.update` continues the same payload and does
   * not fire it. The payload is `{ id, data }`.
   */
  onClose?: MessageCloseHandler;
}

/** The callable method surface of the Toast kind. */
export interface ToastActions {
  info(content: ReactNode, options?: ToastOptions): MessageId;
  success(content: ReactNode, options?: ToastOptions): MessageId;
  warning(content: ReactNode, options?: ToastOptions): MessageId;
  error(content: ReactNode, options?: ToastOptions): MessageId;
  custom(content: ReactNode, options?: ToastOptions): MessageId;
  update(key: string, patch: MessageOptions, options?: { scope?: string }): void;
  dismiss(key?: string, options?: { scope?: string }): void;
}
