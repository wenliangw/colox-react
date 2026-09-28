import type {
  MessageId,
  MessagePalette,
  MessagePosition,
  MessageStrategy,
  MessageVariant,
} from '../cdk/message';
import { notifyFactory } from './factory';
import type { NotifyActions, NotifyOptions, NotifyPayload } from './types';

/**
 * The `Notify` namespace: the imperative kind of the titled
 * notification card. A pure-methods namespace — `Notify.info({ title,
 * content })`, callable from ANY code position, routing into the
 * container named by `{ scope }` (default `'root'`). No component
 * lives here: the container is the separate `MessageViewport`.
 */
export const Notify: NotifyActions = {
  info: (payload, options) => notifyFactory.info(payload, options),
  success: (payload, options) => notifyFactory.success(payload, options),
  warning: (payload, options) => notifyFactory.warning(payload, options),
  error: (payload, options) => notifyFactory.error(payload, options),
  custom: (content, options) => notifyFactory.custom(content, options),
  update: (key, patch, options) => notifyFactory.update(key, patch, options),
  dismiss: (key, options) => notifyFactory.dismiss(key, options),
};

export type { NotifyOptions, NotifyPayload };

export type { MessageId as NotifyId };
export type { MessagePosition as NotifyPosition };
export type { MessagePalette as NotifyPalette };
export type { MessageVariant as NotifyVariant };
export type { MessageStrategy as NotifyStrategy };
