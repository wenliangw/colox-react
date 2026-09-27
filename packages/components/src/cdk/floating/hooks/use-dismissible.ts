import { useEffect } from 'react';

import type { UseDismissibleOptions } from '../types';

/**
 * The popup family's close channels: a pointerdown landing outside
 * both the trigger and the panel, an Escape press, or the window
 * losing focus. Containment checks span the trigger tree and the
 * portal tree, so clicks inside either never dismiss.
 *
 * The outside-click channel is opt-out (`closeOnOutsideClick:
 * false`); Escape and the window loss are NOT clicks and keep
 * dismissing — a panel must always have a keyboard way out.
 *
 * The window channel is not redundant with an element-level blur:
 * when the page runs inside an iframe (a preview host, an embedded
 * widget) or the browser window loses focus, the focused element
 * never receives a DOM blur — only the window does — so a panel that
 * closed on blur alone would stay open behind the other document.
 */
export function useDismissible({
  open,
  triggerRef,
  panelRef,
  closeOnOutsideClick = true,
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

    const handleWindowBlur = () => {
      onDismiss();
    };

    if (closeOnOutsideClick) {
      document.addEventListener('pointerdown', handlePointerDown, true);
    }
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('blur', handleWindowBlur);
    return () => {
      if (closeOnOutsideClick) {
        document.removeEventListener('pointerdown', handlePointerDown, true);
      }
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [open, closeOnOutsideClick, onDismiss, triggerRef, panelRef]);
}
