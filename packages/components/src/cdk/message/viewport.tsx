import {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import clsx from 'clsx';
import { IconX } from '@colox/icons';
import { messageFactory } from './factory';
import { POSITIONS } from './constants/viewport';
import type { MessageEntry, MessagePosition, MessageViewportProps } from './types';
import type { MessageStore } from './store';

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
          <EntryRenderer key="fold-display" entry={displayed} store={store} />
          {notifyShown.length > 0 && (
            <FoldCapsule
              count={notifyShown.length}
              countdown={survivorId !== null}
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
              <EntryRenderer key={entry.id} entry={entry} store={store} />
            ))}
        </>
      ) : (
        entries.map((entry) => <EntryRenderer key={entry.id} entry={entry} store={store} />)
      )}
    </div>
  );
}

/** One entry rendered through the renderer registered for its kind. */
function EntryRenderer({ entry, store }: { entry: MessageEntry; store: MessageStore }) {
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
 * wording changes; there is one card left, so the clear-all ✕ steps
 * back (the capsule is a reading, not a control).
 */
function FoldCapsule({
  count,
  countdown,
  seconds,
  onClear,
}: {
  count: number;
  /** True when the capsule counts down the last card's timer. */
  countdown: boolean;
  /** The remaining seconds; ticked in, null right at the switch. */
  seconds: number | null;
  onClear: () => void;
}) {
  return (
    <div
      role="status"
      className={clsx('colox-message-count', countdown && 'colox-message-count--countdown')}
      aria-label={
        countdown
          ? seconds !== null
            ? `${seconds} seconds before auto-dismiss`
            : 'Counting down'
          : count === 1
            ? '1 notification'
            : `${count} notifications`
      }
    >
      <span className="colox-message-count__label">
        {countdown ? (seconds !== null ? `${seconds}s` : '…') : count}
      </span>
      {!countdown && (
        <button
          type="button"
          className="colox-message-count__clear"
          aria-label="Dismiss all notifications"
          onClick={onClear}
        >
          <IconX aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/**
 * The message container — the one component a consumer actually mounts.
 *
 * Two shapes, one contract:
 *
 * - `<MessageViewport />` (no `asChild`) renders its own screen-wide
 *   layer (`--fixed`): the default `'root'` scope for the unscoped
 *   helper calls, messages pinned to the six screen edges.
 * - `<MessageViewport scope="…" asChild>{element}</MessageViewport>`
 *   renders NO box of its own: it merges the anchor onto the ONE
 *   element child (`--content` — the child becomes the positioning
 *   context) and renders the slots inside it as absolutely positioned
 *   siblings. No wrapper div, and nothing depends on an ancestor being
 *   `position: relative` — the child itself is the box the messages
 *   pin to (an `absolute` viewport used to lean on the parent's
 *   positioning; a parent without `relative` leaked the layer to the
 *   page — the merge removes the contract entirely).
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
 */
export function MessageViewport({
  scope = 'root',
  asChild = false,
  className,
  style,
  children,
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

  const slotNodes = POSITIONS.map((position) => {
    const slotEntries = entries.filter((entry) => entry.position === position);
    if (slotEntries.length === 0) {
      return null;
    }
    return <MessageSlot key={position} position={position} entries={slotEntries} store={store} />;
  });

  // The merge shape: no box of its own — the consumer's element IS the
  // container. The anchor class turns it into the positioning context,
  // and the slots land inside it as absolute siblings (absolutely
  // positioned elements never take part in the child's own layout, so
  // the consumer's layout is untouched).
  if (asChild) {
    const childList = Children.toArray(children);
    if (
      childList.length !== 1 ||
      !isValidElement(childList[0]) ||
      (childList[0].type as unknown) === Fragment
    ) {
      throw new Error(
        'MessageViewport `asChild` merges onto exactly one element child — ' +
          'the element the messages anchor to.',
      );
    }
    const child = childList[0] as ReactElement<Record<string, unknown>>;
    const childProps = child.props as {
      className?: string;
      style?: object;
      children?: ReactNode;
      'data-scope'?: string;
    };
    return cloneElement(child, {
      className: clsx(
        'colox-message-viewport',
        'colox-message-viewport--content',
        childProps.className,
        className,
      ),
      style: { ...style, ...(childProps.style ?? {}) },
      'data-scope': childProps['data-scope'] ?? scope,
      children: [...Children.toArray(childProps.children), ...slotNodes],
    });
  }

  return (
    <div
      className={clsx('colox-message-viewport', 'colox-message-viewport--fixed', className)}
      style={style}
      data-scope={scope}
      {...rest}
    >
      {slotNodes}
    </div>
  );
}
