import { createId } from '@colox/cdk/utils/id';
import { Timer } from '@colox/cdk/utils/timer';
import { DEFAULT_DURATION, DEFAULT_EXIT } from './constants/defaults';
import { FOLD_THRESHOLD, POSITIONS } from './constants/viewport';
import type {
  MessageAddOptions,
  MessageEntry,
  MessageId,
  MessageMode,
  MessageOptions,
  MessagePalette,
  MessagePosition,
  MessageVariant,
} from './types';

/**
 * Resolves the message defaults the store owns: the mode falls back to
 * info, the palette follows the mode, the surface variant to plain and
 * the renderer chrome (mode icon + close button) stays on unless
 * explicitly turned off.
 */
export function resolveMessageDefaults(
  options: MessageOptions,
): Pick<MessageEntry, 'mode' | 'palette' | 'variant' | 'showIcon' | 'closeable'> {
  const mode: MessageMode = options.mode ?? 'info';
  const palette: MessagePalette = options.palette ?? mode;
  const variant: MessageVariant = options.variant ?? 'plain';
  return {
    mode,
    palette,
    variant,
    showIcon: options.showIcon ?? true,
    closeable: options.closeable ?? true,
  };
}

/**
 * One message queue — the single source of truth behind one scope
 * container. A message lives here from `add(...)` until its exit window
 * ends; the store owns every mutation and the scheduling (the time
 * mechanics themselves live in the shared `Timer` core), so the
 * viewport is a pure render of `getSnapshot()`.
 *
 * The store is kind-agnostic: entries carry their own `type` (toast /
 * notify), so one scope container can hold toast and notify entries
 * side by side — the consumer kinds route them in and the viewport
 * renders each by the renderer registered for its type.
 *
 * Entries are immutable and the snapshot reference only changes on a
 * real mutation — the `useSyncExternalStore` contract for the viewport.
 */
