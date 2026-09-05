# Stack Rules

Conditional usage rules for `<Stack>`. Format: `[condition] → action. Why: reason.`

## Children

1. `[div-shaped child]` → `<Stack.Item>`, not a bare `<div>`.
   Why: Stack.Item is the item-axis host and the composition base — full native
   passthrough today, item tokens (`basis`/`shrink`/`alignSelf`) attach to it
   later. A bare div renders identically today but forfeits both.
2. `[component-shaped child (Button/Input/...)]` → place it directly.
   Why: wrapping adds a zero-value DOM layer and breaks the child's own layout
   semantics.
3. `[custom block composition]` → build on `Stack.Item` (forwardRef + className
   merge). Why: refs, native attributes and the item vocabulary stay intact for free.

## Spacing and alignment

4. `[gap/padding/alignment]` → token props only (`gap="4"`); no inline
   `px`/`margin`/hex. Why: the token grid re-themes; hand values do not.

## Responsive

5. `[per-breakpoint gap]` → `<Stack.Responsive gap={{ base?, sm?, md?, lg?, xl? }} />`
   mounted inside the `Stack`. Why: the mounted part attaches to the theme
   breakpoint sensor; values follow the max-width cap semantics — the first
   configured band at-or-wider than the current one wins, `base` last.
6. `[fixed layout]` → skip `Stack.Responsive` entirely.
   Why: capability is mountable, not default; a static Stack must stay
   theme-context-free.
7. `[custom breakpoint CSS]` → never `@media` queries for stack spacing.
   Why: one resolution path keeps behavior identical in every environment.

## Spacer

8. `[push-to-edge / absorb free space]` → `<Stack.Item grow />` at the split point.
   Why: Spacer semantics live in the item axis; `margin: auto` is hand CSS.
