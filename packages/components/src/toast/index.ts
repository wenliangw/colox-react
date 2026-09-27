import type { ReactNode } from 'react';
import type { MessageId, MessageOptions, MessagePosition } from '../cdk/message';
import { toastFactory } from './api';
import type { ToastCallOptions } from './api';

/** The callable method surface of the Toast face. */
export interface ToastNamespace {
  info(content: ReactNode, options?: ToastCallOptions): MessageId;
  success(content: ReactNode, options?: ToastCallOptions): MessageId;
  warning(content: ReactNode, options?: ToastCallOptions): MessageId;
  error(content: ReactNode, options?: ToastCallOptions): MessageId;
  custom(content: ReactNode, options?: ToastCallOptions): MessageId;
  update(key: string, patch: MessageOptions, options?: { scope?: string }): void;
  dismiss(key?: string, options?: { scope?: string }): void;
}

/**
 * The `Toast` namespace: the imperative face of the lightweight hint.
 * A pure-methods namespace — `Toast.info('已保存')`, callable from ANY
 * code position (a handler, a fetch callback, a store action), routing
 * into the container named by `{ scope }` (default `'root'`, the
 * screen-wide viewport). No component lives here: the container is the
 * separate `MessageViewport`.
 */
export const Toast: ToastNamespace = {
  info: (content, options) => toastFactory.info(content, options),
  success: (content, options) => toastFactory.success(content, options),
  warning: (content, options) => toastFactory.warning(content, options),
  error: (content, options) => toastFactory.error(content, options),
  custom: (content, options) => toastFactory.custom(content, options),
  update: (key, patch, options) => toastFactory.update(key, patch, options),
  dismiss: (key, options) => toastFactory.dismiss(key, options),
};

export type { ToastCallOptions };

export type { MessageId as ToastId };
export type { MessageOptions as ToastOptions };
export type { MessagePosition as ToastPosition };
