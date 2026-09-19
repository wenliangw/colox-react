import type { ComboboxOption } from './option';

/**
 * The family filter contract: a query decides whether an option stays
 * visible. Consumers accept their own option records at runtime — the
 * kernel always calls the matcher back with the very records it was
 * given (the narrow word shape is the common surface, not a runtime
 * narrowing).
 */
export type ComboboxFilterFn = (query: string, option: ComboboxOption) => boolean;
