import type { ReactNode } from 'react';
import { MessageFactory } from '../cdk/message';
import type { MessageId, MessageOptions } from '../cdk/message';
import { ToastItem } from './toast-item';
import {
  TOAST_DEFAULT_POSITION,
  TOAST_DEFAULT_STRATEGY,
  TOAST_DEFAULT_VARIANT,
} from './constants/defaults';
import type { ToastOptions } from './types';

/**
 * The toast face of the message system: a lightweight transient hint
 * (the antd-message tier — single line, no title). Extends the base
 * MessageFactory to inherit the shared scope registry — so
 * `Toast.info(msg, { scope })` routes into the SAME container that
 * `Notify.…(…, { scope })` uses. Registering its item renderer makes
 * the base MessageViewport able to draw toast entries.
 */
export class ToastFactory extends MessageFactory {
  constructor() {
    super();
    this.registerRenderer('toast', ToastItem);
  }

  /** Adds a toast of the given mode. */
  private add(content: ReactNode, mode: MessageOptions['mode'], options?: ToastOptions): MessageId {
    const store = this.getOrCreate(options?.scope);
    return store.add({
      type: 'toast',
      content,
      mode,
      position: options?.position ?? TOAST_DEFAULT_POSITION,
      palette: options?.palette,
      variant: options?.variant ?? TOAST_DEFAULT_VARIANT,
      strategy: options?.strategy ?? TOAST_DEFAULT_STRATEGY,
      showIcon: options?.showIcon,
      closeable: options?.closeable,
      duration: options?.duration,
      key: options?.key,
      data: options?.data,
      onClose: options?.onClose,
    });
  }

  info(content: ReactNode, options?: ToastOptions): MessageId {
    return this.add(content, 'info', options);
  }

  success(content: ReactNode, options?: ToastOptions): MessageId {
    return this.add(content, 'success', options);
  }

  warning(content: ReactNode, options?: ToastOptions): MessageId {
    return this.add(content, 'warning', options);
  }

  error(content: ReactNode, options?: ToastOptions): MessageId {
    return this.add(content, 'error', options);
  }

  /** Custom content: any ReactNode rendered as-is (a progress bar, a live status). */
  custom(content: ReactNode, options?: ToastOptions): MessageId {
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
