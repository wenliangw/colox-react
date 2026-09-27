import type { CSSProperties, ReactNode } from 'react';

/**
 * The toast's palette tone. The tone names the semantic icon, the icon
 * color and the reading of the message — the family's palette words,
 * matching the icons batch three set (info/success/warning/error).
 */
export type ToastTone = 'info' | 'success' | 'warning' | 'error';

/**
 * A single action on the toast: one label + one handler. The action is
 * an option object because the toast's content comes from an
 * imperative call, not a JSX tree — a `<Toast.Action>` child has no
 * tree to live in. Single action by design: undo/retry is one
 * decision; multiple actions are a dialog's job.
 */
export interface ToastAction {
  /** The action's label — what the button reads. */
  label: string;
  /** Runs when the action is clicked; the toast closes right after. */
  onClick: () => void;
}

/**
 * The imperative options of one toast: the two payload tiers share one
 * shape. `toast(content)` is the lightweight single-line tier; passing
 * `title` promotes it to the titled notification tier. Everything
 * else — the tone, the action, the duration — is the same on both.
 */
export interface ToastOptions {
  /** The body words (single-line tier, or the body of the titled tier). */
  content?: ReactNode;
  /** The titled tier: a heading above the content. */
  title?: ReactNode;
  /** The palette tone; defaults to info. */
  type?: ToastTone;
  /**
   * How long (ms) the toast stays before auto-dismissing. 0 = sticky
   * (only the close button or an action dismisses). Hovering pauses
   * the countdown. Defaults to the provider's `duration` (3s).
   */
  duration?: number;
  /** The single action — undo/retry, auto-closes the toast on click. */
  action?: ToastAction;
  /**
   * The update key: `toast.update(key, patch)` finds the toast by this
   * key instead of its auto id.
   */
  key?: string;
}

/**
 * What the imperative API returns: the toast's id, usable with
 * `toast.dismiss(id)`.
 */
export type ToastId = string;

/**
 * The mounted toast's runtime record inside the store. `shown` is
 * live (duration counting), `exiting` is in the exit window (the CSS
 * plays the out-animation, then the store removes it).
 */
export type ToastStatus = 'shown' | 'exiting';

/** One live toast as the store holds it. */
export interface ToastEntry extends ToastOptions {
  /** The unique auto id (also the React key). */
  id: ToastId;
  /** Resolved tone (never undefined in the store). */
  type: ToastTone;
  /** Resolved duration (never undefined in the store). */
  duration: number;
  /** The live status driving the animation. */
  status: ToastStatus;
}

/** The `<Toast.Provider>` props: a pass-through host for the moment. */
export interface ToastProviderProps {
  /** The app tree the provider wraps. */
  children?: ReactNode;
}

/** The `<Toast.Viewport>` props. */
export interface ToastViewportProps {
  /**
   * Which of the six stack slots the toasts mount in: a vertical
   * (top/bottom) × horizontal (left/center/right) pair.
   */
  position?: ToastPosition;
  className?: string;
  style?: CSSProperties;
}

/**
 * The six stack slots: vertical × horizontal. New toasts push the
 * stack away from the screen edge (a top slot stacks downward, a
 * bottom slot stacks upward); the slot owns the alignment (left =
 * start, center = centered, right = end).
 */
export type ToastPosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
