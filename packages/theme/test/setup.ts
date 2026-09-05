import { installMatchMediaMock } from './utils/match-media';

installMatchMediaMock();

// The jsdom version used by this repo leaves window.localStorage as an own
// property with value undefined, so an in-memory shim keeps persistence
// tests deterministic.
if (typeof window !== 'undefined' && !window.localStorage) {
  const entries = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return entries.size;
    },
    clear: () => {
      entries.clear();
    },
    getItem: (key: string) => (entries.has(key) ? entries.get(key)! : null),
    key: (index: number) => [...entries.keys()][index] ?? null,
    removeItem: (key: string) => {
      entries.delete(key);
    },
    setItem: (key: string, value: string) => {
      entries.set(key, String(value));
    },
  };
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
}
