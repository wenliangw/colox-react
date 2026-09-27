import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDismissible } from '@colox/cdk/floating';
import { TOOLTIP_DELAY } from '../constants/behavior';
import type { TooltipTriggerHandlers, UseTooltipParams, UseTooltipResult } from '../types';

/**
 * The hint-layer visibility machine. The channels:
 *
 * - hover: pointerenter rides delay.in, focus is instant, pointerleave
 *   rides delay.out, blur is instant — the open/close timers always
 *   cancel each other so a fast enter/leave can never re-open;
 * - click: an instant toggle, no timers — Escape/outside/blur-close
 *   come from cdk useDismissible below;
 * - manual: the `visible` prop verbatim — no surfaces, no auto close,
 *   no echo (onVisibleChange only speaks the hover/click transitions).
 *
 * useDismissible scopes the outside-pointerdown escape to the trigger
 * or panel, Escape to the panel/trigger and window focus loss.
 * closeOnScroll adds a window-capture scroll channel (capture, so the
 * root scroll of a follow-mode default never fires it — the default
 * follows through the autoUpdate stream instead).
 */
export function useTooltip(params: UseTooltipParams): UseTooltipResult {
  const { visibleOn, visible: visibleProp, delay, closeOnScroll, onVisibleChange } = params;

  const [innerVisible, setInnerVisible] = useState(false);
  const visible = visibleOn === 'manual' ? Boolean(visibleProp) : innerVisible;

  const triggerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

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
          clearCloseTimer();
          clearOpenTimer();
          setVisible(true);
        },
        onBlur: () => {
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

  useEffect(
    () => () => {
      clearOpenTimer();
      clearCloseTimer();
    },
    [clearOpenTimer, clearCloseTimer],
  );

  return { visible, triggerRef, panelRef, handlers };
}
