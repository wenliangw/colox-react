/**
 * The calendar glyph: a rounded frame (the stroke's round join turns
 * the corner vertices into the soft corners) with a header rule and
 * the two binding stubs above the top edge — the same anatomy as the
 * platform calendar glyphs, so the affordance reads instantly.
 * Deliberately arc-free: an rx-based rect needs tangent control
 * points, and the join rounding already delivers the corner radius.
 */
export const calendarPath = 'M4 5 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7';
