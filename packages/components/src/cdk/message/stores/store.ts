import { createId } from '@colox/cdk/utils/id';
import { DEFAULT_DURATION, DEFAULT_EXIT } from '../constants/defaults';
import { FOLD_THRESHOLD, POSITIONS } from '../constants/viewport';
import type {
  MessageAddOptions,
  MessageEntry,
  MessageId,
  MessageMode,
  MessageOptions,
  MessagePalette,
  MessagePosition,
  MessageVariant,
} from '../types';

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
 * ends; the store owns every timer (the auto-dismiss countdown, the
 * pause/resume bookkeeping, the exit window) and every mutation, so the
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
  /** id → the auto-dismiss timer handle (present while counting down). */
  private timers = new Map<MessageId, ReturnType<typeof setTimeout>>();
  /** id → ms left on the countdown (updated on pause). */
  private remaining = new Map<MessageId, number>();
  /** id → the countdown start timestamp (pause bookkeeping). */
  private startedAt = new Map<MessageId, number>();
  /**
   * id → how many pause holders sit on the countdown (the hover pause
   * and the fold freeze can stack). The countdown only restarts when
   * the last holder releases.
   */
  private pauseCount = new Map<MessageId, number>();
  /**
   * Positions currently under the notify fold. The fold is the store's
   * bookkeeping (reconciled on every commit): a position ENTERS when
   * its shown notify count passes FOLD_THRESHOLD and HOLDS through the
   * whole descent (4 → 3 → 2 → 1), draining only when the position
   * holds no notify entries at all — the last card's exit window still
   * renders under the fold.
   */
  private foldedPositions = new Set<MessagePosition>();
  /**
   * The ids whose countdown holds the store-side fold freeze (one
   * holder per folded card) — released when the fold descends to its
   * last survivor.
   */
  private foldHeldIds = new Set<MessageId>();

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
    return this.foldedPositions.has(position);
  }

  /**
   * Keeps the fold bookkeeping in step with the entries — runs on
   * every commit, BEFORE the listeners: positions enter/hold/leave the
   * fold, and the frozen timers follow. While folded with more than
   * one shown card, every shown card holds one freeze (its countdown
   * stops — a burst never deletes itself behind the user's back); the
   * LAST survivor is released so its timer resumes under the countdown
   * capsule.
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
        this.foldedPositions.delete(position);
        continue;
      }
      const shown = notify.filter((entry) => entry.status === 'shown');
      if (shown.length > FOLD_THRESHOLD) {
        this.foldedPositions.add(position);
      }
      if (!this.foldedPositions.has(position)) {
        continue;
      }
      if (shown.length === 1) {
        // the last survivor — release the freeze so its countdown
        // resumes under the countdown capsule
        for (const id of this.foldHeldIds) {
          this.resume(id);
        }
        this.foldHeldIds.clear();
      } else {
        for (const entry of shown) {
          if (!this.foldHeldIds.has(entry.id)) {
            this.foldHeldIds.add(entry.id);
            this.pause(entry.id);
          }
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
        for (const leftover of this.entries) {
          if (
            leftover.id !== this.entries[existingIndex].id &&
            leftover.status === 'shown' &&
            leftover.type === options.type &&
            leftover.position === options.position
          ) {
            this.clearCountdown(leftover.id);
            this.remaining.delete(leftover.id);
            this.transitionToExiting(leftover.id);
          }
        }
        return this.replaceInPlace(existingIndex, options);
      }
    }
    const resolved = resolveMessageDefaults(options);
    // a card arriving into an ACTIVE fold lands straight in the display
    // slot — for the viewer that is an update, not an arrival: bump the
    // version so the words re-mount with the zoom entrance (the same
    // language as a pop promotion and a single replacement)
    const revealsFoldDisplay =
      options.position !== undefined && this.foldedPositions.has(options.position);
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
    // runs inside emit — a freeze must find the entry's timer live,
    // or a new card would slip into a folded slot unfrozen
    if (entry.duration > 0) {
      this.startCountdown(id, entry.duration);
    }
    this.emit();
    return id;
  }

  /**
   * Replaces the entry at `index` with a new payload in place — the
   * slot keeps its id (and therefore its DOM node), so a same-position
   * replacement never re-mounts or shifts the stack. The swap commits
   * instantly (no opacity dip — see the consumer direction note in
   * animation.scss): the new payload lands right away, the
   * `contentVersion` bump re-mounts the content node and its zoom
   * entrance plays. An exiting entry revives back to `shown` the same
   * instant way. The replaced payload's `onClose` fires once when its
   * job ends (an exiting entry's already fired at its own exit).
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
    this.clearCountdown(existing.id);
    this.remaining.delete(existing.id);
    this.startedAt.delete(existing.id);
    this.entries = [...this.entries];
    this.entries[index] = next;
    if (next.duration > 0) {
      this.startCountdown(next.id, next.duration);
    }
    this.emit();
    // Replaced in place — the old payload's job ends here. Fire its
    // onClose once, but ONLY after the replacement is committed: a
    // re-entrant add inside onClose must observe the fresh entry (a
    // still-shown `existing` would let it re-fire this payload).
    if (existing.status === 'shown') {
      this.notifyClose(existing);
    }
    return existing.id;
  }

  /**
   * Replaces the message carrying `key` (or the id, when `key` matches
   * none) with a patched copy. Duration changes restart the countdown;
   * a patch from an exiting message keeps it exiting. Every visible
   * payload change commits INSTANTLY (both updates and replacements
   * land straight away — the swap fade is gone): the `contentVersion`
   * bump re-mounts the content node and its zoom entrance plays. An
   * invisible patch (duration/key/position/data/chrome/onClose only)
   * applies without re-mounting the content. An update continues the
   * same payload, so it never fires `onClose`.
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
      this.clearCountdown(current.id);
      if (next.duration > 0) {
        this.startCountdown(next.id, next.duration);
      }
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
    if (
      entry.type === 'notify' &&
      entry.position !== undefined &&
      this.foldedPositions.has(entry.position)
    ) {
      const slotShown = this.entries.filter(
        (item) =>
          item.type === 'notify' && item.status === 'shown' && item.position === entry.position,
      );
      if (slotShown.length > 1) {
        this.popInstant(entry);
        return;
      }
    }
    this.clearCountdown(entry.id);
    this.remaining.delete(entry.id);
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
    this.clearCountdown(entry.id);
    this.remaining.delete(entry.id);
    this.foldHeldIds.delete(entry.id);
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
    this.notifyClose(entry);
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
      this.clearCountdown(newest.id);
      this.remaining.delete(newest.id);
      this.transitionToExiting(newest.id);
      return;
    }
    const backlog = slotShown.slice(0, -1);
    const backlogIds = new Set(backlog.map((item) => item.id));
    this.clearCountdown(newest.id);
    this.remaining.delete(newest.id);
    for (const item of backlog) {
      this.clearCountdown(item.id);
      this.remaining.delete(item.id);
      this.foldHeldIds.delete(item.id);
    }
    // commit first: the backlog is gone instantly, the newest exits
    this.entries = this.entries
      .filter((item) => !backlogIds.has(item.id))
      .map((item) => (item.id === newest.id ? { ...item, status: 'exiting' } : item));
    this.emit();
    this.scheduleRemovals();
    // then fire, per payload — AFTER the commit (re-entrancy discipline)
    for (const item of backlog) {
      this.notifyClose(item);
    }
    this.notifyClose(newest);
  }

  /** Dismisses every message into its exit window. */
  dismissAll(): void {
    // folded notify slots clear through the fold discipline: the
    // invisible backlog vanishes instantly, only the visible newest
    // card walks the exit animation
    for (const position of [...this.foldedPositions]) {
      this.clearSlot(position);
    }
    const ending: MessageEntry[] = [];
    for (const entry of this.entries) {
      if (entry.status === 'shown') {
        this.clearCountdown(entry.id);
        this.remaining.delete(entry.id);
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
      this.notifyClose(entry);
    }
  }

  /**
   * Halts the countdown (hover, fold freeze): remembers the ms left.
   * Pauses stack — each holder increments the count, and only the
   * final release restarts the timer, so the hover pause and the
   * viewport's fold freeze can coexist without clobbering each other.
   */
  pause(id: MessageId): void {
    const entry = this.entries.find((item) => item.id === id);
    if (!entry || entry.status !== 'shown' || entry.duration === 0) {
      return;
    }
    const count = this.pauseCount.get(id) ?? 0;
    if (count > 0) {
      this.pauseCount.set(id, count + 1);
      return;
    }
    const timer = this.timers.get(id);
    this.pauseCount.set(id, 1);
    if (timer === undefined) {
      return;
    }
    clearTimeout(timer);
    this.timers.delete(id);
    const started = this.startedAt.get(id) ?? Date.now();
    this.remaining.set(id, Math.max(0, entry.duration - (Date.now() - started)));
    this.startedAt.delete(id);
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
    const count = this.pauseCount.get(id) ?? 0;
    if (count === 0) {
      return;
    }
    const next = count - 1;
    if (next > 0) {
      this.pauseCount.set(id, next);
      return;
    }
    this.pauseCount.delete(id);
    const left = this.remaining.get(id);
    if (left === undefined) {
      return;
    }
    this.remaining.delete(id);
    this.startCountdown(id, left);
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
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      const started = this.startedAt.get(id) ?? Date.now();
      return Math.max(0, entry.duration - (Date.now() - started));
    }
    const left = this.remaining.get(id);
    return left ?? null;
  }

  private startCountdown(id: MessageId, ms: number): void {
    this.startedAt.set(id, Date.now());
    const timer = setTimeout(() => this.dismiss(id), ms);
    this.timers.set(id, timer);
  }

  private clearCountdown(id: MessageId): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    // the countdown is over — stale pause holders end with it
    this.pauseCount.delete(id);
    this.startedAt.delete(id);
  }

  /** Moves one shown message to exiting and schedules its removal. */
  private transitionToExiting(id: MessageId): void {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return;
    }
    const entry = this.entries[index];
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
    this.notifyClose(entry);
  }

  /** Fires the ended payload's onClose — once, at the moment its job ends. */
  private notifyClose(entry: MessageEntry): void {
    entry.onClose?.({ id: entry.id, data: entry.data });
  }

  /** Removes every exiting message once the exit window ends. */
  private scheduleRemovals(): void {
    const exiting = this.entries.filter((entry) => entry.status === 'exiting');
    for (const entry of exiting) {
      const timer = setTimeout(() => {
        this.entries = this.entries.filter((item) => item.id !== entry.id);
        this.emit();
      }, DEFAULT_EXIT);
      this.timers.set(entry.id, timer);
    }
  }
}

/** Creates one message store. */
export function createMessageStore(): MessageStore {
  return new MessageStore();
}
