/**
 * The single chevron geometry shared by all four directions: direction
 * is a rotation around the canvas center on the same stroke, so the
 * family stays identical by construction (spec: paired glyphs derive
 * from one source). A pure 45° polyline with the sharp vertex at
 * (15,12) — the round linejoin turns it into the small rounded tip.
 * Deliberately arc-free: an arc between the arms can only join them
 * with a tangent break on the integer grid, and that kink becomes
 * visible once the stroke scales up (zoom-proof geometry; see
 * corrections/icon-geometry).
 */
export const chevronPath = 'M9 6 L15 12 L9 18';
