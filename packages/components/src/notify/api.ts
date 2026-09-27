import { MessageFactory } from '../cdk/message';
import type { MessageAction, MessageId, MessageOptions, MessagePosition } from '../cdk/message';
import { NotifyItem } from './notify-item';

/** The notify face's default slot: top-right of the container. */
export const NOTIFY_DEFAULT_POSITION: MessagePosition = 'top-right';

/** The notify payload: the titled notification's own shape. */
export interface NotifyPayload {
  /** The heading above the content. */
  title?: MessageOptions['title'];
  /** The body words. */
  content?: MessageOptions['content'];
  /** The palette tone; defaults to info. */
  type?: MessageOptions['type'];
  /** The single action — undo/retry, auto-closes the card on click. */
  action?: MessageAction;
  /** How long (ms) before auto-dismissing; 0 = sticky. */
  duration?: number;
  /** The update key for `Notify.update`. */
  key?: string;
}

/** The notify face's call options: scope routing + position override. */
export interface NotifyCallOptions {
  /** The container to route into; defaults to `'root'` (screen-wide). */
  scope?: string;
  /** Which slot inside the container; defaults to `top-right`. */
  position?: MessagePosition;
}

/**
 * The notify face of the message system: a titled notification card
 * (the antd-notification tier — title + content + single action).
 * Extends the base MessageFactory to inherit the shared scope registry
 * — so `Notify.info(…, { scope })` routes into the SAME container that
 * `Toast.…(…, { scope })` uses, and the two stack side by side in their
 * own slots. Registering its item renderer makes the base
 * MessageViewport able to draw notify entries.
 */
export class NotifyFactory extends MessageFactory {
  constructor() {
    super();
    this.registerRenderer('notify', NotifyItem);
  }

  /** Adds a notify card of the given tone. */
  private add(payload: NotifyPayload, options?: NotifyCallOptions): MessageId {
    const store = this.getOrCreate(options?.scope);
    return store.add({
      variant: 'notify',
      title: payload.title,
      content: payload.content,
      type: payload.type,
      action: payload.action,
      duration: payload.duration,
      key: payload.key,
      position: options?.position ?? NOTIFY_DEFAULT_POSITION,
    });
  }

  info(payload: NotifyPayload, options?: NotifyCallOptions): MessageId {
    return this.add({ ...payload, type: 'info' }, options);
  }

  success(payload: NotifyPayload, options?: NotifyCallOptions): MessageId {
    return this.add({ ...payload, type: 'success' }, options);
  }

  warning(payload: NotifyPayload, options?: NotifyCallOptions): MessageId {
    return this.add({ ...payload, type: 'warning' }, options);
  }

  error(payload: NotifyPayload, options?: NotifyCallOptions): MessageId {
    return this.add({ ...payload, type: 'error' }, options);
  }

  /** Custom content: any ReactNode rendered as-is inside the card body. */
  custom(content: MessageOptions['content'], options?: NotifyCallOptions): MessageId {
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

/** The app-wide notify face singleton. */
export const notifyFactory = new NotifyFactory();
