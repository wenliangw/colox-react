import { useEffect, useMemo, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { messageFactory } from './factory';
import type { MessagePosition, MessageViewportProps } from './types';

import './styles/index.scss';

/** The six slots a scope container can mount messages in. */
const POSITIONS: readonly MessagePosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

/**
 * The message container — the one component a consumer actually mounts.
 *
 * A `<MessageViewport scope="…">` registers a named container into the
 * shared MessageFactory scope table, subscribes to that scope's store,
 * groups its live entries by position, and renders each entry via the
 * renderer registered for its variant (toast → the toast face's item,
 * notify → the notify face's item). One scope container therefore holds
 * toast and notify entries side by side, each in its own slot.
 *
 * `scope` defaults to `'root'` — the screen-wide container that the
 * no-scope `toast()`/`notify()` calls route into. The viewport's own
 * box is the container: pass a className to size it, and use
 * `positioning` to anchor it to the screen (`fixed`) or to a parent
 * container (`absolute`).
 */
export function MessageViewport({
  scope = 'root',
  positioning = 'fixed',
  className,
  style,
  ...rest
}: MessageViewportProps) {
  const store = useMemo(() => messageFactory.getOrCreate(scope), [scope]);
  const entries = useSyncExternalStore(store.subscribe, store.getSnapshot);

  // A scope container lives as long as its viewport does: unmounting
  // the viewport clears the scope (its messages vanish with it).
  useEffect(() => {
    return () => {
      messageFactory.unregister(scope);
    };
  }, [scope]);

  return (
    <div
      className={clsx(
        'colox-message-viewport',
        `colox-message-viewport--${positioning}`,
        className,
      )}
      style={style}
      data-scope={scope}
      {...rest}
    >
      {POSITIONS.map((position) => {
        const slotEntries = entries.filter((entry) => entry.position === position);
        if (slotEntries.length === 0) {
          return null;
        }
        return (
          <div
            key={position}
            className={clsx(
              'colox-message-viewport__slot',
              `colox-message-viewport__slot--${position}`,
            )}
          >
            {slotEntries.map((entry) => {
              const Renderer = messageFactory.getRenderer(entry.variant);
              if (Renderer === undefined) {
                return null;
              }
              return <Renderer key={entry.id} entry={entry} store={store} />;
            })}
          </div>
        );
      })}
    </div>
  );
}
