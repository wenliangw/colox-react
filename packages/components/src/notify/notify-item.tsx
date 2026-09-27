import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { Button } from '../button';
import { IconButton } from '../icon-button';
import { MessageItemShell, TONE_ICONS } from '../cdk/message';
import type { MessageRendererProps } from '../cdk/message';

import './styles/notify.scss';

/**
 * The notify face's item: the card tier — a titled notification (the
 * antd-notification shape). An opaque bg-default card (the Popover
 * surface recipe) holding the tone icon, the title + content, the
 * single action (subtle Button, auto-closes the card on click) and the
 * close button. The shared shell owns the role announcement, the
 * exiting flag and the hover pause/resume of the countdown.
 */
export function NotifyItem({ entry, store }: MessageRendererProps) {
  const ToneIcon = TONE_ICONS[entry.type];
  const hasTitle = entry.title !== undefined;

  return (
    <MessageItemShell
      entry={entry}
      store={store}
      className={clsx('colox-notify', `colox-notify--tone-${entry.type}`, {
        'colox-notify--titled': hasTitle,
      })}
    >
      <ToneIcon className="colox-notify__icon" aria-hidden="true" />
      <div className="colox-notify__body">
        {hasTitle && <div className="colox-notify__title">{entry.title}</div>}
        {entry.content !== undefined && (
          <div className="colox-notify__content">{entry.content}</div>
        )}
      </div>
      {entry.action && (
        <Button
          variant="subtle"
          className="colox-notify__action"
          onClick={() => {
            entry.action?.onClick();
            // the action is a confirmation — the notify's job is done
            store.dismiss(entry.id);
          }}
        >
          {entry.action.label}
        </Button>
      )}
      <IconButton
        size="4"
        variant="muted"
        className="colox-notify__close"
        aria-label="Close"
        onClick={() => store.dismiss(entry.id)}
      >
        <IconX aria-hidden="true" />
      </IconButton>
    </MessageItemShell>
  );
}