export class MessageStore {
  private entries: MessageEntry[] = [];
  private listeners = new Set<() => void>();
  /**
   * id → the entry's auto-dismiss clock. The time mechanics — the
   * held remaining ledger, the stacking pause holders, one in-flight
   * timer per clock — live in the shared `Timer` core (see
   * `@colox/cdk/utils/timer`); the store just keeps one per timed
   * entry and routes its expiry into `dismiss`.
   */
  private timers = new Map<MessageId, Timer>();
  /** id → the exit-window retention timer (a fixed delay, no pause semantics). */
  private exitTimers = new Map<MessageId, ReturnType<typeof setTimeout>>();
  /**
   * The notify fold bookkeeping, one set per slot: position → the ids
   * whose countdown holds that slot's freeze (one holder per folded
   * card). A position ENTERS when its shown notify count passes
   * FOLD_THRESHOLD and HOLDS through the whole descent (4 → 3 → 2 → 1),
   * draining only when the position holds no notify entries at all —
   * the last card's exit window still renders under the fold. Each
   * slot's holds are its own: releasing one folded slot never touches
   * another slot's freeze.
   */
  private folds = new Map<MessagePosition, Set<MessageId>>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): readonly MessageEntry[] => this.entries;

  private emit(): void {
    this.reconcileFold();
    for (const listener of this.listeners) {
      listener();
    }
  }

  /** Whether a position is under the notify fold (see reconcileFold). */
  isFolded(position: MessagePosition): boolean {
    return this.folds.has(position);
  }

  /**
   * Keeps the fold bookkeeping in step with the entries — runs on
   * every commit, BEFORE the listeners: positions enter/hold/leave the
   * fold, and the frozen timers follow. While folded with more than
   * one shown card, every shown card holds one freeze (its countdown
   * stops — a burst never deletes itself behind the user's back); the
   * LAST survivor is released so its timer resumes under the countdown
   * capsule. Holds of cards that left the slot (popped, cleared) prune
   * on the same pass.
   */
  private reconcileFold(): void {
    const notifyByPosition = new Map<MessagePosition, MessageEntry[]>();
    for (const entry of this.entries) {
      // entries without a position never render in a slot — no fold
      if (entry.type !== 'notify' || entry.position === undefined) {
        continue;
      }
      const list = notifyByPosition.get(entry.position) ?? [];
      list.push(entry);
      notifyByPosition.set(entry.position, list);
    }
    for (const position of POSITIONS) {
      const notify = notifyByPosition.get(position) ?? [];
      if (notify.length === 0) {
        this.folds.delete(position);
        continue;
      }
      const shown = notify.filter((entry) => entry.status === 'shown');
      if (shown.length > FOLD_THRESHOLD && !this.folds.has(position)) {
        this.folds.set(position, new Set());
      }
      const held = this.folds.get(position);
      if (held === undefined) {
        continue;
      }
      if (shown.length === 1) {
        // the last survivor — release THIS slot's freeze only, so its
        // countdown resumes under the countdown capsule
        for (const id of held) {
          this.resume(id);
        }
        held.clear();
      } else {
        for (const entry of shown) {
          if (!held.has(entry.id)) {
            held.add(entry.id);
            this.pause(entry.id);
          }
        }
      }
      // prune stale holds: cards that left the slot (popped, cleared)
      // no longer shown
      for (const id of [...held]) {
        if (!shown.some((entry) => entry.id === id)) {
          held.delete(id);
        }
      }
    }
  }

  /** Adds one message and starts its countdown. Returns its id. */
  add(options: MessageAddOptions): MessageId {
    const id = createId('message');
    if (options.strategy === 'single') {
      const existingIndex = this.entries.findIndex(
        (entry) => entry.type === options.type && entry.position === options.position,
      );
      if (existingIndex !== -1) {
        // One live entry per slot: the newcomer replaces the matching
        // entry in place (the first one — the edge-anchored spot);
        // any OTHER shown entries of the slot are leftovers — they
        // exit (the survivor keeps its spot, no reflow).
        const leftovers = this.entries.filter(
          (item) =>
            item.id !== this.entries[existingIndex].id &&
            item.status === 'shown' &&
            item.type === options.type &&
            item.position === options.position,
        );
        for (const leftover of leftovers) {
          this.transitionToExiting(leftover.id);
        }
        return this.replaceInPlace(existingIndex, options);
      }
    }
    const resolved = resolveMessageDefaults(options);
    // a card arriving into an ACTIVE fold lands straight in the display
    // slot — for the viewer that is an update, not an arrival: bump the
    // version so the words re-mount with the zoom entrance (the same
    // language as a pop promotion and a single replacement)
    const revealsFoldDisplay = options.position !== undefined && this.folds.has(options.position);
    const entry: MessageEntry = {
      ...options,
      id,
      type: options.type,
      mode: resolved.mode,
      palette: resolved.palette,
      variant: resolved.variant,
      showIcon: resolved.showIcon,
      closeable: resolved.closeable,
      duration: options.duration ?? DEFAULT_DURATION,
      contentVersion: revealsFoldDisplay ? 1 : 0,
      status: 'shown',
    };
    this.entries = [...this.entries, entry];
    // the countdown starts BEFORE the commit: the fold reconciliation
    // runs inside emit — a freeze must find the entry's clock armed,
    // or a new card would slip into a folded slot unfrozen
    if (entry.duration > 0) {
      this.timerOf(id).start(entry.duration);
    }
    this.emit();
    return id;
  }

  /**
   * Replaces the entry at `index` with a new payload in place — the
   * slot keeps its id (and therefore its DOM node), so a same-position
   * replacement never re-mounts or shifts the stack. The replacement
   * commits instantly (no opacity dip — the swap-era cross-fade is
   * retired; see the consumer direction note in animation.scss): the
   * new payload lands right away, the `contentVersion` bump re-mounts
   * the content node and its zoom entrance plays. An exiting entry
   * revives back to `shown` the same instant way. The replaced
   * payload's `onClose` fires once when its job ends (an exiting
   * entry's already fired at its own exit).
   */
  private replaceInPlace(index: number, options: MessageAddOptions): MessageId {
    const existing = this.entries[index];
    const resolved = resolveMessageDefaults(options);
    const next: MessageEntry = {
      ...options,
      id: existing.id,
      type: options.type,
      mode: resolved.mode,
      palette: resolved.palette,
      variant: resolved.variant,
      showIcon: resolved.showIcon,
      closeable: resolved.closeable,
      duration: options.duration ?? DEFAULT_DURATION,
      contentVersion: existing.contentVersion + 1,
      status: 'shown',
    };
    // an exiting entry revives: cancel its retention timer, or the
    // exit window would remove the revived message mid-countdown
    const exitTimer = this.exitTimers.get(existing.id);
    if (exitTimer !== undefined) {
      clearTimeout(exitTimer);
      this.exitTimers.delete(existing.id);
    }
    this.entries = [...this.entries];
    this.entries[index] = next;
    this.restartCountdown(next.id, next.duration);
    this.emit();
    // Replaced in place — the old payload's job ends here. Fire its
    // onClose once, but ONLY after the replacement is committed: a
    // re-entrant add inside onClose must observe the fresh entry (a
    // still-shown `existing` would let it re-fire this payload).
    if (existing.status === 'shown') {
      this.fireClose(existing);
    }
    return existing.id;
  }

  /**
   * Replaces the message carrying `key` (or the id, when `key` matches
   * none) with a patched copy. Duration changes restart the countdown;
   * a folded card stays FROZEN across the restart (the fold's promise:
   * a burst never deletes itself — see restartCountdown); a patch from
   * an exiting message keeps it exiting. Every visible payload change
   * commits INSTANTLY (both updates and replacements land straight
   * away — the swap-era opacity cross-fade is gone): the
   * `contentVersion` bump re-mounts the content node and its zoom
   * entrance plays. An invisible patch (duration/key/position/data/
   * chrome/onClose only) applies without re-mounting the content. An
   * update continues the same payload, so it never fires `onClose`.
   */
  update(key: string, patch: MessageOptions): void {
    const index = this.entries.findIndex((entry) => entry.key === key || entry.id === key);
    if (index === -1) {
      return;
    }
    const current = this.entries[index];
    const next: MessageEntry = {
      ...current,
      ...patch,
      id: current.id,
      type: current.type,
      mode: patch.mode ?? current.mode,
      palette: patch.palette ?? current.palette,
      variant: patch.variant ?? current.variant,
      status: current.status,
    };
    const visibleChanged =
      next.content !== current.content ||
      next.title !== current.title ||
      next.mode !== current.mode ||
      next.palette !== current.palette ||
      next.variant !== current.variant;
    this.entries = [...this.entries];
    this.entries[index] =
      visibleChanged && current.status === 'shown'
        ? // The new payload lands immediately and the content node
          // re-mounts on the version bump for the zoom entrance.
          { ...next, contentVersion: current.contentVersion + 1 }
        : next;
    if (current.status === 'shown') {
      this.restartCountdown(next.id, next.duration);
    }
    this.emit();
  }

  /**
   * Dismisses one message (by id or key). In a folded slot, closing a
   * card with others behind it POPS it instantly — the fold slot
   * updates in place, no exit window (only the last card of a fold
   * walks the exit animation; see popInstant).
   */
  dismiss(key: MessageId | string): void {
    const entry = this.entries.find((item) => item.id === key || item.key === key);
    if (!entry || entry.status === 'exiting') {
      return;
    }
    if (entry.type === 'notify' && entry.position !== undefined && this.folds.has(entry.position)) {
      const slotShown = this.entries.filter(
        (item) =>
          item.type === 'notify' && item.status === 'shown' && item.position === entry.position,
      );
      if (slotShown.length > 1) {
        this.popInstant(entry);
        return;
      }
    }
    this.transitionToExiting(entry.id);
  }

  /**
   * The fold pop: closes one folded card INSTANTLY — no exit window,
   * no exit animation (that belongs to the last card alone). When the
   * popped card was the VISIBLE (newest) one, the next-newest card
   * promotes into the display slot: its `contentVersion` bumps so the
   * card frame stays put and its words re-mount with the zoom entrance
   * — the same in-place update language as a single replacement.
   */
  private popInstant(entry: MessageEntry): void {
    this.timers.get(entry.id)?.clear();
    this.timers.delete(entry.id);
    // the promoted card: the next-newest shown notify of the same
    // slot, when the popped one WAS the visible card
    let promotedId: MessageId | undefined;
    const slotShown = this.entries.filter(
      (item) =>
        item.type === 'notify' && item.status === 'shown' && item.position === entry.position,
    );
    if (slotShown[slotShown.length - 1]?.id === entry.id) {
      promotedId = slotShown[slotShown.length - 2]?.id;
    }
    this.entries = this.entries
      .filter((item) => item.id !== entry.id)
      .map((item) =>
        item.id === promotedId ? { ...item, contentVersion: item.contentVersion + 1 } : item,
      );
    this.emit();
    // the ended payload fires AFTER the commit (re-entrancy discipline)
    this.fireClose(entry);
  }

  /**
   * The count capsule's clear-all ✕: the invisible backlog clears
   * instantly — a never-seen card must not flash an exit animation —
   * and the visible newest card walks the exit animation as the slot's
   * last card, the only one the user can see leave. Every payload
   * fires its onClose once, after the commit.
   */
  clearSlot(position: MessagePosition): void {
    const slotShown = this.entries.filter(
      (item) => item.type === 'notify' && item.status === 'shown' && item.position === position,
    );
    if (slotShown.length === 0) {
      return;
    }
    const newest = slotShown[slotShown.length - 1];
    if (slotShown.length === 1) {
      this.transitionToExiting(newest.id);
      return;
    }
    const backlog = slotShown.slice(0, -1);
    const backlogIds = new Set(backlog.map((item) => item.id));
    this.timers.get(newest.id)?.clear();
    // the invisible backlog freezes end instantly with its cards (its
    // holds prune in the fold reconciliation)
    for (const item of backlog) {
      this.timers.get(item.id)?.clear();
      this.timers.delete(item.id);
    }
    // commit first: the backlog is gone instantly, the newest exits
    this.entries = this.entries
      .filter((item) => !backlogIds.has(item.id))
      .map((item) => (item.id === newest.id ? { ...item, status: 'exiting' } : item));
    this.emit();
    this.scheduleRemovals();
    // then fire, per payload — AFTER the commit (re-entrancy discipline)
    for (const item of backlog) {
      this.fireClose(item);
    }
    this.fireClose(newest);
  }

  /** Dismisses every message into its exit window. */
  dismissAll(): void {
    // folded notify slots clear through the fold discipline: the
    // invisible backlog vanishes instantly, only the visible newest
    // card walks the exit animation
    for (const position of [...this.folds.keys()]) {
      this.clearSlot(position);
    }
    const ending: MessageEntry[] = [];
    for (const entry of this.entries) {
      if (entry.status === 'shown') {
        this.timers.get(entry.id)?.clear();
        ending.push(entry);
      }
    }
    this.entries = this.entries.map((entry) =>
      entry.status === 'shown' ? { ...entry, status: 'exiting' } : entry,
    );
    this.emit();
    this.scheduleRemovals();
    // Each shown payload's job ends here — fire its onClose once,
    // AFTER the exiting commit: a re-entrant add inside onClose sees
    // the entries already exiting (no re-fire, no re-entrancy loop).
    for (const entry of ending) {
      this.fireClose(entry);
    }
  }

  /**
   * Halts the entry's countdown (hover, fold freeze). Pauses stack per
   * holder and only the final release resumes — the hover pause and
   * the fold freeze coexist without clobbering each other. The held
   * remaining ledger (not `entry.duration`) is the truth: a countdown
   * resumed from a partial remaining keeps it across further pauses.
   */
  pause(id: MessageId): void {
    const entry = this.entries.find((item) => item.id === id);
    if (!entry || entry.status !== 'shown' || entry.duration === 0) {
      return;
    }
    this.timers.get(id)?.pause();
  }

  /**
   * Releases one pause holder (hover leaves, fold releases). The
   * countdown restarts from the remaining ms only when the LAST
   * holder releases.
   */
  resume(id: MessageId): void {
    const entry = this.entries.find((item) => item.id === id);
    if (!entry || entry.status !== 'shown' || entry.duration === 0) {
      return;
    }
    this.timers.get(id)?.resume();
  }

  /**
   * The ms left on a shown entry's countdown — counting down or
   * halted (hovered / folded). `null` when it has no countdown
   * (sticky duration 0, or already leaving).
   */
  getRemaining(id: MessageId): number | null {
    const entry = this.entries.find((item) => item.id === id);
    if (!entry || entry.status !== 'shown' || entry.duration === 0) {
      return null;
    }
    return this.timers.get(id)?.getRemaining() ?? null;
  }

  /** The entry's clock — created on the first arm, expired into dismiss. */
  private timerOf(id: MessageId): Timer {
    let timer = this.timers.get(id);
    if (timer === undefined) {
      timer = new Timer(() => this.dismiss(id));
      this.timers.set(id, timer);
    }
    return timer;
  }

  /**
   * Restarts an entry's countdown from `ms` — the update/replacement
   * path. A card whose countdown sits under a fold freeze stays
   * frozen: the restart wipes holders, so it re-arms the freeze
   * holder right away (an update must never un-freeze a folded card —
   * the fold's whole promise is that a burst never deletes itself).
   */
  private restartCountdown(id: MessageId, ms: number): void {
    const timer = this.timerOf(id);
    timer.clear();
    if (ms <= 0) {
      return;
    }
    timer.start(ms);
    if (this.heldByFold(id)) {
      this.pause(id);
    }
  }

  private heldByFold(id: MessageId): boolean {
    for (const held of this.folds.values()) {
      if (held.has(id)) {
        return true;
      }
    }
    return false;
  }

  /** Moves one shown message to exiting and schedules its removal. */
  private transitionToExiting(id: MessageId): void {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return;
    }
    const entry = this.entries[index];
    // the countdown is over with the transition — its clock must not
    // outlive the entry (the retention timer is a separate concern)
    this.timers.get(id)?.clear();
    this.entries = [...this.entries];
    this.entries[index] = {
      ...entry,
      status: 'exiting',
    };
    this.emit();
    this.scheduleRemovals();
    // The payload's job ends here — fire its onClose once, with the
    // id and the caller's own data. Fired AFTER the exiting commit: a
    // re-entrant add inside onClose now sees the entry already exiting,
    // so a single-slot replacement revives it without re-firing this
    // payload (the old order re-fired it and recursed forever).
    this.fireClose(entry);
  }

  /** Fires the ended payload's onClose — once, at the moment its job ends. */
  private fireClose(entry: MessageEntry): void {
    entry.onClose?.({ id: entry.id, data: entry.data });
  }

  /** Removes every exiting message once the exit window ends. */
  private scheduleRemovals(): void {
    const exiting = this.entries.filter((entry) => entry.status === 'exiting');
    for (const entry of exiting) {
      // one retention timer per id: an entry already scheduled keeps
      // its window (dismissAll re-commits must not open a second one)
      if (this.exitTimers.has(entry.id)) {
        continue;
      }
      const timer = setTimeout(() => {
        this.exitTimers.delete(entry.id);
        this.timers.delete(entry.id);
        this.entries = this.entries.filter((item) => item.id !== entry.id);
        this.emit();
      }, DEFAULT_EXIT);
      this.exitTimers.set(entry.id, timer);
    }
  }
}

/** Creates one message store. */
export function createMessageStore(): MessageStore {
  return new MessageStore();
}
