import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { messageFactory } from './factory';
import { POSITIONS } from './constants/viewport';
import type { MessageEntry, MessagePosition, MessageViewportProps } from './types';
import type { MessageStore } from './stores/store';

import './styles/index.scss';

/** How often the countdown capsule refreshes its seconds display. */
const COUNTDOWN_TICK = 250;

/**
 * One position slot — the fold renders here. A slot under the notify
 * fold (the store owns the fold bookkeeping — see reconcileFold)
 * shows the NEWEST card plus one count capsule reading the tally;
 * every card past the visible one stops rendering — the storm never
 * paints a pile. The capsule's ✕ clears the whole slot through
 * `clearSlot` (the invisible backlog vanishes instantly, the visible
 * card walks the exit animation as the slot's last card).
 *
 * While folded, the store freezes every card's countdown — a burst
 * never deletes itself behind the user's back. Closing the visible
 * card POPS the stack: the popped card leaves instantly (no exit
 * window) and the next-newest card lands IN PLACE — the display slot
 * keeps its frame, the incoming words re-mount with the zoom entrance
 * (the store bumps their contentVersion; see popInstant). Only the
 * LAST card of the fold walks the exit animation, and then the slot
 * empties. When the stack reaches its last survivor, its timer resumes
 * and the capsule becomes a countdown capsule on its seconds.
 */
function MessageSlot({
  position,
  entries,
  store,
}: {
  position: MessagePosition;
  entries: readonly MessageEntry[];
  store: MessageStore;
}) {
  const folded = store.isFolded(position);
  const notify = useMemo(() => entries.filter((entry) => entry.type === 'notify'), [entries]);
  const notifyShown = useMemo(() => notify.filter((entry) => entry.status === 'shown'), [notify]);
  const exitingNotify = useMemo(
    () => notify.filter((entry) => entry.status === 'exiting'),
    [notify],
  );

  // The fold renders while the position holds any notify entry — the
  // last card's exit window still renders under the fold. The DISPLAY
  // is the newest shown card; once the last card starts its exit there
  // is no shown card left, so the exiting card itself stays displayed.
  const showFold = folded && notify.length > 0;
  const displayed = showFold
    ? (notifyShown[notifyShown.length - 1] ?? exitingNotify[exitingNotify.length - 1] ?? null)
    : null;

  // The countdown capsule's live seconds: the last survivor's ms left,
  // refreshed at COUNTDOWN_TICK granularity.
  const survivorId = folded && notifyShown.length === 1 ? notifyShown[0].id : null;
  const [leftMs, setLeftMs] = useState<number | null>(null);
  useEffect(() => {
    if (survivorId === null) {
      setLeftMs(null);
      return;
    }
    const tick = () => setLeftMs(store.getRemaining(survivorId));
    tick();
    const timer = setInterval(tick, COUNTDOWN_TICK);
    return () => clearInterval(timer);
  }, [survivorId, store]);

  return (
    <div
      className={clsx('colox-message-viewport__slot', `colox-message-viewport__slot--${position}`)}
    >
      {showFold && displayed !== null ? (
        <>
          {/* The DISPLAY slot keeps a stable key: the card frame stays
              put across pops (an in-place update with the incoming
              words zooming in) and across the last card's exit (the
              animation plays on the live node) — the fold never
              remounts the visible card. */}
          <RendererSlot key="fold-display" entry={displayed} store={store} />
          {notifyShown.length > 0 && (
            <FoldCapsule
              count={notifyShown.length}
              seconds={survivorId !== null && leftMs !== null ? Math.ceil(leftMs / 1000) : null}
              onClear={() => store.clearSlot(position)}
            />
          )}
          {/* the backlog stops rendering; toast entries and the card
              already leaving (the last card's exit) render normally */}
          {entries
            .filter(
              (entry) =>
                entry.id !== displayed.id &&
                (entry.type !== 'notify' || entry.status === 'exiting'),
            )
            .map((entry) => (
              <RendererSlot key={entry.id} entry={entry} store={store} />
            ))}
        </>
      ) : (
        entries.map((entry) => <RendererSlot key={entry.id} entry={entry} store={store} />)
      )}
    </div>
  );
}

/** One entry rendered through the renderer registered for its kind. */
function RendererSlot({ entry, store }: { entry: MessageEntry; store: MessageStore }) {
  const Renderer = messageFactory.getRenderer(entry.type);
  if (Renderer === undefined) {
    return null;
  }
  return <Renderer entry={entry} store={store} />;
}

/**
 * The notify count capsule: reads the folded stack's tally and offers
 * one ✕ that dismisses everything in the slot. When the stack is down
 * to its last card, it switches to a countdown capsule (`--countdown`)
 * reading that card's remaining seconds — the same pill look, only the
 * wording changes.
 */
function FoldCapsule({
  count,
  seconds,
  onClear,
}: {
  count: number;
  /** Non-null when the capsule counts down the last card's timer. */
  seconds: number | null;
  onClear: () => void;
}) {
  const countdown = seconds !== null && seconds >= 0;
  return (
    <div
      role="status"
      className={clsx('colox-message-count', countdown && 'colox-message-count--countdown')}
      aria-label={
        countdown
          ? `${seconds} seconds before auto-dismiss`
          : count === 1
            ? '1 notification'
            : `${count} notifications`
      }
    >
      <span className="colox-message-count__label">{countdown ? `${seconds}s` : count}</span>
      <button
        type="button"
        className="colox-message-count__clear"
        aria-label="Dismiss all notifications"
        onClick={onClear}
      >
        <IconX aria-hidden="true" />
      </button>
    </div>
  );
}

/**
 * The message container — the one component a consumer actually mounts.
 *
 * A `<MessageViewport scope="…">` registers a named container into the
 * shared MessageFactory scope table, subscribes to that scope's store,
 * groups its live entries by position, and renders each entry via the
 * renderer registered for its type (toast → the toast kind's item,
 * notify → the notify kind's item). One scope container therefore holds
 * toast and notify entries side by side, each in its own slot.
 *
 * A slot's notify entries fold once they pass FOLD_THRESHOLD (the store
 * owns the fold — see MessageStore.reconcileFold) — the viewport's
 * pollution valve for notification storms; folded closes pop in place,
 * only the last card exits.
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
          <MessageSlot key={position} position={position} entries={slotEntries} store={store} />
        );
      })}
    </div>
  );
}
