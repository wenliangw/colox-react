import type { ReactNode } from 'react';
import { MessageFactory } from '../cdk/message';
import type { MessageId, MessageOptions, MessagePosition } from '../cdk/message';
import { ToastItem } from './toast-item';

/** The toast face's default slot: centered near the top of the container. */
export const TOAST_DEFAULT_POSITION: MessagePosition = 'top-center';

/** The toast face's call options: scope routing + position override. */
export interface ToastCallOptions {
  /** The container to route into; defaults to `'root'` (screen-wide). */
  scope?: string;
  /** Which slot inside the container; defaults to `top-center`. */
  position?: MessagePosition;
  /** How long (ms) before auto-dismissing; 0 = sticky. */
  duration?: number;
  /** The update key for `Toast.update`. */
  key?: string;
}

/**
 * The toast face of the message system: a lightweight transient hint
 * (the antd-message tier — single line, no title, no action). Extends
 * the base MessageFactory to inherit the shared scope registry — so
 * `Toast.info(msg, { scope })` routes into the SAME container that
 * `Notify.…(…, { scope })` uses. Registering its item renderer makes
 * the base MessageViewport able to draw toast entries.
 */
export class ToastFactory extends MessageFactory {
  constructor() {
    super();
    this.registerRenderer('toast', ToastItem);
  }

  /** Adds a toast of the given tone. */
  private add(
    content: ReactNode,
    type: MessageOptions['type'],
    options?: ToastCallOptions,
  ): MessageId {
    const store = this.getOrCreate(options?.scope);
    return store.add({
      variant: 'toast',
      content,
      type,
      position: options?.position ?? TOAST_DEFAULT_POSITION,
      duration: options?.duration,
      key: options?.key,
    });
  }

  info(content: ReactNode, options?: ToastCallOptions): MessageId {
    return this.add(content, 'info', options);
  }

  success(content: ReactNode, options?: ToastCallOptions): MessageId {
    return this.add(content, 'success', options);
  }

  warning(content: ReactNode, options?: ToastCallOptions): MessageId {
    return this.add(content, 'warning', options);
  }

  error(content: ReactNode, options?: ToastCallOptions): MessageId {
    return this.add(content, 'error', options);
  }

  /** Custom content: any ReactNode rendered as-is (a progress bar, a live status). */
  custom(content: ReactNode, options?: ToastCallOptions): MessageId {
    return this.add(content, undefined, options);
  }

  /** Updates a live toast in place (by key or id) inside a scope. */
  update(key: string, patch: MessageOptions, options?: { scope?: string }): void {
    this.getOrCreate(options?.scope).update(key, patch);
  }

  /**
   * Dismisses a toast (by key or id) inside a scope — or everything in
   * that scope when no key is given. Defaults to the root scope.
   */
  dismiss(key?: string, options?: { scope?: string }): void {
    const store = this.getOrCreate(options?.scope);
    if (key === undefined) {
      store.dismissAll();
    } else {
      store.dismiss(key);
    }
  }
}

/** The app-wide toast face singleton. */
export const toastFactory = new ToastFactory();
