import { createId } from '@colox/cdk/utils/id';
import { DEFAULT_DURATION, DEFAULT_EXIT } from '../constants/defaults';
import type {
  MessageAddOptions,
  MessageEntry,
  MessageId,
  MessageMode,
  MessageOptions,
  MessagePalette,
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

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): readonly MessageEntry[] => this.entries;

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
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
      contentVersion: 0,
      status: 'shown',
    };
    this.entries = [...this.entries, entry];
    this.emit();
    if (entry.duration > 0) {
      this.startCountdown(id, entry.duration);
    }
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

  /** Dismisses one message (by id or key) into its exit window. */
  dismiss(key: MessageId | string): void {
    const entry = this.entries.find((item) => item.id === key || item.key === key);
    if (!entry || entry.status === 'exiting') {
      return;
    }
    this.clearCountdown(entry.id);
    this.remaining.delete(entry.id);
    this.transitionToExiting(entry.id);
  }

  /** Dismisses every message into its exit window. */
  dismissAll(): void {
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

  /** Pauses the countdown (hover): remembers the ms left. */
  pause(id: MessageId): void {
    const entry = this.entries.find((item) => item.id === id);
    if (!entry || entry.status !== 'shown' || entry.duration === 0) {
      return;
    }
    const timer = this.timers.get(id);
    if (timer === undefined) {
      return;
    }
    clearTimeout(timer);
    this.timers.delete(id);
    const started = this.startedAt.get(id) ?? Date.now();
    this.remaining.set(id, Math.max(0, entry.duration - (Date.now() - started)));
    this.startedAt.delete(id);
  }

  /** Resumes the countdown from the remaining ms (hover leaves). */
  resume(id: MessageId): void {
    const entry = this.entries.find((item) => item.id === id);
    if (!entry || entry.status !== 'shown' || entry.duration === 0) {
      return;
    }
    const left = this.remaining.get(id);
    if (left === undefined) {
      return;
    }
    this.remaining.delete(id);
    this.startCountdown(id, left);
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
