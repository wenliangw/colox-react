import type { MessagePosition, MessageStrategy, MessageVariant } from '../../cdk/message';

/** The notify kind's default slot: top-right of the container. */
export const NOTIFY_DEFAULT_POSITION: MessagePosition = 'top-right';

/**
 * The notify kind's default strategy: `'stack'` — a titled card is a
 * real notification, several can legitimately coexist. The viewport
 * collapses a burst (more than 3 in a slot) into a deck, so the stack
 * never pollutes the viewport. Pass `{ strategy: 'single' }` to
 * replace in place instead.
 */
export const NOTIFY_DEFAULT_STRATEGY: MessageStrategy = 'stack';

/** The notify kind's default surface: the neutral plain card. */
export const NOTIFY_DEFAULT_VARIANT: MessageVariant = 'plain';
