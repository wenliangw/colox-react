import { useEffect, useState } from 'react';
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom';
import type { Middleware, Placement } from '@floating-ui/dom';

import type { UseFloatingPositionOptions, UseFloatingPositionResult } from '../types';

/** The picker-family flip preset: unchanged unless a caller hands its own chain. */
const DEFAULT_FALLBACK_PLACEMENTS: Placement[] = ['top-start', 'bottom-end', 'top-end'];

/**
 * Wraps @floating-ui/dom's computePosition + autoUpdate stream: the
 * positioning math is outsourced (scroll-follow, flip/shift collision,
 * RTL), everything behavioral stays with the callers. Writes
 * top/left (fixed strategy), min-width and the resolved `data-placement`
 * (the post-flip word — arrows and directional shadows pin to it) into
 * the floating element; no DOM, no classes, no visual styles.
 */
export function useFloatingPosition({
  referenceRef,
  floatingRef,
  open,
  fallbackPlacements,
  placement = 'bottom-start',
  gap = 4,
  padding = 8,
  matchWidth = true,
}: UseFloatingPositionOptions): UseFloatingPositionResult {
  const [positioned, setPositioned] = useState(false);

  useEffect(() => {
    if (!open) {
      setPositioned(false);
      return;
    }
    const reference = referenceRef.current;
    const floating = floatingRef.current;
    if (!reference || !floating) {
      return;
    }

    const middleware: Middleware[] = [
      offset(gap),
      flip({ padding, fallbackPlacements: fallbackPlacements ?? DEFAULT_FALLBACK_PLACEMENTS }),
      shift({ padding }),
    ];
    if (matchWidth) {
      middleware.push(
        size({
          padding,
          apply({ rects }) {
            Object.assign(floating.style, {
              minWidth: `${rects.reference.width}px`,
            });
          },
        }),
      );
    }

    const updatePosition = () => {
      void computePosition(reference, floating, {
        strategy: 'fixed',
        placement,
        middleware,
      }).then(({ x, y, placement: resolvedPlacement }) => {
        Object.assign(floating.style, {
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
        });
        // The post-flip word: consumers pin decoration and shadows to
        // the side the panel actually landed on (additive, pickers
        // ignore it).
        floating.setAttribute('data-placement', resolvedPlacement);
        setPositioned(true);
      });
    };

    const cleanup = autoUpdate(reference, floating, updatePosition);
    updatePosition();
    return cleanup;
  }, [open, fallbackPlacements, placement, gap, padding, matchWidth, referenceRef, floatingRef]);

  return { positioned };
}
