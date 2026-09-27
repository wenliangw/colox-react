import type { ComponentType } from 'react';
import type { MessageEntry, MessageVariant } from './types';
import { createMessageStore, MessageStore } from './store';

/** The renderer a consumer face registers for its variant. */
export interface MessageRendererProps {
  /** The live entry to render. */
  entry: MessageEntry;
  /** The store the entry lives in (pause/resume/dismiss). */
  store: MessageStore;
}

export type MessageRenderer = ComponentType<MessageRendererProps>;

/** The default scope: the screen-wide container `toast()`/`notify()` use. */
export const ROOT_SCOPE = 'root';

// ——— module-level shared state ———————————————————————————————
// The scope table and renderer registry are module singletons, so EVERY
// MessageFactory instance (the Toast face, the Notify face, any consumer
// subclass) reads and writes the SAME scope space. That is the whole
// point: a scope is a container, and a container can hold toast and
// notify entries side by side — the face only decides how entries get in.

const scopes = new Map<string, MessageStore>();
const renderers = new Map<MessageVariant, MessageRenderer>();

/**
 * The base message factory: the scope → store registry plus the renderer
 * registry. Consumer faces extend it (ToastFactory, NotifyFactory) to add
 * their imperative API; the scope management is inherited unchanged.
 *
 * A scope names a container (a `<MessageViewport scope="…">`). All
 * factories share one scope table, so a container can hold entries from
 * every face — `toast(msg, { scope })` and `notify(…, { scope })` land in
 * the same store, and the viewport renders each entry by its variant's
 * registered renderer.
 */
export class MessageFactory {
  /**
   * Returns the store for a scope, creating it on first touch. This is
   * how a viewport "registers" its scope — and how a face routes an
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

  /** Registers the renderer for a variant (called by each face). */
  registerRenderer(variant: MessageVariant, renderer: MessageRenderer): void {
    renderers.set(variant, renderer);
  }

  /** Returns the renderer for a variant (undefined if no face registered it). */
  getRenderer(variant: MessageVariant): MessageRenderer | undefined {
    return renderers.get(variant);
  }

  /** Clears every scope — mostly for tests. */
  clearAll(): void {
    scopes.clear();
  }
}

/**
 * The shared base factory instance: the viewport and every consumer
 * face operate on the SAME scope table through this instance (or their
 * own subclass instances — the table is module-level, so all of them
 * read and write one space). Faces extend the class for their API and
 * register their renderers; the viewport reads the shared registry
 * through this instance.
 */
export const messageFactory = new MessageFactory();
