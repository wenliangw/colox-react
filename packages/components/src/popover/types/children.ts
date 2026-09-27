import type { CSSProperties, ReactNode } from 'react';

/**
 * The Popover.Trigger declaration: renders nothing — the root captures
 * its single child during compilation and clones it in place. The
 * child may be a component or a DOM host element (the injection
 * surface is aria wording plus event handlers, meaningful on both).
 */
export interface PopoverTriggerProps {
  children: ReactNode;
}

/**
 * The Popover.Title declaration: renders nothing — the root captures
 * its children during compilation and mounts the header inside the
 * panel. `className`/`style` land on the header element.
 */
export interface PopoverTitleProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * The Popover.Content carrier: owns its panel DOM. The body is the
 * author's children; `className`/`style` are the escape hatch — they
 * land on the content box below the optional header.
 */
export interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}
