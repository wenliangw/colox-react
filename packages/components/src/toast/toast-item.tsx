import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { IconButton } from '../icon-button';
import { MessageItemShell, TONE_ICONS } from '../cdk/message';
import type { MessageRendererProps } from '../cdk/message';

import './styles/toast.scss';

/**
 * The toast face's item: the lightweight single-line hint — the
 * antd-message tier. A slim opaque pill (bg-default — the Popover
 * surface; a toast never hovers, so the translucent hover-hint recipe
 * does not apply) holding the tone icon, the body words and a close
 * button. No title, no action — those are the notify tier's job.
 *
 * The shared shell owns the role announcement, the exiting flag and
 * the hover pause/resume of the auto-dismiss countdown.
 */
export function ToastItem({ entry, store }: MessageRendererProps) {
  const ToneIcon = TONE_ICONS[entry.type];

  return (
    <MessageItemShell
      entry={entry}
      store={store}
      className={clsx('colox-toast', `colox-toast--tone-${entry.type}`)}
    >
      <ToneIcon className="colox-toast__icon" aria-hidden="true" />
      <div className="colox-toast__content">{entry.content}</div>
      <IconButton
        size="4"
        variant="muted"
        className="colox-toast__close"
        aria-label="Close"
        onClick={() => store.dismiss(entry.id)}
      >
        <IconX aria-hidden="true" />
      </IconButton>
    </MessageItemShell>
  );
}
