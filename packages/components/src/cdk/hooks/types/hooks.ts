import type { RefObject } from 'react';

export type InitialFocusTarget = 'first' | 'container' | 'none';

export interface UsePresenceParams {
  /** Whether the node should be on screen. */
  open: boolean;
  /**
   * The exit window in milliseconds: after `open` flips false the node
   * stays mounted — carrying the exiting flag — for this long before
   * unmounting, so a consumer can play its exit animation. Default 0 =
   * the node unmounts in the SAME commit as the close (an instant
   * unmount consumer never sees an extra painted frame).
   * @default 0
   */
  exitDuration?: number;
}

export interface UsePresenceResult {
  /** Whether the node is mounted (open, or inside the exit window). */
  presence: boolean;
  /**
   * Whether the node is visible: mounted and not a same-commit unmount.
   * A zero exit window unmounts in the same commit as the close; a
   * positive window keeps `show` true through the whole exit.
   */
  show: boolean;
  /** True while mounted but past the close edge (the exit window). */
  exiting: boolean;
}

export interface UseTrapParams {
  /**
   * The trapped root — the panel element. The returned `setRootRef`
   * must be attached to it (the portal node arrives a tick after the
   * open edge; the ref callback performs the pending initial focus).
   */
  rootRef: RefObject<HTMLElement | null>;
  /** Whether the trap is active (the panel is open). */
  enabled: boolean;
  /**
   * Present = the soft cycle (Popover): a forward Tab from the trigger
   * slides into the panel, and focus may otherwise leave the root —
   * non-modal dialog semantics. Absent = the strict trap (Modal): Tab
   * never escapes the root, and a stray outside focus is pulled back —
   * modal dialog semantics.
   */
  triggerRef?: RefObject<HTMLElement | null>;
  /**
   * Writes `aria-modal="true"` on the root while the trap is active
   * (and removes it on release). The strict modal marks its dialog.
   */
  ariaModal?: boolean;
  /**
   * Where the keyboard focus lands when the trap activates: the first
   * focusable element (`first`, falling back to the root itself) or
   * the root container. @default 'first'
   */
  initialFocus?: InitialFocusTarget;
  /**
   * Where the focus returns when the trap releases: a target ref
   * (Popover returns to its trigger), `true` (restore the element
   * focused before the trap activated — Modal's restore), or `false`
   * (leave the focus where it is). The return only fires when the
   * focus was inside the root, so an outside interaction never has it
   * stolen back.
   * @default false
   */
  restoreFocus?: RefObject<HTMLElement | null> | boolean;
  /** The Escape key while the trap is active (the consumer wires close). */
  onEscape?: () => void;
}

export interface UseTrapResult {
  /**
   * Attach to the trapped root. Sets the root ref and performs the
   * pending initial focus once the portal node actually exists.
   */
  setRootRef: (node: HTMLElement | null) => void;
}
