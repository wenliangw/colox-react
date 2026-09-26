import { forwardRef } from 'react';
import clsx from 'clsx';
import { Popup } from '@colox/cdk/floating';
import type { TooltipPanelProps } from '../types';
import { tooltipVariants } from '../variants';

/**
 * The portal panel unit the two channels share: the cdk Popup carries
 * the portal and the positioning (fixed, autoUpdate follow, flipping
 * through the tooltip's opposite-side chain) and writes the resolved
 * placement as `data-placement` — the arrow and the directional
 * shadow pin to that word. The inner content box paints the surfaces
 * (variant/size/arrow); the panel root stays click-through, a hint
 * never blocks its trigger.
 */
export const TooltipPanel = forwardRef<HTMLDivElement, TooltipPanelProps>(
  (
    {
      open,
      contentId,
      referenceRef,
      placement,
      gap,
      fallbackPlacements,
      showArrow,
      variant,
      size,
      contentClassName,
      contentStyle,
      children,
    },
    ref,
  ) => (
    <Popup
      ref={ref}
      id={contentId}
      role="tooltip"
      referenceRef={referenceRef}
      open={open}
      placement={placement}
      gap={gap}
      matchWidth={false}
      fallbackPlacements={fallbackPlacements}
      className="colox-tooltip__panel"
    >
      <div
        className={clsx(tooltipVariants({ variant, size, arrow: showArrow }), contentClassName)}
        style={contentStyle}
      >
        {children}
      </div>
    </Popup>
  ),
);

TooltipPanel.displayName = 'TooltipPanel';
