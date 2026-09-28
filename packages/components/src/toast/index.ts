import type {
  MessageId,
  MessagePalette,
  MessagePosition,
  MessageStrategy,
  MessageVariant,
} from '../cdk/message';
import { toastFactory } from './factory';
import type { ToastActions, ToastOptions } from './types';

/**
 * The `Toast` namespace: the imperative face of the lightweight hint.
 * A pure-methods namespace — `Toast.info('已保存')`, callable from ANY
 * code position (a handler, a fetch callback, a store action), routing
 * into the container named by `{ scope }` (default `'root'`, the
 * screen-wide viewport). No component lives here: the container is the
 * separate `MessageViewport`.
 */
export const Toast: ToastActions = {
  info: (content, options) => toastFactory.info(content, options),
  success: (content, options) => toastFactory.success(content, options),
  warning: (content, options) => toastFactory.warning(content, options),
  error: (content, options) => toastFactory.error(content, options),
  custom: (content, options) => toastFactory.custom(content, options),
  update: (key, patch, options) => toastFactory.update(key, patch, options),
  dismiss: (key, options) => toastFactory.dismiss(key, options),
};

export type { ToastOptions };

export type { MessageId as ToastId };
export type { MessagePosition as ToastPosition };
export type { MessagePalette as ToastPalette };
export type { MessageVariant as ToastVariant };
export type { MessageStrategy as ToastStrategy };
