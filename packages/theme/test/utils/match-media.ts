/**
 * jsdom has no matchMedia, so this controllable mock provides two knobs
 * (viewport width, system theme preference); query results follow the
 * knobs and dispatch change events — mimicking the observation semantics of
 * a real MediaQueryList.
 */
type MediaHandler = (event: { matches: boolean; media: string }) => void;

interface MockMQL {
  matches: boolean;
  media: string;
  addEventListener: (type: 'change', handler: MediaHandler) => void;
  removeEventListener: (type: 'change', handler: MediaHandler) => void;
}

let viewportWidth = 1440; // Initial desktop width: no max-width matches → 'base'
let systemDark = false;
const listenersByQuery = new Map<string, Set<MediaHandler>>();
const mqls: MockMQL[] = [];

export function setViewportWidth(width: number) {
  viewportWidth = width;
  reconcile();
}

export function setSystemPrefersDark(value: boolean) {
  systemDark = value;
  reconcile();
}

export function resetMedia() {
  viewportWidth = 1440;
  systemDark = false;
  listenersByQuery.clear();
  mqls.length = 0;
}

function evaluate(media: string): boolean {
  const maxWidth = media.match(/^\(max-width: (\d+)px\)$/);
  if (maxWidth) {
    return viewportWidth <= Number(maxWidth[1]);
  }
  if (media === '(prefers-color-scheme: dark)') {
    return systemDark;
  }
  return false;
}

function makeMql(media: string): MockMQL {
  const listeners = new Set<MediaHandler>();
  listenersByQuery.set(media, listeners);
  const mql: MockMQL = {
    media,
    matches: evaluate(media),
    addEventListener: (_type, handler) => {
      listeners.add(handler);
    },
    removeEventListener: (_type, handler) => {
      listeners.delete(handler);
    },
  };
  mqls.push(mql);
  return mql;
}

function reconcile() {
  for (const [media, listeners] of listenersByQuery) {
    const matches = evaluate(media);
    for (const mql of mqls) {
      if (mql.media !== media || mql.matches === matches) {
        continue;
      }
      mql.matches = matches;
      for (const handler of listeners) handler({ matches, media });
    }
  }
}

/** Installed once per environment; the node environment (no window) is skipped. */
export function installMatchMediaMock() {
  const win = typeof window !== 'undefined' ? window : null;
  if (!win || typeof win.matchMedia !== 'undefined') {
    return;
  }
  win.matchMedia = (media: string) => makeMql(media) as unknown as MediaQueryList;
}
