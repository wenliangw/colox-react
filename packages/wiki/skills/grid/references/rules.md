# Grid Rules

Conditional usage rules for `<Grid>`. Format: `[condition] → action. Why: reason.`

## Children

1. `[div-shaped child]` → `<Grid.Item>`, not a bare `<div>`.
   Why: Grid.Item is the item-axis host (span today; row placement, area
   tokens attach here later) — a bare div scans as unmanaged grid content.
2. `[component-shaped child (Button/Input/...)]` → place it directly.
   Why: wrapping adds a zero-value DOM layer and breaks the child's own layout
   semantics.

## Columns

3. `[equal column tracks]` → `columns={n}` (number, arbitrary count).
   Why: the template is `repeat(n, minmax(0, 1fr))` — equal, shrinkable
   columns with no hard-coded widths; 12 is a convention, not a limit.
4. `[per-breakpoint columns]` → `columns={{ sm?, md?, lg?, xl? }}`.
   Why: keys are the fixed breakpoint contract (no `base`) with min-width
   activation semantics — a key takes effect from its band upward, the last
   configured band at-or-narrower than the current one wins, and the static
   default (`1`) is the fallback below the first configured band.
5. `[custom breakpoint CSS]` → never `@media` queries for grid columns.
   Why: one resolution path (`resolveResponsiveValue`) keeps behavior
   identical in every environment.

## Gap

6. `[uniform track spacing]` → `gap="4"` (one spacing key covers both axes).
   Why: the single-key form is the common case; token keys re-theme.
7. `[per-axis spacing]` → `gap={{ row: '4', column: '6' }}`.
   Why: row/column follow the CSS `row-gap` / `column-gap` order.
8. `[raw px gaps]` → forbidden. Why: the token grid re-themes; hand values
   do not.

## Alignment

9. `[track distribution]` → `align` (block axis: start/center/end/stretch)
   and `justify` (inline axis: start/center/end/between/around/evenly).
   Why: box-alignment words only, uniform with the Stack families.

## Span

10. `[featured cell]` → `<Grid.Item span={n}>`. Why: span rides an inline
    custom property (`grid-column: span var(--colox-grid-item-span)`) so
    arbitrary column counts need no 1..n modifier class table.
