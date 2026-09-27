import { useCallback, useEffect, useRef } from 'react';
import { getFocusableElements } from '../utils/focusables';
import type { UseTrapParams, UseTrapResult } from './types';

/**
 * The dialog focus manager — one hook, both focus models:
 *
 * - strict (no `triggerRef`): the modal trap. Tab cycles inside the
 *   root and never escapes; a stray focus outside is pulled back in;
 *   `aria-modal` marks the dialog while active.
 * - soft (`triggerRef` given): the non-modal cycle. Tab inside the
 *   root wraps; a forward Tab from the trigger slides into the panel;
 *   focus may otherwise leave (the trigger's backward Tab is the
 *   page's business).
 *
 * Both models share the harvest walk (computed-style-filtered
 * focusables), the explicit Tab stepping (no browser-default Tab, so
 * the wrap works identically in every engine), the initial focus and
 * the focus return on release.
 */
export function useTrap({
  rootRef,
  enabled,
  triggerRef,
  ariaModal = false,
  initialFocus = 'first',
  restoreFocus = false,
  onEscape,
}: UseTrapParams): UseTrapResult {
  // The open-focus appointment: the effect only writes the intent —
  // the portal node arrives one tick after the open edge, and the
  // root ref callback performs the focus once the node exists.
  const pendingFocusRef = useRef(false);

  // The element focused right before the trap activated; `restoreFocus
  // === true` returns to it on release (the Modal restore — there is
  // no trigger to return to).
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Whether the keyboard focus lives inside the root — maintained by
  // the focusin/focusout listeners so the release check survives an
  // immediate unmount (the node may be gone when the release effect
  // runs, but the flag holds the last known state).
  const focusInsideRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      pendingFocusRef.current = false;
      return undefined;
    }
    const active = document.activeElement;
    previousFocusRef.current = active instanceof HTMLElement ? active : null;
    // `none` arms no initial focus: a pointer-driven panel (Popover's
    // hover/manual channels) must not steal the keyboard.
    pendingFocusRef.current = initialFocus !== 'none';
    const root = rootRef.current;
    if (root) {
      pendingFocusRef.current = false;
      if (ariaModal) {
        root.setAttribute('aria-modal', 'true');
      }
      if (initialFocus !== 'none') {
        if (initialFocus === 'container' || getFocusableElements(root).length === 0) {
          root.focus();
        } else {
          getFocusableElements(root)[0].focus();
        }
      }
    }
    return () => {
      const node = rootRef.current;
      if (node && ariaModal) {
        node.removeAttribute('aria-modal');
      }
    };
  }, [enabled, initialFocus, rootRef, ariaModal]);

  const setRootRef = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      if (node && pendingFocusRef.current) {
        pendingFocusRef.current = false;
        if (ariaModal) {
          node.setAttribute('aria-modal', 'true');
        }
        if (initialFocus === 'container' || getFocusableElements(node).length === 0) {
          node.focus();
        } else {
          getFocusableElements(node)[0].focus();
        }
      }
    },
    [rootRef, ariaModal, initialFocus],
  );

  // The focus presence tracker: focusin into the root arms the return,
  // focusout to a target outside it disarms. A pointerdown landing
  // OUTSIDE the root also disarms — an outside interaction (an
  // outside-click close) has the user's focus follow their click, so
  // the release must not yank it back (and a hover panel would
  // otherwise re-open on the restored focus).
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const handleFocusIn = (event: FocusEvent) => {
      const root = rootRef.current;
      if (root && event.target instanceof Node && root.contains(event.target)) {
        focusInsideRef.current = true;
      }
    };
    const handleFocusOut = (event: FocusEvent) => {
      const root = rootRef.current;
      if (root && event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) {
        focusInsideRef.current = false;
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node) || !root.contains(event.target)) {
        focusInsideRef.current = false;
      }
    };
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('focusin', handleFocusIn, true);
      document.removeEventListener('focusout', handleFocusOut, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [enabled, rootRef]);

  // The keyboard: explicit Tab stepping (the wrap never escapes) plus
  // the Escape channel.
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      if (event.key === 'Escape') {
        onEscape?.();
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }

      const focusables = getFocusableElements(root);
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && root.contains(active);

      if (!inside) {
        if (triggerRef && active === triggerRef.current && !event.shiftKey) {
          // The soft slide: a forward Tab from the trigger walks the
          // keyboard into the panel (the portal mounts at the document
          // end, so the natural Tab order would skip it). The backward
          // direction from the trigger stays the page's business.
          event.preventDefault();
          (focusables[0] ?? root).focus();
          return;
        }
        if (!triggerRef) {
          // The strict pull: the modal never lets the focus escape —
          // a stray outside focus (mask click, browser chrome) is
          // dragged back in on the next Tab.
          event.preventDefault();
          (focusables[0] ?? root).focus();
          return;
        }
        return;
      }

      event.preventDefault();
      if (focusables.length === 0) {
        root.focus();
        return;
      }
      const lastIndex = focusables.length - 1;
      const current = focusables.indexOf(active as HTMLElement);
      const nextIndex =
        current === -1
          ? event.shiftKey
            ? lastIndex
            : 0
          : (current + (event.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
      focusables[nextIndex].focus();
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [enabled, rootRef, triggerRef, onEscape]);

  // The release: hand the focus back to the restore target (the
  // trigger, or the pre-open element) when it was inside the root —
  // an outside interaction never has its focus stolen back.
  useEffect(() => {
    if (enabled) {
      return;
    }
    const root = rootRef.current;
    if (
      !focusInsideRef.current &&
      !(
        root &&
        document.activeElement instanceof HTMLElement &&
        root.contains(document.activeElement)
      )
    ) {
      return;
    }
    let target: HTMLElement | null = null;
    if (restoreFocus && typeof restoreFocus !== 'boolean') {
      target = restoreFocus.current;
    } else if (restoreFocus === true) {
      target = previousFocusRef.current;
    }
    if (target) {
      target.focus();
    }
  }, [enabled, restoreFocus, rootRef]);

  return { setRootRef };
}
