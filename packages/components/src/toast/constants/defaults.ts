import type { MessagePosition, MessageStrategy, MessageVariant } from '../../cdk/message';

/** The toast face's default slot: centered near the top of the container. */
export const TOAST_DEFAULT_POSITION: MessagePosition = 'top-center';

/**
 * The toast face's default strategy: `'single'` — a toast is a
 * lightweight centered hint, and a burst of them pollutes the
 * viewport. A new toast replaces the current one in its slot IN PLACE
 * (same node, no re-mount, no position shift — the new payload lands
 * instantly and the words zoom in, the countdown restarts), whatever
 * its palette/variant: exactly one toast per position. Pass
 * `{ strategy: 'stack' }` to pile them up instead.
 */
export const TOAST_DEFAULT_STRATEGY: MessageStrategy = 'single';

/** The toast face's default surface: the neutral plain pill. */
export const TOAST_DEFAULT_VARIANT: MessageVariant = 'plain';
