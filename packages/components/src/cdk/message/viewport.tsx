import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { messageFactory } from './factory';
import { FOLD_THRESHOLD, POSITIONS } from './constants/viewport';
import type { MessageEntry, MessageId, MessagePosition, MessageViewportProps } from './types';
import type { MessageStore } from './stores/store';

import './styles/index.scss';

/** How often the countdown capsule refreshes its seconds display. */
const COUNTDOWN_TICK = 250;

/**
 * One position slot — the fold valve lives here. A slot that shows
 * MORE than FOLD_THRESHOLD notify cards collapses into the newest
 * card plus one count capsule reading the total; every card past the
 * visible one folds into the capsule's number (they stop rendering —
 * the storm no longer paints a pile). The capsule's ✕ dismisses the
 * whole slot at once.
 *
 * While folded, every card's auto-dismiss countdown is FROZEN —
 * bursting notifications stop deleting themselves, the user stays in
 * control. Closing the visible card pops the stack (LIFO — the newest
 * backlog card slides into the visible slot) and the count ticks down.
 * When the stack is down to its LAST card, that card resumes its timer
 * and the capsule becomes a countdown capsule on its seconds. The
 * fold stays engaged through the whole descent (4 → 3 → 2 → 1) and
 * ends when the slot empties.
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
  const notifyShown = useMemo(
    () => entries.filter((entry) => entry.type === 'notify' && entry.status === 'shown'),
    [entries],
  );

  // The fold ENTERS when a slot crosses FOLD_THRESHOLD shown notify
  // cards and STAYS through the whole descent — it only ends when the
  // stack runs out (a folded slot never half-degrades back to a plain
  // stack mid-descent).
  const [folded, setFolded] = useState(() => notifyShown.length > FOLD_THRESHOLD);
  useEffect(() => {
    if (notifyShown.length > FOLD_THRESHOLD) {
      setFolded(true);
    } else if (notifyShown.length === 0) {
      setFolded(false);
    }
  }, [notifyShown.length]);

  // Freeze holders: while folded, every shown notify card holds one
  // pause on its countdown (a frozen card never auto-dismisses). The
  // LAST survivor is released — its timer resumes and the capsule
  // turns into the countdown capsule. The held-id record keeps the
  // freeze idempotent across re-renders, and the store's pause counter
  // lets it coexist with the hover pause.
  const heldIds = useRef(new Set<MessageId>());
  useEffect(() => {
    if (folded) {
      if (notifyShown.length === 1) {
        for (const id of heldIds.current) {
          store.resume(id);
        }
        heldIds.current.clear();
      } else {
        for (const entry of notifyShown) {
          if (!heldIds.current.has(entry.id)) {
            heldIds.current.add(entry.id);
            store.pause(entry.id);
          }
        }
      }
    }
  }, [folded, notifyShown, store]);

  // Release whatever is held when the slot unmounts.
  useEffect(
    () => () => {
      for (const id of heldIds.current) {
        store.resume(id);
      }
      heldIds.current.clear();
    },
    [store],
  );

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

  const showFold = folded && notifyShown.length > 0;
  const newest = showFold ? notifyShown[notifyShown.length - 1] : null;

  return (
    <div
      className={clsx('colox-message-viewport__slot', `colox-message-viewport__slot--${position}`)}
    >
      {showFold && newest !== null ? (
        <>
          <RendererSlot entry={newest} store={store} />
          <FoldCapsule
            count={notifyShown.length}
            seconds={survivorId !== null && leftMs !== null ? Math.ceil(leftMs / 1000) : null}
            onClear={() => {
              // dismiss the whole slot's shown notify — one ✕ empties
              // the stack; each payload fires its onClose normally
              for (const entry of notifyShown) {
                store.dismiss(entry.id);
              }
            }}
          />
          {/* the backlog stops rendering; leaving cards keep their exit
              animation and toast entries stay untouched */}
          {entries
            .filter(
              (entry) =>
                entry.id !== newest.id && (entry.type !== 'notify' || entry.status === 'exiting'),
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
 * showing that card's remaining seconds.
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
 * A slot's notify entries fold once they pass FOLD_THRESHOLD (see
 * MessageSlot) — the viewport's pollution valve for notification
 * storms.
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
