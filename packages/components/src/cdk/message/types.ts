import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * The six stack slots inside a scope container: vertical (top/bottom) ×
 * horizontal (left/center/right). The position is **relative to the
 * scope container** — the MessageViewport's own box, not the screen.
 * New messages push the stack away from the container edge (a top slot
 * stacks downward, a bottom slot stacks upward); the slot owns the
 * alignment (left = start, center = centered, right = end).
 */
export type MessagePosition =
  'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

/**
 * The palette tone. Names the semantic icon, the icon color and the
 * reading of the message — the family's palette words, matching the
 * icons batch three set (info/success/warning/error).
 */
export type MessageTone = 'info' | 'success' | 'warning' | 'error';

/**
 * A single action on a message: one label + one handler. The action is
 * an option object because the message's content comes from an
 * imperative call, not a JSX tree — an `<Action>` child has no tree to
 * live in. Single action by design: undo/retry is one decision;
 * multiple actions are a dialog's job.
 */
export interface MessageAction {
  /** The action's label — what the button reads. */
  label: string;
  /** Runs when the action is clicked; the message closes right after. */
  onClick: () => void;
}

/**
 * The imperative options of one message. The consumer faces (Toast /
 * Notify) narrow this shape to their own semantics — Toast keeps it
 * light (content only), Notify promotes the titled tier (title +
 * content + action).
 */
export interface MessageOptions {
  /** The body words (the lightweight tier, or the body of the titled tier). */
  content?: ReactNode;
  /** The titled tier: a heading above the content. */
  title?: ReactNode;
  /** The palette tone; defaults to info. */
  type?: MessageTone;
  /**
   * How long (ms) the message stays before auto-dismissing. 0 = sticky
   * (only the close button or an action dismisses). Hovering pauses
   * the countdown. Defaults to the factory's duration (3s).
   */
  duration?: number;
  /** The single action — undo/retry, auto-closes the message on click. */
  action?: MessageAction;
  /**
   * The update key: `update(key, patch)` finds the message by this key
   * instead of its auto id.
   */
  key?: string;
  /**
   * Which slot inside the scope container. Defaults to the face's
   * default (Toast: top-center, Notify: top-right).
   */
  position?: MessagePosition;
}

/** What the imperative API returns: the message's id. */
export type MessageId = string;

/**
 * The mounted message's runtime record inside the store. `shown` is
 * live (duration counting), `exiting` is in the exit window (the CSS
 * plays the out-animation, then the store removes it).
 */
export type MessageStatus = 'shown' | 'exiting';

/** The face the message belongs to — routes to the right renderer. */
export type MessageVariant = 'toast' | 'notify';

/** One live message as the store holds it. */
export interface MessageEntry extends MessageOptions {
  /** The unique auto id (also the React key). */
  id: MessageId;
  /** The face this entry belongs to. */
  variant: MessageVariant;
  /** Resolved tone (never undefined in the store). */
  type: MessageTone;
  /** Resolved duration (never undefined in the store). */
  duration: number;
  /** The live status driving the animation. */
  status: MessageStatus;
}

/** The `<MessageViewport>` props — a div element, plus the container config. */
export interface MessageViewportProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * The named container this viewport registers. `toast(msg, { scope })`
   * / `notify(..., { scope })` route into the matching scope's store.
   * Defaults to `'root'` — the screen-wide container.
   */
  scope?: string;
  /**
   * How the container anchors itself: `'fixed'` pins it to the viewport
   * (the root screen container), `'absolute'` pins it to its nearest
   * positioned ancestor (a scoped container inside a panel). Defaults to
   * `'fixed'`.
   */
  positioning?: 'fixed' | 'absolute';
}
