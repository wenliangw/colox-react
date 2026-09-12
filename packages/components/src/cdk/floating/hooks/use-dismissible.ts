import { useEffect } from 'react';
import type { RefObject } from 'react';

export interface UseDismissibleOptions {
  open: boolean;
  /** The trigger reference (the combobox control or its shell). */
  triggerRef: RefObject<HTMLElement | null>;
  /** The portal-mounted panel. */
  panelRef: RefObject<HTMLElement | null>;
  /** Closes the popup: outside pointerdown or Escape. */
  onDismiss: () => void;
}

/**
 * The popup family's close channels: a pointerdown landing outside
 * both the trigger and the panel, or an Escape press. Containment
 * checks span the trigger tree and the portal tree, so clicks inside
 * either never dismiss.
 */
export function useDismissible({
  open,
  triggerRef,
  panelRef,
  onDismiss,
}: UseDismissibleOptions): void {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      onDismiss();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [open, onDismiss, triggerRef, panelRef]);
}
