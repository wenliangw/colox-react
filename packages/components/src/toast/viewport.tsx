import { useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { toastStore } from './store';
import { ToastItem } from './toast-item';
import type { ToastViewportProps } from './types';

/**
 * The stack slot the consumer declares: the `<Toast.Viewport>` is
 * where the toasts mount — its `position` picks one of the six slots
 * (top/bottom × left/center/right) and its className/style shape the
 * slot itself. It subscribes to the module store, so it renders the
 * live queue as cards and owns nothing else — the store drives the
 * whole lifecycle.
 */
export function ToastViewport({ position = 'top-right', className, style }: ToastViewportProps) {
  const entries = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);

  return (
    <div
      className={clsx('colox-toast-viewport', `colox-toast-viewport--${position}`, className)}
      style={style}
    >
      {entries.map((entry) => (
        <ToastItem key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
