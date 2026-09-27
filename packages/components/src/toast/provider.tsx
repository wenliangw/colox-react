import type { ToastProviderProps } from './types';

/**
 * The toast host: must be mounted for toasts to render — the content
 * comes from an imperative call, but the host has to live in the
 * tree. For now it is a pass-through (the store is module-level, so
 * no context is needed); it exists as the composition root the
 * consumer wraps the app with, and as the future home of provider
 * configuration (default duration, offsets).
 */
export function ToastProvider({ children }: ToastProviderProps) {
  return children;
}
