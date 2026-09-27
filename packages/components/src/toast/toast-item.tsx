import clsx from 'clsx';
import { IconError, IconInfo, IconSuccess, IconWarning, IconX } from '@colox/icons';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { toastStore } from './store';
import type { ToastEntry, ToastTone } from './types';

/** The palette tone → its semantic icon. */
const TONE_ICONS: Record<ToastTone, typeof IconInfo> = {
  info: IconInfo,
  success: IconSuccess,
  warning: IconWarning,
  error: IconError,
};

/**
 * One toast card: the opaque surface (bg-default — the Popover
 * recipe; a toast never hovers, so the translucent hover-hint recipe
 * does not apply) holding the tone icon, the title/content, the
 * optional action and the close button. The status class drives the
 * animation: a fresh mount plays the entrance, `exiting` plays the
 * out-animation (the store removes the entry once the window ends).
 * Hovering pauses the auto-dismiss countdown.
 */
export function ToastItem({ entry }: { entry: ToastEntry }) {
  const ToneIcon = TONE_ICONS[entry.type];
  const isTitled = entry.title !== undefined;

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx('colox-toast', `colox-toast--tone-${entry.type}`, {
        'colox-toast--titled': isTitled,
        'colox-toast--exiting': entry.status === 'exiting',
      })}
      onMouseEnter={() => toastStore.pause(entry.id)}
      onMouseLeave={() => toastStore.resume(entry.id)}
    >
      <ToneIcon className="colox-toast__icon" aria-hidden="true" />
      <div className="colox-toast__body">
        {isTitled && <div className="colox-toast__title">{entry.title}</div>}
        {entry.content !== undefined && <div className="colox-toast__content">{entry.content}</div>}
      </div>
      {entry.action && (
        <Button
          variant="subtle"
          className="colox-toast__action"
          onClick={() => {
            entry.action?.onClick();
            // the action is a confirmation — the toast's job is done
            toastStore.dismiss(entry.id);
          }}
        >
          {entry.action.label}
        </Button>
      )}
      <IconButton
        size="4"
        variant="muted"
        className="colox-toast__close"
        aria-label="Close"
        onClick={() => toastStore.dismiss(entry.id)}
      >
        <IconX aria-hidden="true" />
      </IconButton>
    </div>
  );
}
