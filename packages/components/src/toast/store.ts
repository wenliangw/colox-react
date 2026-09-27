import type { ToastEntry, ToastId, ToastOptions } from './types';

/**
 * The default auto-dismiss window (ms). Overridable per toast via
 * `duration`; 0 = sticky.
 */
export const DEFAULT_DURATION = 3000;

/**
 * The exit window (ms): after a dismiss the toast stays mounted for
 * this long while the CSS plays the out-animation, then the store
 * removes it. The runtime mirror of `--colox-motion-duration-normal`;
 * the CSS duration must stay in lockstep.
 */
export const TOAST_EXIT = 200;

/** A fresh unique id (monotonic per session, safe for React keys). */
let nextId = 0;
const nextToastId = (): ToastId => `colox-toast-${++nextId}`;

/**
 * The module-level toast store: the single source of truth behind the
 * imperative API. A toast lives here from `toast(...)` until its exit
 * window ends — the store owns every timer (the auto-dismiss
 * countdown, the pause/resume bookkeeping, the exit window) and every
 * mutation, so the components are pure renders of `getSnapshot()`.
 *
 * Entries are immutable and the snapshot reference only changes on a
 * real mutation — the `useSyncExternalStore` contract for the
 * Viewport.
 */
class ToastStore {
  private entries: ToastEntry[] = [];
  private listeners = new Set<() => void>();
  /** id → the auto-dismiss timer handle (present while counting down). */
  private timers = new Map<ToastId, ReturnType<typeof setTimeout>>();
  /** id → ms left on the countdown (updated on pause). */
  private remaining = new Map<ToastId, number>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): readonly ToastEntry[] => this.entries;

  private emit(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  /** Adds a toast and starts its auto-dismiss countdown. */
  add(options: ToastOptions): ToastId {
    const id = nextToastId();
    const entry: ToastEntry = {
      ...options,
      id,
      type: options.type ?? 'info',
      duration: options.duration ?? DEFAULT_DURATION,
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
   * Replaces the toast carrying `key` (or the id, when `key` matches
   * none) with a patched copy. Duration changes restart the countdown;
   * a patch from an exiting toast keeps it exiting.
   */
  update(key: string, patch: ToastOptions): void {
    const index = this.entries.findIndex((entry) => entry.key === key || entry.id === key);
    if (index === -1) {
      return;
    }
    const current = this.entries[index];
    const next: ToastEntry = {
      ...current,
      ...patch,
      id: current.id,
      type: patch.type ?? current.type,
      status: current.status,
    };
    this.entries = [...this.entries];
    this.entries[index] = next;
    if (current.status === 'shown') {
      this.clearCountdown(current.id);
      if (next.duration > 0) {
        this.startCountdown(next.id, next.duration);
      }
    }
    this.emit();
  }

  /** Dismisses one toast (by id or key) into its exit window. */
  dismiss(key: ToastId | string): void {
    const entry = this.entries.find((item) => item.id === key || item.key === key);
    if (!entry || entry.status === 'exiting') {
      return;
    }
    this.clearCountdown(entry.id);
    this.remaining.delete(entry.id);
    this.transitionToExiting(entry.id);
  }

  /** Dismisses every toast into its exit window. */
  dismissAll(): void {
    for (const entry of this.entries) {
      if (entry.status === 'shown') {
        this.clearCountdown(entry.id);
        this.remaining.delete(entry.id);
      }
    }
    this.entries = this.entries.map((entry) =>
      entry.status === 'shown' ? { ...entry, status: 'exiting' } : entry,
    );
    this.emit();
    this.scheduleRemovals();
  }

  /** Pauses the countdown (hover): remembers the ms left. */
  pause(id: ToastId): void {
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
  resume(id: ToastId): void {
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

  /** The id → countdown start timestamp map (pause bookkeeping). */
  private startedAt = new Map<ToastId, number>();

  private startCountdown(id: ToastId, ms: number): void {
    this.startedAt.set(id, Date.now());
    const timer = setTimeout(() => this.dismiss(id), ms);
    this.timers.set(id, timer);
  }

  private clearCountdown(id: ToastId): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  /** Moves one shown toast to exiting and schedules its removal. */
  private transitionToExiting(id: ToastId): void {
    const index = this.entries.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return;
    }
    this.entries = [...this.entries];
    this.entries[index] = { ...this.entries[index], status: 'exiting' };
    this.emit();
    this.scheduleRemovals();
  }

  /** Removes every exiting toast once the exit window ends. */
  private scheduleRemovals(): void {
    const exiting = this.entries.filter((entry) => entry.status === 'exiting');
    for (const entry of exiting) {
      const timer = setTimeout(() => {
        this.entries = this.entries.filter((item) => item.id !== entry.id);
        this.emit();
      }, TOAST_EXIT);
      this.timers.set(entry.id, timer);
    }
  }
}

/** The app-wide singleton the imperative API and the Viewport share. */
export const toastStore = new ToastStore();
