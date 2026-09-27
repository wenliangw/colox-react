import { useEffect } from 'react';

/**
 * Locks the document body scroll while active: a modal must keep the
 * background page still behind its overlay. Each activation saves the
 * current `overflow` and restores it verbatim on release — nested
 * locks (Modal over Modal) restore correctly in LIFO order (the close
 * stack), since every inner save captures the outer lock's value. The
 * body style is left exactly as found, so an external lock that was
 * already on the body survives this hook's release.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
}
