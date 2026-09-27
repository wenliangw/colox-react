import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDismissible } from '@colox/cdk/floating';
import { POPOVER_DELAY } from '../constants/behavior';
import type {
  PopoverBridgeHandlers,
  PopoverTriggerHandlers,
  UsePopoverParams,
  UsePopoverResult,
} from '../types';
import { getFocusableElements } from '../utils/focusables';

/**
 * The popover surface machine — visibility AND focus, one hook: the
 * two concerns share every ref and edge (the blur-into-panel check
 * returns to the focus, the close edge hands the focus back to the
 * trigger), so splitting them would only choreograph a loop.
 *
 * Channels — the Tooltip template grown for an interactive panel:
 *
 * - hover: pointerenter rides delay.in, the focus leg is instant,
 *   pointerleave rides delay.out AND the panel's own half of the hover
 *   region (bridgeHandlers) cancels the pending close — the out-delay
 *   is the bridge that lets the pointer cross into the panel without
 *   dropping it. A blur moving INTO the panel keeps it open; the lost
 *   window cancels both pending timers and swallows the focus the
 *   browser re-plants (a non-gesture — the Tooltip tab-roundtrip
 *   ruling). Hover never steals focus.
 * - click: an instant toggle; opening focuses the panel (the first
 *   focusable element, or the panel itself via tabindex=-1), the Tab
 *   cycle stays in it, Escape closes and returns the focus to the
 *   trigger before the unmount, an outside close never steals back
 *   the focus the user just placed elsewhere.
 * - manual: the `visible` prop verbatim — no surfaces, no auto close,
 *   no echo (onVisibleChange only speaks the hover/click transitions).
 *
 * Element blur does NOT arm the restore swallow (unlike the Tooltip):
 * a blur into the panel is legitimate navigation, and the close-return
 * refocus this hook performs itself must not be eaten. Window blur
 * plus visibilitychange-hidden are the true non-gesture sources.
 */
