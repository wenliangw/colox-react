import type { ReactNode } from 'react';
import { MessageFactory } from '../cdk/message';
import type { MessageId } from '../cdk/message';
import { NotifyItem } from './notify-item';
import {
  NOTIFY_DEFAULT_POSITION,
  NOTIFY_DEFAULT_STRATEGY,
  NOTIFY_DEFAULT_VARIANT,
} from './constants/defaults';
import type { NotifyOptions, NotifyPayload } from './types';

/**
 * The notify kind of the message system: a titled notification card
 * (the antd-notification tier — title + content). Extends the base
 * MessageFactory to inherit the shared scope registry — so
 * `Notify.info(…, { scope })` routes into the SAME container that
 * `Toast.…(…, { scope })` uses, and the two stack side by side in their
 * own slots. Registering its item renderer makes the base
 * MessageViewport able to draw notify entries.
 */
export class NotifyFactory extends MessageFactory {
  constructor() {
    super();
    this.registerRenderer('notify', NotifyItem);
  }

  /** Adds a notify card of the given mode. */
  private add(payload: NotifyPayload, options?: NotifyOptions): MessageId {
    const store = this.getOrCreate(options?.scope);
    return store.add({
      type: 'notify',
      title: payload.title,
      content: payload.content,
      mode: payload.mode,
      palette: payload.palette,
      variant: payload.variant ?? NOTIFY_DEFAULT_VARIANT,
      strategy: options?.strategy ?? NOTIFY_DEFAULT_STRATEGY,
      duration: payload.duration,
      key: payload.key,
      position: options?.position ?? NOTIFY_DEFAULT_POSITION,
      showIcon: options?.showIcon,
      closeable: options?.closeable,
      data: options?.data,
      onClose: options?.onClose,
    });
  }

  info(payload: NotifyPayload, options?: NotifyOptions): MessageId {
    return this.add({ ...payload, mode: 'info' }, options);
  }

  success(payload: NotifyPayload, options?: NotifyOptions): MessageId {
    return this.add({ ...payload, mode: 'success' }, options);
  }

  warning(payload: NotifyPayload, options?: NotifyOptions): MessageId {
    return this.add({ ...payload, mode: 'warning' }, options);
  }

  error(payload: NotifyPayload, options?: NotifyOptions): MessageId {
    return this.add({ ...payload, mode: 'error' }, options);
  }

  /** Custom content: any ReactNode rendered as-is inside the card body. */
  custom(content: ReactNode, options?: NotifyOptions): MessageId {
    return this.add({ content }, options);
  }

  /** Updates a live notify card in place (by key or id) inside a scope. */
  update(key: string, patch: NotifyPayload, options?: { scope?: string }): void {
    this.getOrCreate(options?.scope).update(key, patch);
  }

  /**
   * Dismisses a notify card (by key or id) inside a scope — or
   * everything in that scope when no key is given. Defaults to root.
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

/** The app-wide notify kind singleton. */
export const notifyFactory = new NotifyFactory();
