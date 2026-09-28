import { ROOT_SCOPE } from './constants/defaults';
import { createMessageStore, MessageStore } from './store';
import type { MessageRenderer, MessageType } from './types';

export { ROOT_SCOPE };

// ——— module-level shared state ———————————————————————————————
// The scope table and renderer registry are module singletons, so EVERY
// MessageFactory instance (the Toast kind, the Notify kind, any consumer
// subclass) reads and writes the SAME scope space. That is the whole
// point: a scope is a container, and a container can hold toast and
// notify entries side by side — the kind only decides how entries get in.

const scopes = new Map<string, MessageStore>();
const renderers = new Map<MessageType, MessageRenderer>();

/**
 * The base message factory: the scope → store registry plus the renderer
 * registry. Consumer kinds extend it (ToastFactory, NotifyFactory) to add
 * their imperative API; the scope management is inherited unchanged.
 *
 * A scope names a container (a `<MessageViewport scope="…">`). All
 * factories share one scope table, so a container can hold entries from
 * every kind — `toast(msg, { scope })` and `notify(…, { scope })` land in
 * the same store, and the viewport renders each entry by the renderer
 * registered for its type.
 */
export class MessageFactory {
  /**
   * Returns the store for a scope, creating it on first touch. This is
   * how a viewport "registers" its scope — and how a kind routes an
   * imperative call into the right container.
   */
  getOrCreate(scope: string = ROOT_SCOPE): MessageStore {
    let store = scopes.get(scope);
    if (store === undefined) {
      store = createMessageStore();
      scopes.set(scope, store);
    }
    return store;
  }

  /** Returns the store for a scope without creating it (undefined if absent). */
  get(scope: string = ROOT_SCOPE): MessageStore | undefined {
    return scopes.get(scope);
  }

  /** Removes a scope entirely — the viewport calls this on unmount. */
  unregister(scope: string = ROOT_SCOPE): void {
    scopes.delete(scope);
  }

  /** Registers the renderer for a message type (called by each consumer kind). */
  registerRenderer(type: MessageType, renderer: MessageRenderer): void {
    renderers.set(type, renderer);
  }

  /** Returns the renderer for a message type (undefined if no kind registered it). */
  getRenderer(type: MessageType): MessageRenderer | undefined {
    return renderers.get(type);
  }

  /** Clears every scope — mostly for tests. */
  clearAll(): void {
    scopes.clear();
  }
}

/**
 * The shared base factory instance: the viewport and every consumer
 * kind operate on the SAME scope table through this instance (or their
 * own subclass instances — the table is module-level, so all of them
 * read and write one space). Kinds extend the class for their API and
 * register their renderers; the viewport reads the shared registry
 * through this instance.
 */
export const messageFactory = new MessageFactory();
