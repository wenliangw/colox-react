import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { MouseEvent } from 'react';
import clsx from 'clsx';
import { IconChevronUp } from '@colox/icons';
import { messageFactory } from './factory';
import { DECK_THRESHOLD, POSITIONS } from './constants/viewport';
import type { MessageEntry, MessageViewportProps } from './types';
import type { MessageStore } from './stores/store';

import './styles/index.scss';

/** How many notify cards peek behind the front card of a deck. */
const DECK_PEEKS = 2;

/** The deck surface: the front card is the newest (array order, so
 *  reverse — the store appends, the newest is last). */
function sliceDeck(entries: readonly MessageEntry[]) {
  const newestFirst = [...entries].reverse();
  const front = newestFirst[0];
  const peeks = newestFirst.slice(1, 1 + DECK_PEEKS);
  const hidden = Math.max(0, entries.length - 1 - DECK_PEEKS);
  return { front, peeks, hidden, newestFirst };
}

/**
 * The notify deck: a slot that holds more than DECK_THRESHOLD notify
 * cards collapses them into a stacked deck — the newest card fully
 * visible and holding the pile's footprint, the two behind it rendered
 * in full and hanging above it (each shifted up by index × 4px with a
 * descending z-index, so only their top edges ladder out like cards in
 * a deck), and the rest folded into a "+N" count chip. This is the
 * viewport-pollution valve: many simultaneous notifications stop
 * painting the whole stack and show a compact pile instead — the pile
 * height stays card + 2 × 4px no matter how many cards a slot holds.
 * Clicking the deck surface (or the count chip) expands it into the
 * full newest-first stack; clicking again collapses. The cards keep
 * their own timers in both states; collapsed, only the front card and
 * the chips are interactive.
 */
export function MessageDeck({
  entries,
  store,
}: {
  entries: readonly MessageEntry[];
  store: MessageStore;
}) {
  const [expanded, setExpanded] = useState(false);

  const Renderer = messageFactory.getRenderer(entries[0].type);
  if (Renderer === undefined) {
    return null;
  }
  const { front, peeks, hidden, newestFirst } = sliceDeck(entries);

  // A click landing on an interactive element inside a card (the close
  // button) is that element's — the deck does not hijack it.
  // The count/collapse chips are buttons of their own; they toggle via
  // their own handlers, so the deck ignores button clicks entirely.
  const toggle = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('button, a, input, [role="button"]')) {
      return;
    }
    setExpanded((v) => !v);
  };

  return (
    <div
      className={clsx('colox-message-deck', expanded && 'colox-message-deck--expanded')}
      onClick={toggle}
    >
      {expanded ? (
        newestFirst.map((entry) => <Renderer key={entry.id} entry={entry} store={store} />)
      ) : (
        <>
          {/* the front card keeps the pile's footprint (in-flow) and
              sits on top: its z-index tops every peek */}
          <div className="colox-message-deck__front" style={{ zIndex: peeks.length + 1 }}>
            <Renderer entry={front} store={store} />
          </div>
          {/* the cards behind it: FULL renders absolutely anchored to
              the deck's top edge, each shifted up by its index (× the
              spacing-1 token = 4px) with a descending z-index — the two
              top edges ladder up above the front card like a deck */}
          {peeks.map((entry, index) => (
            <div
              key={entry.id}
              className="colox-message-deck__peek-card"
              style={{
                zIndex: peeks.length - index,
                transform: `translateY(calc(-1 * ${index + 1} * var(--colox-spacing-1)))`,
              }}
              aria-hidden="true"
            >
              <Renderer entry={entry} store={store} />
            </div>
          ))}
          <button
            type="button"
            className="colox-message-deck__count"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
          >
            +{hidden}
          </button>
        </>
      )}
      {expanded && (
        <button
          type="button"
          className="colox-message-deck__collapse"
          aria-label="Collapse notifications"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(false);
          }}
        >
          <IconChevronUp aria-hidden="true" />
        </button>
      )}
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
 * A slot's notify entries collapse into a deck once they pass
 * DECK_THRESHOLD (see MessageDeck) — the viewport's pollution valve
 * for notification storms.
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
        const notifyEntries = slotEntries.filter((entry) => entry.type === 'notify');
        const deck = notifyEntries.length > DECK_THRESHOLD;
        return (
          <div
            key={position}
            className={clsx(
              'colox-message-viewport__slot',
              `colox-message-viewport__slot--${position}`,
            )}
          >
            {deck ? (
              <>
                {slotEntries
                  .filter((entry) => entry.type !== 'notify')
                  .map((entry) => {
                    const Renderer = messageFactory.getRenderer(entry.type);
                    if (Renderer === undefined) {
                      return null;
                    }
                    return <Renderer key={entry.id} entry={entry} store={store} />;
                  })}
                <MessageDeck entries={notifyEntries} store={store} />
              </>
            ) : (
              slotEntries.map((entry) => {
                const Renderer = messageFactory.getRenderer(entry.type);
                if (Renderer === undefined) {
                  return null;
                }
                return <Renderer key={entry.id} entry={entry} store={store} />;
              })
            )}
          </div>
        );
      })}
    </div>
  );
}
