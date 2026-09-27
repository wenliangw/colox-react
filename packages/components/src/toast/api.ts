import type { ReactNode } from 'react';
import { toastStore } from './store';
import type { ToastId, ToastOptions } from './types';

/**
 * The toast payload: either the bare lightweight content (the
 * single-line tier) or the full options object (the titled tier or any
 * option at all). `toast('saved')` and
 * `toast({ title: 'Saved', content: '…' })` are the same call shape —
 * one component, two payload tiers.
 */
export type ToastPayload = ReactNode | ToastOptions;

const isOptions = (payload: ToastPayload): payload is ToastOptions =>
  typeof payload === 'object' && payload !== null && !('$$typeof' in payload);

/**
 * The imperative toast API: callable from any code position (a module
 * store, no provider tree access needed). The `<Toast.Provider>` must
 * be mounted for the toasts to render — the host has to be in the
 * tree even though the content comes from a call.
 *
 * `toast('Saved')` — lightweight single-line.
 * `toast({ title: 'Saved', content: 'The file is on disk.' })` —
 * titled notification.
 *
 * The return value is the toast's id — hand it to `toast.dismiss(id)`.
 */
export function toast(payload: ToastPayload): ToastId {
  const options: ToastOptions = isOptions(payload) ? payload : { content: payload };
  return toastStore.add(options);
}

toast.info = (payload: ToastPayload): ToastId => toast({ ...asOptions(payload), type: 'info' });
toast.success = (payload: ToastPayload): ToastId =>
  toast({ ...asOptions(payload), type: 'success' });
toast.warning = (payload: ToastPayload): ToastId =>
  toast({ ...asOptions(payload), type: 'warning' });
toast.error = (payload: ToastPayload): ToastId => toast({ ...asOptions(payload), type: 'error' });

/**
 * Updates a live toast by its update key (or id). Same-key update is
 * how a toast's content evolves in place — progress, retries.
 */
toast.update = (key: string, patch: ToastOptions): void => {
  toastStore.update(key, patch);
};

/** Dismisses one toast (by id or update key); no argument dismisses all. */
toast.dismiss = (key?: string): void => {
  if (key === undefined) {
    toastStore.dismissAll();
    return;
  }
  toastStore.dismiss(key);
};

function asOptions(payload: ToastPayload): ToastOptions {
  return isOptions(payload) ? payload : { content: payload };
}

export type Toast = typeof toast;
