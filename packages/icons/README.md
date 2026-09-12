# @colox/icons

The Colox first-party icon set: stroke-based glyphs drawn in the same design
language as the components. Every icon is an `Icon*`-prefixed React component —
the prefix keeps bare high-frequency names (`X`, `Eye`, `Search`) collision-free
next to other icon libraries and business components.

```tsx
import { IconChevronDown, IconEye, IconSearch } from '@colox/icons';

<Button trailing={<IconChevronDown />}>Open</Button>;
<IconSearch size={16} />;
```

## Sizing and color

`size` pins a px size; without it an icon renders at `1em` — it follows the host
font size, so an icon placed in a Button inherits the component's typography
without props. `color` pins an explicit CSS color; without it the icon inherits
the host's `color` via `currentColor` — semantic tokens and status colors (e.g.
a `success` Message wrapper) reach the icon for free. An explicit `style.color`
still wins over the `color` prop.

## Design specification

Every glyph must pass the machine-enforced spec lint (`test/icon-spec.test.tsx`).
The nine clauses:

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
6. **Paired glyphs share one source**: `IconChevronDown/Left/Right/Up` are one
   drawing rotated around the canvas center; `IconEyeOff` is `IconEye` with the
   pupil swapped for the slash. No second hand-drawn face for a state pair.
7. **Naming**: kebab-case file names, PascalCase `Icon*` exports; direction
   suffixes `-up/-down/-left/-right`, state suffixes `-off`.
8. **Variants**: the set is stroke-only; a filled variant enters only when a
   semantic requirement appears.
9. **Hit-test yielding**: every icon ships `pointer-events="none"` — a
   decorative icon never intercepts the host surface (button, row, shell).
   Consumers needing interactive hits re-enable them through one of three
   channels: a className rule, the `style` prop, or the `pointerEvents` prop.

## Machine enforcement

The spec lint renders every icon and asserts:

- the full base attribute contract (canvas, fill, stroke, caps, 1em, a11y
  defaults, pointer-inert hits) and the public passthrough contract (`size`,
  `color`, className, a11y overrides);
- the designed drawing is rendered verbatim (the geometry lock — a path change
  fails the suite and forces a spec review);
- every geometry number is an integer (grid clause);
- every explicit path node and circle extent stays inside `[2, 22]`;
- the documented optical bounds of each glyph stay inside the content box;
- pair-source rules (chevron family single geometry, eye/eye-off derivation).

The shared `IconBase` the glyphs render through is internal: it holds the
visual contract in one place, but consumers take finished icons only. Custom
business glyphs stay native `svg`/third-party icons in the consumer's own code
the component slots accept any ReactNode.

## API shape

- Named per-icon exports only — `import { IconEye } from '@colox/icons'` stays
  per-icon tree-shakeable (preserveModules output, `sideEffects: false`).
- No namespace object and no `name` string index: they would statically pull
  the whole set into every consumer's bundle.
- Every icon: `size?: number`, `color?: string` + all native svg attributes
  pass through.
