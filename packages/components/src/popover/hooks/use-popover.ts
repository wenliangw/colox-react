import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDismissible } from '@colox/cdk/floating';
import { useTrap } from '@colox/cdk/hooks';
import { POPOVER_DELAY } from '../constants/behavior';
import type {
  PopoverBridgeHandlers,
  PopoverTriggerHandlers,
  UsePopoverParams,
  UsePopoverResult,
} from '../types';

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
 *   `closeOnOutsideClick=false` keeps the panel open against outside
 *   clicks — Escape and the lost window still dismiss (they are not
 *   clicks), and the trigger toggle stays live.
 * - manual: the `visible` prop verbatim — no surfaces, no auto close
 *   (the close channels never flip the controlled state). The OPT-IN
 *   channels speak instead of closing: the outside click (per
 *   `closeOnOutsideClick`) and the scroll (per `closeOnScroll`) echo
 *   `onVisibleChange(false)` so the controlled owner follows — those
 *   special moments are the library's business, not the consumer's.
 *   Escape and the window loss keep their manual silence.
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
    closeOnOutsideClick,
    hasContent,
    onVisibleChange,
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
    [visibleOn, visible, hasContent, onVisibleChange],
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

  // The dialog focus machine (shared cdk hook): the soft cycle — the
  // forward Tab from the trigger slides into the panel, the panel's own
  // Tab wraps, Escape inside hands the focus back to the trigger
  // (useDismissible performs the actual close), and a close that leaves
  // the focus orphaned inside the panel returns it to the trigger.
  const handleEscape = useCallback(() => {
    if (panelRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus();
    }
  }, []);

  const { setRootRef: setPanelRef } = useTrap({
    rootRef: panelRef,
    enabled: visible,
    triggerRef,
    // Only the click channel steals the keyboard: a hover/manual open
    // must never move the focus (pointer interaction stays off the
    // keyboard; manual keeps the focus where the user left it).
    initialFocus: visibleOn === 'click' ? 'first' : 'none',
    restoreFocus: triggerRef,
    onEscape: handleEscape,
  });

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
  }, [visibleOn, delayOut, focusInside, clearCloseTimer, close]);

  // The close channels split by their manual contract: the OPT-IN
  // moments (the outside click per closeOnOutsideClick, the scroll
  // per closeOnScroll) are the special dismissals the library handles
  // for the user — under manual they echo onVisibleChange(false)
  // instead of closing, and the controlled owner follows. Escape and
  // the window loss keep their old manual silence: a controlled panel
  // does not hand its keyboard fate to the library.
  const closeViaOptIn = useCallback(() => {
    if (visibleOn === 'manual') {
      onVisibleChange?.(false);
      return;
    }
    setVisible(false);
  }, [visibleOn, onVisibleChange, setVisible]);

  const closeViaEnvironment = useCallback(() => {
    if (visibleOn !== 'manual') {
      setVisible(false);
    }
  }, [visibleOn, setVisible]);

  useDismissible({
    open: visible,
    triggerRef,
    panelRef,
    closeOnOutsideClick,
    onDismiss: closeViaEnvironment,
    onDismissOutsideClick: closeViaOptIn,
  });

  useEffect(() => {
    if (!closeOnScroll || !visible) {
      return;
    }
    const onScroll = () => closeViaOptIn();
    window.addEventListener('scroll', onScroll, true);
    return () => window.removeEventListener('scroll', onScroll, true);
  }, [closeOnScroll, visible, closeViaOptIn]);

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
