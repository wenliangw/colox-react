import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDismissible } from '@colox/cdk/floating';
import { TOOLTIP_DELAY } from '../constants/behavior';
import type { TooltipTriggerHandlers, UseTooltipParams, UseTooltipResult } from '../types';

/**
 * The hint-layer visibility machine. The channels:
 *
 * - hover: pointerenter rides delay.in, focus is instant, pointerleave
 *   rides delay.out, blur is instant — the open/close timers always
 *   cancel each other so a fast enter/leave can never re-open; a lost
 *   window cancels both pending timers, and the focus the browser
 *   replants when the window returns is swallowed once as a
 *   non-gesture (any real pointer/keyboard input re-arms it);
 * - click: an instant toggle, no timers — Escape/outside/blur-close
 *   come from cdk useDismissible below;
 * - manual: the `visible` prop verbatim — no surfaces, no auto close
 *   (the close channels never flip the controlled state). The OPT-IN
 *   channels speak instead of closing: the outside click (per
 *   `closeOnOutsideClick`) and the scroll (per `closeOnScroll`) echo
 *   `onVisibleChange(false)` so the controlled owner follows — those
 *   special moments are the library's business, not the consumer's.
 *   Escape and the window loss keep their manual silence.
 *
 * useDismissible scopes the outside-pointerdown escape to the trigger
 * or panel, Escape to the panel/trigger and window focus loss.
 * closeOnScroll adds a window-capture scroll channel (capture, so the
 * root scroll of a follow-mode default never fires it — the default
 * follows through the autoUpdate stream instead).
 */
export function useTooltip(params: UseTooltipParams): UseTooltipResult {
  const {
    visibleOn,
    visible: visibleProp,
    delay,
    closeOnScroll,
    closeOnOutsideClick,
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
  // and opening from it would stick — no pointer around, no blur to
  // come. Element/window blur arms it; any real pointer or keyboard
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
      if (next !== visible) {
        onVisibleChange?.(next);
      }
      setInnerVisible(next);
    },
    [visibleOn, visible, onVisibleChange],
  );

  const open = useCallback(
    (delayMs: number) => {
      clearCloseTimer();
      clearOpenTimer();
      if (delayMs <= 0) {
        setVisible(true);
        return;
      }
      openTimerRef.current = window.setTimeout(() => {
        openTimerRef.current = null;
        setVisible(true);
      }, delayMs);
    },
    [clearCloseTimer, clearOpenTimer, setVisible],
  );

  const close = useCallback(
    (delayMs: number) => {
      clearOpenTimer();
      clearCloseTimer();
      if (delayMs <= 0) {
        setVisible(false);
        return;
      }
      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setVisible(false);
      }, delayMs);
    },
    [clearOpenTimer, clearCloseTimer, setVisible],
  );

  const delayIn = delay.in ?? TOOLTIP_DELAY.IN;
  const delayOut = delay.out ?? TOOLTIP_DELAY.OUT;

  const handlers = useMemo<TooltipTriggerHandlers>(() => {
    if (visibleOn === 'hover') {
      return {
        onPointerEnter: () => {
          open(delayIn);
        },
        onPointerLeave: () => {
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
        onBlur: () => {
          restoredFocusRef.current = true;
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
    clearCloseTimer,
    clearOpenTimer,
    setVisible,
  ]);

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

  return { visible, triggerRef, panelRef, handlers };
}
