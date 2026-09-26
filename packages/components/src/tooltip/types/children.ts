import type { CSSProperties, ReactNode } from 'react';

/**
 * The Tooltip.Trigger declaration: renders nothing — the root captures
 * its single child during compilation and clones it in place. The child
 * may be a component or a DOM host element (the injection surface is
 * aria wording plus event handlers, meaningful on both).
 */
export interface TooltipTriggerProps {
  children: ReactNode;
}

/**
 * The Tooltip.Content carrier: owns its DOM (the portal panel). The
 * body is the author's children; `className`/`style` land on the
 * content box as the escape hatch.
 */
export interface TooltipContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}
