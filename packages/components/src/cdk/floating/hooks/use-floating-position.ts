import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { autoUpdate, computePosition, flip, offset, shift, size } from '@floating-ui/dom';
import type { Middleware, Placement } from '@floating-ui/dom';

export interface UseFloatingPositionOptions {
  /** The reference element the panel positions against (the combobox control/shell). */
  referenceRef: RefObject<HTMLElement | null>;
  /** The panel element; the resolved position is written into its inline style. */
  floatingRef: RefObject<HTMLElement | null>;
  /** Skip the positioning stream while closed. */
  open: boolean;
  placement?: Placement;
  /** Gap between the reference edge and the panel. */
  gap?: number;
  /** Minimum clearance kept to the viewport edges. */
  padding?: number;
  /** Keep the panel at least as wide as the reference element (default true). */
  matchWidth?: boolean;
}

export interface UseFloatingPositionResult {
  /**
   * Flips true once the first position resolves — the panel paints
   * hidden until then, so it never flashes at the pre-layout origin.
   */
  positioned: boolean;
}

/**
 * Wraps @floating-ui/dom's computePosition + autoUpdate stream: the
 * positioning math is outsourced (scroll-follow, flip/shift collision,
 * RTL), everything behavioral stays with the callers. Writes
 * top/left (fixed strategy) and min-width inline into the floating
 * element; no DOM, no classes, no visual styles.
 */
export function useFloatingPosition({
  referenceRef,
  floatingRef,
  open,
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
      flip({ padding, fallbackPlacements: ['top-start', 'bottom-end', 'top-end'] }),
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
      }).then(({ x, y }) => {
        Object.assign(floating.style, {
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
        });
        setPositioned(true);
      });
    };

    const cleanup = autoUpdate(reference, floating, updatePosition);
    updatePosition();
    return cleanup;
  }, [open, placement, gap, padding, matchWidth, referenceRef, floatingRef]);

  return { positioned };
}
