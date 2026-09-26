import type { HTMLAttributes } from 'react';

/**
 * The unit-wide size word, inherited by members that carry one.
 * Mirrors FormSize — the family shares a single size union ('md' is
 * the resting tier everywhere).
 */
export type CompactSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * The unit-wide palette word, inherited by the members that carry one
 * (Button / Switch / Slider / DatePicker / TimePicker). Members
 * without a palette word simply ignore it.
 */
export type CompactPalette = 'primary' | 'gray' | 'info' | 'error' | 'warning' | 'success';

/**
 * The visual joining base: it seams sibling members into one unit. It
 * stays wordless on layout (no gap, no alignment, no direction —
 * spacing and layout belong to `Stack`), and gains only two inherited
 * STATE words: `size` and `palette`, offered to members as defaults
 * through context (never by cloning — the members stay the author's
 * own elements). A member's own `size` / `palette` always wins; the
 * Form-level injected size wins over Compact's default, because it
 * arrives as the control's own prop.
 */
export interface CompactProps extends HTMLAttributes<HTMLDivElement> {
  /** The unit-wide size default — members without their own `size` take it. */
  size?: CompactSize;
  /** The unit-wide palette default — members with a palette follow it. */
  palette?: CompactPalette;
}
