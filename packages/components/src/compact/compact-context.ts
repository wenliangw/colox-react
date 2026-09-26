import { createContext, useContext } from 'react';
import type { CompactPalette, CompactSize } from './types';

/**
 * The Compact inheritance channel: unit-wide `size` / `palette`
 * defaults, read by every member that owns that word.
 *
 * This lives in the Compact domain, not in cdk — the seam owns this
 * contract, and cdk is the dependency-free base layer (it must never
 * import from a component domain). The dependency edge is one-way:
 * members import the contract here; Compact itself imports no member.
 *
 * Null outside a Compact — a member outside a seam keeps its own
 * defaults, and a member inside one keeps its own words FIRST:
 * `member ?? compact` is the resolution order (the same "the control
 * speaks first" precedence the Form-level `size` uses, only without
 * prop injection: Compact never clones its children — a red line from
 * its inception).
 */
export interface CompactContextValue {
  size?: CompactSize;
  palette?: CompactPalette;
}

export const CompactContext = createContext<CompactContextValue | null>(null);

/** The enclosing Compact's defaults, or null — never an invented value. */
export function useCompactContext(): CompactContextValue | null {
  return useContext(CompactContext);
}