export function usePopover(params: UsePopoverParams): UsePopoverResult {
  const {
    visibleOn,
    visible: visibleProp,
    delay,
    closeOnScroll,
    onVisibleChange,
    hasContent,
  } = params;

  const [innerVisible, setInnerVisible] = useState(false);
  const visible = visibleOn === 'manual' ? Boolean(visibleProp) : innerVisible;

  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  // Swallows the focus the browser replants on the trigger after the
  // window was lost (tab return): that refire is not a user gesture,
  // and opening from it would stick. Arms on the lost window only
  // (window blur / document hidden); any real pointer or keyboard
  // input re-arms the channel.
  const restoredFocusRef = useRef(false);

  // The open-focus appointment: the click channel opens the panel
  // with the keyboard focus inside. The portal node arrives one tick
  // after the open edge — the effect only writes the intent, the
  // panel's ref callback (setPanelRef) performs the focus once the
  // node actually exists.
  const pendingFocusRef = useRef(false);

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  }, []);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const setVisible = useCallback(
    (next: boolean) => {
      if (visibleOn === 'manual') {
        return;
      }
      if (next && !hasContent) {
        return;
      }
      if (next !== visible) {
        onVisibleChange?.(next);
      }
      setInnerVisible(next);
    },
    [visibleOn, visible, onVisibleChange, hasContent],
  );

  const open = useCallback(
    (delayMs: number) => {
      clearCloseTimer();
      if (delayMs <= 0) {
        setVisible(true);
        return;
      }
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        setVisible(true);
      }, delayMs);
    },
    [clearCloseTimer, setVisible],
  );

  const close = useCallback(
    (delayMs: number) => {
      clearOpenTimer();
      if (delayMs <= 0) {
        setVisible(false);
        return;
      }
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setVisible(false);
      }, delayMs);
    },
    [clearOpenTimer, setVisible],
  );

  /**
   * The keyboard focus already lives inside the region (trigger or
   * panel): a pointer leaving must not drop the panel under it — the
   * panel is interactive and a keyboard user may be working in it.
   */
  const focusInside = useCallback((): boolean => {
    const active = document.activeElement;
    if (!active) {
      return false;
    }
    return triggerRef.current === active || (panelRef.current?.contains(active) ?? false);
  }, []);

  // Focus: appointment (click open), perform-on-attach, trap, return.
  useEffect(() => {
    if (visible && visibleOn === 'click') {
      pendingFocusRef.current = true;
      // A re-open inside the exit window keeps the SAME panel node
      // mounted — the ref callback won't re-fire, focus directly.
      if (panelRef.current) {
        pendingFocusRef.current = false;
        (getFocusableElements(panelRef.current)[0] ?? panelRef.current).focus();
      }
      return;
    }
    if (!visible) {
      pendingFocusRef.current = false;
    }
  }, [visible, visibleOn]);

  const setPanelRef = useCallback((node: HTMLDivElement | null) => {
    panelRef.current = node;
    if (node && pendingFocusRef.current) {
      pendingFocusRef.current = false;
      (getFocusableElements(node)[0] ?? node).focus();
    }
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) {
        return;
      }
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && panel.contains(active);

      if (event.key === 'Escape') {
        if (inside) {
          triggerRef.current?.focus();
        }
        return;
      }
      if (event.key !== 'Tab') {
        return;
      }

      const focusables = getFocusableElements(panel);
      if (!inside) {
        // Slides the keyboard into the panel: the portal mounts at the
        // document end, so a trigger Tab would otherwise walk past it.
        // Forward only — a Shift+Tab from the trigger stays the page's
        // business.
        if (active === triggerRef.current && !event.shiftKey) {
          event.preventDefault();
          (focusables[0] ?? panel).focus();
        }
        return;
      }
      // The panel holds the focus: the cycle steps EXPLICITLY (no
      // browser-default Tab), so the wrap works identically in every
      // engine and the keystroke never escapes.
      event.preventDefault();
      if (focusables.length === 0) {
        panel.focus();
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
  }, [visible]);

  // The close edge: a panel that held the keyboard focus hands it back
  // to the trigger (an outside-click close already moved the focus —
  // this only recovers the orphaned cases like scroll and window loss).
  useEffect(() => {
    if (visible) {
      return;
    }
    const panel = panelRef.current;
    if (
      panel &&
      document.activeElement instanceof HTMLElement &&
      panel.contains(document.activeElement)
    ) {
      triggerRef.current?.focus();
    }
  }, [visible]);

  const delayIn = delay.in ?? POPOVER_DELAY.IN;
  const delayOut = delay.out ?? POPOVER_DELAY.OUT;

  const handlers = useMemo<PopoverTriggerHandlers>(() => {
    if (visibleOn === 'hover') {
      return {
        onPointerEnter: () => {
          open(delayIn);
        },
        onPointerLeave: () => {
          if (focusInside()) {
            return;
          }
          close(delayOut);
        },
        onFocus: () => {
          if (restoredFocusRef.current) {
            restoredFocusRef.current = false;
            return;
          }
          clearCloseTimer();
          clearOpenTimer();
          setVisible(true);
        },
        onBlur: (event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && panelRef.current?.contains(next)) {
            return;
          }
          clearOpenTimer();
          setVisible(false);
        },
      };
    }
    if (visibleOn === 'click') {
      return {
        onClick: () => {
          clearOpenTimer();
          clearCloseTimer();
          setVisible(!visible);
        },
      };
    }
    return {};
  }, [
    visibleOn,
    visible,
    delayIn,
    delayOut,
    open,
    close,
    focusInside,
    clearCloseTimer,
    clearOpenTimer,
    setVisible,
  ]);

  // The panel half of the hover region: the bridge. Entering the
  // panel cancels the pending close the trigger's pointerleave
  // started (the out-delay window IS the bridge — no hidden bridge
  // element); leaving it starts a close unless the keyboard focus
  // still lives inside.
  const bridgeHandlers = useMemo<PopoverBridgeHandlers>(() => {
    if (visibleOn !== 'hover') {
      return {};
    }
    return {
      onPointerEnter: () => {
        clearCloseTimer();
      },
      onPointerLeave: () => {
        if (focusInside()) {
          return;
        }
        close(delayOut);
      },
    };
  }, [visibleOn, focusInside, clearCloseTimer, close, delayOut]);

  useDismissible({
    open: visible,
    triggerRef,
    panelRef,
    onDismiss: () => setVisible(false),
  });

  useEffect(() => {
    if (!closeOnScroll || visibleOn === 'manual' || !visible) {
      return;
    }
    const onScroll = () => setVisible(false);
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [closeOnScroll, visibleOn, visible, setVisible]);

  // The lost window stops the hover channel cold: both pending timers
  // die (nothing may fire while the tab is hidden) and the restore
  // swallow arms — the browser replants focus on the previously
  // focused trigger when the window returns, which must not re-open
  // the panel. The disarm runs on any real input, capture-first, so
  // a click or a Tab re-entering the trigger opens normally.
  useEffect(() => {
    if (visibleOn !== 'hover') {
      return undefined;
    }
    const handleLostWindow = () => {
      restoredFocusRef.current = true;
      clearOpenTimer();
      clearCloseTimer();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleLostWindow();
      }
    };
    const handleInput = () => {
      restoredFocusRef.current = false;
    };
    window.addEventListener('blur', handleLostWindow);
    document.addEventListener('visibilitychange', handleVisibility);
    document.addEventListener('pointerdown', handleInput, true);
    document.addEventListener('keydown', handleInput, true);
    return () => {
      window.removeEventListener('blur', handleLostWindow);
      document.removeEventListener('visibilitychange', handleVisibility);
      document.removeEventListener('pointerdown', handleInput, true);
      document.removeEventListener('keydown', handleInput, true);
    };
  }, [visibleOn, clearOpenTimer, clearCloseTimer]);

  useEffect(
    () => () => {
      clearOpenTimer();
      clearCloseTimer();
    },
    [clearOpenTimer, clearCloseTimer],
  );

  return { visible, triggerRef, panelRef, handlers, bridgeHandlers, setPanelRef };
}
