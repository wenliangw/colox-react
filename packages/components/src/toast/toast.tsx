import { ToastProvider } from './provider';
import { ToastViewport } from './viewport';

import './styles/index.scss';

/**
 * The toast surface: `<Toast.Provider>` wraps the app (the host that
 * must be in the tree) and `<Toast.Viewport>` declares the stack slot
 * the toasts mount in. The imperative `toast()` api (see `api.ts`)
 * feeds the module store the Viewport renders — the content comes
 * from calls anywhere, the host from the tree.
 */
export const Toast = Object.assign(ToastProvider, {
  Provider: ToastProvider,
  Viewport: ToastViewport,
});

export type { ToastPayload } from './api';
export type {
  ToastAction,
  ToastEntry,
  ToastId,
  ToastOptions,
  ToastPosition,
  ToastProviderProps,
  ToastStatus,
  ToastTone,
  ToastViewportProps,
} from './types';
