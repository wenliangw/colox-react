import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { IconButton } from '../icon-button';
import { MessageBox, MODE_ICONS } from '../cdk/message';
import type { MessageRendererProps } from '../cdk/message';

import './styles/toast.scss';

/**
 * The toast kind's item: the lightweight single-line hint — the
 * antd-message tier. A slim opaque pill (bg-default — the Popover
 * surface; a toast never hovers, so the translucent hover-hint recipe
 * does not apply) holding the mode icon, the body words and the close
 * button. No title and no action — those are the notify tier's job (a
 * 3s transient hint solicits no decision; custom interactive content
 * goes through `Toast.custom` / the content node, which is any
 * ReactNode). The renderer-owned chrome follows the entry:
 * `showIcon: false` drops the icon, `closeable: false` drops the
 * corner ✕. The content node keys
 * itself by the entry's `contentVersion`, so a freshly landed payload
 * re-mounts just that node and replays the zoom entrance (a visible
 * update lands instantly with the zoom — see animation.scss).
 *
 * The shared box owns the role announcement, the exiting flag and
 * the hover pause/resume of the auto-dismiss countdown.
 */
export function ToastItem({ entry, store }: MessageRendererProps) {
  const ModeIcon = MODE_ICONS[entry.mode];

  return (
    <MessageBox
      entry={entry}
      store={store}
      className={clsx('colox-toast', `colox-toast--mode-${entry.mode}`)}
    >
      {entry.showIcon && (
        <ModeIcon className="colox-toast__icon colox-message__icon" aria-hidden="true" />
      )}
      <div
        key={entry.contentVersion}
        className={clsx(
          'colox-toast__content',
          entry.contentVersion > 0 && 'colox-toast__content--zoom',
        )}
      >
        {entry.content}
      </div>
      {entry.closeable && (
        <IconButton
          size="4"
          variant="muted"
          className="colox-toast__close"
          aria-label="Close"
          onClick={() => store.dismiss(entry.id)}
        >
          <IconX aria-hidden="true" />
        </IconButton>
      )}
    </MessageBox>
  );
}
