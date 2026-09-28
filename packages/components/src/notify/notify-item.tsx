import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { IconButton } from '../icon-button';
import { MessageBox, MODE_ICONS } from '../cdk/message';
import type { MessageRendererProps } from '../cdk/message';

import './styles/notify.scss';

/**
 * The notify kind's item: the card tier — a titled notification (the
 * antd-notification shape). An opaque bg-default card (the Popover
 * surface recipe) holding the mode icon, the title + content and the
 * close button. No action — a notification reports and closes, the
 * decision-tier interactions are a dialog's job (undo/retry go through
 * custom interactive content via `Notify.custom`). The renderer-owned
 * chrome follows the entry: `showIcon: false` drops the icon,
 * `closeable: false` drops the corner ✕. The content node keys itself
 * by the entry's `contentVersion`, so a freshly landed payload re-mounts
 * just that node and replays the zoom entrance (a visible update lands
 * instantly with the zoom). The shared box owns the role announcement,
 * the exiting flag and the hover pause/resume of the countdown.
 */
export function NotifyItem({ entry, store }: MessageRendererProps) {
  const ModeIcon = MODE_ICONS[entry.mode];
  const hasTitle = entry.title !== undefined;

  return (
    <MessageBox
      entry={entry}
      store={store}
      className={clsx('colox-notify', `colox-notify--mode-${entry.mode}`, {
        'colox-notify--titled': hasTitle,
      })}
    >
      {entry.showIcon && (
        <ModeIcon className="colox-notify__icon colox-message__icon" aria-hidden="true" />
      )}
      <div
        key={entry.contentVersion}
        className={clsx(
          'colox-notify__body',
          entry.contentVersion > 0 && 'colox-notify__body--zoom',
        )}
      >
        {hasTitle && <div className="colox-notify__title">{entry.title}</div>}
        {entry.content !== undefined && (
          <div className="colox-notify__content">{entry.content}</div>
        )}
      </div>
      {entry.closeable && (
        <IconButton
          size="4"
          variant="muted"
          className="colox-notify__close"
          aria-label="Close"
          onClick={() => store.dismiss(entry.id)}
        >
          <IconX aria-hidden="true" />
        </IconButton>
      )}
    </MessageBox>
  );
}
