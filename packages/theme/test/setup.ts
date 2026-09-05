import { installMatchMediaMock } from './match-media';

installMatchMediaMock();

// 本仓 vitest 版本的 jsdom 不给 window.localStorage（own property 值为
// undefined），装内存版保证持久化测试确定可控。
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
