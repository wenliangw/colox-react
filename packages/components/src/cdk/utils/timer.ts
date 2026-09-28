/**
 * One timer: a startable, pausable, restartable expiry clock.
 *
 * The shared time core of the message system (each auto-dismiss entry
 * holds one) — and the foundation a future countdown component
 * reuses: its hook only wraps this class with a subscription, the time
 * mechanics stay here.
 *
 * The invariants that took three rounds of message-store audit to
 * settle live inside this class now, structurally:
 *
 * - the remaining time is a HELD LEDGER (`getRemaining` reads it, live
 *   or halted) — never re-derived from the original duration, so a
 *   timer resumed from a partial remaining keeps it across further
 *   pauses;
 * - pauses STACK per holder (hover pause + fold freeze): the first
 *   holder halts the clock, only the last release resumes it;
 * - one instance = one in-flight timer; there is no id-keyed shared
 *   slot for different timer kinds to collide in.
 *
 * The class is silent: it owns no subscription. A React consumer wraps
 * it (react to `getRemaining` on its own tick) — that is the consumer's
 * display concern, not the clock's.
 */
export class Timer {
  private timer: ReturnType<typeof setTimeout> | null = null;
  /** The held ledger: armed at start, debited on pause, re-armed on resume. */
  private remainingMs: number | null = null;
  /** The live run's start timestamp (elapsed bookkeeping). */
  private startedAt = 0;
  /** How many pause holders sit on the clock (the first halts, the last resumes). */
  private holders = 0;

  constructor(private readonly onExpire: () => void) {}

  /**
   * Arms (or re-arms) the clock from a FULL `ms` — the call that starts
   * a fresh countdown. Does not touch the holders.
   */
  start(ms: number): void {
    this.stopTimer();
    this.remainingMs = ms;
    this.startedAt = Date.now();
    this.timer = setTimeout(() => {
      // expired: the clock is over with itself — consume the state
      // before handing over, so a re-arm inside onExpire never fights
      // a stale ledger
      this.timer = null;
      this.remainingMs = null;
      this.startedAt = 0;
      this.onExpire();
    }, ms);
  }

  /** Restarts the clock from a full `ms` — the update/replacement path. */
  restart(ms: number): void {
    this.stopTimer();
    this.remainingMs = null;
    this.startedAt = 0;
    this.holders = 0;
    this.start(ms);
  }

  /** Closes the clock: timer, ledger, holders — a dead countdown. */
  clear(): void {
    this.stopTimer();
    this.remainingMs = null;
    this.startedAt = 0;
    this.holders = 0;
  }

  /**
   * One pause holder steps in. The FIRST holder halts the clock,
   * debiting the elapsed span into the ledger; further holders just
   * stack on the count.
   */
  pause(): void {
    this.holders += 1;
    if (this.timer === null) {
      return;
    }
    this.stopTimer();
    const armed = this.remainingMs ?? 0;
    this.remainingMs = Math.max(0, armed - (Date.now() - this.startedAt));
  }

  /**
   * One pause holder steps out. The clock resumes from the ledger only
   * when the LAST holder releases.
   */
  resume(): void {
    if (this.holders === 0) {
      return;
    }
    this.holders -= 1;
    if (this.holders > 0) {
      return;
    }
    if (this.remainingMs === null) {
      return;
    }
    const left = this.remainingMs;
    this.remainingMs = null;
    this.start(left);
  }

  /**
   * The ms left — live (counting) or held (halted). `null` when the
   * clock is dead (cleared, expired, or never started).
   */
  getRemaining(): number | null {
    if (this.timer !== null && this.remainingMs !== null) {
      return Math.max(0, this.remainingMs - (Date.now() - this.startedAt));
    }
    return this.remainingMs;
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
