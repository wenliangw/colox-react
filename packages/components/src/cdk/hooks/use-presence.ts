import { useEffect, useState } from 'react';
import type { UsePresenceParams, UsePresenceResult } from './types';

/**
 * The mount lifecycle behind portal panels: open mounts the node, an
 * open->false edge with an exit window keeps it alive (exiting) for
 * that long and unmounts at the end, without one unmounts instantly.
 * SSR-safe: the initial presence is false, so nothing portals on the
 * server or before the first client tick.
 */
export function usePresence({ open, exitDuration = 0 }: UsePresenceParams): UsePresenceResult {
  const [presence, setPresence] = useState(false);

  useEffect(() => {
    if (open) {
      setPresence(true);
      return undefined;
    }
    if (exitDuration === 0) {
      setPresence(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setPresence(false), exitDuration);
    return () => window.clearTimeout(timer);
  }, [open, exitDuration]);

  const show = presence && (exitDuration > 0 || open);
  const exiting = show && !open;

  return { presence, show, exiting };
}
