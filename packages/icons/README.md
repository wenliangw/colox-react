# @colox/icons

The Colox first-party icon set: stroke-based glyphs drawn in the same design
language as the components. Icons are React components riding `IconBase` — the
single place the visual contract lives.

```tsx
import { ChevronDown, Eye } from '@colox/icons';

<Button trailing={<ChevronDown />}>Open</Button>;
<div style={{ fontSize: 20 }}>
  <Eye />
</div>;
```

Colors follow the host via `stroke="currentColor"` (semantic tokens flow
through), sizes follow the host font size via `1em` sizing — an icon placed in a
Button inherits the component's typography and color without props.

## Design specification

Every glyph must pass the machine-enforced spec lint (`test/icon-spec.test.tsx`).
The eight clauses:

1. **Canvas**: `24×24` viewBox; every node lands on the integer grid — no
   half-pixel strokes.
2. **Stroke**: `1.5`, round caps and joins. 1.5@24 renders as an effective 1px at
   16px — the same visual weight as the component borders.
3. **Corners**: right-angle turns take `r=2` (the `radii.xs` token), sweeping
   turns `r=4` (`radii.sm`) — the icon shape language hangs off the token radii
   family.
4. **Optical box**: every stroke (bleed included) sits inside the `[2, 22]`
   content box, keeping icons optically flush with text.
5. **Angles**: diagonals are 45°/30° constructions — no orphan angles.
6. **Paired glyphs share one source**: `ChevronDown/Left/Right/Up` are one
   drawing rotated around the canvas center; `EyeOff` is `Eye` with the pupil
   swapped for the slash. No second hand-drawn face for a state pair.
7. **Naming**: kebab-case file names, PascalCase exports; direction suffixes
   `-up/-down/-left/-right`, state suffixes `-off`.
8. **Variants**: the set is stroke-only; a filled variant enters only when a
   semantic requirement appears.

## Machine enforcement

The spec lint renders every icon and asserts:

- the full `IconBase` attribute contract (canvas, fill, stroke, caps, 1em,
  a11y defaults);
- the designed drawing is rendered verbatim (the geometry lock — a path change
  fails the suite and forces a spec review);
- every geometry number is an integer (grid clause);
- every explicit path node and circle extent stays inside `[2, 22]`;
- the documented optical bounds of each glyph stay inside the content box;
- pair-source rules (chevron family single geometry, eye/eye-off derivation).

`IconBase` spreads consumer props after its defaults, so stroke width, fill or
a11y attributes stay overridable — the fork channel is open by design.
