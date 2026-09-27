import type { ReactNode } from 'react';
import type { MessageId, MessagePosition } from '../cdk/message';
import { notifyFactory } from './api';
import type { NotifyCallOptions, NotifyPayload } from './api';

/** The callable method surface of the Notify face. */
export interface NotifyNamespace {
  info(payload: NotifyPayload, options?: NotifyCallOptions): MessageId;
  success(payload: NotifyPayload, options?: NotifyCallOptions): MessageId;
  warning(payload: NotifyPayload, options?: NotifyCallOptions): MessageId;
  error(payload: NotifyPayload, options?: NotifyCallOptions): MessageId;
  custom(content: ReactNode, options?: NotifyCallOptions): MessageId;
  update(key: string, patch: NotifyPayload, options?: { scope?: string }): void;
  dismiss(key?: string, options?: { scope?: string }): void;
}

/**
 * The `Notify` namespace: the imperative face of the titled
 * notification card. A pure-methods namespace — `Notify.info({ title,
 * content })`, callable from ANY code position, routing into the
 * container named by `{ scope }` (default `'root'`). No component
 * lives here: the container is the separate `MessageViewport`.
 */
export const Notify: NotifyNamespace = {
  info: (payload, options) => notifyFactory.info(payload, options),
  success: (payload, options) => notifyFactory.success(payload, options),
  warning: (payload, options) => notifyFactory.warning(payload, options),
  error: (payload, options) => notifyFactory.error(payload, options),
  custom: (content, options) => notifyFactory.custom(content, options),
  update: (key, patch, options) => notifyFactory.update(key, patch, options),
  dismiss: (key, options) => notifyFactory.dismiss(key, options),
};

export type { NotifyCallOptions, NotifyPayload };

export type { MessageId as NotifyId };
export type { MessagePosition as NotifyPosition };
