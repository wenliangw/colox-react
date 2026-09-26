import type { HTMLAttributes } from 'react';

/**
 * The visual joining base: it seams sibling members into one unit. It is
 * deliberately wordless — no gap, no alignment, no direction: spacing and
 * layout stay with `Stack`, the seam stays here.
 */
export type CompactProps = HTMLAttributes<HTMLDivElement>;
